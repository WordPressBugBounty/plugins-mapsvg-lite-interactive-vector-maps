<?php

declare(strict_types=1);

namespace MapSVG\DataLayer;

use MapSVG\Schema;

/**
 * Single production backend policy for the data-layer cutover.
 *
 * Local schemas use v2 by default. Legacy is a temporary diagnostic rollback
 * backend only; remote/API schemas remain outside both local backends.
 */
final class RuntimeBackendSelector
{
    public const V2 = 'v2';
    public const LEGACY = 'legacy';
    public const REMOTE = 'remote';

    /**
     * Planned removal boundary for the temporary rollback switch.
     * The flag must not become a permanent dual-runtime product mode.
     */
    public const LEGACY_ROLLBACK_REMOVE_IN = '10.0.0';

    public static function backendForSchema(Schema $schema): string
    {
        if ($schema->isRemote()) {
            return self::REMOTE;
        }

        return self::localBackend();
    }

    public static function localBackend(): string
    {
        $rollback = defined('MAPSVG_DATA_LAYER_LEGACY_ROLLBACK')
            && MAPSVG_DATA_LAYER_LEGACY_ROLLBACK === true;

        if (function_exists('apply_filters')) {
            $rollback = (bool) apply_filters(
                'mapsvg_data_layer_legacy_rollback',
                $rollback
            );
        }

        return self::resolve($rollback);
    }

    public static function isV2Default(): bool
    {
        return self::localBackend() === self::V2;
    }

    public static function resolve(bool $legacyRollback): string
    {
        return $legacyRollback ? self::LEGACY : self::V2;
    }

    private function __construct()
    {
    }
}
