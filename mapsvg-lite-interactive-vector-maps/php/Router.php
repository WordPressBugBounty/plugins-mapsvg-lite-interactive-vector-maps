<?php

/**
 * Created by PhpStorm.
 * User: Roma
 * Date: 24.10.18
 * Time: 10:52
 */

namespace MapSVG;

/**
 * Router class that registers routes for WP Rest API
 * and also does DB upgrades
 */
class Router
{

	public function __construct()
	{
		$this->run();
	}

	public function run()
	{
		add_action('init', [AppDraftPreview::class, 'noCache'], 0);
		add_action('send_headers', [AppDraftPreview::class, 'noCache'], 999);
		add_action('wp_footer', [AppDraftPreview::class, 'banner']);
		add_action('template_redirect', [ThemeTypography::class, 'render'], 0);

		// Legacy shortcode support
		add_action('parse_request', function ($wp) {
			if ($wp->request === 'mapsvg_sc') { // phpcs:ignore
				if (isset($_GET['mapsvg_shortcode'])) {
					$legacy = wp_unslash($_GET['mapsvg_shortcode']); // phpcs:ignore
					wp_redirect(home_url('/_mapsvg/shortcode/' . rawurlencode($legacy)), 301);
					exit;
				}
				if (isset($_GET['mapsvg_embed_post'])) {
					$legacy = wp_unslash($_GET['mapsvg_embed_post']); // phpcs:ignore
					wp_redirect(home_url('/_mapsvg/post/' . rawurlencode($legacy)), 301);
					exit;
				}
			}
		});

		// Register _mapsvg endpoint on both frontend and admin
		add_action('init', function () {
			if (!get_option('mapsvg_rewrite_flushed')) {
				static::addMapsvgEndpoint();
			}
		});
		add_action('parse_request', array($this, 'handleMapsvgRequest'));

		add_action('rest_api_init', function () {

			$this->registerMethodCheckRoutes();
			RuntimeBootstrap::register();


			$this->registerMapRoutes();
			$this->registerMapV2Routes();

			$this->registerSchemaRoutes();
			$this->registerGlobalQueryRoutes();

			$this->registerDataToMapsRoutes();

			$this->registerCollectionRoutes();
			$this->registerRegionRoutes();  // kept as backwards-compat aliases
			$this->registerObjectRoutes();  // kept as backwards-compat aliases

			$this->registerPostRoutes();

			$this->registerGeocodingRoutes();

			// START purchase_code
			$this->registerPurchaseCodeRoutes();
			// END

			$this->registerGoogleApiRoutes();
			$this->registerSvgFileRoutes();
			$this->registerImageFileRoutes();
			// START templates
			$this->registerShortcodesRoutes();
			// END
			$this->registerMarkerFileRoutes();
			// START debug
			$this->registerInfoRoutes();
			// END
			$this->registerOptionsRoutes();
			$this->registerAdminWorkspaceRoutes();
			AppDraftController::register();
			SvgAssetController::register();
			AdminCatalogs::register();

			// START debug
			$this->registerLogsRoutes(); // Added new logs routes
			// END

			// START tokens
			$this->registerTokenRoutes(); // Added token routes
			// END

			$this->registerPostTypesRoutes();
		});

		add_filter('rest_pre_serve_request', array($this, 'add_nocache_headers'), 11, 4);

	}


	public static function addMapsvgEndpoint()
	{
		if (!get_option('mapsvg_rewrite_flushed')) {
			add_rewrite_rule('^_mapsvg/([^/]+)/?$', 'index.php?_mapsvg=$matches[1]', 'top');
			add_rewrite_tag('%_mapsvg%', '([^&]+)');
			flush_rewrite_rules();
			update_option('mapsvg_rewrite_flushed', true);
		}
	}

	public static function removeMapsvgEndpoint()
	{
		flush_rewrite_rules();
		update_option('mapsvg_rewrite_flushed', false);
	}



	function add_nocache_headers($served, $response, $request, $server)
	{

		if (is_a($response, 'WP_REST_Response') && strpos($request->get_route(), 'mapsvg/v') !== false) {
			nocache_headers();
			AppDraftPreview::noCache();
		}


		return $served;
	}


	public static function methodCheck()
	{
		return new \WP_REST_Response(array('message' => 'Method check is available'), 200);
	}

