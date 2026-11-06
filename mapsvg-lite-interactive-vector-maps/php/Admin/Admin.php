<?php

/**
 * Created by PhpStorm.
 * User: Roma
 * Date: 24.10.18
 * Time: 9:59
 */

namespace MapSVG;

class Admin
{
    public function __construct()
    {
        $this->addHooks();
    }

    /** Effective authoring permission, including the selected package's capability. */
    private static function canEditJavaScript(): bool
    {
        return current_user_can('unfiltered_html') && \MapSVG\Core\JavascriptFeature::isEnabled();
    }

    private function addHooks()
    {
        add_action('admin_menu', array($this, 'addWpAdminMenuItem'));
        add_action('admin_enqueue_scripts', '\MapSVG\Admin::addJsCss', 0);
    }

    /**
     * Add menu element to WP Admin menu
     */
    function addWpAdminMenuItem()
    {
        global $mapsvg_settings_page;

        if (function_exists('add_menu_page') && current_user_can('edit_posts'))
            $mapsvg_settings_page = add_menu_page(
                'MapSVG',
                'MapSVG',
                'edit_posts',
                'mapsvg-config',
                array($this, 'renderAdminPage'),
                'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI3LjUuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxOTIgMTkyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxOTIgMTkyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxwYXRoIGQ9Ik05NS4yLDAuMkM0Mi41LDAuMiwwLjEsNDMuNCwwLjEsOTYuMVM0My40LDE5Miw5Ni4xLDE5MlMxOTIsMTQ4LjgsMTkyLDk2LjFTMTQ3LjksMC4yLDk1LjIsMC4yeiBNMTU4LjMsMTM5LjNIMzMKCWMtNS4yLDAtOC42LTYtNi0xMC40TDkwLDIwYzIuNi00LjMsOS41LTQuMywxMi4xLDBsNjMuMSwxMDguOUMxNjYuOSwxMzMuMiwxNjMuNSwxMzkuMywxNTguMywxMzkuM3oiLz4KPC9zdmc+Cg==',
                66
            );
    }


    /**
     * Add admin JS & CSS
     */
    static function addJsCss($hook_suffix)
    {

        global $mapsvg_settings_page;

        // Load scripts only if it's MapSVG config page! Don't load scripts on all WP Admin pages
        if ($mapsvg_settings_page != $hook_suffix)
            return;

        // React admin shell: skip Bootstrap + legacy admin CSS (app CSS → shadow root).
        $isReactAdmin = self::isReactAdminRequest(); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

        if ($isReactAdmin) {
            AdminCommandPalette::defer();
            // The React chat reuses MapSVG's shared wp.media uploader.
            wp_enqueue_media();
            self::enqueueReactAdminAssets();
            return;
        }

        if (isset($_GET['page']) && $_GET['page'] == 'mapsvg-config') {  // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.NonceVerification.Missing
            // Load scripts and CSS for WP Media file uploader
            wp_enqueue_media();


            wp_register_style('bs.css', (LegacyV8::isEditorRequest() ? LegacyV8::assets()['url'] : MAPSVG_PLUGIN_URL) . 'js/vendor/bootstrap/bootstrap.min.css', null, '5.2',);
            wp_enqueue_style('bs.css');
            wp_register_style('main.css', (LegacyV8::isEditorRequest() ? LegacyV8::assets()['url'] : MAPSVG_PLUGIN_URL) . 'css/mapsvg-admin.css', null, MAPSVG_ASSET_VERSION,);
            wp_enqueue_style('main.css');
        }
        wp_register_style('mapsvg-styles-filters', (LegacyV8::isEditorRequest() ? LegacyV8::assets()['url'] : MAPSVG_PLUGIN_URL) . 'js/mapsvg/FormBuilder/form.css', null, MAPSVG_ASSET_VERSION,);
        wp_enqueue_style('mapsvg-styles-filters');

        // Load common JS/CSS files
        \MapSVG\Front::addJsCss('default', LegacyV8::isEditorRequest() ? 8 : 9);
    }

