<?php

namespace MapSVG;

use Error;

class PostEditorMapLoader
{

    private $mappablePostTypes;

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
        $this->mappablePostTypes = MappablePostTypes::all();
    }

    private function isClassicEditor($hook_suffix)
    {
        global $post;

        $post_types = MappablePostTypes::all();
        $screen = get_current_screen();
        if (empty($post_types)) {
            return false;
        }

        $onMappablePostTypeEditorScreen = is_object($screen) && in_array($screen->post_type, $post_types, true) && in_array($hook_suffix, array('post.php', 'post-new.php'));

        if ($onMappablePostTypeEditorScreen) {

            $itsGutenbergEnabledForThePost = use_block_editor_for_post($post);

            if ($itsGutenbergEnabledForThePost) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    }

    function init()
    {
        // CPTs are usually registered at init 10; stay later so add_post_type_support sticks.
        add_action('init', array($this, 'addLocationFieldToPosts'), 20);
        add_action('rest_api_init', array($this, 'addLocationFieldToPosts'));

        if (is_admin()) {

            add_action('current_screen', function (\WP_Screen $screen) {
                if ($screen->base !== 'post' && $screen->base !== 'post-new') {
                    return;
                }
                $mappable = MappablePostTypes::all();
                if (empty($screen->post_type) || !in_array($screen->post_type, $mappable, true)) {
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
                    add_action('add_meta_boxes', array($this, 'addLocationMetaBox'));
                    add_action('save_post', array($this, 'saveLocationMeta'));
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

        $this->mappablePostTypes = MappablePostTypes::all();
        if (empty($this->mappablePostTypes)) {
            return;
        }

        foreach ($this->mappablePostTypes as $postType) {
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

        $meta = get_post_meta($id, 'mapsvg_location', true);
        $location = json_decode($meta, true);

        $params = array(
            'post'  => $id,
            'location' => $location
        );


        // If the post is not published or doesn't have a valid location with a geoPoint, remove it from the MapSVG table.
        if (
            $post->post_status !== 'publish'
            || empty($location)
            || empty($location['geoPoint'])
        ) {
            $this->deletePostData($id, $post);
            return;
        }

        $postsRepo = RepositoryFactory::get($table);

        if (!$postsRepo) {
            Logger::error("[SERVER-001] MapSVG: trying to update location meta field of the post type that is not connected to any map: " . $post->post_type . " — Read more: https://mapsvg.com/docs/errors#SERVER-001");
        } else {
            $post = $postsRepo->findOne(["post" => $id]);

            if ($post) {
                $post->update($params);
                $postsRepo->update($post);
            } else {
                $postsRepo->create($params);
            }
        }

        // 
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

        $postTypes = MappablePostTypes::all();
        if (!empty($postTypes)) {
            foreach ($postTypes as $postType) {
                if (!use_block_editor_for_post_type($postType)) {
                    add_meta_box(
                        'mapsvg_location_meta_box',
                        'Location @mapsvg',
                        [$this, 'locationMetaBoxCallback'],
                        $postType,
                        'normal',
                        'high'
                    );
                }
            }
        }
    }



    /**
     * Add buttons to Visual Editor
     */
    public function setupTinymce()
    {
        wp_register_style('mapsvg-tinymce', MAPSVG_PLUGIN_URL . "css/mapsvg-tinymce.css", null, MAPSVG_ASSET_VERSION);
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

    function addScriptsForPostEditor($hook_suffix)
    {
        global $post;
        $post_types = MappablePostTypes::all();
        $screen = get_current_screen();
        if (empty($post_types)) {
            return;
        }

        $onMappablePostTypeEditorScreen = is_object($screen) && in_array($screen->post_type, $post_types, true) && in_array($hook_suffix, array('post.php', 'post-new.php'));

        if ($onMappablePostTypeEditorScreen) {

            $itsGutenbergEnabledForThePost = use_block_editor_for_post($post);

            if ($itsGutenbergEnabledForThePost) {
                static::addJsCssGutenberg();
            } else {
                static::addJsCssClassicEditor();
                static::setupTinymce();
                add_action('add_meta_boxes', array($this, 'addLocationMetaBox'));
                add_action('save_post', array($this, 'saveLocationMeta'));
            }
        }
    }

    public function locationMetaBoxCallback($post)
    {
        // Retrieve current value
        $location = get_post_meta($post->ID, 'mapsvg_location', true);
        echo '<div id="mapsvg-classic-editor-container">';
        echo '    <div id="mapsvg"></div>';
        echo '    <div id="mapsvg-filters"></div>';
        echo '</div>';
        echo '<input type="hidden" id="mapsvg_location" name="mapsvg_location" value="' . esc_attr($location) . '">';
    }

    public function saveLocationMeta($post_id)
    {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if (!current_user_can('edit_post', $post_id)) return;

        if (isset($_POST['mapsvg_location'])) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.NonceVerification.Missing
            $location = wp_json_encode(json_decode(wp_unslash($_POST['mapsvg_location']))); // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized, WordPress.Security.NonceVerification.Missing
            update_post_meta($post_id, 'mapsvg_location', $location);
            $this->updatePostData($post_id);
        }
    }

    public function addJsCssCommon()
    {
        // Add common JS and CSS files
        // wp_enqueue_script('mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg.min.js', array('jquery'), MAPSVG_VERSION, true);
        // wp_enqueue_style('mapsvg', MAPSVG_PLUGIN_URL . 'css/mapsvg.css', array(), MAPSVG_VERSION);
        wp_register_style('mapsvg-styles-filters', MAPSVG_PLUGIN_URL . 'js/mapsvg/FormBuilder/form.css', null, MAPSVG_ASSET_VERSION,);
        wp_enqueue_style('mapsvg-styles-filters');

        // Add jQuery Growl for notifications
        wp_enqueue_script('jquery-growl', MAPSVG_PLUGIN_URL . 'js/vendor/jquery-growl/jquery.growl.js', array('jquery'), "1.3.1", true);
        wp_enqueue_style('jquery-growl', MAPSVG_PLUGIN_URL . 'js/vendor/jquery-growl/jquery.growl.css', array(), "1.3.1");

        wp_enqueue_style(
            'mapsvg-gutenberg-css',
            MAPSVG_PLUGIN_URL . 'css/mapsvg-gutenberg.css',
            array(),
            MAPSVG_ASSET_VERSION
        );
    }

    /**
     * Adds scripts and CSS to Gutenberg editor
     */
    function addJsCssClassicEditor()
    {
        global $post;

        static::setupTinymce();

        \MapSVG\Front::addJsCss();

        $this->addJsCssCommon();

        wp_enqueue_script('mapsvg-classic-editor', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/wp-classic-editor/mapsvg-classic-editor.js', ['jquery', 'mapsvg'], MAPSVG_VERSION, true);

        $markersRepo = new MarkersRepository();
        $markerImages = $markersRepo->find();
        $apiKey = Options::get("google_api_key");

        // Localize script with necessary data
        wp_localize_script('mapsvg-classic-editor', 'mapsvgBackendParams', [
            "markerImages" => $markerImages,
            "googleApiKey" => $apiKey,
            "mapsPath" => MAPSVG_MAPS_URL,
            'post' => $post->ID,
            "mapsvg_location" => get_post_meta($post->ID, 'mapsvg_location', true),
        ]);
    }

    /**
     * Adds scripts and CSS to Gutenberg editor
     */
    function addJsCssGutenberg()
    {
        \MapSVG\Front::addJsCss();

        $this->addJsCssCommon();

        wp_register_script(
            'mapsvg-gutenberg-sidebar',
            MAPSVG_PLUGIN_URL . 'dist/mapsvg-gutenberg.build.js',
            array('wp-blocks', 'wp-plugins', 'wp-edit-post', 'wp-i18n', 'wp-element'),
            MAPSVG_ASSET_VERSION,
            true
        );

        $markersRepo = new MarkersRepository();
        $markerImages = $markersRepo->find();
        $apiKey = Options::get("google_api_key");

        wp_localize_script('mapsvg-gutenberg-sidebar', 'mapsvgBackendParams', array(
            "markerImages" => $markerImages,
            "googleApiKey" => $apiKey,
            "mapsPath" => MAPSVG_MAPS_URL,
            "mappablePostTypes" => MappablePostTypes::all(),
        ));

        wp_enqueue_script('mapsvg-gutenberg-sidebar');
    }
}
