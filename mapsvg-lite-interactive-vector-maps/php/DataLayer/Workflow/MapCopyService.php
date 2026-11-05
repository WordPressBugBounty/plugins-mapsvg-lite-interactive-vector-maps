<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Workflow;

/**
 * Top-level map copy orchestration with explicit compensation boundaries.
 *
 * Public repositories remain the compatibility facade; this service owns
 * ordering and failure cleanup.
 */
final class MapCopyService
{
    /** @var callable */
    private $findMap;
    /** @var callable */
    private $createMap;
    /** @var callable */
    private $updateMap;
    /** @var callable */
    private $deleteMap;
    /** @var callable */
    private $sanitizeTitle;
    /** @var callable */
    private $copySvg;
    /** @var callable */
    private $deleteSvg;
    /** @var callable */
    private $createSchema;
    /** @var callable */
    private $loadSchema;
    /** @var callable */
    private $targetSchemaExists;
    /** @var callable */
    private $cleanupSchemas;
    /** @var callable */
    private $copyPhysicalTables;
    private string $localApiBaseUrl;

    public function __construct(
        callable $findMap,
        callable $createMap,
        callable $updateMap,
        callable $deleteMap,
        callable $sanitizeTitle,
        callable $copySvg,
        callable $deleteSvg,
        callable $createSchema,
        callable $loadSchema,
        callable $targetSchemaExists,
        callable $cleanupSchemas,
        callable $copyPhysicalTables,
        string $localApiBaseUrl = ''
    ) {
        $this->findMap = $findMap;
        $this->createMap = $createMap;
        $this->updateMap = $updateMap;
        $this->deleteMap = $deleteMap;
        $this->sanitizeTitle = $sanitizeTitle;
        $this->copySvg = $copySvg;
        $this->deleteSvg = $deleteSvg;
        $this->createSchema = $createSchema;
        $this->loadSchema = $loadSchema;
        $this->targetSchemaExists = $targetSchemaExists;
        $this->cleanupSchemas = $cleanupSchemas;
        $this->copyPhysicalTables = $copyPhysicalTables;
        $this->localApiBaseUrl = $localApiBaseUrl;
    }

    /**
     * @param int|string $id
     * @param array<string,mixed> $newData
     * @return mixed Map-compatible domain object
     */
    public function copy($id, array $newData)
    {
        $title = call_user_func(
            $this->sanitizeTitle,
            isset($newData['title']) ? $newData['title'] : ''
        );
        $sourceMap = call_user_func($this->findMap, $id);
        $newFile = null;
        $newMap = null;

        try {
            try {
                $newFile = call_user_func(
                    $this->copySvg,
                    $sourceMap->options['source']
                );
            } catch (\Throwable $error) {
                throw new \Exception(
                    'Can\'t copy the SVG file.',
                    400,
                    $error
                );
            }

            // Preserve legacy data preparation without mutating the source map
            // object held by this request.
            $copyTemplate = clone $sourceMap;
            $copyTemplate->options['source'] = $newFile->relativeUrl;
            $copyTemplate->setSvgFilePath($newFile->relativeUrl);

            $newMapData = $copyTemplate->getData();
            $newMapData['title'] = $title;
            $newMapData['options']['title'] = $title;
            unset($newMapData['id']);

            $newMap = call_user_func($this->createMap, $newMapData);
            $mapUpdate = array(
                'id' => $newMap->id,
                'options' => $newMapData['options'],
            );
            $needUpdate = false;

            if (isset($newMapData['options']['templates']['directory'])) {
                $directory = $newMapData['options']['templates']['directory'];
                $directory = str_replace(
                    '{{>directoryItem-' . $sourceMap->id . '}}',
                    '{{>directoryItem}}',
                    $directory
                );
                $directory = str_replace(
                    '{{>directoryCategoryItem-' . $sourceMap->id . '}}',
                    '{{>directoryCategoryItem}}',
                    $directory
                );
                $mapUpdate['options']['templates']['directory'] = $directory;
                $needUpdate = true;
            }

            if (isset($newMapData['options']['css'])) {
                $mapUpdate['options']['css'] = str_replace(
                    '#mapsvg-map-' . $sourceMap->id,
                    '#mapsvg-map-' . $newMap->id,
                    $newMapData['options']['css']
                );
                $needUpdate = true;
            }

            if ($needUpdate) {
                $newMap = call_user_func($this->updateMap, $mapUpdate);
            }

            // Query-bound Apps share global data resources when copied. Only
            // unconverted v8 Apps own the former private-table copy workflow.
            $queryBound = !empty($sourceMap->options['scenes']);
            foreach ($sourceMap->options['scenes'] ?? array() as $page) foreach (array('objects', 'regions') as $role) {
                if (in_array($page['dataBindings'][$role]['queryId'] ?? '', array('', 'getObjects', 'getRegions'), true)) $queryBound = false;
            }
            if (!$queryBound) $this->copyTables($sourceMap, $newMap);

            return $newMap;
        } catch (\Throwable $error) {
            $recoveryErrors = array();

            if ($newMap !== null && isset($newMap->id)) {
                try {
                    call_user_func($this->deleteMap, $newMap->id);
                } catch (\Throwable $recoveryError) {
                    $recoveryErrors[] = 'map row: '
                        . $recoveryError->getMessage();
                }
            }

            if ($newFile !== null) {
                try {
                    call_user_func($this->deleteSvg, $newFile);
                } catch (\Throwable $recoveryError) {
                    $recoveryErrors[] = 'SVG file: '
                        . $recoveryError->getMessage();
                }
            }

            $this->rethrowWithRecovery($error, $recoveryErrors);
        }
    }

