<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Workflow;

use MapSVG\DataLayer\DataLayerV2;
use MapSVG\DataLayer\Relation\WpdbRegionRelationStore;
use MapSVG\DataLayer\Repository\SchemaCatalogV2Repository;
use MapSVG\DataLayer\Schema\SchemaMutationServiceFactory;
use MapSVG\DataLayer\Schema\StorageModelRegistrySynchronizer;

/** Composition root for failed-map-copy schema/table compensation. */
final class MapCopyRecoveryServiceFactory
{
    public static function create(
        DataLayerV2 $dataLayer
    ): MapCopyRecoveryService {
        $catalogSchema = MapCopyCatalogSchema::load();
        $catalog = new SchemaCatalogV2Repository(
            $catalogSchema,
            $dataLayer->registry()
        );
        $mutations = SchemaMutationServiceFactory::create(
            $dataLayer->provider()->wpdb(),
            new StorageModelRegistrySynchronizer($dataLayer->registry())
        );
        $relations = new WpdbRegionRelationStore(
            $dataLayer->client()->getAdapter()
        );

        return new MapCopyRecoveryService(
            $catalog,
            $mutations,
            $relations
        );
    }

    private function __construct()
    {
    }
}
