<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Workflow;

use MapSVG\DataLayer\DataLayerV2;
use MapSVG\DataLayer\Relation\DatabaseTransactionRunner;
use MapSVG\DataLayer\Relation\WpdbRegionRelationStore;
use MapSVG\DataLayer\StorageSchemaResolution;
use MapSVG\Schema;

/** Composition root for map region/object/r2o physical copy. */
final class MapTableCopyServiceFactory
{
    public static function forSchemas(
        DataLayerV2 $dataLayer,
        Schema $sourceRegions,
        Schema $targetRegions,
        Schema $sourceObjects,
        Schema $targetObjects
    ): MapTableCopyService {
        foreach (array(
            'source regions' => $sourceRegions,
            'target regions' => $targetRegions,
            'source objects' => $sourceObjects,
            'target objects' => $targetObjects,
        ) as $label => $schema) {
            if ($schema->isRemote()) {
                throw new \InvalidArgumentException(
                    ucfirst($label) . ' schema cannot be remote.'
                );
            }
        }

        $sourceRegionsResolution = $dataLayer->resolveSchema($sourceRegions);
        $targetRegionsResolution = $dataLayer->resolveSchema($targetRegions);
        $sourceObjectsResolution = $dataLayer->resolveSchema($sourceObjects);
        $targetObjectsResolution = $dataLayer->resolveSchema($targetObjects);

        $regionColumns = self::copyColumns(
            $sourceRegionsResolution,
            $targetRegionsResolution,
            'region'
        );
        $objectColumns = self::copyColumns(
            $sourceObjectsResolution,
            $targetObjectsResolution,
            'object'
        );
        if (!in_array('regions', $objectColumns, true)) {
            throw new \UnexpectedValueException(
                'Object storage is missing the physical regions column.'
            );
        }

        $adapter = $dataLayer->client()->getAdapter();

        return new MapTableCopyService(
            $adapter,
            new DatabaseTransactionRunner($adapter),
            new WpdbRegionRelationStore($adapter),
            $sourceRegionsResolution->logicalTable(),
            $targetRegionsResolution->logicalTable(),
            $sourceObjectsResolution->logicalTable(),
            $targetObjectsResolution->logicalTable(),
            $sourceRegionsResolution->physicalTable(),
            $targetRegionsResolution->physicalTable(),
            $sourceObjectsResolution->physicalTable(),
            $targetObjectsResolution->physicalTable(),
            $regionColumns,
            $objectColumns
        );
    }

    /** @return string[] */
    private static function copyColumns(
        StorageSchemaResolution $source,
        StorageSchemaResolution $target,
        string $label
    ): array {
        $sourceColumns = array_keys($source->actualColumns());
        $targetColumns = $target->actualColumns();

        foreach ($sourceColumns as $column) {
            if (!array_key_exists($column, $targetColumns)) {
                throw new \UnexpectedValueException(
                    'Target ' . $label . ' storage is missing source column: '
                    . $column
                );
            }
        }

        return $sourceColumns;
    }

    private function __construct()
    {
    }
}
