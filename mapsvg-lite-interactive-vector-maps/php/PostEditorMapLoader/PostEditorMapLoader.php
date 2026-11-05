<?php

namespace MapSVG;

use Error;

class PostEditorMapLoader
{

    /** @var string[]|null Post types with a current Query/legacy map binding (lazy). */
    private $postTypesWithLinkedMaps = null;
    private $mapBindings;

    private function mapBindings(): PostTypeMapBindings
    {
        if ($this->mapBindings === null) $this->mapBindings = new PostTypeMapBindings();
        return $this->mapBindings;
    }

    public static function getTableName($postType)
    {
        $schemaRepo = RepositoryFactory::get("schema");
        $schema = $schemaRepo->findOne(["postType" => $postType]);
        if ($schema) {
            return $schema->name;
        }
        return null;
    }


    public function __construct()
    {
    }

    /**
     * CPT has a post source consumed by a current map or live draft.
     */
    private function postTypeHasLinkedMaps(string $postType): bool
    {
        if ($postType === '') {
            return false;
        }
        return in_array($postType, $this->getPostTypesWithLinkedMaps(), true);
    }

    /**
     * Post types that should show the MapSVG editor panel / meta.
     *
     * @return string[]
     */
    private function getPostTypesWithLinkedMaps(): array
    {
        if ($this->postTypesWithLinkedMaps !== null) {
            return $this->postTypesWithLinkedMaps;
        }

        $this->postTypesWithLinkedMaps = [];

        $schemaRepo = RepositoryFactory::get("schema");
        $result = $schemaRepo->find(new Query([
            'perpage' => 0,
            'filters' => ['type' => 'post'],
        ]));
        $schemas = $result['items'] ?? [];
        if (empty($schemas)) {
            return $this->postTypesWithLinkedMaps;
        }

        foreach ($schemas as $schema) {
            if (empty($schema->postType) || empty($schema->id)) {
                continue;
            }
            if ($this->mapBindings()->mapsForSchema((int) $schema->id)) {
                $this->postTypesWithLinkedMaps[] = (string) $schema->postType;
            }
        }

        $this->postTypesWithLinkedMaps = array_values(array_unique($this->postTypesWithLinkedMaps));
        return $this->postTypesWithLinkedMaps;
    }

    function init()
    {
        if (!\MapSVG\Core\PostDataFeature::isEnabled()) return;
        // CPTs are usually registered at init 10; stay later so add_post_type_support sticks.
        add_action('init', array($this, 'addLocationFieldToPosts'), 20);
        add_action('rest_api_init', array($this, 'addLocationFieldToPosts'));

        if (is_admin()) {

            add_action('current_screen', function (\WP_Screen $screen) {
                if ($screen->base !== 'post' && $screen->base !== 'post-new') {
                    return;
                }
                if (empty($screen->post_type) || !$this->postTypeHasLinkedMaps($screen->post_type)) {
                    return;
                }
                $current_screen = get_current_screen();
                if (
                    method_exists($current_screen, 'is_block_editor')
                    && $current_screen->is_block_editor()
                ) {
                    add_action('admin_enqueue_scripts', array($this, 'addJsCssGutenberg'));
                } else {
                    add_action('admin_enqueue_scripts', array($this, 'addJsCssClassicEditor'));
                    // After WooCommerce (priority 30) so Location sits with other "high" boxes.
                    add_action('add_meta_boxes', array($this, 'addLocationMetaBox'), 35);
                    add_action('save_post', array($this, 'saveLocationMeta'));
                    // Woo may persist meta-box-order without MapSVG — keep Location right after Product data.
                    add_filter('get_user_option_meta-box-order_product', array($this, 'placeLocationMetaBoxAfterProductData'));
                }
            });
        }

        $this->registerPostDataSyncHooks();
    }

