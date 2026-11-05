<?php

declare(strict_types=1);

namespace MapSVG\Shared\QueryRpc;

/** Reserved protocol names (including deferred names); only query resolvers are composed here.
 * Code-owned RPC names. Saved/user Queries may never shadow these dispatch contracts. */
final class BuiltinQueryNames
{
    public const APP_BOOTSTRAP = 'getAppBootstrap';
    public const PUBLISHED_APP_BOOTSTRAP = 'getPublishedAppBootstrap';
    public const COLLECTION = 'getCollection';
    public const SCHEMA = 'getSchema';
    public const SCHEMAS = 'listSchemas';
    public const PAGE_BINDING = 'getPageBinding';

    public static function all(): array
    {
        return array(
            self::APP_BOOTSTRAP,
            self::PUBLISHED_APP_BOOTSTRAP,
            self::COLLECTION,
            self::SCHEMA,
            self::SCHEMAS,
            self::PAGE_BINDING,
        );
    }

    public static function isReserved(string $name): bool
    {
        return in_array($name, self::all(), true);
    }

    private function __construct()
    {
    }
}
