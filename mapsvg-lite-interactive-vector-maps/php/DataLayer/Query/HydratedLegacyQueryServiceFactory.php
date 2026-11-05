<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

use MapSVG\DataLayer\DataLayerV2;
use MapSVG\DataLayer\Mapping\SchemaRecordMapper;
use MapSVG\DataLayer\Post\PostEnricher;
use MapSVG\DataLayer\Post\PostEnrichedRecordHydratorFactory;
use MapSVG\Schema;

/** Explicit canary composition for simple legacy reads with post enrichment. */
final class HydratedLegacyQueryServiceFactory
{
    public static function forSchema(
        DataLayerV2 $dataLayer,
        Schema $schema,
        ?QueryLimits $limits = null,
        ?PostEnricher $posts = null
    ): HydratedLegacyQueryService {
        if ($schema->isRemote()) {
            throw new \InvalidArgumentException(
                'Remote schemas cannot use local hydrated queries.'
            );
        }

        $resolution = $dataLayer->resolveSchema($schema);
        $mapper = new SchemaRecordMapper(
            $schema,
            null,
            $resolution->primaryKey()
        );
        $limits = $limits ?? new QueryLimits();

        $hydrator = PostEnrichedRecordHydratorFactory::forSchema(
            $schema,
            $posts,
            $resolution->primaryKey()
        );

        return new HydratedLegacyQueryService(
            new LegacyQueryPlanner(
                $schema,
                $mapper,
                $resolution,
                $limits
            ),
            new HydratedSimpleQueryExecutor(
                new PlasmaQueryStore(
                    $dataLayer->modelForSchema($schema)
                ),
                $hydrator
            )
        );
    }

    private function __construct()
    {
    }
}