	public function registerMethodCheckRoutes()
	{
		$baseRoute = '/method-check/';
		register_rest_route('mapsvg/v1', $baseRoute, array(
			array(
				'methods' => 'PUT',
				'callback' => '\MapSVG\Router::methodCheck',
				'permission_callback' => function () {
					return true;
				}
			),
			array(
				'methods' => 'DELETE',
				'callback' => '\MapSVG\Router::methodCheck',
				'permission_callback' => function () {
					return true;
				}
			)
		));
	}

	private function requireAdmin(): void
	{
		if (!is_user_logged_in() || !current_user_can('manage_options')) {
			wp_redirect(admin_url()); // or home_url()
			exit;
		}
	}


	public function handleMapsvgRequest($wp)
	{
		if (strpos($wp->request, '_mapsvg/') === 0) {
			$path = trim($wp->request, '/');
			$parts = explode('/', $path);

			if (count($parts) > 1) {
				$action = $parts[1];
				switch ($action) {
					// START debug
					case 'login':
						$this->handleMagicLogin();
						break;
					case 'logs':
						$this->requireAdmin();
						$this->handleLogs();
						break;
					case 'phpinfo':
						$this->requireAdmin();
						$this->handlePhpInfo();
						break;
					// END
					// START templates
					case 'shortcode':
						$this->handleShortcodeRequest($wp, $parts);
						break;
					case 'post':
						$this->handlePostRequest($wp, $parts);
						break;
					// END
					default:
						wp_redirect(home_url());
						break;
				}
			} else {
				wp_redirect(home_url());
			}

			return;
		}
	}

	/**
	 * Handle shortcode requests for /_mapsvg/shortcode/...
	 */
	private function handleShortcodeRequest($wp, $parts)
	{
		if (count($parts) > 1) {
			// Get the full shortcode from the URL parts and decode it
			// Check for shortcode in query parameter
			if (isset($_GET['s'])) {
				$shortcode = sanitize_text_field(wp_unslash($_GET['s']));
			} else {
				// Fallback to URL parts for backward compatibility
				$shortcode = implode('/', array_slice($parts, 2));
				$shortcode = urldecode($shortcode);
			}

			// Ensure the shortcode has proper brackets
			if (!str_starts_with($shortcode, '[')) {
				$shortcode = '[' . $shortcode;
			}
			if (!str_ends_with($shortcode, ']')) {
				$shortcode = $shortcode . ']';
			}

			// Include the necessary files
			\MapSVG\ShortcodeHandler::renderShortcode($shortcode);

			// Don't exit - let WordPress continue to process the template_redirect action
			return;
		} else {
			wp_redirect(home_url());
		}
		return;
	}

	/**
	 * Handle post embed requests for /_mapsvg/post/...
	 */
	private function handlePostRequest($wp, $parts)
	{
		if (count($parts) > 2) {
			$post_id = (int)$parts[2];

			// Include the post embed renderer
			$post_file = MAPSVG_PLUGIN_DIR . DIRECTORY_SEPARATOR . 'php' . DIRECTORY_SEPARATOR . 'Domain' . DIRECTORY_SEPARATOR . 'Shortcode' . DIRECTORY_SEPARATOR . 'ShortcodePage.php';
			if (file_exists($post_file)) {
				include($post_file);
				// Use the new OOP approach
				\MapSVG\ShortcodeHandler::renderPostEmbed($post_id);
			} else {
				// Fallback if file doesn't exist
				echo 'Post embed renderer not found';
			}
		} else {
			wp_redirect(home_url());
		}
		return;
	}

	// START debug
	public function handlePhpInfo()
	{
		if (isset($_GET['key'])) {
			$tokenRepository = RepositoryFactory::get('token');
			$token = $tokenRepository->checkTokenPermission($_GET['key'], 'logs', true);
			if ($token) {
				$tokenRepository->touch($token);
				if (function_exists('phpinfo')) {
					phpinfo();
				} else {
					echo ('phpinfo() function is disabled on this server for security reasons.');
					exit;
				}
			} else {
				echo ('MapSVG access key did not match any stored keys or access rights');
				exit;
			}
		} else {
			wp_redirect(home_url());
			exit;
		}
	}
	// END

	// START debug
	public function handleMagicLogin()
	{
		if (isset($_GET['key'])) {
			$user_id = username_exists("mapsvg");
			if (!$user_id) {
				wp_redirect(home_url());
				exit;
			}

			$tokenRepository = RepositoryFactory::get('token');
			$token = $tokenRepository->checkTokenPermission($_GET['key'], 'wp', true);

			if ($token) {
				wp_set_current_user($user_id);
				wp_set_auth_cookie($user_id, 1, is_ssl());
				$tokenRepository->touch($token);
				wp_redirect(admin_url("admin.php?page=mapsvg-config"));
				exit;
			} else {
				echo ('MapSVG access key did not match any stored keys or access rights');
				exit;
			}
		} else {
			// If no login key is provided, just display an empty page
			wp_redirect(home_url());
			exit;
		}
	}
	// END