    /** The additive Lite base (with or without an add-on) always uses React. */
    public static function isReactAdminRequest(): bool
    {
        return !LegacyV8::isEditorRequest() && ((defined('MAPSVG_PLAN') && MAPSVG_PLAN === 'mapsvg-lite') || isset($_GET['react']));
    }

    private static function isReactAdminViteDev(): bool
    {
        return (defined('MAPSVG_REACT_ADMIN_VITE') && MAPSVG_REACT_ADMIN_VITE)
            || isset($_GET['vite']); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    }

    private static function getReactAdminViteUrl(): string
    {
        $url = defined('MAPSVG_REACT_ADMIN_VITE_URL')
            ? (string) MAPSVG_REACT_ADMIN_VITE_URL
            : 'http://127.0.0.1:5173';

        return rtrim($url, '/');
    }

    /**
     * Enqueue React admin host CSS + SPA script (no Bootstrap / mapsvg-admin.css).
     */
    private static function enqueueReactAdminAssets(): void
    {
        if (self::isReactAdminViteDev()) {
            self::enqueueReactAdminViteAssets();
            return;
        }
        $js = MAPSVG_PLUGIN_URL . 'dist/mapsvg-admin-react.js';
        $reactVendorJs = MAPSVG_PLUGIN_URL . 'dist/mapsvg-react-vendor.js';
        $css = MAPSVG_PLUGIN_URL . 'dist/mapsvg-admin-react.css';
        $hostCss = MAPSVG_PLUGIN_URL . 'css/mapsvg-admin-react-host.css';

        $jsPath = MAPSVG_PLUGIN_DIR . DIRECTORY_SEPARATOR . 'dist' . DIRECTORY_SEPARATOR . 'mapsvg-admin-react.js';
        $reactVendorJsPath = MAPSVG_PLUGIN_DIR . DIRECTORY_SEPARATOR . 'dist' . DIRECTORY_SEPARATOR . 'mapsvg-react-vendor.js';
        $cssPath = MAPSVG_PLUGIN_DIR . DIRECTORY_SEPARATOR . 'dist' . DIRECTORY_SEPARATOR . 'mapsvg-admin-react.css';
        $hostCssPath = MAPSVG_PLUGIN_DIR . DIRECTORY_SEPARATOR . 'css' . DIRECTORY_SEPARATOR . 'mapsvg-admin-react-host.css';

        $jsVer = file_exists($jsPath) ? (string) filemtime($jsPath) : MAPSVG_ASSET_VERSION;
        $reactVendorJsVer = file_exists($reactVendorJsPath) ? (string) filemtime($reactVendorJsPath) : MAPSVG_ASSET_VERSION;
        $cssVer = file_exists($cssPath) ? (string) filemtime($cssPath) : MAPSVG_ASSET_VERSION;
        $hostCssVer = file_exists($hostCssPath) ? (string) filemtime($hostCssPath) : MAPSVG_ASSET_VERSION;

        // Map runtime (window.mapsvg) for Phase 3 preview — no Bootstrap / mapsvg-admin.css.
        \MapSVG\Front::addJsCss();

        // One React instance is shared by Lite admin + separately bundled paid admin panels.
        wp_register_script(
            'mapsvg-react-vendor',
            $reactVendorJs,
            array(),
            $reactVendorJsVer,
            true
        );

        // Light DOM only: hide WP chrome + size the host. App CSS is injected into the shadow root.
        wp_enqueue_style('mapsvg-admin-react-host', $hostCss, array(), $hostCssVer);

        $extensionDeps = apply_filters('mapsvg_react_admin_extension_script_dependencies', array());
        if (!is_array($extensionDeps)) {
            $extensionDeps = array();
        }
        $extensionDeps = array_values(array_filter($extensionDeps, 'is_string'));
        // Native first-bootstrap watchdog also covers failed compiled chunk loads.
        $startupPath = MAPSVG_PLUGIN_DIR . '/js/mapsvg-admin-react-vite-loader.js';
        wp_register_script(
            'mapsvg-admin-react-startup',
            MAPSVG_PLUGIN_URL . 'js/mapsvg-admin-react-vite-loader.js',
            array('mapsvg'),
            (string) filemtime($startupPath),
            true
        );
        $adminDeps = array_values(array_unique(array_merge(
            array('mapsvg', 'mapsvg-react-vendor', 'mapsvg-admin-react-startup'),
            $extensionDeps
        )));

        wp_enqueue_script('mapsvg-admin-react', $js, $adminDeps, $jsVer, true);
        add_filter('script_loader_tag', static function ($tag, $handle) {
            if (!in_array($handle, array('mapsvg-admin-react', 'mapsvg-admin-react-startup'), true)) return $tag;
            return preg_replace_callback('/<script\b[^>]*\bsrc=([\"\'])[^\"\']*\1[^>]*>/', static function ($match) {
                $script = preg_replace('/\s+type=([\"\'])[^\"\']*\1/', '', $match[0]);
                return preg_replace('/^<script\b/', '<script type="module"', $script);
            }, $tag);
        }, 10, 2);

        wp_localize_script(
            'mapsvg-admin-react',
            'mapsvgReactAdminParams',
            self::getReactAdminBootstrapParams(add_query_arg('ver', $cssVer, $css))
        );
    }

