<?php

namespace MapSVG;

// Explicit require because the recursive autoloader matches only by basename
// and cannot resolve sub-namespace paths like MapSVG\Core\*.
require_once __DIR__ . '/Core/ModuleInterface.php';
require_once __DIR__ . '/Core/ModuleRegistry.php';
require_once __DIR__ . '/Core/PaidAddonRegistry.php';

use MapSVG\Core\ModuleRegistry;
use MapSVG\Core\PaidAddonRegistry;

/**
 * Register WordPress actions, filters, and custom cron callbacks for MapSVG.
 *
 * Intended for lifecycle/bootstrap hooks kept separate from {@see Router}.
 * Register early from the main bootstrap; DB upgrade runs on init priority -100,
 * before these init consumers, while module declarations still use plugins_loaded.
 */
final class PluginHooks
{
    /** @var self|null */
    private static $instance;

    /** @var bool */
    private $hooksRegistered = false;

    /** @var ModuleRegistry */
    private ModuleRegistry $moduleRegistry;

    private function __construct()
    {
        $this->moduleRegistry = new ModuleRegistry();
    }

    /**
     * Singleton instance (useful if something needs the same object reference WP holds).
     */
    public static function instance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Register hooks exactly once even if called multiple times.
     *
     * @return void
     */
    public static function boot(): void
    {
        self::instance()->registerHooks();
    }

    /**
     * @return void
     */
    private function registerHooks(): void
    {
        if ($this->hooksRegistered) {
            return;
        }
        $this->hooksRegistered = true;

        // Paid add-ons declare themselves at plugins_loaded priority 5.
        // Resolve the complete candidate set before any paid code is allowed to boot,
        // so conflicts never depend on WordPress plugin load order.
        add_action('plugins_loaded', function (): void {
            $paidAddons = PaidAddonRegistry::instance();
            $paidAddons->resolve();

            $error = $paidAddons->error();
            if ($error !== null) {
                add_action('admin_notices', function () use ($error): void {
                    echo '<div class="notice notice-error"><p>' .
                        esc_html($error['message']) .
                        '</p></div>';
                });
            }
        }, 10);

        // Base artifacts load their manifest-owned modules. Transitional full
        // artifacts use the materialized bootstrap; separately installed paid
        // add-ons contribute their additional modules through their own bootstrap.
        add_action('plugins_loaded', function (): void {
            if (!defined('MAPSVG_PLAN')) {
                return;
            }

            // Lite owns the shared AI module. Paid add-ons only contribute their
            // additional capabilities, so the AI registration is loaded once.
            if (MAPSVG_PLAN === 'mapsvg-lite') {
                $baseBootstrap = MAPSVG_PLUGIN_DIR . '/mapsvg-modules.php';
                if (is_readable($baseBootstrap)) {
                    require_once $baseBootstrap;
                } else {
                    $sourceAi = MAPSVG_PLUGIN_DIR . '/paid/features/ai_assistant/php/module.php';
                    $materialized = MAPSVG_PLUGIN_DIR . '/dist/mapsvg-paid-modules.php';
                    if (is_readable($sourceAi)) require_once $sourceAi;
                    elseif (is_readable($materialized)) require_once $materialized;
                }
                return;
            }

            // In a source checkout, load paid modules directly from /paid so PHP
            // stays in sync with Vite/admin source changes. Release artifacts do not
            // include /paid and therefore fall back to the materialized /dist bootstrap.
            $sourcePaidModule = MAPSVG_PLUGIN_DIR .
                DIRECTORY_SEPARATOR .
                'paid' .
                DIRECTORY_SEPARATOR .
                'features' .
                DIRECTORY_SEPARATOR .
                'ai_assistant' .
                DIRECTORY_SEPARATOR .
                'php' .
                DIRECTORY_SEPARATOR .
                'module.php';

            if (is_readable($sourcePaidModule)) {
                require_once $sourcePaidModule;
                if (MAPSVG_PLAN === 'mapsvg-demo') {
                    require_once MAPSVG_PLUGIN_DIR . '/paid/features/demo_authorization/php/module.php';
                }
                require_once MAPSVG_PLUGIN_DIR . '/paid/features/map_features/php/module.php';
                require_once MAPSVG_PLUGIN_DIR . '/paid/features/csv/php/module.php';
                require_once MAPSVG_PLUGIN_DIR . '/paid/features/google_sheets/php/module.php';
                require_once MAPSVG_PLUGIN_DIR . '/paid/features/javascript/php/module.php';
                $runtimeBootstrap = MAPSVG_PLUGIN_DIR . '/dist/mapsvg-paid-runtime.php';
                if (is_readable($runtimeBootstrap)) require_once $runtimeBootstrap;
                return;
            }

            $standalonePaidBootstrap = MAPSVG_PLUGIN_DIR .
                DIRECTORY_SEPARATOR .
                'dist' .
                DIRECTORY_SEPARATOR .
                'mapsvg-paid-modules.php';

            if (is_readable($standalonePaidBootstrap)) {
                require_once $standalonePaidBootstrap;
            }
        }, 12);

        // Selected paid add-ons / standalone materialized modules attach
        // mapsvg/register callbacks before this fires at 15.
        add_action('plugins_loaded', function (): void {
            do_action('mapsvg/register', $this->moduleRegistry);
            $this->moduleRegistry->boot();
        }, 15);

        // This should be called before "rest_api_init"
        add_action('init', array($this, 'setupGutenberg'));
        add_action('init', array($this, 'setupElementor'));
        add_action('init', array($this, 'addShortcodePostType'));

        // Add query vars for custom endpoints
        add_filter('query_vars', array($this, 'addCustomQueryVars'));

        // WordPress cookie authentication creates rest_cookie_invalid_nonce at priority 100,
        // so this must run afterwards to downgrade only public MapSVG GETs to anonymous reads.
        add_filter('rest_authentication_errors', array(RestAuth::class, 'allowStaleNonceOnPublicGet'), 110);

        // Background geocoding cron — must be registered on every request so WP Cron can fire it.
        add_action('mapsvg_geocode_batch', '\MapSVG\GeocodingQueue::process');

        // WooCommerce loads as a separate plugin and may not be available yet.
        // Defer registration so mapsvg_format_post_data hook is always attached.
        add_action(
            'plugins_loaded',
            function () {
                WooCommerceIntegration::boot();
            },
            20
        );


    }

    public function setupGutenberg()
    {
        $postEditorMapLoader = new PostEditorMapLoader();
        $postEditorMapLoader->init();

        $mapBlock = new MapBlock();
        $mapBlock->init();
    }

    /**
     * @return void
     */
    public function setupElementor(): void
    {
        if (!did_action('elementor/loaded')) {
            add_action('elementor/loaded', function () {
                $integration = new ElementorIntegration();
                $integration->init();
            });
            return;
        }

        $integration = new ElementorIntegration();
        $integration->init();
    }

    public function addShortcodePostType()
    {
        register_post_type(
            'mapsvg_shortcode',
            array(
                'label'               => 'MapSVG Embeddable Shortcode Blank Page',
                'public'              => false,
                'show_ui'             => false,
                'exclude_from_search' => true,
                'supports'            => array('title', 'editor'),
            )
        );
    }

    /**
     * @param string[] $vars
     * @return string[]
     */
    public function addCustomQueryVars($vars)
    {
        $vars[] = '_mapsvg';
        return $vars;
    }
}
