<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Relation;

use MapSVG\DataLayer\DataLayerV2;
use MapSVG\DataLayer\Location\GeocodingProvider;
use MapSVG\DataLayer\Location\SynchronousLocationPreparationCanaryFactory;
use MapSVG\DataLayer\Mapping\SchemaRecordMapper;
use MapSVG\DataLayer\Store\PlasmaCrudStore;
use MapSVG\Schema;

/** Explicit composition root; callers must opt one repository into the canary. */
final class ObjectsRepositoryRelationCanaryFactory
{
    public static function forSchema(
        DataLayerV2 $dataLayer,
        Schema $schema,
        ?GeocodingProvider $geocodingProvider = null,
        string $country = ''
    ): ObjectsRepositoryRelationCanary {
        if ($schema->isRemote()) {
            throw new \InvalidArgumentException(
                'Remote schemas cannot use local relation writes.'
            );
        }

        $resolution = $dataLayer->resolveSchema($schema);
        $adapter = $dataLayer->client()->getAdapter();
        $relations = new WpdbRegionRelationStore($adapter);
        $writes = new ObjectRelationWriteService(
            new DatabaseTransactionRunner($adapter),
            $relations,
            $resolution->logicalTable()
        );

        $primaryKey = $resolution->primaryKey();
        $columns = $resolution->actualColumns();
        $extra = strtolower((string) (
            $columns[$primaryKey]['extra'] ?? ''
        ));
        $resetAutoIncrement = strpos(
            $extra,
            'auto_increment'
        ) !== false;
        $rows = new ObjectRowWriteStore(
            new PlasmaCrudStore($dataLayer->modelForSchema($schema)),
            $adapter,
            $resolution->physicalTable(),
            $primaryKey
        );

        $locationPreparation = null;
        if ($schema->getFieldByType('location') !== null) {
            $locationPreparation =
                SynchronousLocationPreparationCanaryFactory::forSchema(
                    $schema,
                    $geocodingProvider,
                    $country
                );
        }
        $preparer = new ObjectWritePreparationAdapter(
            new SchemaRecordMapper($schema, null, $primaryKey),
            $locationPreparation
        );

        return new ObjectsRepositoryRelationCanary(
            $writes,
            new RegionRelationNormalizer($schema),
            $rows,
            $resetAutoIncrement,
            $preparer
        );
    }

    private function __construct()
    {
    }
}
