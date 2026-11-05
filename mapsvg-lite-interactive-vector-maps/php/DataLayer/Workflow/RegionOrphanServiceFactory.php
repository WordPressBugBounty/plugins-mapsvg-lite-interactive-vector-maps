<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Workflow;

use MapSVG\DataLayer\DataLayerV2;
use MapSVG\DataLayer\Relation\RegionOrphanDeleteServiceFactory;
use MapSVG\Schema;

/** Composition root for prefix-aware region orphan workflows. */
final class RegionOrphanServiceFactory
{
    public static function forSchema(
        DataLayerV2 $dataLayer,
        Schema $schema,
        int $batchSize = 500
    ): RegionOrphanService {
        if ($schema->isRemote()) {
            throw new \InvalidArgumentException(
                'Remote schemas cannot use local orphan workflows.'
            );
        }
        if (!$schema->getField('orphaned')) {
            throw new \InvalidArgumentException(
                'Region schema has no orphaned field.'
            );
        }

        $resolution = $dataLayer->resolveSchema($schema);
        foreach (array($resolution->primaryKey(), 'orphaned') as $field) {
            if (!array_key_exists($field, $resolution->actualColumns())) {
                throw new \UnexpectedValueException(
                    'Orphan workflow field is missing from physical storage: '
                    . $field
                );
            }
        }

        return new RegionOrphanService(
            $dataLayer->client()->getAdapter(),
            RegionOrphanDeleteServiceFactory::forSchema(
                $dataLayer,
                $schema,
                $batchSize
            ),
            $resolution->physicalTable(),
            $resolution->primaryKey(),
            $batchSize
        );
    }

    private function __construct()
    {
    }
}