    /**
     * Permanent delete is global (`before_delete_post`) so it still runs when
     * the post type was not in the mappable list at `init`. Per-type trash and
     * REST hooks are kept for the existing editor/REST paths.
     *
     * WordPress has a global `untrash_post` hook, fired before status changes;
     * `untrash_{$postType}` only happens to match it for the standard post type.
     * Restore is handled after the change by `transition_post_status`.
     *
     * @return void
     */
    public function registerPostDataSyncHooks()
    {
        add_action('before_delete_post', [$this, 'deletePostDataOnPermanentDelete'], 10, 2);
        add_action('transition_post_status', [$this, 'syncPostDataOnStatusTransition'], 10, 3);

        $postTypes = MappablePostTypes::all();
        if (empty($postTypes)) {
            return;
        }

        foreach ($postTypes as $postType) {
            if ($postType) {
                add_action('trash_' . $postType, [$this, 'deletePostData']);
                add_action('rest_after_insert_' . $postType, [$this, 'updatePostData'], 10, 2);
                add_action('rest_after_update_' . $postType, [$this, 'updatePostData'], 10, 2);
            }
        }
    }

    /**
     * `before_delete_post` — the post object still exists here (WP 5.5+ passes it).
     *
     * @param int           $postId
     * @param \WP_Post|null $post
     * @return void
     */
    public function deletePostDataOnPermanentDelete($postId, $post = null)
    {
        $resolved = $this->resolvePostReference($postId, $post);
        if ($resolved === null) {
            return;
        }
        if ($resolved['type'] !== '' && !$this->isMappablePostType($resolved['type'])) {
            return;
        }
        $this->deletePostData($resolved['id'], $post);
    }

    /**
     * Status changes (Quick Edit, bulk edit, classic save, untrash, REST).
     * Inserts use old status `new` and are skipped so location meta can be saved first.
     *
     * @param string        $newStatus
     * @param string        $oldStatus
     * @param \WP_Post|null $post
     * @return void
     */
    public function syncPostDataOnStatusTransition($newStatus, $oldStatus, $post = null)
    {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }
        if (!is_object($post) || empty($post->post_type)) {
            return;
        }
        if (!$this->isMappablePostType((string) $post->post_type)) {
            return;
        }
        if ($newStatus === $oldStatus || $oldStatus === 'new') {
            return;
        }
        if ($newStatus !== 'publish' && $oldStatus !== 'publish' && $oldStatus !== 'trash') {
            return;
        }

