<?php

namespace MapSVG;

final class AppDraftController
{
    /** MapSVG authoring follows edit_posts, with independent App and executable-code policies. */
    public static function canEdit(int $mapId): bool
    {
        return $mapId > 0 && is_user_logged_in() && current_user_can('edit_posts')
            && (bool) apply_filters('mapsvg_can_edit_app', true, $mapId, get_current_user_id());
    }

    public static function canPreview(int $mapId): bool
    {
        return $mapId > 0 && is_user_logged_in() && current_user_can('edit_posts')
            && (bool) apply_filters('mapsvg_can_edit_app', true, $mapId, get_current_user_id());
    }

    public static function register(): void
    {
        $base = '/apps/(?P<mapId>\d+)';
        foreach ([
            '/versions/(?P<versionId>\d+)' => [['GET', 'version']],
            '/versions/(?P<versionId>\d+)/rename' => [['POST', 'renameVersion']],
            '/versions/(?P<versionId>\d+)/unpublish' => [['POST', 'unpublish']],
            '/versions/(?P<versionId>\d+)/checkout' => [['POST', 'checkout']],
            '/drafts' => [['GET', 'index'], ['POST', 'create']],
            '/drafts/(?P<draftId>\d+)' => [['GET', 'get'], ['PUT', 'save'], ['DELETE', 'deleteDraft']],
            '/drafts/(?P<draftId>\d+)/rename' => [['POST', 'rename']],
            '/drafts/(?P<draftId>\d+)/restore' => [['POST', 'restore']],
            '/drafts/(?P<draftId>\d+)/publish' => [['POST', 'publish']],
            '/drafts/(?P<draftId>\d+)/preview' => [['POST', 'preview']],
            '/drafts/(?P<draftId>\d+)/svg-source' => [['POST', 'svgSource']],
            '/drafts/(?P<draftId>\d+)/svg' => [['POST', 'saveSvg']],
            '/drafts/(?P<draftId>\d+)/regions-sync/preview' => [['POST', 'previewRegionsSync']],
            '/drafts/(?P<draftId>\d+)/regions-sync' => [['POST', 'syncRegions']],
            '/drafts/(?P<draftId>\d+)/regions-cleanup/preview' => [['POST', 'previewRegionsCleanup']],
            '/drafts/(?P<draftId>\d+)/regions-cleanup' => [['POST', 'cleanupRegions']],
        ] as $suffix => $actions) {
            $routes = [];
            foreach ($actions as $action) {
                $permission = static function ($request) use ($action) {
                    return $action[1] === 'preview'
                        ? self::canPreview((int) $request['mapId'])
                        : self::canEdit((int) $request['mapId']);
                };
                $routes[] = ['methods' => $action[0], 'permission_callback' => $permission,
                    'callback' => static function ($request) use ($action) { return self::dispatch($action[1], $request); }];
            }
            register_rest_route('mapsvg/v1', $base . $suffix, $routes);
        }
    }

