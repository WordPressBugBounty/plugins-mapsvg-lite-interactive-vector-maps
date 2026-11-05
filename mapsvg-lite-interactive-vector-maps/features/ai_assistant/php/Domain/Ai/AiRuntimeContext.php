<?php

namespace MapSVG;

/** Secret-free facts from the current server request, never from browser/chat input. */
final class AiRuntimeContext
{
    /** Module ownership, not a table of inferred commercial tiers. */
    private const FEATURE_MODULES = [
        'directory' => 'directory', 'filters' => 'map_features',
        'javascript' => 'javascript', 'css' => 'code_editor', 'templates' => 'code_editor',
        'csv' => 'csv', 'google_sheets' => 'google_sheets', 'clustering' => 'clustering',
        'show_another_map' => 'show_another_map', 'ai_assistant' => 'ai_assistant',
    ];

    /** Pure projection shared by the request reader and contract tests. */
    public static function describe(string $basePlan, ?array $addon, array $modules, array $capabilities, bool $canEditApp): array
    {
        $modules = array_values(array_unique(array_filter($modules, 'is_string')));
        sort($modules, SORT_STRING);
        $features = [];
        foreach (self::FEATURE_MODULES as $feature => $module) $features[$feature] = in_array($module, $modules, true);
        // Distance/address search and the ordinary Map primitives are core-owned.
        $features['address_search'] = true;
        $features['region_data_rules'] = true;
        $permissions = [];
        foreach (['edit_posts', 'unfiltered_html', 'manage_options'] as $cap) $permissions[$cap] = !empty($capabilities[$cap]);
        return [
            'wordpress' => ['capabilities' => $permissions, 'actions' => [
                'edit_maps' => $permissions['edit_posts'] && $canEditApp,
                'edit_javascript' => $permissions['edit_posts'] && $canEditApp && $permissions['unfiltered_html'] && $features['javascript'],
                'edit_shortcode_allowlist' => $permissions['manage_options'],
            ]],
            'mapsvg' => [
                'basePlan' => $basePlan,
                'plan' => is_string($addon['slug'] ?? null) ? $addon['slug'] : $basePlan,
                'modules' => $modules,
                'features' => $features,
            ],
        ];
    }

    private static function manifestModules(string $directory, string $slug): ?array
    {
        $file = rtrim($directory, '/\\') . '/artifact-manifest.json';
        if (!is_readable($file)) return null;
        $manifest = json_decode((string) file_get_contents($file), true);
        if (!is_array($manifest) || ($manifest['slug'] ?? null) !== $slug || !is_array($manifest['ownedFeatureIds'] ?? null)) return null;
        return array_values(array_filter($manifest['ownedFeatureIds'], 'is_string'));
    }

    private static function addonDirectory(string $pluginFile, string $pluginsRoot): string
    {
        $pluginFile = str_replace('\\', '/', $pluginFile);
        return dirname(preg_match('#^(?:/|[A-Za-z]:/)#', $pluginFile)
            ? $pluginFile : rtrim($pluginsRoot, '/\\') . '/' . $pluginFile);
    }

    public static function snapshot(int $mapId): array
    {
        $basePlan = defined('MAPSVG_PLAN') ? (string) MAPSVG_PLAN : 'unknown';
        $addon = class_exists('MapSVG\\Core\\PaidAddonRegistry') ? \MapSVG\Core\PaidAddonRegistry::instance()->selected() : null;
        $modules = defined('MAPSVG_PLUGIN_DIR') ? self::manifestModules(MAPSVG_PLUGIN_DIR, $basePlan) : null;
        $source = $modules !== null ? 'installed_artifact_manifest' : 'unavailable';
        if ($modules === null && defined('MAPSVG_PLUGIN_DIR') && !in_array($basePlan, ['lite', 'mapsvg-lite', 'unknown'], true)
            && is_dir(MAPSVG_PLUGIN_DIR . '/paid/features')) {
            // Source checkout uses the full runtime; packaged artifacts use their manifest.
            $modules = [];
            foreach (array_unique(self::FEATURE_MODULES) as $module) {
                if (is_dir(MAPSVG_PLUGIN_DIR . '/paid/features/' . $module)) $modules[] = $module;
            }
            $source = 'full_source_checkout';
        }
        $modules = $modules ?? [];
        if ($addon !== null) {
            $paidModules = self::manifestModules(self::addonDirectory($addon['plugin_file'], defined('WP_PLUGIN_DIR') ? WP_PLUGIN_DIR : ''), $addon['slug']);
            if ($paidModules !== null) {
                $modules = array_merge($modules, $paidModules);
                $source = 'installed_base_and_selected_addon_manifests';
            } else $source = 'selected_addon_manifest_unavailable';
        }
        $caps = [];
        foreach (['edit_posts', 'unfiltered_html', 'manage_options'] as $cap) $caps[$cap] = current_user_can($cap);
        $canEditApp = $mapId > 0 ? AppDraftController::canEdit($mapId) : $caps['edit_posts'];
        $context = self::describe($basePlan, $addon, $modules, $caps, $canEditApp);
        $context['mapsvg']['version'] = defined('MAPSVG_VERSION') ? (string) MAPSVG_VERSION : null;
        $context['mapsvg']['availabilitySource'] = $source;
        $context['mapsvg']['importEnabled'] = \MapSVG\Core\CollectionImportFeature::isEnabled();
        // Reflect the actual REST/cron import gate in addition to module packaging.
        $context['mapsvg']['features']['csv'] = $context['mapsvg']['features']['csv'] && $context['mapsvg']['importEnabled'];
        $context['mapsvg']['features']['google_sheets'] = $context['mapsvg']['features']['google_sheets'] && $context['mapsvg']['importEnabled'];
        $context['integrations'] = ['woocommerce' => function_exists('WC'), 'acf' => function_exists('get_field')];
        $context['prerequisites'] = [
            'googleMapsKeyConfigured' => trim((string) Options::get('google_api_key')) !== '',
            'googleGeocodingKeyConfigured' => trim((string) Options::get('google_geocoding_api_key')) !== '',
        ];
        return $context;
    }

}