        $this->updatePostData($post);
    }

    function updatePostData($postOrId)
    {

        if (!is_object($postOrId)) {
            $post = get_post($postOrId);
        } else {
            $post = $postOrId;
        }

        if (!is_object($post) || empty($post->ID)) {
            return false;
        }

        $id = $post->ID;

        $table = static::getTableName($post->post_type);
        if (!$table) {
            return false;
        }

        $schemaRepo = RepositoryFactory::get("schema");
        $schema = $schemaRepo ? $schemaRepo->findOne(["name" => $table]) : null;

        if (!$schema) {
            return false;
        }

        $locationMeta = get_post_meta($id, 'mapsvg_location', true);
        $location = is_string($locationMeta) && $locationMeta !== '' && $locationMeta !== 'null'
            ? json_decode($locationMeta, true)
            : null;
        if (!is_array($location)) {
            $location = null;
        }

        $regionsMeta = get_post_meta($id, 'mapsvg_regions', true);
        $regions = is_string($regionsMeta) && $regionsMeta !== '' && $regionsMeta !== 'null'
            ? json_decode($regionsMeta, true)
            : null;
        if (!is_array($regions)) {
            $regions = [];
        }

        $hasLocation = !empty($location) && !empty($location['geoPoint']);
        $hasRegions = !empty($regions);

        // Password protection keeps WP status=publish, but the Map is public.
        if ($post->post_status !== 'publish' || (string) $post->post_password !== '' || (!$hasLocation && !$hasRegions)) {
            $this->deletePostData($id, $post);
            return;
        }

        $params = array(
            'post' => $id,
            'location' => $hasLocation ? $location : null,
            'regions' => $regions,
        );

        $postsRepo = RepositoryFactory::get($table);

        if (!$postsRepo) {
            Logger::error("[SERVER-001] MapSVG: trying to update location/regions meta of the post type that is not connected to any map: " . $post->post_type . " — Read more: https://mapsvg.com/docs/errors#SERVER-001");
        } else {
            $existing = $postsRepo->findOne(["post" => $id]);

            if ($existing) {
                $existing->update($params);
                $postsRepo->update($existing);
            } else {
                $postsRepo->create($params);
            }
        }
    }

    /**
     * Remove the MapSVG Database row for a WordPress post.
     *
     * Accepts a post ID and/or WP_Post so this still works from `before_delete_post`
     * (`$post_id, $post` since WP 5.5) when `get_post()` would otherwise be enough,
     * and does not fatal when the post is already gone.
     *
     * @param int|\WP_Post  $postOrId
     * @param \WP_Post|null $post
     * @return void
     */
    function deletePostData($postOrId, $post = null)
    {
        $resolved = $this->resolvePostReference($postOrId, $post);
        if ($resolved === null) {
            return;
        }

        if ($resolved['type'] !== '') {
            $this->deletePostDataFromType($resolved['id'], $resolved['type']);
            return;
        }

        foreach (MappablePostTypes::all() as $postType) {
            $this->deletePostDataFromType($resolved['id'], $postType);
        }
    }

    /**
     * @param string $postType
     * @return bool
     */
    private function isMappablePostType($postType): bool
    {
        return $postType !== '' && in_array($postType, MappablePostTypes::all(), true);
    }

    /**
     * @param int|\WP_Post  $postOrId
     * @param \WP_Post|null $post
     * @return array{id:int,type:string}|null
     */
    private function resolvePostReference($postOrId, $post = null)
    {
        if (is_object($post) && !empty($post->ID)) {
            return array(
                'id'   => (int) $post->ID,
                'type' => isset($post->post_type) ? (string) $post->post_type : '',
            );
        }

        if (is_object($postOrId) && !empty($postOrId->ID)) {
            return array(
                'id'   => (int) $postOrId->ID,
                'type' => isset($postOrId->post_type) ? (string) $postOrId->post_type : '',
            );
        }

        $postID = (int) $postOrId;
        if ($postID <= 0) {
            return null;
        }

        $fetched = get_post($postID);
        if (is_object($fetched) && !empty($fetched->ID)) {
            return array(
                'id'   => (int) $fetched->ID,
                'type' => isset($fetched->post_type) ? (string) $fetched->post_type : '',
            );
        }

        return array(
            'id'   => $postID,
            'type' => '',
        );
    }

    /**
     * @param int    $postID
     * @param string $postType
     * @return void
     */
    private function deletePostDataFromType($postID, $postType)
    {
        $table = static::getTableName($postType);
        if (!$table) {
            return;
        }
        $postsRepo = RepositoryFactory::get($table);
        if (!$postsRepo) {
            return;
        }
        $postInMapsvgTable = $postsRepo->findOne(["post" => $postID]);
        if ($postInMapsvgTable) {
            $postsRepo->delete($postInMapsvgTable->id);
        }
    }

    function addLocationFieldToPosts()
    {
        $postTypes = MappablePostTypes::all();
        if (empty($postTypes)) {
            return;
        }

        foreach ($postTypes as $postType) {
            add_post_type_support($postType, 'custom-fields');
            if (function_exists('register_post_meta')) {
                register_post_meta($postType, 'mapsvg_location', self::getLocationMetaRegistrationArgs());
            } else {
                $args = self::getLocationMetaRegistrationArgs();
                $args['object_subtype'] = $postType;
                register_meta('post', 'mapsvg_location', $args);
            }
            register_meta('post', 'mapsvg_regions', array(
                'object_subtype' => $postType,
                'show_in_rest' => true,
                'type' => 'string',
                'single' => true,
                'auth_callback' => array(self::class, 'authLocationMeta'),
            ));
        }
    }

    /**
     * REST args for the Gutenberg Location panel. Without show_in_rest, core
     * omits the key from /wp/v2/{type} and silently drops it on save.
     *
     * @return array<string, mixed>
     */
    public static function getLocationMetaRegistrationArgs(): array
    {
        return array(
            'type'              => 'string',
            'single'            => true,
            'default'           => '',
            'show_in_rest'      => array(
                'schema' => array(
                    'type'    => 'string',
                    'default' => '',
                ),
            ),
            'sanitize_callback' => array(self::class, 'sanitizeLocationMeta'),
            'auth_callback'     => array(self::class, 'authLocationMeta'),
        );
    }

    /**
     * @param mixed $value
     * @return string
     */
    public static function sanitizeLocationMeta($value): string
    {
        if ($value === null || $value === '') {
            return '';
        }
        if (is_array($value)) {
            return wp_json_encode($value, JSON_UNESCAPED_UNICODE);
        }

        $raw = is_string($value) ? $value : (string) $value;
        // sanitize_meta receives an unslashed value. JSON escapes belong to the
        // document and must survive; unslashing again corrupts quoted addresses.

        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            return '';
        }

        return wp_json_encode($decoded, JSON_UNESCAPED_UNICODE);
    }

    /**
     * @param bool   $allowed
     * @param string $meta_key
     * @param int    $object_id
     * @return bool
     */
    public static function authLocationMeta($allowed, $meta_key, $object_id): bool
    {
        return current_user_can('edit_post', (int) $object_id);
    }

    // Register meta box
    public function addLocationMetaBox($hook_suffix)
    {

        $postTypes = $this->getPostTypesWithLinkedMaps();
        if (!empty($postTypes)) {
            foreach ($postTypes as $postType) {
                // Registered only for a Classic current_screen. A post can use
                // Classic even when its post type supports the block editor.
                add_meta_box(
                    'mapsvg_location_meta_box',
                    'Location',
                    [$this, 'locationMetaBoxCallback'],
                    $postType,
                    'normal',
                    'high'
                );
            }
        }
    }

    /**
     * Keep Location metabox immediately after WooCommerce Product data.
     *
     * @param mixed $order
     * @return mixed
     */
    public function placeLocationMetaBoxAfterProductData($order)
    {
        if (!is_array($order) || empty($order['normal']) || !is_string($order['normal'])) {
            return $order;
        }

        $boxId = 'mapsvg_location_meta_box';
        $afterId = 'woocommerce-product-data';
        $boxes = array_values(array_filter(array_map('trim', explode(',', $order['normal']))));
        $boxes = array_values(array_diff($boxes, [$boxId]));
        $afterPos = array_search($afterId, $boxes, true);
        if ($afterPos === false) {
            return $order;
        }
        array_splice($boxes, $afterPos + 1, 0, [$boxId]);
        $order['normal'] = implode(',', $boxes);
        return $order;
    }



    /**
     * Add buttons to Visual Editor
     */
    public function setupTinymce()
    {
        wp_register_style(
            'mapsvg-tinymce',
            MAPSVG_PLUGIN_URL . "css/mapsvg-tinymce.css",
            array(),
            MAPSVG_ASSET_VERSION
        );
        wp_enqueue_style('mapsvg-tinymce');

        add_filter('mce_external_plugins', array($this, 'addTinymceJs'));
        add_filter('mce_buttons', array($this, 'addTinymceButton'));
    }

    /**
     * Adds a TinyMCE plugin compatible JS file to the TinyMCE / Visual Editor instance
     *
     * @param array $plugin_array Array of registered TinyMCE Plugins
     * @return array Modified array of registered TinyMCE Plugins
     */
    public function addTinymceJs($plugin_array)
    {
        $plugin_array['mapsvg'] = MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/wp-classic-editor/tinymce-mapsvg.js';
        return $plugin_array;
    }

    /**
     * Adds a button to the TinyMCE / Visual Editor which the user can click
     * to insert a custom CSS class.
     *
     * @param array $buttons Array of registered TinyMCE Buttons
     * @return array Modified array of registered TinyMCE Buttons
     */
    public function addTinymceButton($buttons)
    {
        array_push($buttons, 'mapsvg');
        return $buttons;
    }

    public function locationMetaBoxCallback($post)
    {
        $location = get_post_meta($post->ID, 'mapsvg_location', true);
        $regions = get_post_meta($post->ID, 'mapsvg_regions', true);
        echo '<div id="mapsvg-location-host" class="mapsvg-location-host"></div>';
        echo '<input type="hidden" id="mapsvg_location" name="mapsvg_location" value="' . esc_attr($location) . '">';
        echo '<input type="hidden" id="mapsvg_regions" name="mapsvg_regions" value="' . esc_attr($regions) . '">';
    }

    public function saveLocationMeta($post_id)
    {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if (!current_user_can('edit_post', $post_id)) return;

        $updated = false;

        if (isset($_POST['mapsvg_location'])) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.NonceVerification.Missing
            $location = wp_json_encode(json_decode(wp_unslash($_POST['mapsvg_location']))); // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized, WordPress.Security.NonceVerification.Missing
            update_post_meta($post_id, 'mapsvg_location', $location);
            $updated = true;
        }

        if (isset($_POST['mapsvg_regions'])) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.NonceVerification.Missing
            $regionsRaw = wp_unslash($_POST['mapsvg_regions']); // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized, WordPress.Security.NonceVerification.Missing
            $regionsDecoded = json_decode($regionsRaw);
            $regions = ($regionsRaw === '' || $regionsRaw === 'null')
                ? ''
                : wp_json_encode($regionsDecoded);
            update_post_meta($post_id, 'mapsvg_regions', $regions);
            $updated = true;
        }

        if ($updated) {
            $this->updatePostData($post_id);
        }
    }

    /**
     * Maps whose Page Query consumes this CPT source (legacy links remain fallback).
     *
     * @param string $postType
     * @return array<int, array{id:int,title:string}>
     */
    private function getMapsForPostType($postType)
    {
        $table = static::getTableName($postType);
        if (!$table) {
            return [];
        }

        $schemaRepo = RepositoryFactory::get("schema");
        $schema = $schemaRepo->findOne(["name" => $table]);
        if (!$schema || empty($schema->id)) {
            return [];
        }

        return $this->mapBindings()->mapsForSchema((int) $schema->id);
    }

    /**
     * Shared localize payload for Gutenberg / Classic post editor panel.
     *
     * @param \WP_Post|null $post
     * @return array
     */
    private function getBackendParams($post = null)
    {
        $markersRepo = new MarkersRepository();
        $markerImages = $markersRepo->find();
        $apiKey = Options::get("google_api_key");

        $lastMaps = Options::get("post_editor_last_map");
        if (!is_array($lastMaps)) {
            $lastMaps = [];
        }

        $params = [
            "markerImages" => $markerImages,
            "mappablePostTypes" => MappablePostTypes::all(),
            "googleApiKey" => $apiKey,
            "mapsPath" => MAPSVG_MAPS_URL,
            "markerSupport" => 1,
            "regionSupport" => 0,
            "schemaId" => null,
            "maps" => [],
            "mapsvg_location" => "",
            "mapsvg_regions" => "",
            "postType" => "",
            "lastMaps" => $lastMaps,
            "lastMapId" => null,
        ];

        if (!$post) {
            return $params;
        }

        $postType = $post->post_type;
        $params["post"] = (int) $post->ID;
        $params["postType"] = $postType;
        $params["mapsvg_location"] = get_post_meta($post->ID, 'mapsvg_location', true);
        $params["mapsvg_regions"] = get_post_meta($post->ID, 'mapsvg_regions', true);

        if (!empty($lastMaps[$postType])) {
            $params["lastMapId"] = (int) $lastMaps[$postType];
        }

        $table = static::getTableName($post->post_type);
        if ($table) {
            $schemaRepo = RepositoryFactory::get("schema");
            $schema = $schemaRepo->findOne(["name" => $table]);
            if ($schema) {
                $params["schemaId"] = (int) $schema->id;
                $params["markerSupport"] = isset($schema->markerSupport) ? (int) $schema->markerSupport : 1;
                $params["regionSupport"] = isset($schema->regionSupport) ? (int) $schema->regionSupport : 0;
                $params["maps"] = $this->getMapsForPostType($post->post_type);
            }
        }

        return $params;
    }

    public function addJsCssCommon()
    {
        // MapSVG form/admin CSS is injected into the map shadowRoot (see post-editor panel).
        // Only host-layout CSS stays in the light DOM to avoid WP/Woo conflicts.
        wp_enqueue_style(
            'mapsvg-gutenberg-css',
            MAPSVG_PLUGIN_URL . 'css/mapsvg-gutenberg.css',
            array(),
            MAPSVG_ASSET_VERSION
        );

        // Add jQuery Growl for notifications
        wp_enqueue_script('jquery-growl', MAPSVG_PLUGIN_URL . 'js/vendor/jquery-growl/jquery.growl.js', array('jquery'), "1.3.1", true);
        wp_enqueue_style(
            'jquery-growl',
            MAPSVG_PLUGIN_URL . 'js/vendor/jquery-growl/jquery.growl.css',
            array(),
            "1.3.1"
        );
    }

    /**
     * Localize backend params without wp_localize_script stringification of ints.
     *
     * @param string $scriptHandle
     * @param \WP_Post|null $post
     */
    private function localizeBackendParams(string $scriptHandle, $post = null): void
    {
        $params = $this->getBackendParams($post instanceof \WP_Post ? $post : null);
        $json = wp_json_encode($params);
        if ($json === false) {
            $json = '{}';
        }
        wp_add_inline_script(
            $scriptHandle,
            'window.mapsvgBackendParams = ' . $json . ';',
            'before'
        );
    }

    /**
     * Adds scripts and CSS to Classic editor
     */
    function addJsCssClassicEditor()
    {
        global $post;

        if (!$post instanceof \WP_Post || !$this->postTypeHasLinkedMaps($post->post_type)) {
            return;
        }

        $this->addJsCssCommon();
        static::setupTinymce();

        \MapSVG\Front::addJsCss();

        $classicPath = MAPSVG_PLUGIN_DIR . '/dist/mapsvg-classic-editor.build.js';
        $classicVer = file_exists($classicPath) ? (string) filemtime($classicPath) : MAPSVG_ASSET_VERSION;

        wp_enqueue_script(
            'mapsvg-classic-editor',
            MAPSVG_PLUGIN_URL . 'dist/mapsvg-classic-editor.build.js',
            ['jquery', 'mapsvg'],
            $classicVer,
            true
        );

        $this->localizeBackendParams('mapsvg-classic-editor', $post);
    }

    /**
     * Adds scripts and CSS to Gutenberg editor
     */
    function addJsCssGutenberg()
    {
        global $post;

        if (!$post instanceof \WP_Post || !$this->postTypeHasLinkedMaps($post->post_type)) {
            return;
        }

        $this->addJsCssCommon();

        \MapSVG\Front::addJsCss();

        $gutenbergPath = MAPSVG_PLUGIN_DIR . '/dist/mapsvg-gutenberg.build.js';
        $gutenbergVer = file_exists($gutenbergPath) ? (string) filemtime($gutenbergPath) : MAPSVG_ASSET_VERSION;

        wp_register_script(
            'mapsvg-gutenberg-sidebar',
            MAPSVG_PLUGIN_URL . 'dist/mapsvg-gutenberg.build.js',
            array('wp-blocks', 'wp-plugins', 'wp-edit-post', 'wp-i18n', 'wp-element'),
            $gutenbergVer,
            true
        );

        $this->localizeBackendParams(
            'mapsvg-gutenberg-sidebar',
            $post instanceof \WP_Post ? $post : null
        );

        wp_enqueue_script('mapsvg-gutenberg-sidebar');
    }
}
