<?php
/*
Plugin Name: MapSVG Pro
Plugin URI: https://mapsvg.com
Description: Paid MapSVG add-on. Requires MapSVG Lite.
Version: 8.16.1
Requires at least: 5.0
Requires PHP: 7.4
Requires Plugins: mapsvg-lite-interactive-vector-maps
Author: Northern Lights Production
Author URI: https://mapsvg.com
License: GPLv2 or later
Text Domain: mapsvg-pro
*/

if (!defined('ABSPATH')) {
    exit;
}

$mapsvgPaidAddon = array(
    'slug' => 'mapsvg-pro',
    'sku' => 'pro',
    'title' => 'MapSVG Pro',
    'version' => '8.16.1',
    'plugin_file' => plugin_basename(__FILE__),
    'requires_lite_version' => '8.16.1',
    'requires_addon_api' => 1,
);

$mapsvgPaidAddonState = array(
    'declared' => false,
    'missing_lite' => false,
);

add_action('plugins_loaded', function () use ($mapsvgPaidAddon, &$mapsvgPaidAddonState): void {
    if (
        !defined('MAPSVG_ADDON_API_VERSION') ||
        !class_exists('\\MapSVG\\Core\\PaidAddonRegistry')
    ) {
        $mapsvgPaidAddonState['missing_lite'] = true;
        return;
    }

    \MapSVG\Core\PaidAddonRegistry::instance()->declare($mapsvgPaidAddon);
    $mapsvgPaidAddonState['declared'] = true;
}, 5);

add_action('plugins_loaded', function () use ($mapsvgPaidAddon, &$mapsvgPaidAddonState): void {
    if ($mapsvgPaidAddonState['missing_lite']) {
        add_action('admin_notices', function () use ($mapsvgPaidAddon): void {
            echo '<div class="notice notice-error"><p>' .
                esc_html($mapsvgPaidAddon['title'] . ' requires MapSVG Lite to be installed and active.') .
                '</p></div>';
        });
        return;
    }

    if (!$mapsvgPaidAddonState['declared']) {
        return;
    }

    $registry = \MapSVG\Core\PaidAddonRegistry::instance();
    if (!$registry->isResolved()) {
        add_action('admin_notices', function () use ($mapsvgPaidAddon): void {
            echo '<div class="notice notice-error"><p>' .
                esc_html($mapsvgPaidAddon['title'] . ' could not initialize because the MapSVG Lite add-on contract did not resolve.') .
                '</p></div>';
        });
        return;
    }
    if (!$registry->isSelected($mapsvgPaidAddon['slug'])) {
        return;
    }

    require_once __DIR__ . '/mapsvg-modules.php';

    $pluginUrl = plugin_dir_url(__FILE__);
    $version = $mapsvgPaidAddon['version'];
    $mapsvgPaidScriptExcludes = array('mapsvg-pro-admin.js');

    if (!empty($mapsvgPaidScriptExcludes)) {
        $mapsvgPaidScriptExcludeFilter = function ($excludes) use ($mapsvgPaidScriptExcludes) {
            $excludes = is_array($excludes) ? $excludes : array();
            return array_values(array_unique(array_merge($excludes, $mapsvgPaidScriptExcludes)));
        };
        add_filter('litespeed_optimize_js_excludes', $mapsvgPaidScriptExcludeFilter);
        add_filter('litespeed_optm_js_defer_exc', $mapsvgPaidScriptExcludeFilter);
        add_filter('litespeed_optm_gm_js_exc', $mapsvgPaidScriptExcludeFilter);
    }


    wp_register_script(
        'mapsvg-pro-admin',
        $pluginUrl . 'dist/mapsvg-pro-admin.js',
        array('mapsvg', 'mapsvg-react-vendor'),
        $version,
        true
    );
    add_filter('mapsvg_react_admin_extension_script_dependencies', function ($handles) {
        $handles = is_array($handles) ? $handles : array();
        $handles[] = 'mapsvg-pro-admin';
        return array_values(array_unique($handles));
    });

    $adminStyleScript = 'window.MapSVG.extensions.register("admin.style",' .
        wp_json_encode($mapsvgPaidAddon['slug']) .
        ',{id:' . wp_json_encode($mapsvgPaidAddon['slug']) .
        ',url:' . wp_json_encode($pluginUrl . 'dist/mapsvg-pro-admin.css') .
        '});';
    wp_add_inline_script('mapsvg-pro-admin', $adminStyleScript, 'before');


    $metadataScript = 'window.MapSVG.extensions.setActiveAddon(' .
        wp_json_encode(array(
            'sku' => $mapsvgPaidAddon['sku'],
            'version' => $mapsvgPaidAddon['version'],
            'plugin' => $mapsvgPaidAddon['slug'],
        )) .
        ');';
    wp_add_inline_script('mapsvg-pro-admin', $metadataScript, 'before');

}, 12);
