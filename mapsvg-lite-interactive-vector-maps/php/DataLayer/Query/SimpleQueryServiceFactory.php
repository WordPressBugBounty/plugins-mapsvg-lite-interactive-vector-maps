<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

use MapSVG\DataLayer\DataLayerV2;
use MapSVG\DataLayer\Mapping\RecordMapper;
use MapSVG\DataLayer\Mapping\SchemaRecordMapper;
use MapSVG\DataLayer\Validation\OperationValidationService;
use MapSVG\Schema;

/** Builds a strict query service for one server-selected MapSVG schema. */
final class SimpleQueryServiceFactory
{
    public static function forSchema(
        DataLayerV2 $dataLayer,
        Schema $schema,
        ?QueryLimits $limits = null,
        ?PostIdResolver $postResolver = null,
        ?RecordMapper $mapper = null
    ): SimpleQueryService {
        \MapSVG\Core\PostDataFeature::assertSchema($schema);
        $resolution = $dataLayer->resolveSchema($schema);
        $mapper = $mapper ?? new SchemaRecordMapper(
            $schema,
            null,
            $resolution->primaryKey()
        );
        $limits = $limits ?? new QueryLimits();
        $fields = new QueryFieldResolver($schema, $mapper, $resolution);
        $advancedContext = new AdvancedQueryContext(
            $schema,
            $resolution,
            $dataLayer->client()->getAdapter(),
            $fields,
            $limits,
            $dataLayer->provider()->physicalPrefix() . 'r2o',
            $postResolver ?? new WordPressPostIdResolver($limits)
        );

        return new SimpleQueryService(
            new LegacyQueryPlanner($schema, $mapper, $resolution, $limits),
            new PrismaQueryPlanner($schema, $mapper, $resolution, $limits),
            new SimpleQueryExecutor(
                new PlasmaQueryStore($dataLayer->modelForSchema($schema)),
                $mapper
            ),
            new AdvancedQueryExecutor($advancedContext, $mapper),
            new OperationValidationService($schema, $limits)
        );
    }

    private function __construct()
    {
    }
}