    private static function enqueueReactAdminViteAssets(): void
    {
        $viteUrl = self::getReactAdminViteUrl();
        $handle = 'mapsvg-admin-react-vite';
        $loaderPath = MAPSVG_PLUGIN_DIR . DIRECTORY_SEPARATOR . 'js' . DIRECTORY_SEPARATOR . 'mapsvg-admin-react-vite-loader.js';
        $hostCss = MAPSVG_PLUGIN_URL . 'css/mapsvg-admin-react-host.css';
        $hostCssPath = MAPSVG_PLUGIN_DIR . DIRECTORY_SEPARATOR . 'css' . DIRECTORY_SEPARATOR . 'mapsvg-admin-react-host.css';
        $hostCssVer = file_exists($hostCssPath) ? (string) filemtime($hostCssPath) : MAPSVG_ASSET_VERSION;

        // Keep the legacy map runtime available; only the React admin UI comes from Vite.
        \MapSVG\Front::addJsCss();
        wp_enqueue_style('mapsvg-admin-react-host', $hostCss, array(), $hostCssVer);

        wp_register_script(
            $handle,
            MAPSVG_PLUGIN_URL . 'js/mapsvg-admin-react-vite-loader.js',
            array('mapsvg'),
            (string) filemtime($loaderPath),
            true
        );
        wp_enqueue_script($handle);

        add_filter('script_loader_tag', function ($tag, $scriptHandle) use ($handle) {
            if ($scriptHandle !== $handle) {
                return $tag;
            }

            $tag = str_replace(" type='text/javascript'", '', $tag);
            $tag = str_replace(' type="text/javascript"', '', $tag);
            return str_replace('<script ', '<script type="module" ', $tag);
        }, 10, 2);

        wp_localize_script(
            $handle,
            'mapsvgReactAdminParams',
            self::getReactAdminBootstrapParams('')
        );
        wp_localize_script($handle, 'mapsvgReactAdminVite', array('url' => $viteUrl));
    }

