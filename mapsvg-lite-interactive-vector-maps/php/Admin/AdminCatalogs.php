<?php

namespace MapSVG;

/** Installation-wide picker catalogs are read only when a React picker opens. */
final class AdminCatalogs
{
    public static function register(): void
    {
        register_rest_route('mapsvg/v1', '/admin-catalogs', [
            'methods' => 'GET',
            'permission_callback' => [self::class, 'allowed'],
            'callback' => [self::class, 'index'],
            'args' => ['kind' => ['required' => true, 'enum' => ['svg', 'image', 'markers']]],
        ]);
    }

    public static function allowed(): bool
    {
        return is_user_logged_in() && current_user_can('edit_posts');
    }

    public static function index($request)
    {
        if (!self::allowed()) return new \WP_Error('mapsvg_catalog_forbidden', 'You cannot access the file library.', ['status' => 403]);
        $kind = $request['kind'] ?? '';
        if (!in_array($kind, ['svg', 'image', 'markers'], true)) return new \WP_Error('mapsvg_catalog_kind', 'Choose a file library.', ['status' => 400]);
        try {
            if ($kind === 'svg') $files = (new MapAssetCatalog())->svgFiles();
            elseif ($kind === 'image') $files = (new MapAssetCatalog())->imageFiles();
            else $files = array_map([self::class, 'markerMetadata'], (new MarkersRepository())->find());
            $response = new \WP_REST_Response(['files' => $files]);
            $response->header('Cache-Control', 'private, no-store, max-age=0');
            return $response;
        } catch (\Throwable $error) {
            return new \WP_Error('mapsvg_catalog_unavailable', 'The file library could not be loaded. Please retry.', ['status' => 500]);
        }
    }

    /** The default is needed before any picker opens; this does not scan the catalog. */
    public static function defaultMarker(): array
    {
        return [self::markerMetadata(new Marker(['serverPath' => MAPSVG_PINS_DIR . DIRECTORY_SEPARATOR . '_pin_default.png']))];
    }

    public static function markerMetadata($file): array
    {
        return ['name' => (string) ($file->name ?? ''), 'relativeUrl' => (string) ($file->relativeUrl ?? ''), 'pathShort' => (string) ($file->pathShort ?? '')];
    }
}
