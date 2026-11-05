<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Workflow;

use MapSVG\Schema;

/** Loads the canonical schema-catalog definition without invoking WP_Filesystem. */
final class MapCopyCatalogSchema
{
    public static function load(): Schema
    {
        $path = dirname(__DIR__, 2)
            . '/Core/schema/schema.json';
        $json = @file_get_contents($path);
        $data = is_string($json)
            ? json_decode($json, true)
            : null;
        if (!is_array($data)) {
            throw new \RuntimeException(
                'Could not load the MapSVG schema catalog definition.'
            );
        }

        return new Schema($data);
    }

    private function __construct()
    {
    }
}
