<?php

declare(strict_types=1);

namespace MapSVG\Core;

/** Shared package capability for Collection Import navigation and REST routes. */
final class CollectionImportFeature
{
    public static function isEnabled(): bool
    {
        $enabled = false;
        // START csv
        $enabled = true;
        // END
        if (defined('MAPSVG_PLAN') && MAPSVG_PLAN === 'mapsvg-lite') {
            return (bool) apply_filters('mapsvg_collection_import_enabled', false);
        }
        return $enabled;
    }
}
