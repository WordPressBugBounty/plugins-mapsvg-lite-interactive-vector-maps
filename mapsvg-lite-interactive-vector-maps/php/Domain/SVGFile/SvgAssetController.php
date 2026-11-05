<?php

namespace MapSVG;

final class SvgAssetController
{
    public static function register(): void
    {
        foreach (['/svg-assets' => 'index', '/svg-assets/(?P<assetId>\d+)' => 'show', '/svg-assets/(?P<assetId>\d+)/revisions' => 'history'] as $path => $action) {
            register_rest_route('mapsvg/v1', $path, ['methods' => 'GET',
                'permission_callback' => static function () { return is_user_logged_in() && current_user_can('edit_posts'); },
                'callback' => static function ($request) use ($action) { return self::dispatch($action, $request); }]);
        }
    }

    public static function dispatch(string $action, $request)
    {
        try {
            if (!is_user_logged_in() || !current_user_can('edit_posts')) return new \WP_Error('mapsvg_svg_forbidden', 'You cannot access the SVG library.', ['status' => 403]);
            $registry = new SvgAssetRegistry();
            if (!$registry->available()) throw new \RuntimeException('SVG registry upgrade is required.', 503);
            $after = max(0, (int) ($request['after'] ?? 0));
            $limit = max(1, min(200, (int) ($request['limit'] ?? 100)));
            if ($action === 'index') $data = $registry->catalog($after, $limit);
            elseif ($action === 'show') $data = ['file' => $registry->metadata($registry->latest((int) $request['assetId']))];
            else $data = ['revisions' => $registry->history((int) $request['assetId'], isset($request['before']) ? max(1, (int) $request['before']) : PHP_INT_MAX, min(100, $limit))];
            $response = new \WP_REST_Response($data);
            $response->header('Cache-Control', 'private, no-store, max-age=0');
            return $response;
        } catch (\Throwable $error) {
            $status = in_array($error->getCode(), [400, 403, 404, 409, 413, 503], true) ? $error->getCode() : 500;
            return new \WP_Error('mapsvg_svg_registry', $status === 500 ? 'SVG registry is unavailable.' : $error->getMessage(), ['status' => $status]);
        }
    }
}