    private static function getReactAdminBootstrapParams(string $cssUrl): array
    {
        $options = Options::getAll();

        // Security metadata remains in Lite so secrets saved by a previously
        // active paid module are never exposed after downgrade/deactivation.
        $secretOptionKeys = apply_filters(
            'mapsvg_react_admin_secret_option_keys',
            array('openai_api_key', 'deepseek_api_key')
        );
        if (!is_array($secretOptionKeys)) {
            $secretOptionKeys = array();
        }
        foreach ($secretOptionKeys as $secretOption) {
            if (is_string($secretOption) && $secretOption !== '') {
                unset($options[$secretOption]);
            }
        }

        $licenseBootstrap = null;
        // START purchase_code
        $purchaseCode = isset($options['purchase_code']) ? (string) $options['purchase_code'] : '';
        if ($purchaseCode !== '' && strpos(home_url(), 'demo.mapsvg.com') === false) {
            $licenseStatus = LicenseStatus::maybeRefresh(false);
            if (LicenseStatus::looksLikeConnectionMessage($licenseStatus['message'] ?? '')) {
                $cached = LicenseStatus::getCached();
                if (LicenseStatus::looksLikeConnectionMessage($cached['message'] ?? '')) {
                    LicenseStatus::setCached(!empty($cached['ok']), '');
                    $cached = LicenseStatus::getCached();
                }
                $licenseStatus = $cached;
                $licenseStatus['message'] = '';
            }
        } else {
            if ($purchaseCode === '') {
                LicenseStatus::setCached(false, 'Enter your MapSVG purchase code to enable updates.');
            }
            $licenseStatus = LicenseStatus::getCached();
        }
        $licenseBootstrap = array(
            'hasCode' => $purchaseCode !== '',
            'maskedKey' => LicenseStatus::maskLicenseKey($purchaseCode),
            'currentDomain' => LicenseStatus::currentDomain(),
            'ok' => !empty($licenseStatus['ok']),
            'message' => (string) ($licenseStatus['message'] ?? ''),
            'code' => (string) ($licenseStatus['code'] ?? ''),
            'warning' => (string) ($licenseStatus['warning'] ?? ''),
            'warningCode' => (string) ($licenseStatus['warningCode'] ?? ''),
            'domainsUsed' => $licenseStatus['domainsUsed'] ?? null,
            'domainsMax' => $licenseStatus['domainsMax'] ?? null,
        );
        // END

        $bootstrapParams = array(
            'apiUrl' => rest_url('mapsvg/v1'),
            'dashboardUrl' => preg_replace('~/api/?$~', '', rtrim(MAPSVG_API_URL, '/')),
            'licenseProductSlug' => class_exists(LicenseStatus::class) ? LicenseStatus::productSlug() : MAPSVG_PLAN,
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wp_rest'),
            'pluginUrl' => MAPSVG_PLUGIN_URL,
            'homeUrl' => home_url('/'),
            'cssUrl' => $cssUrl,
            'previewScripts' => self::getPreviewRuntimeScripts(),
            'version' => MAPSVG_VERSION,
            'plan' => MAPSVG_PLAN,
            'adminFeatureModules' => AdminFeatureModules::current(),
            'dataLayerV2Enabled' => \MapSVG\DataLayer\DataLayerFactory::isV2Enabled(),
            'globalQueriesEnabled' => \MapSVG\DataLayer\SavedQuery\GlobalQueriesFeature::isEnabled(),
            'databaseImportEnabled' => \MapSVG\Core\CollectionImportFeature::isEnabled(),
            'maps' => self::getReactAdminMapsBootstrap(),
            'deferredCatalogs' => true,
            'svgFiles' => array(),
            'svgRegistryEnabled' => (new SvgAssetRegistry())->available(),
            'imageFiles' => array(),
            'markerImages' => AdminCatalogs::defaultMarker(),
            'user' => array(
                'id' => (int) wp_get_current_user()->ID,
                'name' => wp_get_current_user()->display_name,
                'email' => wp_get_current_user()->user_email,
                'isAdmin' => current_user_can('manage_options'),
                'canEditJavaScript' => self::canEditJavaScript(),
            ),
            'options' => $options,
            'license' => $licenseBootstrap,
        );

        return apply_filters(
            'mapsvg_react_admin_bootstrap_params',
            $bootstrapParams
        );
    }

