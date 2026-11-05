<?php
namespace MapSVG;
require_once __DIR__ . '/../Core/JavascriptFeature.php';

/** Frozen v8 clients; current PHP owns security, shared data and version publication. */
final class LegacyV8
{
    public static function assets(): array
    {
        $assets = apply_filters('mapsvg_legacy_v8_assets', ['dir' => MAPSVG_PLUGIN_DIR . '/compat/v8', 'url' => MAPSVG_PLUGIN_URL . 'compat/v8/']);
        $manifest = is_file($assets['dir'] . '/manifest.json') ? json_decode(file_get_contents($assets['dir'] . '/manifest.json'), true) : [];
        if (isset($manifest['directory']) && preg_match('/\A[a-f0-9]{16}\z/D', $manifest['directory'])) {
            $assets['dir'] .= '/' . $manifest['directory']; $assets['url'] .= $manifest['directory'] . '/';
        }
        return $assets;
    }

    /** Standalone built-in URLs survive the move of /maps into the Lite base. */
    public static function source(string $source): string
    {
        $host = wp_parse_url($source, PHP_URL_HOST);
        if ($host && strcasecmp($host, (string) wp_parse_url(home_url(), PHP_URL_HOST)) !== 0) return $source;
        $path = wp_parse_url($source, PHP_URL_PATH);
        if (!is_string($path) || !preg_match('~/mapsvg(?:-[a-z0-9-]+)?/maps/(.+\.svg)$~i', $path, $match)) return $source;
        $relative = rawurldecode($match[1]);
        $root = realpath(MAPSVG_MAPS_DIR); $file = realpath(MAPSVG_MAPS_DIR . '/' . $relative);
        if (!$root || !$file || strpos($relative, "\0") !== false || strpos($file, $root . DIRECTORY_SEPARATOR) !== 0) return $source;
        return rtrim((string) wp_parse_url(MAPSVG_MAPS_URL, PHP_URL_PATH), '/') . '/' . $relative;
    }

    public static function isEditorRequest(): bool { return isset($_GET['mapsvg_old_editor']) && (string) $_GET['mapsvg_old_editor'] === '1'; }

    public static function editorUrl(int $mapId, int $versionId): string
    {
        return add_query_arg(['page' => 'mapsvg-config', 'map_id' => $mapId, 'mapsvg_old_editor' => '1', 'mapsvg_version' => $versionId], admin_url('admin.php'));
    }

    public static function liveVersion(int $mapId): int
    {
        $db = Database::get();
        return (int) $db->get_var($db->prepare('SELECT version_id FROM `' . $db->mapsvg_prefix . 'map_live_versions` WHERE map_id=%d', $mapId));
    }

    public static function assertEditor($map): int
    {
        if (!$map || !AppDraftController::canEdit((int) $map->id) || AppEngine::version($map->options) !== 8) throw new \RuntimeException('This map is not a current v8 publication.', 403);
        $live = self::liveVersion((int) $map->id);
        if (!$live || $live !== (int) ($_GET['mapsvg_version'] ?? 0)) throw new \RuntimeException('The published version changed. Open the old editor again from Versions.', 409);
        return $live;
    }

    public static function renderEditor($map): void
    {
        $assets = self::assets();
        $html = file_get_contents($assets['dir'] . '/html/editor.html');
        if ($html === false) throw new \RuntimeException('Frozen master editor view is missing.');
        $support = strpos(home_url(), 'demo.mapsvg.com') !== false ? 'support-demo.html' : 'support.html';
        $html .= file_get_contents($assets['dir'] . '/html/' . $support);
        echo strtr($html, ['{{adminUrl}}' => esc_url(admin_url('admin.php?page=mapsvg-config')), '{{pluginRoot}}' => esc_url(MAPSVG_PLUGIN_RELATIVE_URL), '{{mapId}}' => (string) (int) $map->id]);
    }

    public static function enqueue(): void
    {
        $assets = self::assets();
        if (!is_file($assets['dir'] . '/dist/mapsvg.js')) throw new \RuntimeException('Frozen v8 client assets are missing. Rebuild the MapSVG package.');
        $root = $assets['url'];
        $version = json_decode(file_get_contents($assets['dir'] . '/manifest.json'), true)['version'];
        foreach (['mselect2' => 'select2/select2.full.min.js', 'nanoscroller' => 'nanoscroller/jquery.nanoscroller.min.js', 'handlebars' => 'handlebars/handlebars.min.js', 'handlebars-helpers' => 'handlebars/handlebars-helpers.js', 'typeahead' => 'typeahead/typeahead.jquery.js', 'bloodhound' => 'typeahead/bloodhound.js'] as $handle => $file) {
            wp_enqueue_script($handle, $root . 'js/vendor/' . $file, ['jquery'], $version, true);
        }
        wp_enqueue_script('mapsvg-legacy-v8', $root . 'dist/mapsvg.js', ['jquery', 'mselect2', 'nanoscroller', 'handlebars', 'handlebars-helpers'], $version, true);
        wp_localize_script('mapsvg-legacy-v8', 'mapsvgLegacyV8FrontendParams', [
            'routes' => ['root' => $root, 'api' => get_rest_url(null, 'mapsvg/v1/'), 'templates' => $root . 'js/mapsvg-admin/templates/', 'maps' => wp_parse_url(MAPSVG_MAPS_URL, PHP_URL_PATH), 'uploads' => wp_parse_url(MAPSVG_UPLOADS_URL, PHP_URL_PATH), 'home' => home_url()],
            'nonce' => wp_create_nonce('wp_rest'), 'google_maps_api_key' => Options::get('google_api_key'),
            'styles' => [
                ['name' => 'mapsvg-v8', 'url' => $root . 'dist/mapsvg-bundle.css', 'version' => $version],
                ['name' => 'nanoscroller', 'url' => $root . 'js/vendor/nanoscroller/nanoscroller.css', 'version' => '0.8.7'],
                ['name' => 'select2', 'url' => $root . 'js/vendor/select2/select2.min.css', 'version' => '4.0.31'],
            ],
        ]);
        // Literal JS preserves boolean type; wp_localize_script stringifies top-level scalars.
        wp_add_inline_script('mapsvg-legacy-v8', 'window.mapsvgLegacyV8JavascriptEnabled=' .
            (\MapSVG\Core\JavascriptFeature::isEnabled() ? 'true' : 'false') . ';', 'before');
        wp_add_inline_script('mapsvg-legacy-v8', 'window.addEventListener("mapsvgLegacyV8Initialized", function () { if (!window.mapsvg || window.mapsvg instanceof HTMLElement) { window.mapsvg = window.mapsvgLegacyV8; window.MapSVG = Object.assign(window.MapSVGLegacyV8, { extensions: window.MapSVG?.extensions }); } });', 'before');
        add_filter('script_loader_tag', static function ($tag, $handle) { return $handle === 'mapsvg-legacy-v8' ? str_replace('<script ', '<script type="module" data-no-minify="1" ', $tag) : $tag; }, 20, 2);
    }
}
