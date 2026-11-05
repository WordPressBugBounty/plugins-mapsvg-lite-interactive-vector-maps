<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Workflow;

use MapSVG\DataLayer\DataLayerFactory;
use MapSVG\DataLayer\Schema\AdapterPhysicalTableInspector;
use MapSVG\MapsRepository;
use MapSVG\SchemaRepository;
use MapSVG\SVGFileRepository;

/** Production composition root for top-level map-copy orchestration. */
final class MapCopyServiceFactory
{
    public static function forRepository(
        MapsRepository $maps
    ): MapCopyService {
        $dataLayer = DataLayerFactory::createV2(
            null,
            array('force' => true, 'observe' => false)
        );
        $files = new SVGFileRepository();
        $schemas = new SchemaRepository(
            MapCopyCatalogSchema::load()
        );
        $recovery = MapCopyRecoveryServiceFactory::create($dataLayer);
        $physicalInspector = new AdapterPhysicalTableInspector(
            $dataLayer->client()->getAdapter(),
            $dataLayer->provider()->physicalPrefix()
        );

        return new MapCopyService(
            static function ($id) use ($maps) {
                return $maps->findById($id);
            },
            static function (array $data) use ($maps) {
                $data['options'] = \MapSVG\Map::sanitizeOptionsForWrite($data['options']);
                if (\MapSVG\AppEngine::version($data['options']) !== 8) $data['options'] = (new \MapSVG\SvgAssetRegistry())->pinOptions($data['options']);
                return $maps->create($data);
            },
            static function (array $data) use ($maps) {
                $data['options'] = \MapSVG\Map::sanitizeOptionsForWrite($data['options']);
                if (\MapSVG\AppEngine::version($data['options']) !== 8) $data['options'] = (new \MapSVG\SvgAssetRegistry())->pinOptions($data['options']);
                return $maps->update($data);
            },
            static function ($id) use ($maps): void {
                $result = $maps->delete($id);
                if ($result === false) {
                    throw new \RuntimeException(
                        'Could not delete incomplete map row.'
                    );
                }
            },
            static function ($title): string {
                return wp_strip_all_tags(wp_unslash((string) $title));
            },
            static function ($relativeUrl) use ($files) {
                return $files->copy(new \MapSVG\SVGFile(array(
                    'relativeUrl' => (string) $relativeUrl,
                )));
            },
            static function ($file): void {
                self::deleteCopiedSvg($file);
            },
            static function (array $schemaData) use ($schemas) {
                return $schemas->create($schemaData);
            },
            static function (string $name) use ($schemas) {
                return $schemas->findByName($name);
            },
            static function (string $name) use (
                $schemas,
                $physicalInspector
            ): bool {
                return $schemas->findByName($name) !== null
                    || $physicalInspector->inspect($name) !== null;
            },
            static function (
                string $objectsTable,
                string $regionsTable
            ) use ($recovery): void {
                $recovery->cleanupSchemas(
                    $objectsTable,
                    $regionsTable
                );
            },
            static function (
                $sourceRegions,
                $targetRegions,
                $sourceObjects,
                $targetObjects
            ) use ($dataLayer): void {
                MapTableCopyServiceFactory::forSchemas(
                    $dataLayer,
                    $sourceRegions,
                    $targetRegions,
                    $sourceObjects,
                    $targetObjects
                )->copy();
            },
            get_rest_url(null, 'mapsvg/v1/')
        );
    }

    /** @param mixed $file */
    private static function deleteCopiedSvg($file): void
    {
        if (!is_object($file) || empty($file->serverPath)) {
            throw new \InvalidArgumentException(
                'Copied SVG has no server path.'
            );
        }

        $path = realpath((string) $file->serverPath);
        if ($path === false) {
            return;
        }
        $uploadsRoot = realpath(MAPSVG_UPLOADS_DIR);
        if ($uploadsRoot === false) {
            throw new \RuntimeException(
                'MapSVG uploads directory cannot be resolved.'
            );
        }

        $prefix = rtrim($uploadsRoot, DIRECTORY_SEPARATOR)
            . DIRECTORY_SEPARATOR;
        if (strpos($path, $prefix) !== 0) {
            throw new \RuntimeException(
                'Refusing to remove a copied SVG outside MapSVG uploads.'
            );
        }
        if (!unlink($path)) {
            throw new \RuntimeException(
                'Could not remove copied SVG during map-copy recovery.'
            );
        }
    }

    private function __construct()
    {
    }
}