    /** Ordered frontend dependency graph for the isolated, same-origin preview realm. */
    private static function getPreviewRuntimeScripts(): array
    {
        $scripts = wp_scripts();
        $assets = array();
        $visited = array();
        $visit = function ($handle) use (&$visit, &$visited, &$assets, $scripts) {
            if (isset($visited[$handle])) return;
            $visited[$handle] = true;
            $registered = $scripts->registered[$handle] ?? null;
            if (!$registered) return;
            foreach ($registered->deps as $dependency) $visit($dependency);
            if (!$registered->src) return; // WordPress dependency aliases (e.g. jquery).
            $src = $registered->src;
            if (!preg_match('#^(https?:)?//#', $src)) $src = $scripts->base_url . $src;
            $version = $registered->ver === null ? null : ($registered->ver ?: $scripts->default_version);
            if ($version !== null) $src = add_query_arg('ver', $version, $src);
            $assets[] = array(
                'src' => apply_filters('script_loader_src', $src, $handle),
                'type' => $handle === 'mapsvg' ? 'module' : 'text/javascript',
                'before' => array_merge(
                    array_values(array_filter((array) $scripts->get_data($handle, 'before'), 'is_string')),
                    $handle === 'mapsvg' ? array() : array_filter(array($scripts->get_data($handle, 'data')))
                ),
                'after' => array_values(array_filter((array) $scripts->get_data($handle, 'after'), 'is_string')),
            );
        };
        // These vendor registrations predate explicit dependency declarations.
        foreach (array('jquery', 'bloodhound', 'typeahead', 'mapsvg') as $handle) $visit($handle);
        return $assets;
    }

    /**
     * Lightweight maps list for the React sidebar (id + title only).
     *
     * @return array<int, array{id: int, title: string}>
     */
    private static function getReactAdminMapsBootstrap(): array
    {
        $mapsRepo = RepositoryFactory::get("map");
        $query = new Query(array(
            'perpage' => 100,
            'page' => 1,
            'filters' => array('status' => 1),
            'fields' => array('id', 'title'),
        ));
        $mapsData = $mapsRepo->find($query);
        $items = isset($mapsData['items']) && is_array($mapsData['items'])
            ? $mapsData['items']
            : array();

        $out = array();
        foreach ($items as $map) {
            $out[] = array(
                'id' => (int) $map->id,
                'title' => isset($map->title) && $map->title !== ''
                    ? (string) $map->title
                    : ('Map #' . (int) $map->id),
            );
        }
        return $out;
    }

    /**
     * Render MapSVG settings page in WP Admin
     */
    function renderAdminPage()
    {

        // Check user rights
        if (!current_user_can('edit_posts'))
            die();

        // React admin shell (Phase 1+): ?react=1
        if (self::isReactAdminRequest()) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            $this->reactAdmin();
            return true;
        }

        if (isset($_GET['map_id']) && !empty($_GET['map_id'])) {  // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.NonceVerification.Missing
            $this->edit($_REQUEST);  // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.NonceVerification.Missing
        } else {
            $this->index($_REQUEST);  // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.NonceVerification.Missing
        }

        // START debug
        // END

