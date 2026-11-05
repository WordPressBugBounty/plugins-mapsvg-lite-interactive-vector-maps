<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Relation;

use MapSVG\DataLayer\DataLayerV2;
use MapSVG\Schema;

/** Explicit composition root for atomic orphan-region deletion. */
final class RegionOrphanDeleteServiceFactory
{
    public static function forSchema(
        DataLayerV2 $dataLayer,
        Schema $schema,
        int $batchSize = 500
    ): RegionOrphanDeleteService {
        if ($schema->isRemote()) {
            throw new \InvalidArgumentException(
                'Remote schemas cannot delete local orphan regions.'
            );
        }
        if (!$schema->getField('orphaned')) {
            throw new \InvalidArgumentException(
                'Region schema has no orphaned field.'
            );
        }
        $resolution = $dataLayer->resolveSchema($schema);
        foreach (array(
            $resolution->primaryKey(),
            'orphaned',
        ) as $field) {
            if (!array_key_exists(
                $field,
                $resolution->actualColumns()
            )) {
                throw new \UnexpectedValueException(
                    'Orphan cleanup field is missing from physical storage: '
                    . $field
                );
            }
        }

        $adapter = $dataLayer->client()->getAdapter();
        return new RegionOrphanDeleteService(
            $adapter,
            new DatabaseTransactionRunner($adapter),
            new WpdbRegionRelationStore($adapter),
            $resolution->logicalTable(),
            $resolution->physicalTable(),
            $resolution->primaryKey(),
            $batchSize
        );
    }

    private function __construct()
    {
    }
}
