<?php
/*
Plugin Name: MapSVG - Vector maps, Google Maps, Image maps - with AI assistant
Plugin URI: https://mapsvg.com
Description: AI maps for WordPress. Create interactive SVG maps, image maps, floor plans and Google Maps from one prompt.
Version: 9.0.3
MapSVG Distribution: lite
MapSVG Add-on API: 2
Requires at least: 5.0
Requires PHP: 7.4
Author: Northern Lights Production
Author URI: https://mapsvg.com
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: mapsvg-lite
Domain Path: /languages
*/

namespace MapSVG;

include 'php/Autoloader.php';
// Production data-layer and SVG sanitization dependencies are required by every SKU.
$mapsvgComposerLoader = include 'vendor/autoload.php';
if ($mapsvgComposerLoader instanceof \Composer\Autoload\ClassLoader) {
    $mapsvgComposerLoader->addPsr4('MapSVG\\Shared\\', __DIR__ . '/maps/shared/backend');
    $mapsvgComposerLoader->addPsr4('MapSVG\\App\\', __DIR__ . '/maps/app/backend');
}

if (!defined('ABSPATH')) exit; // Exit if accessed directly

// Cache integrations inspecting plugin bootstrap must never store draft preview HTML.
if (isset($_GET['mapsvg_preview_app']) && !defined('DONOTCACHEPAGE')) define('DONOTCACHEPAGE', true);

/** MapSVG plan */
if (!defined('MAPSVG_API_URL')) {
    define('MAPSVG_API_URL', 'https://mapsvg.com/dashboard/api');
}
if (!defined('MAPSVG_PLAN')) {
    define('MAPSVG_PLAN', 'mapsvg-lite');
}
/** MapSVG version number */
define('MAPSVG_VERSION', '9.0.3');
/**
 * Stable PHP contract version for separately packaged paid add-ons.
 * Bump only for an incompatible add-on bootstrap/module API change.
 */
define('MAPSVG_ADDON_API_VERSION', 2);
// Additive Lite owns compatibility guards; legacy standalone updates remain unchanged.
if (MAPSVG_PLAN === 'mapsvg-lite') {
    if (!class_exists('\\MapSVG\\Distribution\\UpdateGuard', false)) {
        require_once __DIR__ . '/php/Core/DistributionUpdateGuard.php';
    }
    \MapSVG\Distribution\UpdateGuard::register();
}
/** Prefix for MapSVG tables in the database */
define('MAPSVG_PREFIX',  'mapsvg6_');

/** Configure explicit development logging without touching support-token storage. */
function checkDebugMode()
{
    if (!defined('MAPSVG_DEBUG')) {
        define('MAPSVG_DEBUG', false);
    }
    Logger::init(['logToFile' => MAPSVG_DEBUG && defined('WP_DEBUG') && WP_DEBUG]);
}
checkDebugMode();

/**
 * MAPSVG_DEBUG controls development assets and optional file diagnostics.
 * Configure it explicitly in wp-config.php; support access tokens do not enable it.
 */

// START templates
/**
 * Include the class that renders shortcode on an empty page.
 * Used in MapSVG templates as shown below:
 * {{shortcode '[apple id="123"]'}}
 * 
 * This logic has been moved to Router.php to handle /_mapsvg/shortcode/ and /_mapsvg/post/ URLs
 */
// END

/**
 * If MAPSVG_RAND == true && MAPSVG_DEBUG == true
 * then a random number is added to js/css file URLs to disable cache
 */
if (!defined('MAPSVG_RAND')) {
    define('MAPSVG_RAND', isset($_GET['norand']) ? false : true); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
}

$upload_dir = wp_upload_dir();
$upload_dir['path'] = str_replace(['\\', '/'], DIRECTORY_SEPARATOR, $upload_dir['path']);
$upload_dir['basedir'] = str_replace(['\\', '/'], DIRECTORY_SEPARATOR, $upload_dir['basedir']);

$plugin_dir_url = plugin_dir_url(__FILE__);
if (is_ssl()) {
    $upload_dir['baseurl'] = str_replace('http:', 'https:', $upload_dir['baseurl']);
    $plugin_dir_url = str_replace('http:', 'https:', $plugin_dir_url);
}