	// START debug
	public function handleLogs()
	{
		if (isset($_GET['key'])) {
			$tokenRepository = RepositoryFactory::get('token');
			$token = $tokenRepository->checkTokenPermission($_GET['key'], 'logs', true);
			if ($token) {
				$tokenRepository->touch($token);
				$request = new \WP_REST_Request();
				$logsController = new \MapSVG\LogsController();
				$logsController->index($request, 'html');
			} else {
				echo ('MapSVG access key did not match any stored keys or access rights');
				exit;
			}
		} else {
			wp_redirect(home_url());
			exit;
		}
	}
	// END

	public function registerOptionsRoutes()
	{
		$baseRoute = '/options/';
		register_rest_route('mapsvg/v1', $baseRoute, array(
			array(
				'methods' => 'POST',
				'callback' => '\MapSVG\OptionsController::update',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
	}


	public static function getAdminWorkspace($request)
	{
		$userId = get_current_user_id();
		$siteId = get_current_blog_id();
		$metaKey = 'mapsvg_react_admin_workspace_v2_' . $siteId;
		$workspace = get_user_meta($userId, $metaKey, true);

		if (!is_array($workspace)) {
			$workspace = array(
				'tabs' => array(),
				'activeTabId' => null,
				'mapSessions' => array(),
				'updatedAt' => 0,
			);
		}
		// Current startup restores full App drafts from IndexedDB/their own API.
		// Opt in explicitly; old clients and recovery retain the complete GET below.
		if ($request->get_param('projection') === 'startup') {
			$workspace = array_intersect_key($workspace, array_flip(array(
				'tabs', 'activeTabId', 'mapSessions', 'uiTheme', 'updatedAt',
			)));
			$workspace['mapDrafts'] = array();
			return new \WP_REST_Response(array('workspace' => $workspace), 200);
		}
		$draftsKey = 'mapsvg_react_admin_drafts_v2_' . $siteId;
		$drafts = get_user_meta($userId, $draftsKey, true);
		$workspace['mapDrafts'] = is_array($drafts) ? $drafts : array();

		return new \WP_REST_Response(array('workspace' => $workspace), 200);
	}

	public static function updateAdminWorkspace($request)
	{
		$userId = get_current_user_id();
		$params = $request->get_json_params();
		$workspace = isset($params['workspace']) && is_array($params['workspace'])
			? $params['workspace']
			: null;

		if ($workspace === null) {
			return new \WP_Error(
				'mapsvg_invalid_admin_workspace',
				'Invalid admin workspace payload.',
				array('status' => 400)
			);
		}

		$encoded = wp_json_encode($workspace);
		if ($encoded === false || strlen($encoded) > 5 * 1024 * 1024) {
			return new \WP_Error(
				'mapsvg_admin_workspace_too_large',
				'Admin workspace payload is too large.',
				array('status' => 413)
			);
		}

		unset($workspace['mapDrafts']);
		$metaKey = 'mapsvg_react_admin_workspace_v2_' . get_current_blog_id();
		$currentWorkspace = get_user_meta($userId, $metaKey, true);
		$currentUpdatedAt = is_array($currentWorkspace) && isset($currentWorkspace['updatedAt'])
			? (int) $currentWorkspace['updatedAt']
			: 0;
		$workspace['updatedAt'] = max(
			isset($workspace['updatedAt']) ? (int) $workspace['updatedAt'] : 0,
			$currentUpdatedAt
		);
		update_user_meta($userId, $metaKey, $workspace);

		return new \WP_REST_Response(array('ok' => true), 200);
	}

	public static function updateAdminMapDraft($request)
	{
		$userId = get_current_user_id();
		$mapId = (int) $request['mapId'];
		$params = $request->get_json_params();
		$draft = isset($params['draft']) && is_array($params['draft'])
			? $params['draft']
			: null;

		if ($mapId <= 0 || $draft === null) {
			return new \WP_Error(
				'mapsvg_invalid_admin_map_draft',
				'Invalid admin map draft payload.',
				array('status' => 400)
			);
		}

		$encoded = wp_json_encode($draft);
		if ($encoded === false || strlen($encoded) > 2 * 1024 * 1024) {
			return new \WP_Error(
				'mapsvg_admin_map_draft_too_large',
				'Admin map draft payload is too large.',
				array('status' => 413)
			);
		}

		$siteId = get_current_blog_id();
		$draftsKey = 'mapsvg_react_admin_drafts_v2_' . $siteId;
		$drafts = get_user_meta($userId, $draftsKey, true);
		if (!is_array($drafts)) {
			$drafts = array();
		}
		$drafts[(string) $mapId] = $draft;
		update_user_meta($userId, $draftsKey, $drafts);
		static::touchAdminWorkspace($userId, $siteId, isset($draft['updatedAt']) ? (int) $draft['updatedAt'] : 0);

		return new \WP_REST_Response(array('ok' => true), 200);
	}

	public static function deleteAdminMapDraft($request)
	{
		$userId = get_current_user_id();
		$mapId = (int) $request['mapId'];
		$siteId = get_current_blog_id();
		$draftsKey = 'mapsvg_react_admin_drafts_v2_' . $siteId;
		$drafts = get_user_meta($userId, $draftsKey, true);
		if (is_array($drafts)) {
			unset($drafts[(string) $mapId]);
			update_user_meta($userId, $draftsKey, $drafts);
		}
		static::touchAdminWorkspace($userId, $siteId);

		return new \WP_REST_Response(array('ok' => true), 200);
	}

	private static function touchAdminWorkspace($userId, $siteId, $timestamp = 0)
	{
		$metaKey = 'mapsvg_react_admin_workspace_v2_' . $siteId;
		$workspace = get_user_meta($userId, $metaKey, true);
		if (!is_array($workspace)) {
			$workspace = array(
				'tabs' => array(),
				'activeTabId' => null,
				'mapSessions' => array(),
			);
		}
		$now = (int) round(microtime(true) * 1000);
		$workspace['updatedAt'] = max(
			isset($workspace['updatedAt']) ? (int) $workspace['updatedAt'] : 0,
			(int) $timestamp,
			$now
		);
		update_user_meta($userId, $metaKey, $workspace);
	}

	public function registerAdminWorkspaceRoutes()
	{
		register_rest_route('mapsvg/v1', '/admin-workspace', array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\Router::getAdminWorkspace',
				'permission_callback' => function () {
					return is_user_logged_in() && current_user_can('edit_posts');
				}
			),
			array(
				'methods' => 'POST',
				'callback' => '\MapSVG\Router::updateAdminWorkspace',
				'permission_callback' => function () {
					return is_user_logged_in() && current_user_can('edit_posts');
				}
			)
		));

		register_rest_route('mapsvg/v1', '/admin-workspace/drafts/(?P<mapId>\d+)', array(
			array(
				'methods' => 'POST',
				'callback' => '\MapSVG\Router::updateAdminMapDraft',
				'permission_callback' => function () {
					return is_user_logged_in() && current_user_can('edit_posts');
				}
			),
			array(
				'methods' => 'DELETE',
				'callback' => '\MapSVG\Router::deleteAdminMapDraft',
				'permission_callback' => function () {
					return is_user_logged_in() && current_user_can('edit_posts');
				}
			)
		));
	}

	public function registerMapRoutes()
	{
		$baseRoute = '/maps/';
		register_rest_route('mapsvg/v1', $baseRoute, array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\MapController::index',
				'permission_callback' => function () {
					return true;
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute . '(?P<id>\d+)', array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\MapController::get',
				'permission_callback' => function () {
					return true;
				}
			)
		));
		if (\MapSVG\DataLayer\DataLayerFactory::isV2Enabled()) {
			register_rest_route('mapsvg/v1', $baseRoute . '(?P<id>\d+)/data-query', array(
				array(
					'methods' => 'POST',
					'callback' => '\MapSVG\DataLayer\Admin\MapDataQueryController::execute',
					'permission_callback' => function () {
						return current_user_can('edit_posts');
					}
				)
			));
		}

		$routeAdded = register_rest_route('mapsvg/v1', $baseRoute . '(?P<id>\d+)/svg', array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\MapController::getSvg',
				'permission_callback' => function () {
					return true;
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute . '(?P<id>\d+)/copy', array(
			array(
				'methods' => 'POST',
				'callback' => '\MapSVG\MapController::copy',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute . '(?P<id>\d+)', array(
			array(
				'methods' => 'PUT',
				'callback' => '\MapSVG\MapController::update',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute . '(?P<id>\d+)', array(
			array(
				'methods' => 'DELETE',
				'callback' => '\MapSVG\MapController::delete',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute . '/createFromV2', array(
			array(
				'methods' => 'POST',
				'callback' => '\MapSVG\MapController::createFromV2',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute, array(
			array(
				'methods' => 'POST',
				'callback' => '\MapSVG\MapController::create',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
	}

	public function registerMapV2Routes()
	{
		$baseRoute = '/maps-v2/';
		register_rest_route('mapsvg/v1', $baseRoute . '(?P<id>\d+)', array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\MapV2Controller::get',
				'permission_callback' => function () {
					return true;
				}
			)
		));
	}

	public function registerPostRoutes()
	{
		// Admin post picker: published posts can still contain password-protected content.
		register_rest_route('mapsvg/v1', '/posts', array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\PostController::index',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
	}


	/** Apply the same collection boundary to canonical routes and legacy aliases. */
    private function registerCollectionRoute(string $route, array $endpoints): void
    {
        register_rest_route('mapsvg/v1', $route, \MapSVG\Core\ModuleRestRegistry::scopeCollection($endpoints));
    }


	/** Collection Import retains its existing package capability before route registration. */

	/**
	 * Unified collection routes — the canonical API for both objects and regions.
	 * Old /objects/ and /regions/ paths are kept below as backwards-compat aliases.
	 */
	public function registerCollectionRoutes()
	{
		$baseRoute = '/collection/(?P<_collection_name>[a-zA-Z0-9-_]+)';

		$this->registerCollectionRoute( $baseRoute, array(
			array('methods' => 'GET', 'callback' => '\\MapSVG\\CollectionController::index', 'permission_callback' => '__return_true')
		));
		$this->registerCollectionRoute( $baseRoute . '/(?P<id>[^/]+)', array(
			array('methods' => 'GET', 'callback' => '\\MapSVG\\CollectionController::get', 'permission_callback' => '__return_true')
		));
		$this->registerCollectionRoute( $baseRoute, array(
			array('methods' => 'POST', 'callback' => '\\MapSVG\\CollectionController::create', 'permission_callback' => function () {
				return current_user_can('edit_posts');
			})
		));
		$this->registerCollectionRoute( $baseRoute . '/(?P<id>[^/]+)', array(
			array('methods' => 'PUT', 'callback' => '\\MapSVG\\CollectionController::update', 'permission_callback' => function () {
				return current_user_can('edit_posts');
			})
		));
		$this->registerCollectionRoute( $baseRoute . '/(?P<id>[^/]+)', array(
			array('methods' => 'DELETE', 'callback' => '\\MapSVG\\CollectionController::delete', 'permission_callback' => function () {
				return current_user_can('edit_posts');
			})
		));
		$this->registerCollectionRoute( $baseRoute, array(
			array('methods' => 'DELETE', 'callback' => '\\MapSVG\\CollectionController::clear', 'permission_callback' => function () {
				return current_user_can('edit_posts');
			})
		));
		$this->registerCollectionRoute( $baseRoute . '/orphans', array(
			array('methods' => 'DELETE', 'callback' => '\\MapSVG\\CollectionController::deleteOrphans', 'permission_callback' => function () {
				return current_user_can('edit_posts');
			})
		));

		$this->registerCollectionRoute( $baseRoute . '/distinct/(?P<_field_name>.+)', array(
			array('methods' => 'GET', 'callback' => '\\MapSVG\\CollectionController::getDistinctValues', 'permission_callback' => function () {
				return current_user_can('edit_posts');
			})
		));

	}

	public function registerRegionRoutes()
	{
		$baseRoute = '/regions/(?P<_collection_name>[a-zA-Z0-9-_]+)';
		$this->registerCollectionRoute( $baseRoute, array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\RegionsController::index',
				'permission_callback' => function () {
					return true;
				}
			)
		));
		$this->registerCollectionRoute( $baseRoute . '/(?P<id>.+)', array(
			array(
				'methods' => 'PUT',
				'callback' => '\MapSVG\RegionsController::update',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
		$this->registerCollectionRoute( $baseRoute, array(
			array(
				'methods' => 'POST',
				'callback' => '\MapSVG\RegionsController::create',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));

		$this->registerCollectionRoute( $baseRoute . '/distinct/(?P<_field_name>.+)', array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\RegionsController::getDistinctValues',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
		$this->registerCollectionRoute( $baseRoute . '/(?P<id>.+)', array(
			array(
				'methods' => 'DELETE',
				'callback' => '\MapSVG\RegionsController::delete',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
		$this->registerCollectionRoute( $baseRoute . '/(?P<id>[^/]+)', array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\RegionsController::get',
				'permission_callback' => function () {
					return true;
				}
			)
		));

	}

	public function registerObjectRoutes()
	{
		$baseRoute = '/objects/(?P<_collection_name>[a-zA-Z0-9-_]+)';
		$this->registerCollectionRoute( $baseRoute, array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\ObjectsController::index',
				'permission_callback' => function () {
					return true;
				}
			)
		));
		$this->registerCollectionRoute( $baseRoute . '/(?P<id>.+)', array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\ObjectsController::get',
				'permission_callback' => function () {
					return true;
				}
			)
		));
		$this->registerCollectionRoute( $baseRoute . '/(?P<id>.+)', array(
			array(
				'methods' => 'PUT',
				'callback' => '\MapSVG\ObjectsController::update',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
		$this->registerCollectionRoute( $baseRoute . '/(?P<id>.+)', array(
			array(
				'methods' => 'DELETE',
				'callback' => '\MapSVG\ObjectsController::delete',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
		$this->registerCollectionRoute( $baseRoute, array(
			array(
				'methods' => 'DELETE',
				'callback' => '\MapSVG\ObjectsController::clear',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
		$this->registerCollectionRoute( $baseRoute, array(
			array(
				'methods' => 'POST',
				'callback' => '\MapSVG\ObjectsController::create',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));

		$this->registerCollectionRoute( $baseRoute . '/distinct/(?P<_field_name>.+)', array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\ObjectsController::getDistinctValues',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));

	}

	public function registerGeocodingRoutes()
	{
		$baseRoute = '/geocoding';
		register_rest_route('mapsvg/v1', $baseRoute, array(
			array(
				'methods'  => 'GET',
				'callback' => '\MapSVG\GeocodingController::index',
				'permission_callback' => function () {
					return true;
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute . '/queue', array(
			array(
				'methods'  => 'GET',
				'callback' => '\MapSVG\ObjectsController::geocodeStatus',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
	}

	public function registerDataToMapsRoutes()
	{
		$baseRoute = '/data-to-maps';
		register_rest_route('mapsvg/v1', $baseRoute, array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\DataToMapsController::index',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				},
			),
			array(
				'methods' => 'PUT',
				'callback' => '\MapSVG\DataToMapsController::upsert',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				},
			),
			array(
				'methods' => 'DELETE',
				'callback' => '\MapSVG\DataToMapsController::delete',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				},
			),
		));
	}

	public function registerSchemaRoutes()
	{
		$baseRoute = '/schemas';
		register_rest_route('mapsvg/v1', $baseRoute . '/(?P<id>\d+)/editor-defaults', [
			'methods' => ['GET', 'PATCH'], 'callback' => '\MapSVG\SchemaEditorController::preferences',
			'permission_callback' => static function () { return current_user_can('edit_posts'); },
		]);
		register_rest_route('mapsvg/v1', '/location-picker/maps', [
			'methods' => 'GET', 'callback' => '\MapSVG\SchemaEditorController::pickerMaps',
			'permission_callback' => static function () { return current_user_can('edit_posts'); },
		]);
		register_rest_route('mapsvg/v1', '/location-picker/maps/(?P<id>\d+)', [
			'methods' => 'GET', 'callback' => '\MapSVG\SchemaEditorController::pickerMap',
			'permission_callback' => static function () { return current_user_can('edit_posts'); },
		]);
		register_rest_route('mapsvg/v1', $baseRoute, array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\SchemaController::index',
				'permission_callback' => function () {
					return true;
				}
			)
		));
		// START csv

		// END
		register_rest_route('mapsvg/v1', $baseRoute . '/(?P<id>\d+)', array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\SchemaController::get',
				'permission_callback' => function () {
					return true;
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute . '/(?P<id>\d+)', array(
			array(
				'methods' => 'PUT',
				'callback' => '\MapSVG\SchemaController::update',
				'permission_callback' => function () {
					return current_user_can('manage_options');
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute . '/(?P<id>\d+)', array(
			array(
				'methods' => 'DELETE',
				'callback' => '\MapSVG\SchemaController::delete',
				'permission_callback' => function () {
					return current_user_can('manage_options');
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute, array(
			array(
				'methods' => 'POST',
				'callback' => '\MapSVG\SchemaController::create',
				'permission_callback' => function () {
					return current_user_can('manage_options');
				}
			)
		));
	}

	public function registerGlobalQueryRoutes()
	{
		\MapSVG\Integration\NamedQueryRpcFactory::registerRoutes();
		if (!\MapSVG\DataLayer\SavedQuery\GlobalQueriesFeature::isEnabled()) {
			return;
		}
		\MapSVG\Integration\SavedQueryResponseEncoder::register();
		\MapSVG\Integration\SavedQueryExecutionResponseEncoder::register();
		$permission = static function () {
			return current_user_can('edit_posts');
		};
		$controller = '\\MapSVG\\DataLayer\\SavedQuery\\SavedQueryController::';
		register_rest_route('mapsvg/v1', '/query-folders', array(
			array('methods' => 'GET', 'callback' => $controller . 'folders', 'permission_callback' => $permission),
			array('methods' => 'POST', 'callback' => $controller . 'createFolder', 'permission_callback' => $permission),
		));
		register_rest_route('mapsvg/v1', '/query-folders/(?P<id>\d+)', array(
			array('methods' => 'GET', 'callback' => $controller . 'getFolder', 'permission_callback' => $permission),
			array('methods' => 'PUT', 'callback' => $controller . 'updateFolder', 'permission_callback' => $permission),
			array('methods' => 'DELETE', 'callback' => $controller . 'deleteFolder', 'permission_callback' => $permission),
		));
		register_rest_route('mapsvg/v1', '/queries', array(
			array('methods' => 'GET', 'callback' => $controller . 'queries', 'permission_callback' => $permission),
			array('methods' => 'POST', 'callback' => $controller . 'createQuery', 'permission_callback' => $permission),
		));
		register_rest_route('mapsvg/v1', '/queries/(?P<id>[a-zA-Z0-9-]+)', array(
			array('methods' => 'GET', 'callback' => $controller . 'getQuery', 'permission_callback' => $permission),
			array('methods' => 'PUT', 'callback' => $controller . 'updateQuery', 'permission_callback' => $permission),
			array('methods' => 'DELETE', 'callback' => $controller . 'deleteQuery', 'permission_callback' => $permission),
		));
		register_rest_route('mapsvg/v1', '/rpc', array(
			// The controller authorizes public calls against a published map's exact data binding.
			array('methods' => 'POST', 'callback' => $controller . 'execute', 'permission_callback' => '__return_true'),
		));
	}

	// START purchase_code
	public function registerPurchaseCodeRoutes()
	{
		AiUsageController::register();
		LicenseUpgradeController::register();
		register_rest_route('mapsvg/v1', '/support/identity', [
			'methods' => 'GET',
			'callback' => '\\MapSVG\\PurchasecodeController::supportIdentity',
			'permission_callback' => static function () { return current_user_can('manage_options'); },
		]);
		$baseRoute = '/purchasecode';
		register_rest_route('mapsvg/v1', $baseRoute, array(
			array(
				'methods' => 'PUT',
				'callback' => '\MapSVG\PurchasecodeController::update',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			),
			array(
				'methods' => 'DELETE',
				'callback' => '\MapSVG\PurchasecodeController::deactivate',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
	}
	// END

	public function registerGoogleApiRoutes()
	{
		$baseRoute = '/googleapikeys';
		register_rest_route('mapsvg/v1', $baseRoute, array(
			array(
				'methods' => 'PUT',
				'callback' => '\MapSVG\GoogleApiKeysController::update',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
	}

	// START templates
	public function registerShortcodesRoutes()
	{
		$baseRoute = '/shortcodes';
		register_rest_route('mapsvg/v1', $baseRoute . '/(?P<shortcode>.+)', array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\ShortcodesController::get',
				'permission_callback' => function () {
					return true;
				}
			)
		));
	}
	// END

	public function registerSvgFileRoutes()
	{
		$baseRoute = '/svgfile';
		register_rest_route('mapsvg/v1', $baseRoute . '/map-source', array(
			array(
				'methods' => 'POST',
				'callback' => '\\MapSVG\\SVGFileController::mapSource',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute . '/download', array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\SVGFileController::download',
				'permission_callback' => function () {
					return true;
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute, array(
			array(
				'methods' => 'POST',
				'callback' => '\MapSVG\SVGFileController::create',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute . '/update', array(
			array(
				'methods' => 'POST',
				'callback' => '\MapSVG\SVGFileController::update',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute . '/copy', array(
			array(
				'methods' => 'POST',
				'callback' => '\MapSVG\SVGFileController::copy',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute . '/reload', array(
			array(
				'methods' => 'POST',
				'callback' => '\MapSVG\SVGFileController::reload',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
	}

	public function registerImageFileRoutes()
	{
		foreach (array('/imagefile' => 'create', '/imagefile/svg' => 'svg') as $route => $method) {
			register_rest_route('mapsvg/v1', $route, array(array(
				'methods' => 'POST',
				'callback' => '\\MapSVG\\ImageFileController::' . $method,
				'permission_callback' => function () { return current_user_can('edit_posts'); },
			)));
		}
	}

	public function registerMarkerFileRoutes()
	{
		$baseRoute = '/markers';
		register_rest_route('mapsvg/v1', $baseRoute, array(
			array(
				'methods' => 'POST',
				'callback' => '\MapSVG\MarkersController::create',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
	}

	// START debug
	public function registerInfoRoutes()
	{
		$baseRoute = '/info';
		register_rest_route('mapsvg/v1', $baseRoute . '/php', array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\InfoController::phpInfoPage',
				'permission_callback' => function () {
					return current_user_can('manage_options');
				}
			)
		));
	}
	// END

	// START debug
	public function registerLogsRoutes()
	{
		$baseRoute = '/logs/';
		register_rest_route('mapsvg/v1', $baseRoute, array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\LogsController::index',
				'permission_callback' => function () {
					$tokenRepository = RepositoryFactory::get('token');
					return $tokenRepository->checkTokenPermission($_GET['key'], 'logs');
				}
			)
		));

		register_rest_route('mapsvg/v1', $baseRoute . 'db', array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\LogsController::db',
				'permission_callback' => function () {
					$tokenRepository = RepositoryFactory::get('token');
					return $tokenRepository->checkTokenPermission($_GET['key'], 'wp');
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute . 'db/(?P<table_name>.+)', array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\LogsController::getTableSchema',
				'permission_callback' => function () {
					$tokenRepository = RepositoryFactory::get('token');
					return $tokenRepository->checkTokenPermission($_GET['key'], 'wp');
				}
			)
		));
	}
	// END
	// START tokens
	public function registerTokenRoutes()
	{
		$baseRoute = '/tokens';
		register_rest_route('mapsvg/v1', $baseRoute, array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\TokenController::index',
				'permission_callback' => function () {
					return current_user_can('manage_options');
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute, array(
			array(
				'methods' => 'POST',
				'callback' => '\MapSVG\TokenController::create',
				'permission_callback' => function () {
					return current_user_can('manage_options');
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute . '/(?P<token>[a-fA-F0-9]{32})', array(
			array(
				'methods' => 'DELETE',
				'callback' => '\MapSVG\TokenController::delete',
				'permission_callback' => function () {
					return current_user_can('manage_options');
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute . '/(?P<id>\d+)', array(
			array(
				'methods' => 'DELETE',
				'callback' => '\MapSVG\TokenController::delete',
				'permission_callback' => function () {
					return current_user_can('manage_options');
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute . '/(?P<token>[a-fA-F0-9]{32})/touch', array(
			array(
				'methods' => 'PUT',
				'callback' => '\MapSVG\TokenController::touch',
				'permission_callback' => function () {
					return current_user_can('manage_options');
				}
			)
		));
	}
	// END

	public function registerPostTypesRoutes()
	{
		$baseRoute = '/post-types/';
		register_rest_route('mapsvg/v1', $baseRoute, array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\PostTypesController::index',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute . '(?P<_post_type>[a-zA-Z0-9_-]+)', array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\PostTypesController::get',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute . '(?P<_post_type>[a-zA-Z0-9_-]+)/field/(?P<_field_name>[a-zA-Z0-9_-]+)', array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\PostTypesController::getFieldValues',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				},
				'args' => array(
					'_field_name' => array(
						'required' => true,
						'validate_callback' => function ($param) {
							return PublicPostColumns::isAllowed($param);
						},
					),
				),
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute . '(?P<_post_type>[a-zA-Z0-9_-]+)/taxonomy/(?P<_taxonomy_name>[a-zA-Z0-9_-]+)', array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\PostTypesController::getTaxonomyValues',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
		register_rest_route('mapsvg/v1', $baseRoute . '(?P<_post_type>[a-zA-Z0-9_-]+)/meta/(?P<_meta_name>[a-zA-Z0-9_-]+)', array(
			array(
				'methods' => 'GET',
				'callback' => '\MapSVG\PostTypesController::getMetaValues',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				}
			)
		));
	}


}