    public static function dispatch(string $action, $request)
    {
        try {
            $mapId = (int) $request['mapId'];
            $allowed = $action === 'preview' ? self::canPreview($mapId) : self::canEdit($mapId);
            if (!$allowed) return new \WP_Error('mapsvg_app_forbidden', $action === 'preview' ? 'You cannot preview this App.' : 'You cannot edit this App.', ['status' => 403]);
            $params = $request->get_json_params() ?: [];
            $native = json_decode($request->get_body());
            if (isset($native->snapshot)) {
                $params['snapshot'] = AppDraftStore::decodeSnapshot(wp_json_encode($native->snapshot));
            }
            $draftId = (int) ($request['draftId'] ?? 0);
            $revision = isset($params['revision']) && is_int($params['revision']) ? $params['revision'] : 0;
            $store = new AppDraftStore();
            $author = get_current_user_id();
            switch ($action) {
                case 'index': $result = $store->index($mapId, $author); break;
                case 'get': $result = ['draft' => $store->get($mapId, $draftId)]; break;
                case 'create': $result = ['draft' => $store->create($mapId, $params, $author)]; break;
                case 'save': $result = $store->save($mapId, $draftId, $revision, $params['snapshot'] ?? [], $author); break;
                case 'rename': $result = $store->rename($mapId, $draftId, $revision, (string) ($params['title'] ?? '')); break;
                case 'restore': $result = ['draft' => $store->restore($mapId, $draftId, $revision, (int) ($params['version_id'] ?? 0), $author)]; break;
                case 'publish': $result = $store->publish($mapId, $draftId, $revision, $params['snapshot'] ?? [], $author, (string) ($params['request_id'] ?? '')); break;
                case 'version': $result = ['version' => $store->version($mapId, (int) $request['versionId'])]; break;
                case 'renameVersion':
                    if (!isset($params['title'], $params['expected_title']) || !is_string($params['title']) || !is_string($params['expected_title'])) throw new \InvalidArgumentException('New and expected version names are required.', 400);
                    $result = $store->renameVersion($mapId, (int) $request['versionId'], $params['title'], $params['expected_title']);
                    break;
                case 'unpublish': $result = $store->unpublish($mapId, (int) $request['versionId'], $author); break;
                case 'deleteDraft': $result = $store->deleteDraft($mapId, $draftId, $revision); break;
                case 'checkout': $result = $store->checkout($mapId, (int) $request['versionId'], $author); break;
                case 'saveSvg':
                    if (!isset($params['source'], $params['svg'], $params['resetGeometry']) || !is_string($params['source']) || !is_string($params['svg']) || !is_bool($params['resetGeometry'])) throw new \InvalidArgumentException('SVG source, contents and resetGeometry are required.', 400);
                    $result = $store->saveSvg($mapId, $draftId, $revision, $params['source'], $params['svg'], $params['resetGeometry']);
                    break;
                case 'svgSource':
                    $store->get($mapId, $draftId);
                    list($file, $geometry) = SVGFileController::readMapSource((string) ($params['source'] ?? ''));
                    $result = ['source' => $file->relativeUrl, 'geometry' => $geometry];
                    $registry = new SvgAssetRegistry();
                    if ($registry->available()) {
                        $row = $registry->importSource($file->relativeUrl);
                        $result['source'] = $row['source'];
                        $result['svgAsset'] = SvgAssetRegistry::selection($row);
                    }
                    break;
                case 'previewRegionsSync':
                case 'syncRegions':
                case 'previewRegionsCleanup':
                case 'cleanupRegions':
                    if ($revision < 1 || !is_string($params['pageId'] ?? null) || !is_string($params['stateId'] ?? null)
                        || strlen($params['pageId']) > 120 || strlen($params['stateId']) > 160
                        || (in_array($action, ['syncRegions', 'cleanupRegions'], true) && (!is_string($params['token'] ?? null) || !preg_match('/\A[a-f0-9]{64}\z/D', $params['token'])))) {
                        throw new \InvalidArgumentException('Draft revision, Page, Scene and reviewed changes are required.', 400);
                    }
                    $result = $store->syncRegions($mapId, $draftId, $revision, $params['pageId'], $params['stateId'],
                        in_array($action, ['syncRegions', 'cleanupRegions'], true) ? $params['token'] : null,
                        in_array($action, ['previewRegionsCleanup', 'cleanupRegions'], true));
                    break;
                case 'preview':
                    $draft = $store->get($mapId, $draftId);
                    if ($revision !== $draft['revision']) throw new \RuntimeException('Draft changed before preview.', 409);
                    $url = isset($params['url']) ? esc_url_raw($params['url']) : '';
                    if ($url !== '') {
                        // Retain explicit-page previews for existing API consumers.
                        $postId = url_to_postid($url);
                        $post = $postId ? get_post($postId) : null;
                        if (!$post || $post->post_status !== 'publish' || !self::containsApp($post->post_content, $mapId) || wp_parse_url($url, PHP_URL_HOST) !== wp_parse_url(home_url(), PHP_URL_HOST)) {
                            throw new \InvalidArgumentException('Enter a published WordPress page URL containing this App shortcode.', 400);
                        }
                        $url = get_permalink($postId);
                    } else {
                        $url = add_query_arg('withHeader', '1', home_url('/_mapsvg/shortcode/' . rawurlencode('[mapsvg id="' . $mapId . '"]')));
                    }
                    $result = ['url' => add_query_arg([
                        'mapsvg_preview_app' => $mapId, 'mapsvg_preview_draft' => $draftId,
                        'mapsvg_preview_nonce' => wp_create_nonce(AppDraftPreview::nonceAction($mapId, $draftId)),
                    ], $url)];
                    break;
                default: throw new \InvalidArgumentException('Unknown draft operation.', 400);
            }
            $response = new \WP_REST_Response($result, 200);
            $response->header('Cache-Control', 'private, no-store, max-age=0');
            return $response;
        } catch (\Throwable $error) {
            $status = in_array($error->getCode(), [400, 403, 404, 409, 413, 422, 503], true) ? $error->getCode() : 500;
            return new \WP_Error('mapsvg_app_draft_' . $status, $status === 500 ? 'App storage operation failed. Your local copy is retained.' : $error->getMessage(), ['status' => $status]);
        }
    }

    public static function containsApp(string $content, int $mapId): bool
    {
        preg_match_all('/' . get_shortcode_regex(['mapsvg']) . '/s', $content, $matches, PREG_SET_ORDER);
        foreach ($matches as $match) {
            $atts = shortcode_parse_atts($match[3]);
            if (is_array($atts) && isset($atts['id']) && (int) $atts['id'] === $mapId) return true;
        }
        return false;
    }
}
