<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Relation;

use MapSVG\DataLayer\DataLayerV2;
use MapSVG\Schema;

/** Explicit composition root for bounded relation rebuild jobs. */
final class RegionRelationRebuilderFactory
{
    public static function forSchema(
        DataLayerV2 $dataLayer,
        Schema $schema
    ): RegionRelationRebuilder {
        if ($schema->isRemote()) {
            throw new \InvalidArgumentException(
                'Remote schemas cannot rebuild local relations.'
            );
        }

        $resolution = $dataLayer->resolveSchema($schema);
        $adapter = $dataLayer->client()->getAdapter();
        $normalizer = new RegionRelationNormalizer($schema);

        foreach ($normalizer->fieldNames() as $fieldName) {
            if (!array_key_exists(
                $fieldName,
                $resolution->actualColumns()
            )) {
                throw new \UnexpectedValueException(
                    'Relation field is missing from physical storage: '
                    . $fieldName
                );
            }
        }

        $transactions = new DatabaseTransactionRunner($adapter);
        return new RegionRelationRebuilder(
            $adapter,
            $transactions,
            new WpdbRegionRelationStore($adapter),
            $normalizer,
            $resolution->logicalTable(),
            $resolution->physicalTable(),
            $resolution->primaryKey()
        );
    }

    private function __construct()
    {
    }
}
