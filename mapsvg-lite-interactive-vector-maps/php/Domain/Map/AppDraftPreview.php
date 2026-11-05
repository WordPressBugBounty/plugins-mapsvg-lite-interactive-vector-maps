<?php

namespace MapSVG;

/** Logged-in, user-bound preview only. Query arguments never grant public read access. */
final class AppDraftPreview
{
    public static function nonceAction(int $mapId, int $draftId): string
    {
        return 'mapsvg-app-preview:' . $mapId . ':' . $draftId;
    }

    public static function noCache(): void
    {
        if (!isset($_GET['mapsvg_preview_app'])) return;
        if (!defined('DONOTCACHEPAGE')) define('DONOTCACHEPAGE', true);
        nocache_headers();
        if (!headers_sent()) {
            header('Cache-Control: private, no-store, no-cache, must-revalidate, max-age=0');
            header('Vary: Cookie', false);
            header('Referrer-Policy: same-origin');
        }
    }

    public static function requestedDraft(int $mapId, $request = null): ?array
    {
        $params = $request ? $request->get_params() : wp_unslash($_GET);
        if ((int) ($params['mapsvg_preview_app'] ?? 0) !== $mapId) return null;
        $draftId = (int) ($params['mapsvg_preview_draft'] ?? 0);
        if (!AppDraftController::canPreview($mapId) || !$draftId || !wp_verify_nonce((string) ($params['mapsvg_preview_nonce'] ?? ''), self::nonceAction($mapId, $draftId))) {
            return null;
        }
        return (new AppDraftStore())->get($mapId, $draftId);
    }

    public static function apply($map, $request = null): void
    {
        if (!$map) return;
        $draft = self::requestedDraft((int) $map->id, $request);
        if (!$draft) return;
        self::noCache();
        // The retained PHP runtime expects associative arrays; stored history keeps JSON object identity.
        $map->setOptions(json_decode(wp_json_encode($draft['snapshot']['options']), true));
        $map->setTitle($draft['snapshot']['title']);
        if (isset($draft['snapshot']['svgFileLastChanged'])) $map->setSvgFileLastChanged($draft['snapshot']['svgFileLastChanged']);
    }

    public static function banner(): void
    {
        $mapId = (int) ($_GET['mapsvg_preview_app'] ?? 0);
        if (!$mapId) return;
        try { $draft = self::requestedDraft($mapId); } catch (\Throwable $error) { return; }
        if (!$draft) return;
        $editor = add_query_arg(['page' => 'mapsvg-config', 'react' => '1', 'mapsvg_workspace' => 'map:' . $mapId, 'mapsvg_draft' => $mapId . ':' . $draft['id']], admin_url('admin.php'));
        echo '<aside data-mapsvg-draft-preview style="position:fixed;bottom:12px;left:12px;z-index:2147483647;padding:8px 12px;background:#fff;color:#111;border:1px solid #aaa;border-radius:6px;font:13px sans-serif">'
            . esc_html('Preview: ' . $draft['title']) . ' · <a href="' . esc_url($editor) . '">Back to editor</a></aside>';
    }
}
