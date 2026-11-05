<?php
namespace MapSVG;

/** Read-only frontend shell: measure actual classic/block theme CSS in the browser. */
final class ThemeTypography
{
    public static function render(): void
    {
        if (!isset($_GET['mapsvg_typography'])) {
            return;
        }
        if (!current_user_can('edit_posts')) {
            status_header(403);
            exit;
        }
        nocache_headers();
        header('X-Robots-Tag: noindex, nofollow', true);
        header('Content-Type: text/html; charset=' . get_bloginfo('charset'));
        ?><!doctype html><html <?php language_attributes(); ?>><head>
        <meta charset="<?php echo esc_attr(get_bloginfo('charset')); ?>">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <?php wp_head(); ?>
        </head><body <?php body_class(); ?>>
        <script type="module" src="<?php echo esc_url(MAPSVG_PLUGIN_URL . 'dist/mapsvg-typography-probe.js?ver=' . MAPSVG_ASSET_VERSION); ?>"></script>
        <?php wp_footer(); ?>
        </body></html><?php
        exit;
    }
}
