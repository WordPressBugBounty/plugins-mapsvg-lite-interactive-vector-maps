<?php
namespace MapSVG\Core;

/** Product availability is independent of WordPress's unfiltered_html permission. */
final class JavascriptFeature
{
    public static function isEnabled(): bool
    {
        // Full source development runs without an artifact manifest. Installed
        // artifacts have no /paid source tree and require the selected module.
        $root = dirname(__DIR__, 2);
        $source = !file_exists($root . "/artifact-manifest.json") && (!defined('MAPSVG_PLAN') || !in_array(MAPSVG_PLAN, ['lite', 'mapsvg-lite'], true))
            && is_dir($root . '/paid/features/javascript');
        return function_exists('apply_filters') ? (bool) apply_filters('mapsvg_javascript_enabled', $source) : $source;
    }
}