/** MapSVG plugin URL */
define('MAPSVG_PLUGIN_URL', $plugin_dir_url);

/** MapSVG plugin relative URL without domain */
$parts = wp_parse_url(MAPSVG_PLUGIN_URL);
define('MAPSVG_PLUGIN_RELATIVE_URL', $parts['path']);

/** MapSVG plugin dir */
define('MAPSVG_PLUGIN_DIR', str_replace(['\\', '/'], DIRECTORY_SEPARATOR, realpath(plugin_dir_path(__FILE__))));

/** Maps dir */
define('MAPSVG_MAPS_DIR', realpath(MAPSVG_PLUGIN_DIR . DIRECTORY_SEPARATOR . 'maps'));

/** Maps uploads dir */
define('MAPSVG_UPLOADS_DIR', $upload_dir['basedir'] . DIRECTORY_SEPARATOR . 'mapsvg');

/** Maps uploads URL */
define('MAPSVG_UPLOADS_URL', $upload_dir['baseurl'] . '/mapsvg/');

define('MAPSVG_MAPS_URL', MAPSVG_PLUGIN_URL . 'maps/');

define('MAPSVG_PINS_DIR', realpath(MAPSVG_PLUGIN_DIR . DIRECTORY_SEPARATOR . 'markers'));

define('MAPSVG_PINS_URL', MAPSVG_PLUGIN_URL . 'markers/');

// phpcs:ignore WordPress.WP.AlternativeFunctions.rand_rand -- wp_rand() isn't available this early in plugin initialization
define('MAPSVG_ASSET_VERSION', MAPSVG_VERSION . (MAPSVG_DEBUG ? (MAPSVG_RAND ? rand() : '') : ''));

// phpcs:ignore WordPress.WP.AlternativeFunctions.rand_rand -- wp_rand() isn't available this early in plugin initialization
define('MAPSVG_JQUERY_VERSION', MAPSVG_VERSION . (MAPSVG_DEBUG ? (MAPSVG_RAND ? rand() : '') : ''));

// START debug    
register_activation_hook(__FILE__, function () {
    Router::addMapsvgEndpoint();
});
register_deactivation_hook(__FILE__, function () {
    Router::removeMapsvgEndpoint();
});
// END


/**
 * Class MapSVG
 * @package MapSVG
 */
class MapSVG
{

    private $mapsvgPurchaseCode;

    public function __construct() {}

    // START purchase_code
    /**
     * Check purchase code and enable updates
     */
    function checkUpdates()
    {
        if (MAPSVG_PLAN === 'mapsvg-lite') return; // Free channel only; paid add-ons own their updates.
        $this->mapsvgPurchaseCode = Options::get('purchase_code');
        if (!$this->mapsvgPurchaseCode) {
            return;
        }

        // Do not register update-checker while license/domain is not ok.
        // Keeps Plugins "Check for updates" from silently succeeding on a bad license.
        $status = LicenseStatus::getCached();
        if (empty($status['ok'])) {
            return;
        }

        require MAPSVG_PLUGIN_DIR . DIRECTORY_SEPARATOR . str_replace("/", DIRECTORY_SEPARATOR, 'php/Vendor/plugin-update-checker/plugin-update-checker.php');
        $myUpdateChecker = \Puc_v4_Factory::buildUpdateChecker(
            MAPSVG_API_URL . '/releases/' . MAPSVG_PLAN . '/latest/',
            __FILE__, //Full path to the main plugin file or functions.php.
            'mapsvg'
        );
        //Add the license key to query arguments.
        $myUpdateChecker->addQueryArgFilter(array($this, 'filterUpdateChecks'));
        $myUpdateChecker->addHttpRequestArgFilter(array($this, 'filterUpdateCheckRequest'));
    }
    function filterUpdateChecks($queryArgs)
    {
        $queryArgs['key'] = $this->mapsvgPurchaseCode;
        $queryArgs['product_slug'] = MAPSVG_PLAN;
        $queryArgs['domain'] = LicenseStatus::currentDomain();
        return $queryArgs;
    }
    function filterUpdateCheckRequest($options)
    {
        // PUC uses wp_remote_get(). Do not attach a JSON body (WAFs drop GET+body).
        // Second channel = header, compared to ?domain= on the server.
        $domain = LicenseStatus::currentDomain();
        if (!isset($options['headers']) || !is_array($options['headers'])) {
            $options['headers'] = array();
        }
        $options['headers']['X-MapSVG-Domain'] = $domain;
        return $options;
    }
    // END