    /**
     * Public compatibility implementation for MapsRepository::copyTables().
     *
     * @param mixed $fromMap
     * @param mixed $toMap
     */
    public function copyTables($fromMap, $toMap): bool
    {
        $targetRegionsName = 'regions_' . $toMap->id;
        $targetObjectsName = 'objects_' . $toMap->id;

        $sourceRegionsName = self::sourceSchemaName($fromMap, 'regions');
        $sourceObjectsName = self::sourceSchemaName($fromMap, 'objects');
        $sourceRegionsSchema = call_user_func(
            $this->loadSchema,
            $sourceRegionsName
        );
        $fromObjectsSchema = call_user_func(
            $this->loadSchema,
            $sourceObjectsName
        );
        if ($sourceRegionsSchema === null) {
            throw new \OutOfBoundsException(
                'Map copy source schema not found: ' . $sourceRegionsName
            );
        }
        if ($fromObjectsSchema === null) {
            throw new \OutOfBoundsException(
                'Map copy source schema not found: ' . $sourceObjectsName
            );
        }

        foreach (array($targetRegionsName, $targetObjectsName) as $targetName) {
            if (call_user_func($this->targetSchemaExists, $targetName)) {
                throw new \LogicException(
                    'Map copy target schema or physical table already exists: '
                    . $targetName
                );
            }
        }

        try {
            $regionsSchemaData = \MapSVG\DataLayer\Schema\MapPrivateApiEndpoints::copy(
                $sourceRegionsSchema->getData(), (int) $fromMap->id, (int) $toMap->id,
                $this->localApiBaseUrl
            );
            unset($regionsSchemaData['id']);
            $regionsSchemaData['name'] = $targetRegionsName;
            $regionsPkField = $sourceRegionsSchema->getPrimaryKeyFieldName();
            foreach ($regionsSchemaData['fields'] as $key => $field) {
                $field = is_object($field)
                    ? clone $field
                    : (object) $field;
                if ($field->name === $regionsPkField) {
                    $field->not_null = true;
                }
                $regionsSchemaData['fields'][$key] = $field;
            }
            $newRegionsSchema = call_user_func(
                $this->createSchema,
                $regionsSchemaData
            );

            $objectsPkField = $fromObjectsSchema->getPrimaryKeyFieldName();
            $objectsSchemaData = \MapSVG\DataLayer\Schema\MapPrivateApiEndpoints::copy(
                $fromObjectsSchema->getData(), (int) $fromMap->id, (int) $toMap->id,
                $this->localApiBaseUrl
            );
            unset($objectsSchemaData['id']);
            $objectsSchemaData['name'] = $targetObjectsName;
            $objectsSchemaData['bindings'] = is_array($objectsSchemaData['bindings'] ?? null) ? $objectsSchemaData['bindings'] : [];
            $objectsSchemaData['bindings']['editor'] = array_merge(is_array($objectsSchemaData['bindings']['editor'] ?? null) ? $objectsSchemaData['bindings']['editor'] : [], [
                'regionsTableName' => $targetRegionsName, 'mapId' => (int) $toMap->id,
            ]);

            foreach ($objectsSchemaData['fields'] as $key => $field) {
                $field = is_object($field)
                    ? clone $field
                    : (object) $field;
                if ($field->name === $objectsPkField) {
                    $field->not_null = true;
                    if (!isset($field->auto_increment)
                        || $field->auto_increment !== true) {
                        $field->auto_increment = true;
                    }
                }
                $objectsSchemaData['fields'][$key] = $field;
            }

            $newObjectsSchema = call_user_func(
                $this->createSchema,
                $objectsSchemaData
            );

            call_user_func(
                $this->copyPhysicalTables,
                $sourceRegionsSchema,
                $newRegionsSchema,
                $fromObjectsSchema,
                $newObjectsSchema
            );

            $mapUpdate = array(
                'id' => $toMap->id,
                'options' => $toMap->options,
            );
            if (!isset($mapUpdate['options']['database'])) {
                $mapUpdate['options']['database'] = array();
            }
            $mapUpdate['options']['database']['regionsTableName']
                = $newRegionsSchema->name;
            $mapUpdate['options']['database']['objectsTableName']
                = $newObjectsSchema->name;
            if (!isset($mapUpdate['options']['database']['schemas'])) {
                $mapUpdate['options']['database']['schemas'] = array();
            }
            $mapUpdate['options']['database']['schemas']['regions'] = array(
                'name' => $newRegionsSchema->name,
            );
            $mapUpdate['options']['database']['schemas']['objects'] = array(
                'name' => $newObjectsSchema->name,
            );

            call_user_func($this->updateMap, $mapUpdate);
            return true;
        } catch (\Throwable $error) {
            $recoveryErrors = array();
            try {
                call_user_func(
                    $this->cleanupSchemas,
                    $targetObjectsName,
                    $targetRegionsName
                );
            } catch (\Throwable $recoveryError) {
                $recoveryErrors[] = 'schemas: '
                    . $recoveryError->getMessage();
            }

            $this->rethrowWithRecovery($error, $recoveryErrors);
        }
    }

    /** @param mixed $map */
    private static function sourceSchemaName($map, string $kind): string
    {
        $database = isset($map->options['database'])
            && is_array($map->options['database'])
            ? $map->options['database']
            : array();
        $schemas = isset($database['schemas'])
            && is_array($database['schemas'])
            ? $database['schemas']
            : array();

        if (isset($schemas[$kind]['name'])
            && is_string($schemas[$kind]['name'])
            && $schemas[$kind]['name'] !== '') {
            return $schemas[$kind]['name'];
        }

        $legacyKey = $kind === 'regions'
            ? 'regionsTableName'
            : 'objectsTableName';
        if (isset($database[$legacyKey])
            && is_string($database[$legacyKey])
            && $database[$legacyKey] !== '') {
            return $database[$legacyKey];
        }

        return $kind . '_' . $map->id;
    }

    /**
     * @param string[] $recoveryErrors
     */
    private function rethrowWithRecovery(
        \Throwable $error,
        array $recoveryErrors
    ): void {
        if ($recoveryErrors === array()) {
            throw $error;
        }

        throw new \RuntimeException(
            'Map copy failed: ' . $error->getMessage()
            . '. Recovery also failed for '
            . implode('; ', $recoveryErrors),
            0,
            $error
        );
    }
}
