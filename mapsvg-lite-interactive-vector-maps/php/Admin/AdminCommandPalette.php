<?php

namespace MapSVG;

/** Keep WordPress's real palette, but load its graph on the first shortcut. */
final class AdminCommandPalette
{
    private const SCRIPT_ROOTS = ['wp-commands', 'wp-core-commands'];
    private const STYLE_ROOTS = ['wp-commands'];

    public static function defer(): void
    {
        if (!function_exists('wp_enqueue_command_palette_assets')) return;
        // Core and plugin callbacks first register their native settings/inline scripts.
        add_action('admin_enqueue_scripts', [self::class, 'prepare'], PHP_INT_MAX);
    }

    public static function prepare(): void
    {
        if (!wp_script_is('wp-core-commands', 'enqueued')) return;
        foreach (self::SCRIPT_ROOTS as $handle) wp_dequeue_script($handle);
        foreach (self::STYLE_ROOTS as $handle) wp_dequeue_style($handle);
        $path = MAPSVG_PLUGIN_DIR . '/js/mapsvg-admin-command-palette.js';
        wp_enqueue_script('mapsvg-command-palette', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin-command-palette.js', [], (string) filemtime($path), true);
        // Header assets are now done; other footer assets still have their native queue.
        $printerPriority = has_action('admin_print_footer_scripts', '_wp_footer_scripts');
        add_action('admin_print_footer_scripts', [self::class, 'bootstrap'], $printerPriority !== false ? $printerPriority - 1 : 0);
    }

    public static function bootstrap(): void
    {
        $html = self::renderDeferred(wp_styles(), self::STYLE_ROOTS, 'wp_styles')
            . self::renderDeferred(wp_scripts(), self::SCRIPT_ROOTS, 'wp_scripts');
        wp_add_inline_script('mapsvg-command-palette', 'window.mapsvgDeferredCommandPalette=' . wp_json_encode(['html' => $html]) . ';', 'before');
    }

    /** Native renderers preserve translations, localization, ordering and tag filters. */
    public static function renderDeferred($registry, array $roots, string $global): string
    {
        $copy = clone $registry;
        foreach ($copy->registered as $handle => $dependency) $copy->registered[$handle] = clone $dependency;
        // Assets still needed by another normal queue entry must keep loading normally.
        $normal = array_fill_keys($registry->done, true);
        $visit = static function ($handle) use (&$visit, &$normal, $registry) {
            if (isset($normal[$handle])) return;
            $normal[$handle] = true;
            foreach (($registry->registered[$handle]->deps ?? []) as $dependency) $visit($dependency);
        };
        foreach ($registry->queue as $handle) $visit($handle);
        $copy->done = array_keys($normal);
        $copy->queue = $roots;
        $copy->to_do = [];
        $copy->do_concat = false;
        $original = $GLOBALS[$global] ?? null;
        $GLOBALS[$global] = $copy;
        ob_start();
        try {
            $copy->do_items($roots);
            return (string) ob_get_contents();
        } finally {
            ob_end_clean();
            $GLOBALS[$global] = $original;
        }
    }
}