    public function run()
    {

        $this->isPhpVersionOk();

        if (defined("PHP_VERSION_ERROR")) {
            add_action('admin_menu', array($this, 'addErrorPage'));
            return;
        }

        WpCli::addWpCliCommands();

        $upgrader = new Upgrade();
        // Migrations may use WordPress pagination/permalink APIs. WP_Rewrite
        // does not exist while active plugin files or plugins_loaded run.
        // Activation after init can run immediately; normal boot runs before
        // MapSVG's other init consumers and before any request is dispatched.
        if (did_action('init')) {
            $upgrader->run();
        } else {
            add_action('init', array($upgrader, 'run'), -100);
        }
        PluginHooks::boot();

        // START purchase_code
        $this->checkUpdates();
        if (is_admin() && MAPSVG_PLAN !== 'mapsvg-lite') {
            add_action('after_plugin_row_' . plugin_basename(__FILE__), array($this, 'renderPluginLicenseNotice'), 10, 2);
            add_action('load-plugins.php', array($this, 'maybeRefreshLicenseStatusOnPluginsPage'));
            add_action('admin_enqueue_scripts', array($this, 'enqueuePluginLicenseNoticeScript'));
        }
        // END


        $router = new Router();

        if (is_admin()) {
            /** Load Admin controller */
            try {
                $admin = new Admin();
            } catch (\Exception $e) {
                status_header($e->getCode());
                $response = ['error' => $e->getMessage()];
            }
        } else {
            /** Load Front-end controller */
            $front = new Front();
        }
    }