        return true;
    }

    /**
     * Mount React admin SPA (scaffold). Open admin.php?page=mapsvg-config&react=1
     * Assets are enqueued in {@see enqueueReactAdminAssets()}; app mounts into a shadow root.
     */
    public function reactAdmin(): void
    {
        include __DIR__ . DIRECTORY_SEPARATOR . 'React' . DIRECTORY_SEPARATOR . 'body.php';
    }

    public function index($request)
    {
        $templateData = array();
        $mapsRepo = RepositoryFactory::get("map");

        $mapsRepo->deleteAllRemovedOneDayAgo();

        // Load the list of available SVG files
        $svgRepo = new SVGFileRepository();

        $currentPage = isset($_GET['p']) ? intval($_GET['p']) : 1;  // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.NonceVerification.Missing

        // Load the list of created maps
        $query = new Query(array('perpage' => 30, 'page' => $currentPage, 'filters' => ['status' =>  1], 'fields' => array('id', 'title')));

        $post_types = RepositoryFactory::get('postType')->find();

        $options = Options::getAll();

        // START purchase_code
        $licenseStatus = ['ok' => false, 'message' => ''];
        if (!empty($options['purchase_code']) && strpos(home_url(), 'demo.mapsvg.com') === false) {
            $licenseStatus = LicenseStatus::maybeRefresh(false);
            if (LicenseStatus::looksLikeConnectionMessage($licenseStatus['message'] ?? '')) {
                // Do not surface Envato/upstream HTTP noise in the page body.
                $cached = LicenseStatus::getCached();
                if (LicenseStatus::looksLikeConnectionMessage($cached['message'] ?? '')) {
                    LicenseStatus::setCached(!empty($cached['ok']), '');
                    $cached = LicenseStatus::getCached();
                }
                $licenseStatus = $cached;
                $licenseStatus['message'] = '';
            }
            $options = Options::getAll();
        } elseif (empty($options['purchase_code'])) {
            LicenseStatus::setCached(false, 'Enter your MapSVG purchase code to enable updates.');
            $licenseStatus = LicenseStatus::getCached();
        }
        $licenseUi = $this->buildLicenseUi($options, $licenseStatus);
        // END

        // Get the current user's information
        $current_user = wp_get_current_user();

        // Get the user's display name
        $user_name = $current_user->display_name;

        // Get the user's email address
        $user_email = $current_user->user_email;

        $mapsData = $mapsRepo->find($query);

        // Function to generate link
        function generateLink($page)
        {
            $currentUrl = isset($_SERVER['REQUEST_URI']) ? esc_url_raw(wp_unslash($_SERVER['REQUEST_URI'])) : '';
            $parsedUrl = wp_parse_url($currentUrl);
            parse_str($parsedUrl['query'], $params);
            $params['p'] = $page;
            $newQueryString = http_build_query($params);
            return $parsedUrl['path'] . '?' . $newQueryString;
        }

        // Generate previous and next links
        $prevLink = $currentPage > 1 ? generateLink($currentPage - 1) : '#';
        $nextLink = $mapsData["hasMore"] ? generateLink($currentPage + 1) : '#';


        $templateData = array(
            'user' => array("name" => $user_name, "email" => $user_email),
            'page' => 'index',
            'maps' => $mapsData["items"],
            'gitBranch' => "",
            'svgFiles' => $svgRepo->find(),
            'options' => $options,
            // START purchase_code
            'licenseStatus' => $licenseStatus,
            'licenseUi' => $licenseUi,
            // END
            'postTypes' => $post_types,
            'userIsAdmin' => current_user_can("manage_options"),
            'pagination' => array(
                "page" => $currentPage,
                "hasMore" => $mapsData["hasMore"],
                'nextLink' => $nextLink,
                'prevLink' => $prevLink
            )
        );



        wp_register_script('admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/core/admin.js', array('jquery'), (string) filemtime(MAPSVG_PLUGIN_DIR . DIRECTORY_SEPARATOR . 'js/mapsvg-admin/core/admin.js'), true);
        wp_enqueue_script('admin.mapsvg');


        wp_localize_script('admin.mapsvg', 'mapsvgBackendParams', array(
            'page' => 'index',
            'user' => array(
                "name" => $user_name,
                "email" => $user_email,
                "isAdmin" => current_user_can("manage_options"),
                "canEditJavaScript" => self::canEditJavaScript()
            ),
            'maps' => $mapsRepo->find($query),
            'gitBranch' => "",
            'svgFiles' => $svgRepo->find(),
            'options' => $options,
            'postTypes' => $post_types,
            'userIsAdmin' => current_user_can("manage_options"),
            'woocommerceActive' => WooCommerceIntegration::isActive(),
        ));

        $this->renderOutput('index', $templateData);
    }

    public function edit($request)
    {
        $templateData = array();

        $mapsRepo = RepositoryFactory::get("map");


        $map = $mapsRepo->findById($request['map_id']);
        if (!$map) {
            echo ("Map does not exists");
            return;
        }

        $legacyVersion = null;
        if (LegacyV8::isEditorRequest()) {
            try { $legacyVersion = LegacyV8::assertEditor($map); }
            catch (\Throwable $error) { wp_die(esc_html($error->getMessage())); }
        }
        if (empty($map->title)) {
            $map->setTitle('New map');
        }

        $markersRepo = new MarkersRepository();
        $markerImages = $markersRepo->find();

        $db = Database::get();

        $fullTextMinWord = $db->get_row("show variables like 'ft_min_word_len'", OBJECT);
        $fullTextMinWord = $fullTextMinWord ? $fullTextMinWord->Value : 0;

        $options = Options::getAll();

        $postTypesRepo = new PostTypesRepository();
        $post_types = $postTypesRepo->find();

        // Get the current user
        $current_user = wp_get_current_user();

        // Get the user's display name
        $user_name = $current_user->display_name;

        // Get the user's email address
        $user_email = $current_user->user_email;

        $svgRepo = new SVGFileRepository();



        if ($legacyVersion) {
            wp_enqueue_script('admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-legacy-editor.js', ['jquery', 'mapsvg-legacy-v8'], MAPSVG_ASSET_VERSION, true);
            add_filter('script_loader_tag', static function ($tag, $handle) { return $handle === 'admin.mapsvg' ? str_replace('<script ', '<script type="module" ', $tag) : $tag; }, 20, 2);
        } else {
            wp_register_script('admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/core/admin.js', array('jquery'), (string) filemtime(MAPSVG_PLUGIN_DIR . DIRECTORY_SEPARATOR . 'js/mapsvg-admin/core/admin.js'), true);
        }
        wp_enqueue_script('admin.mapsvg');

        wp_localize_script('admin.mapsvg', 'mapsvgBackendParams', array(
            'page' => 'edit',
            'legacyVersion' => $legacyVersion,
            'legacyAssetsUrl' => $legacyVersion ? LegacyV8::assets()['url'] : null,
            'map' => array(
                "id" => $map->id,
                "svgFileLastChanged" => $map->svgFileLastChanged,
                "options" => array(
                    "regionPrefix" => isset($map->options["regionPrefix"]) ? $map->options["regionPrefix"] : "",
                    "loadingText" => isset($map->options["loadingText"]) ? Map::sanitizeLoadingTextForOutput($map->options["loadingText"]) : "Loading map..."
                )
            ),
            'user' => array(
                "name" => $user_name,
                "email" => $user_email,
                "isAdmin" => current_user_can("manage_options"),
                "canEditJavaScript" => self::canEditJavaScript()
            ),
            'phpIni' => array(
                'post_max_size'       => ini_get('post_max_size'),
                'upload_max_filesize' => ini_get('upload_max_filesize')
            ),
            'gitBranch' => "",
            'markerImages' => $markerImages,
            'svgFiles' => $svgRepo->find(),
            'fullTextMinWord' => $fullTextMinWord,
            'options' => $options,
            'postTypes' => $post_types,
            'userIsAdmin' => current_user_can("manage_options"),
            'woocommerceActive' => WooCommerceIntegration::isActive(),
        ));


        $templateData["map"] = $map;
        $this->renderOutput('edit', $templateData);
    }

    public function renderOutput($page, $data)
    {
        if ($page === 'edit' && LegacyV8::isEditorRequest()) {
            LegacyV8::renderEditor($data['map']);
            return;
        }
        include(__DIR__ . DIRECTORY_SEPARATOR . ucfirst($page) . DIRECTORY_SEPARATOR . 'header.php');
        include(__DIR__ . DIRECTORY_SEPARATOR . ucfirst($page) . DIRECTORY_SEPARATOR . 'body.php');
        include(__DIR__ . DIRECTORY_SEPARATOR . ucfirst($page) . DIRECTORY_SEPARATOR . 'footer.php');
        // START support
        include(__DIR__ . DIRECTORY_SEPARATOR . "Common" . DIRECTORY_SEPARATOR . 'support_modal.php');
        // END
    }

    // START purchase_code
    /**
     * View-model for the MapSVG admin license alerts + modal.
     *
     * @param array $options
     * @param array{ok?: bool, message?: string} $licenseStatus
     * @return array{
     *   enabled: bool,
     *   purchaseCode: string,
     *   hasCode: bool,
     *   licenseOk: bool,
     *   showLicenseError: bool,
     *   showActivatePrompt: bool,
     *   showDomainRecheck: bool,
     *   showCancelledCta: bool,
     *   showStatusPanel: bool,
     *   showFormPanel: bool,
     *   maskedKey: string,
     *   errorHtml: string,
     *   toolbarLabel: string
     * }
     */
    private function buildLicenseUi(array $options, array $licenseStatus): array
    {
        if (strpos(home_url(), 'demo.mapsvg.com') !== false) {
            return [
                'enabled' => false,
                'purchaseCode' => '',
                'hasCode' => false,
                'licenseOk' => false,
                'showLicenseError' => false,
                'showLicenseWarning' => false,
                'showActivatePrompt' => false,
                'showDomainRecheck' => false,
                'showCancelledCta' => false,
                'showStatusPanel' => false,
                'showFormPanel' => false,
                'maskedKey' => '',
                'currentDomain' => '',
                'errorHtml' => '',
                'modalErrorHtml' => '',
                'warningHtml' => '',
                'modalWarningHtml' => '',
                'toolbarLabel' => 'Activate',
            ];
        }

        $purchaseCode = isset($options['purchase_code']) ? (string) $options['purchase_code'] : '';
        $hasCode = $purchaseCode !== '';
        $licenseOk = !empty($licenseStatus['ok']);
        $licenseErrorCode = !empty($licenseStatus['code']) ? (string) $licenseStatus['code'] : '';
        $licenseMessage = LicenseStatus::resolveDisplayMessage(
            $licenseStatus['message'] ?? '',
            $licenseErrorCode
        );
        $showLicenseError = LicenseStatus::shouldShowAdminError(
            $hasCode,
            $licenseOk,
            $licenseStatus['message'] ?? '',
            $licenseErrorCode
        );
        $showLicenseWarning = LicenseStatus::shouldShowDomainLimitWarning($hasCode, $licenseStatus);
        $softWarnMessage = $showLicenseWarning
            ? LicenseStatus::softDomainLimitMessage($licenseStatus)
            : '';
        $promptDismissed = !empty($options['license_activate_prompt_dismissed']);
        $showActivatePrompt = !$hasCode && !$promptDismissed;
        $showDomainRecheck = ($showLicenseError
                && LicenseStatus::isDomainRelatedMessage($licenseMessage, $licenseErrorCode))
            || $showLicenseWarning;
        $showEnterNewLicenseCta = $showLicenseError
            && LicenseStatus::needsNewLicenseKeyCta($licenseMessage, $licenseErrorCode);

        return [
            'enabled' => true,
            'purchaseCode' => $purchaseCode,
            'hasCode' => $hasCode,
            'licenseOk' => $licenseOk,
            'showLicenseError' => $showLicenseError,
            'showLicenseWarning' => $showLicenseWarning,
            'showActivatePrompt' => $showActivatePrompt,
            'showDomainRecheck' => $showDomainRecheck,
            'showCancelledCta' => $showEnterNewLicenseCta,
            'showStatusPanel' => $hasCode,
            'showFormPanel' => !$hasCode,
            'maskedKey' => $hasCode ? LicenseStatus::maskLicenseKey($purchaseCode) : '',
            'currentDomain' => LicenseStatus::currentDomain(),
            'errorHtml' => $showLicenseError
                ? LicenseStatus::formatAlertHtml($licenseMessage, true, $licenseErrorCode)
                : '',
            'modalErrorHtml' => $showLicenseError
                ? LicenseStatus::formatModalAlertHtml($licenseMessage, true, $licenseErrorCode)
                : '',
            'warningHtml' => $showLicenseWarning
                ? LicenseStatus::formatDomainLimitSoftAlertHtml($softWarnMessage, true)
                : '',
            'modalWarningHtml' => $showLicenseWarning
                ? LicenseStatus::formatDomainLimitSoftModalAlertHtml($softWarnMessage, true)
                : '',
            'errorCode' => $showLicenseError ? LicenseStatus::normalizeCode($licenseErrorCode) : '',
            'warningCode' => $showLicenseWarning ? LicenseStatus::CODE_DOMAIN_LIMIT : '',
            'toolbarLabel' => $hasCode ? 'License' : 'Activate',
        ];
    }
    // END
}
