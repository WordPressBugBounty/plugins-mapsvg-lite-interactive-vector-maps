<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\SavedQuery;

use MapSVG\DataLayer\DataLayerFactory;

/** Global Queries follow the v2 production backend, with an explicit rollback switch. */
final class GlobalQueriesFeature
{
    public static function isEnabled(): bool
    {
        if (!DataLayerFactory::isV2Enabled()) return false;
        $enabled = !defined('MAPSVG_GLOBAL_QUERIES') || MAPSVG_GLOBAL_QUERIES === true;
        if (function_exists('apply_filters')) {
            $enabled = (bool) apply_filters('mapsvg_global_queries_enabled', $enabled);
        }
        return $enabled;
    }
}