    // START purchase_code
    function maybeRefreshLicenseStatusOnPluginsPage()
    {
        $force = isset($_GET['mapsvg_recheck_license'])
            && current_user_can('update_plugins')
            && wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['_wpnonce'] ?? '')), 'mapsvg_recheck_license');
        LicenseStatus::maybeRefresh($force);
        if (isset($_GET['mapsvg_recheck_license'])) {
            wp_safe_redirect(admin_url('plugins.php'));
            exit;
        }
    }

    /**
     * WP core styles the plugins list around an "update" row pair:
     * plugin info <tr class="… update"> + notice <tr class="plugin-update-tr">.
     * Without "update" on the info row, ::before (checkbox column mimic) stays white
     * and a border gap appears. Same fix WooCommerce uses for custom notices.
     */
    function enqueuePluginLicenseNoticeScript($hook)
    {
        if ($hook !== 'plugins.php') {
            return;
        }

        $purchaseCode = Options::get('purchase_code');
        $status = LicenseStatus::getCached();
        $showSoftWarning = $purchaseCode
            && LicenseStatus::shouldShowDomainLimitWarning(true, $status);
        if ($purchaseCode && !empty($status['ok']) && !$showSoftWarning) {
            return;
        }

        $plugin_file = plugin_basename(__FILE__);
        $handle = 'mapsvg-plugin-license-notice';
        wp_register_script($handle, '', array(), MAPSVG_VERSION, true);
        wp_enqueue_script($handle);
        wp_add_inline_script(
            $handle,
            'document.querySelectorAll(' . wp_json_encode('tr.plugin-update-tr[data-plugin="' . $plugin_file . '"]') . ').forEach(function(warningRow){' .
                'var pluginInfoRow=document.querySelector(' . wp_json_encode('tr.active[data-plugin="' . $plugin_file . '"]:not(.plugin-update-tr),tr.inactive[data-plugin="' . $plugin_file . '"]:not(.plugin-update-tr)') . ');' .
                'if(!pluginInfoRow){return;}' .
                'if(pluginInfoRow.classList.contains("update")){' .
                'warningRow.classList.remove("plugin-update-tr");' .
                'var notice=warningRow.querySelector(".notice");' .
                'if(notice){notice.style.margin="5px 10px 15px 30px";}' .
                '}else{pluginInfoRow.classList.add("update");}' .
                '});'
        );
    }

    function renderPluginLicenseNotice($plugin_file, $plugin_data)
    {
        $purchaseCode = Options::get('purchase_code');
        $status = LicenseStatus::getCached();
        $showSoftWarning = $purchaseCode
            && LicenseStatus::shouldShowDomainLimitWarning(true, $status);

        if ($purchaseCode && !empty($status['ok']) && !$showSoftWarning) {
            return;
        }

        $code = !empty($status['code']) ? (string) $status['code'] : '';
        $message = LicenseStatus::resolveDisplayMessage(
            $status['message'] ?? '',
            $code
        );
        if ($showSoftWarning) {
            $message = LicenseStatus::softDomainLimitMessage($status);
            $code = LicenseStatus::CODE_DOMAIN_LIMIT;
        } elseif ($message === '') {
            $message = 'Enter your MapSVG purchase code to enable updates.';
        }

        // Don't surface Dashboard connectivity noise on plugins.php (Activate shows growl).
        if ($purchaseCode && !$showSoftWarning && LicenseStatus::looksLikeConnectionMessage($message)) {
            return;
        }

        $wp_list_table = _get_list_table('WP_Plugins_List_Table');
        $colspan = $wp_list_table ? (int) $wp_list_table->get_column_count() : 4;
        $slug = !empty($plugin_data['slug']) ? $plugin_data['slug'] : dirname($plugin_file);
        if ($slug === '.' || $slug === '') {
            $slug = basename($plugin_file, '.php');
        }

        // Markup mirrors wp_plugin_update_row() / WooCommerce custom notices.
        $showDomainRecheck = LicenseStatus::isDomainRelatedMessage($message, $code) || $showSoftWarning;
        $noticeClass = $showSoftWarning ? 'notice-warning' : 'notice-error';
        $bodyHtml = $showSoftWarning
            ? LicenseStatus::formatDomainLimitSoftAlertHtml($message, false)
            : LicenseStatus::formatAlertHtml($message, false, $code);
        printf(
            '<tr class="plugin-update-tr update active" id="%1$s-update" data-slug="%1$s" data-plugin="%2$s" data-plugin-row-type="mapsvg-license">' .
                '<td colspan="%3$d" class="plugin-update colspanchange">' .
                '<div class="update-message notice inline %4$s notice-alt"><p>%5$s%6$s</p></div></td></tr>',
            esc_attr($slug),
            esc_attr($plugin_file),
            $colspan,
            esc_attr($noticeClass),
            $bodyHtml,
            $showDomainRecheck
                ? ' | <a href="' . esc_url(wp_nonce_url(admin_url('plugins.php?mapsvg_recheck_license=1'), 'mapsvg_recheck_license')) . '">'
                . ($showSoftWarning ? 'Recheck after fixing sites' : 'I updated domain settings')
                . '</a>'
                : ''
        );
    }
    // END




    function addErrorPage()
    {
        add_menu_page('MapSVG', 'MapSVG', 'edit_posts', 'mapsvg-config', array($this, 'renderErrorPage'), '', 66);
    }

    /**
     * Checks PHP Version
     * @return bool
     */
    function isPhpVersionOk()
    {
        $match = array();
        preg_match("#^\d+(\.\d+)*#", PHP_VERSION, $match);
        $php_version = $match[0];
        if (version_compare($php_version, '7.4.0', '<')) {
            define('PHP_VERSION_ERROR', 'Your PHP version is ' . $php_version . '. MapSVG requires version 7.4.0 or higher.');
            return false;
        } else {
            return true;
        }
    }

    function renderErrorPage()
    {
        echo "<div style='padding: 30px;'>" . esc_html(PHP_VERSION_ERROR) . "</div>";
    }
}

$mapsvg = new MapSVG();
$mapsvg->run();
