<?php

namespace MapSVG;

/** Public browser boot information; map and Query authorization remain on their own routes. */
class RuntimeBootstrap
{
    public static function register(): void
    {
        register_rest_route('mapsvg/v1', '/runtime', [
            'methods' => 'GET',
            'permission_callback' => '__return_true',
            'callback' => [self::class, 'get'],
        ]);
    }

    public static function get()
    {
        Front::addJsCss();
        $registry = wp_scripts();
        // Include the separately enqueued autocomplete dependencies as well as the core graph.
        $scripts = self::scripts($registry->registered, ['jquery', 'typeahead', 'bloodhound', 'mapsvg'], $registry->base_url);
        $params = Front::frontendParams(true);
        foreach (['root', 'maps', 'uploads', 'templates'] as $key) {
            $params['routes'][$key] = self::absoluteUrl($params['routes'][$key], home_url('/'));
        }
        foreach ($params['styles'] as &$style) {
            $style['url'] = self::absoluteUrl($style['url'], home_url('/'));
        }
        unset($style);
        $selected = \MapSVG\Core\PaidAddonRegistry::instance()->selected();
        $addon = $selected ? ['sku' => $selected['sku'], 'version' => $selected['version'], 'plugin' => $selected['slug']] : null;
        return new \WP_REST_Response(['protocol' => 1, 'engine' => 9, 'params' => $params, 'scripts' => $scripts, 'addon' => $addon]);
    }

    /** Dependency order is significant: shared host and selected add-on must precede core. */
    public static function scripts(array $registered, array $roots, string $baseUrl): array
    {
        $output = [];
        $visited = [];
        $visiting = [];
        $visit = static function (string $handle) use (&$visit, &$output, &$visited, &$visiting, $registered, $baseUrl): void {
            if (isset($visited[$handle])) return;
            if (isset($visiting[$handle]) || !isset($registered[$handle])) {
                throw new \RuntimeException('MapSVG runtime dependency is unavailable: ' . $handle);
            }
            $visiting[$handle] = true;
            $script = $registered[$handle];
            foreach ($script->deps as $dependency) $visit($dependency);
            if ($script->src) {
                $url = self::absoluteUrl($script->src, $baseUrl);
                if ($script->ver) $url = add_query_arg('ver', $script->ver, $url);
                $output[] = ['handle' => $handle, 'url' => $url, 'type' => $handle === 'mapsvg' ? 'module' : 'classic'];
            }
            unset($visiting[$handle]);
            $visited[$handle] = true;
        };
        foreach ($roots as $root) $visit($root);
        return $output;
    }

    public static function absoluteUrl(string $url, string $baseUrl): string
    {
        if (preg_match('#^https?://#i', $url)) return $url;
        if (strpos($url, '//') === 0) return wp_parse_url($baseUrl, PHP_URL_SCHEME) . ':' . $url;
        $origin = wp_parse_url($baseUrl);
        $authority = $origin['scheme'] . '://' . $origin['host'] . (isset($origin['port']) ? ':' . $origin['port'] : '');
        return strpos($url, '/') === 0 ? $authority . $url : rtrim($baseUrl, '/') . '/' . $url;
    }
}
