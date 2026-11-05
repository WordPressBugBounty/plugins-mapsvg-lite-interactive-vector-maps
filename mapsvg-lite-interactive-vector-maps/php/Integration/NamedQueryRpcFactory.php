<?php

declare(strict_types=1);
namespace MapSVG\Integration;

use MapSVG\App\Data\Query\QueryRegistry;
use MapSVG\App\Data\Query\QueryRpcDispatcher;
use MapSVG\App\Data\Query\StoredQueryProvider;
use MapSVG\App\Data\Query\WordPressQueryContext;
use MapSVG\DataLayer\SavedQuery\GlobalQueriesFeature;
use MapSVG\DataLayer\SavedQuery\SavedQueryStore;
use MapSVG\DataLayer\SavedQuery\StoredQueryGatewayAdapter;
use MapSVG\DataLayer\Collection\CollectionQueryExecutionService;
use MapSVG\DataLayer\Collection\CollectionReadGatewayAdapter;
use MapSVG\Shared\QueryRpc\BuiltinQueryNames;

/** Explicit composition root; registration is separate from per-request identity capture. */
final class NamedQueryRpcFactory
{
    public static function registerRoutes(): void
    {
        $controller=self::controller();
        \MapSVG\App\Http\QueryRpcRoutes::register($controller);
        if($controller->available())NamedQueryRpcResponseEncoder::register();
    }

    public static function controller(): \MapSVG\App\Http\QueryRpcController
    {
        return new \MapSVG\App\Http\QueryRpcController(
            static function (WordPressQueryContext $context): QueryRpcDispatcher { return self::create($context); },
            array(WordPressQueryContext::class, 'capture'),
            array(GlobalQueriesFeature::class, 'isEnabled')
        );
    }

    public static function create(WordPressQueryContext $context, ?callable $reportError = null): QueryRpcDispatcher
    {
        if (!GlobalQueriesFeature::isEnabled()) throw new \DomainException('Global Queries are disabled.');
        $store = new SavedQueryStore();
        $collectionQueries = new CollectionQueryExecutionService();
        $gateway = new StoredQueryGatewayAdapter(
            $store,
            $collectionQueries,
            $context->siteId()
        );
        $registry = new QueryRegistry(new StoredQueryProvider($gateway, $context->siteId()));
        $registry->register(BuiltinQueryNames::PAGE_BINDING, new \MapSVG\DataLayer\SavedQuery\PageBindingQuery($store, $collectionQueries));
        $collections = new CollectionReadGatewayAdapter(
            $context->siteId(),
            null,
            array($collectionQueries, 'execute')
        );
        $registry->register(BuiltinQueryNames::COLLECTION, new \MapSVG\App\Data\Query\CollectionQuery(
            $collections,
            $context->siteId()
        ));
        $registry->register(BuiltinQueryNames::SCHEMA, new \MapSVG\App\Data\Query\SchemaQuery(
            $collections,
            $context->siteId()
        ));
        $registry->register(BuiltinQueryNames::SCHEMAS, new \MapSVG\App\Data\Query\SchemaCatalogQuery(
            $collections,
            $context->siteId()
        ));
        return new QueryRpcDispatcher($registry, $reportError);
    }
}
