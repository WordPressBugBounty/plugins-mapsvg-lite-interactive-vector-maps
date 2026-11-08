<?php
namespace MapSVG\Core;

/** Server-owned CSS/HBS entitlement, including already released add-on manifests. */
final class CodeEditorFeature
{
    public static function isEnabled(): bool
    {
        $root = dirname(__DIR__, 2);
        $enabled = !file_exists($root . '/artifact-manifest.json')
            && (!defined('MAPSVG_PLAN') || !in_array(MAPSVG_PLAN, ['lite', 'mapsvg-lite'], true))
            && is_dir($root . '/paid/features/code_editor');
        $addon = class_exists(PaidAddonRegistry::class) ? PaidAddonRegistry::instance()->selected() : null;
        if ($addon) {
            $file = str_replace('\\', '/', $addon['plugin_file']);
            if (!preg_match('#^(?:/|[A-Za-z]:/)#', $file)) $file = (defined('WP_PLUGIN_DIR') ? WP_PLUGIN_DIR : '') . '/' . $file;
            $manifest = json_decode((string) @file_get_contents(dirname($file) . '/artifact-manifest.json'), true);
            $enabled = $enabled || (is_array($manifest) && ($manifest['slug'] ?? null) === $addon['slug']
                && is_array($manifest['ownedFeatureIds'] ?? null) && in_array('code_editor', $manifest['ownedFeatureIds'], true));
        }
        return function_exists('apply_filters') ? (bool) apply_filters('mapsvg_code_editor_enabled', $enabled) : $enabled;
    }
}
