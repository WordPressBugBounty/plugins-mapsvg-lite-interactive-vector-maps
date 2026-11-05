<?php

namespace MapSVG;

/**
 * Map Controller Class
 * @package MapSVG
 */
class MapController extends Controller
{

	/**
	 * Returns all maps
	 * @param \WP_REST_Request $request
	 *
	 * @return \WP_REST_Response
	 * @throws \Exception
	 */
	public static function index($request)
	{
		/**
		 * @var MapsRepository
		 */
		$mapsRepository = RepositoryFactory::get("map");
		$query = new Query($request->get_params());
		$maps = $mapsRepository->find($query);

		return self::render($maps);
	}

	/**
	 * Returns a map by ID
	 * @param \WP_REST_Request $request
	 *
	 * @return \WP_REST_Response
	 * @throws \Exception
	 */
	public static function get($request)
	{
		/**
		 * @var MapsRepository
		 */
		$mapsRepository = RepositoryFactory::get("map");
		$response   = array();
		$map = $mapsRepository->findById($request['id']);
		try {
			if (!AppPublishedVersion::applyRequested($map, $request)) AppDraftPreview::apply($map, $request);
		} catch (\Throwable $error) {
			return self::render(['error' => 'Published version not available.'], $error instanceof \InvalidArgumentException ? 400 : 404);
		}

		if ($map && is_array($map->options) && AppEngine::version($map->options) === 8 && isset($map->options['source'])) {
            $options = $map->options; $options['source'] = LegacyV8::source($options['source']); $map->setOptions($options);
        }
		$response['map'] = $map;
		$response['globalQueriesEnabled'] = \MapSVG\DataLayer\SavedQuery\GlobalQueriesFeature::isEnabled();

		if (!$map) {
			return self::render($response, 404);
		}

		if (!empty($map->optionsBroken) || !is_array($map->options)) {
			$response['regions'] = ["items" => [], "hasMore" => false];
			$response['objects'] = ["items" => [], "hasMore" => false];
			return self::render($response, 200);
		}

		try {

		$withData = isset($request["withData"]) ? explode(",", $request["withData"]) : false;
		$loadRegions = $withData && in_array("regions", $withData);
		$loadObjects = $withData && in_array("objects", $withData);

		// Query-bound row responses carry their own schema; bootstrap has no Collection authority.
		if (AppEngine::version($map->options) !== 8 && \MapSVG\DataLayer\SavedQuery\GlobalQueriesFeature::isEnabled()) {
			$response['pageBindings'] = true;
			foreach (['objects', 'regions'] as $role) {
				$response[$role] = ['items' => [], 'hasMore' => false];
				$binding = \MapSVG\DataLayer\SavedQuery\PageBindingQuery::binding($map->options, $role, \MapSVG\DataLayer\SavedQuery\PageBindingSource::defaultPageId($map->options));
				// Unconverted external v8 providers retain their original browser transport.
				if (in_array($binding['queryId'], ['getObjects', 'getRegions'], true)) {
					$legacy = $map->getLegacyBindingRepository($role);
					if ($legacy && !$legacy->getSchema()->isLocal()) $response[$role]['schema'] = $legacy->getSchema();
				}
			}
			return self::render($response, 200);
		}
		$regionsRepo = $map->getRegions();
		$objectsRepo = $map->getObjects();

		/**
		 * Get regions & schema
		 */
		if ($regionsRepo && $loadRegions) {
			$sortBy  = (isset($map->options['menu']) && $map->options['menu']['source'] == 'regions' ? (isset($map->options['menu']['sortBy']) ?  $map->options['menu']['sortBy'] : 'id') : (isset($map->options['menu']) && strpos($map->options['source'], 'geo-cal') !== false ? 'title' : 'id'));
			$sortDir = isset($map->options['menu']) &&  $map->options['menu']['source'] == 'regions' ? (isset($map->options['menu']['sortDirection']) ?  $map->options['menu']['sortDirection'] : 'desc') : 'asc';
			$sort = [["field" => $sortBy, "order" => $sortDir]];

			$regionsQuery = array(
				'perpage' => 0,
				'sortBy'  => (isset($map->options['menu']) && $map->options['menu']['source'] == 'regions' ? (isset($map->options['menu']['sortBy']) ?  $map->options['menu']['sortBy'] : 'id') : (isset($options['menu']) && strpos($map->options['source'], 'geo-cal') !== false ? 'title' : 'id')),
				"sort" => $sort,
				'filters' => array(),
			);
			if (isset($map->options['menu']) && isset($map->options['menu']['filterout']) && $map->options['menu']['source'] == 'regions' && !empty($map->options['menu']['filterout']['field'])) {
				$regionsQuery['filterout'][$map->options['menu']['filterout']['field']] = $map->options['menu']['filterout']['val'];
			}
			// Admin editor passes includeOrphans=1 so orphaned rows stay visible for manual data migration.
			// Front-end omits it → RegionsRepository excludes orphaned=1 by default.
			if (!empty($request['includeOrphans'])) {
				$regionsQuery['filters']['includeOrphans'] = 1;
			}

			if ($regionsRepo) {
				$boundId = AppEngine::version($map->options) !== 8 && \MapSVG\DataLayer\SavedQuery\GlobalQueriesFeature::isEnabled()
					? \MapSVG\DataLayer\SavedQuery\SavedQueryExecutionService::boundQueryId($map, 'regions') : null;
				$runtime = array('filterout' => $regionsQuery['filterout'] ?? array());
				if (!empty($request['includeOrphans'])) $runtime['filters'] = array('includeOrphans' => 1);
				$response['regions'] = $boundId
					? self::prefetchBoundQuery($map, 'regions', $boundId, 5000, $runtime)
					: $regionsRepo->find(new Query($regionsQuery));
				$response['regions']["schema"] = $regionsRepo->getSchema();
			} else {
				$response['regions'] = ["items" => [], "hasMore" => false];
			}
		} else {
			$response['regions'] = ["items" => [], "hasMore" => false];
			if ($regionsRepo) {
				$response['regions']["schema"] = $regionsRepo->getSchema();
			}
		}


		/**
		 * Get objects & schema
		 */
		if ($objectsRepo && $loadObjects) {

			$dataType = $objectsRepo->getSchema()->type;
			if ($dataType === 'api' && AppEngine::version($map->options) !== 8 && \MapSVG\DataLayer\SavedQuery\GlobalQueriesFeature::isEnabled()
				&& \MapSVG\DataLayer\SavedQuery\SavedQueryExecutionService::boundQueryId($map, 'objects')) {
				return self::render(array('error' => 'Global queries require a local collection.'), 409);
			}
			$sortBy  = (isset($map->options['menu']) && $map->options['menu']['source'] == 'database' ? (isset($map->options['menu']['sortBy']) ?  $map->options['menu']['sortBy'] : 'id') : (isset($map->options['menu']) && strpos($map->options['source'], 'geo-cal') !== false ? 'title' : 'id'));
			$sortDir = isset($map->options['menu']) &&  $map->options['menu']['source'] == 'database' ? (isset($map->options['menu']['sortDirection']) ?  $map->options['menu']['sortDirection'] : 'desc') : 'asc';
			$sort = [["field" => $sortBy, "order" => $sortDir]];

			$objectsQuery = array(
				'perpage' => isset($map->options['database']) && isset($map->options['database']['pagination']) && (int)$map->options['database']['pagination']['on'] ? $map->options['database']['pagination']['perpage'] : 0,
				"sort" => $sort
			);
			if (isset($map->options['menu']) && isset($map->options['menu']['filterout']) && $map->options['menu']['source'] == 'database' && !empty($map->options['menu']['filterout']['field'])) {
				$objectsQuery['filterout'][$map->options['menu']['filterout']['field']] = $map->options['menu']['filterout']['val'];
			}


			if ($objectsRepo) {
				// For API need to request from front-end to be able to use request middleware
				if ($dataType !== "api") {
					// Need to keep "objects" generic name here! Because on map load we don't know schema name yet						
					$boundId = AppEngine::version($map->options) !== 8 && \MapSVG\DataLayer\SavedQuery\GlobalQueriesFeature::isEnabled()
						? \MapSVG\DataLayer\SavedQuery\SavedQueryExecutionService::boundQueryId($map, 'objects') : null;
					$perpage = (int) ($objectsQuery['perpage'] ?? 0);
					$response['objects'] = $boundId
						? self::prefetchBoundQuery($map, 'objects', $boundId, $perpage > 0 ? min($perpage, 5000) : 5000, array('filterout' => $objectsQuery['filterout'] ?? array()))
						: $objectsRepo->find(new Query($objectsQuery));
				} else {
					$response['objects'] = [];
				}

				$response['objects']["schema"] = $objectsRepo->getSchema();
			} else {
				$response['objects'] = ["items" => [], "hasMore" => false];
			}
		} else {
			$response['objects'] = ["items" => [], "hasMore" => false];
			// if ($objectsRepo) {
			// 	$response['objects']["schema"] = $objectsRepo->getSchema();
			// }
		}



		return self::render($response, 200);
		} catch (\MapSVG\DataLayer\Query\AdvancedQueryRequired $error) {
			return self::render(array('error' => $error->getMessage(), 'reasons' => $error->reasons()), 422);
		} catch (\OutOfBoundsException | \DomainException | \UnexpectedValueException | \InvalidArgumentException | \LengthException $error) {
			return self::render(array('error' => 'Map data binding could not be loaded: ' . $error->getMessage()), 409);
		}
	}

	private static function prefetchBoundQuery($map, string $role, string $queryId, int $take, array $runtime = array()): array
	{
		$result = (new \MapSVG\DataLayer\SavedQuery\SavedQueryExecutionService())->executeBound(
			$map,
			$role,
			$queryId,
			array('skip' => 0, 'take' => $take),
			$runtime
		);
		return array(
			'items' => $result['rows'],
			'hasMore' => $result['count'] > count($result['rows']),
			'page' => 1,
			'perpage' => $take,
		);
	}

	/**
	 * Returns a map by ID
	 * @param \WP_REST_Request $request
	 *
	 * @return \WP_REST_Response
	 * @throws \Exception
	 */
	public static function getSvg($request)
	{
		$mapsRepository = RepositoryFactory::get("map");
		$map = $mapsRepository->findById($request['id']);
		try {
			if (!AppPublishedVersion::applyRequested($map, $request)) AppDraftPreview::apply($map, $request);
		} catch (\Throwable $error) {
			return self::render(['error' => 'Published version not available.'], $error instanceof \InvalidArgumentException ? 400 : 404);
		}
		$svgFile = new SVGFile(["relativeUrl" => $map->options['source']]);

		$etag = $map->svgFileLastChanged;
		$last_modified = gmdate('D, d M Y H:i:s', $map->svgFileLastChanged) . ' GMT';

		// Get headers sent by the client - properly sanitized
		$if_modified_since = isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_IF_MODIFIED_SINCE'])) : false;
		$if_none_match = isset($_SERVER['HTTP_IF_NONE_MATCH']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_IF_NONE_MATCH'])) : false;

		// Check if the file has been modified
		if (($if_none_match && $if_none_match == $etag) || ($if_modified_since && $if_modified_since == $last_modified)) {
			// File has not been modified
			header('HTTP/1.1 304 Not Modified');
			exit;
		}

		// Use WordPress Filesystem API
		require_once(ABSPATH . 'wp-admin/includes/file.php');
		WP_Filesystem();
		global $wp_filesystem;

		// Output file contents
		if ($wp_filesystem->exists($svgFile->serverPath)) {
			// This raw SVG response exits before the REST server's normal CORS writer.
			rest_send_cors_headers(false);
			header('Content-Type: image/svg+xml');
			clearstatcache(true, $svgFile->serverPath);
			header('Content-Length: ' . $wp_filesystem->size($svgFile->serverPath));
			$maxAge = 30 * 24 * 60 * 60; // 1 month
			header('Cache-Control: public, max-age=' . $maxAge);
			header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $maxAge) . ' GMT');
			header('Last-Modified: ' . $last_modified);

			// Use WordPress Filesystem to read and output file
			echo $wp_filesystem->get_contents($svgFile->serverPath); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		} else {
			Logger::error("[SERVER-004] SVG file not found: " . $svgFile->serverPath . " — Read more: https://mapsvg.com/docs/errors#SERVER-004");
			return new \WP_Error('file_open_error', 'Unable to open SVG file', array('status' => 404));
		}

		exit;
	}

	/**
	 * Validates the map data to prevent file traversal and other issues.
	 * @param array $map
	 * @throws \Exception if validation fails
	 */
	private static function validate(array $map)
	{
		$svgPaths = [];
		if (isset($map['options']['source']) && $map['options']['source'] !== '') {
			$svgPaths[] = $map['options']['source'];
		}
		if (isset($map['svgFilePath']) && $map['svgFilePath'] !== '') {
			$svgPaths[] = $map['svgFilePath'];
		}
		foreach ($svgPaths as $svgPath) {
			if (strpos($svgPath, '../') !== false || strpos($svgPath, '..\\') !== false) {
				throw new \Exception("Invalid SVG file path: path traversal detected.", 400);
			}
		}
		// Add more validation checks here as needed
	}

	/** Decode the REST options format, including the client mod_sec placeholders. */
	private static function decodeOptionsForWrite($options): array
	{
		if (is_string($options)) {
			$options = str_replace(
				['!mapsvg-encoded-slct', '!mapsvg-encoded-tbl', '!mapsvg-encoded-db', '!mapsvg-encoded-vc', '!mapsvg-encoded-int'],
				['select', 'table', 'database', 'varchar', 'int(11)'],
				$options
			);
			$options = json_decode($options, true);
		}
		if (!is_array($options)) {
			throw new \Exception('Invalid map options.', 400);
		}
		return $options;
	}

	/**
	 * Creates a new map
	 *
	 * @param \WP_REST_Request $request
	 *
	 * @return \WP_REST_Response
	 * @throws \Exception
	 */
	public static function create($request, string $creationContext = NewMapDefaults::MANUAL)
	{
		$map = $request['map'];
		/**
		 * @var MapsRepository
		 */
		$mapsRepository = RepositoryFactory::get("map");

		// Validate map data
		try {
			$map['options'] = Map::prepareOptionsForWrite(NewMapDefaults::apply(self::decodeOptionsForWrite($map['options']), $creationContext));
			self::validate($map);
		} catch (\Exception $e) {
			return self::render(["error" => $e->getMessage()], $e->getCode() ?: 400);
		}

		if (!array_key_exists('filtersSchema', $map['options'])) {
			$map["options"]["filtersSchema"] =
				[
					// START filters
					["type" => "select", "db_type" => "varchar(255)", "label" => "Category", "name" => "category", "searchable" => "", "multiselect" => "", "optionsGrouped" => "", "options" => [["label" => "First", "value" => "1"], ["label" => "Second", "value" => "2"], ["label" => "Third", "value" => "3"]], "optionsDict" => ["1" => "First", "2" => "Second", "3" => "Third"], "parameterName" => "Object.category", "parameterNameShort" => "category", "placeholder" => "Choose category", "visible" => true],
					// END
					// START distance_search
					["type" => "distance", "db_type" => "varchar(255)", "label" => "Search by address", "name" => "distance", "value" => "", "searchable" => "", "options" => [["value" => "10", "default" => true, "selected" => true], ["value" => "30", "default" => false], ["value" => "50", "default" => false], ["value" => "100", "default" => false]], "optionsDict" => [], "distanceControl" => "select", "distanceUnits" => "km", "distanceUnitsLabel" => "km", "fromLabel" => "from", "addressField" => true, "addressFieldPlaceholder" => "Address", "userLocationButton" => "", "placeholder" => "Address", "language" => "", "country" => "", "searchByZip" => "", "zipLength" => 5, "parameterName" => "Object.distance", "parameterNameShort" => "distance", "visible" => true]
					// END
				];
		}

// Create map and its two private schemas as one recoverable application-level operation.
		$createdMap = null;
		$createdSource = null;
		$createdQueryIds = [];
		$createdQueryFolderIds = [];
		$regionsTableName = null;
		$objectsTableName = null;
		$regionsSchemaPreexisting = false;
		$objectsSchemaPreexisting = false;

		try {
			$map['options'][AppEngine::KEY] = 9;
			$preparedSource = MapCreationSourceOptions::prepare($map['options']);
			$createdSource = $preparedSource['createdFile'];
			$map['options'] = $preparedSource['options'];
			$map['options'] = (new SvgAssetRegistry())->pinOptions($map['options']);
			$createdMap = $mapsRepository->create([
				'options' => $map['options'],
				'version' => MAPSVG_VERSION
			]);

			// Define schemas and update model in DB.
			if (!isset($createdMap->options['database'])
				|| !isset($createdMap->options['database']['schemas'])) {
				if (!isset($createdMap->options['database'])) {
					$createdMap->options['database'] = [];
				}
				if (!isset($createdMap->options['database']['schemas'])) {
					$createdMap->options['database']['schemas'] = [];
				}

				$regionsTableName = 'regions_' . $createdMap->id;
				$objectsTableName = 'objects_' . $createdMap->id;

				$createdMap->options['database']['schemas'] = [
					'regions' => [
						'objectNameSingular' => 'region',
						'objectNamePlural' => 'regions',
						'name' => $regionsTableName,
						'type' => 'region',
						'bindings' => Schema::defaultSvgBindings(),
						'apiEndpoints' => [
							['url' => 'regions/' . $regionsTableName, 'method' => 'GET', 'name' => 'index'],
							['url' => 'regions/' . $regionsTableName . '/[:id]', 'method' => 'GET', 'name' => 'show'],
							['url' => 'regions/' . $regionsTableName, 'method' => 'POST', 'name' => 'create'],
							['url' => 'regions/' . $regionsTableName . '/[:id]', 'method' => 'PUT', 'name' => 'update'],
							['url' => 'regions/' . $regionsTableName . '/[:id]', 'method' => 'DELETE', 'name' => 'delete'],
							['url' => 'regions/' . $regionsTableName, 'method' => 'DELETE', 'name' => 'clear'],
						],
					],
					'objects' => [
						'objectNameSingular' => 'object',
						'objectNamePlural' => 'objects',
						'name' => $objectsTableName,
						'type' => 'object',
						'apiEndpoints' => [
							['url' => 'objects/' . $objectsTableName, 'method' => 'GET', 'name' => 'index'],
							['url' => 'objects/' . $objectsTableName . '/[:id]', 'method' => 'GET', 'name' => 'show'],
							['url' => 'objects/' . $objectsTableName, 'method' => 'POST', 'name' => 'create'],
							['url' => 'objects/' . $objectsTableName . '/[:id]', 'method' => 'PUT', 'name' => 'update'],
							['url' => 'objects/' . $objectsTableName . '/[:id]', 'method' => 'DELETE', 'name' => 'delete'],
							['url' => 'objects/' . $objectsTableName, 'method' => 'DELETE', 'name' => 'clear'],
						],
					],
				];
			} else {
				$regionsTableName = isset($createdMap->options['database']['schemas']['regions']['name'])
					? (string) $createdMap->options['database']['schemas']['regions']['name']
					: null;
				$objectsTableName = isset($createdMap->options['database']['schemas']['objects']['name'])
					? (string) $createdMap->options['database']['schemas']['objects']['name']
					: null;
			}

			if (!$regionsTableName || !$objectsTableName) {
				throw new \RuntimeException('Map schemas are missing from map options.');
			}

			/** @var SchemaRepository $schemaRepo */
			$schemaRepo = RepositoryFactory::get('schema');
			$regionsSchemaPreexisting = $schemaRepo->findByName($regionsTableName) !== null;
			$objectsSchemaPreexisting = $schemaRepo->findByName($objectsTableName) !== null;

			$mapsRepository->update($createdMap);

			// Create repos.
			$createdMap->regions = RepositoryFactory::create($regionsTableName);
			$createdMap->objects = RepositoryFactory::create($objectsTableName);
			(new SchemaEditorDefaults())->seed($objectsTableName, $regionsTableName, (int) $createdMap->id);

			// Load regions table from the SVG.
			$createdMap->setRegionsTable();
			if (\MapSVG\DataLayer\SavedQuery\GlobalQueriesFeature::isEnabled()) {
				\MapSVG\DataLayer\SavedQuery\PageBindingSource::createDefaults($createdMap, $createdQueryIds, $createdQueryFolderIds);
				$mapsRepository->update($createdMap);
			}
			if (!empty($request['draftOnly'])) {
				(new AppDraftStore())->initializeUnpublished((int) $createdMap->id, get_current_user_id());
			}

			return self::render(['map' => $createdMap], 200);
		} catch (\Throwable $error) {
			if ($createdMap && !empty($createdMap->id)) {
				self::rollbackFailedCreate(
					$mapsRepository,
					$createdMap,
					$regionsTableName,
					$objectsTableName,
					$regionsSchemaPreexisting,
					$objectsSchemaPreexisting,
					$createdQueryIds,
					$createdQueryFolderIds
				);
			}
			// Keep the derivative if failed compensation left a Map row referring to it.
			$removeSource = !$createdMap || empty($createdMap->id);
			if (!$removeSource && $createdSource) {
				try { $removeSource = $mapsRepository->findById((int) $createdMap->id) === null; }
				catch (\Throwable $readError) { $removeSource = false; }
			}
			if ($removeSource) MapCreationSourceOptions::discard($createdSource);

			Logger::error('[MAP-CREATE] ' . $error->getMessage());
			$status = (int) $error->getCode();
			if ($status < 400 || $status > 599) {
				$status = 500;
			}
			return self::render(
				['error' => 'Map creation failed: ' . $error->getMessage()],
				$status
			);
		}

	}

	/**
	 * Best-effort compensation for a failed map create.
	 *
	 * Only schemas that did not exist before this create attempt are removed.
	 * The map row itself was created by this request, so it is hard-deleted.
	 * Remove its Query references before deleting Queries and their source schemas.
	 */
	private static function rollbackFailedCreate(
		$mapsRepository,
		$map,
		?string $regionsTableName,
		?string $objectsTableName,
		bool $regionsSchemaPreexisting,
		bool $objectsSchemaPreexisting,
		array $createdQueryIds,
		array $createdQueryFolderIds
	): void {
		try {
			(new DataToMapsRepository())->deleteByMapId((int) $map->id);
		} catch (\Throwable $connectionError) {
			Logger::error(
				'[MAP-CREATE-ROLLBACK connections map=' . (int) $map->id . '] '
				. $connectionError->getMessage()
			);
		}

		try {
			$mapsRepository->delete((int) $map->id);
		} catch (\Throwable $mapError) {
			Logger::error(
				'[MAP-CREATE-ROLLBACK map=' . (int) $map->id . '] '
				. $mapError->getMessage()
			);
		}

		foreach ($createdQueryIds as $queryId) {
			try { (new \MapSVG\DataLayer\SavedQuery\SavedQueryStore())->deleteQuery($queryId); }
			catch (\Throwable $cleanupError) { Logger::error('[MAP-CREATE] Query compensation failed: ' . $cleanupError->getMessage()); }
		}
		foreach ($createdQueryFolderIds as $folderId) {
			try { (new \MapSVG\DataLayer\SavedQuery\SavedQueryStore())->deleteEmptyFolder($folderId); }
			catch (\Throwable $cleanupError) { Logger::error('[MAP-CREATE] Query folder compensation failed: ' . $cleanupError->getMessage()); }
		}

		try {
			/** @var SchemaRepository $schemaRepo */
			$schemaRepo = RepositoryFactory::get('schema');

			$schemaCleanup = array(
				array(
					'name' => $objectsTableName,
					'preexisting' => $objectsSchemaPreexisting,
					'region' => false,
				),
				array(
					'name' => $regionsTableName,
					'preexisting' => $regionsSchemaPreexisting,
					'region' => true,
				),
			);

			foreach ($schemaCleanup as $item) {
				$name = $item['name'];
				if (!$name || !empty($item['preexisting'])) {
					continue;
				}

				try {
					$schema = $schemaRepo->findByName((string) $name);
					if (!$schema) {
						continue;
					}

					if (!empty($item['region'])) {
						// Region schemas are protected from deletion while SVG-bound.
						// This schema belongs exclusively to the failed create attempt.
						$schema->setType('object');
						// Null at the top level is omitted by partial catalog updates.
						$schema->setBindings(['svg' => null]);
						$schemaRepo->update($schema, true);
					}

					$schemaRepo->delete((int) $schema->id);
				} catch (\Throwable $schemaError) {
					Logger::error(
						'[MAP-CREATE-ROLLBACK schema=' . (string) $name . '] '
						. $schemaError->getMessage()
					);
				}
			}
		} catch (\Throwable $schemaRepoError) {
			Logger::error(
				'[MAP-CREATE-ROLLBACK schemas] '
				. $schemaRepoError->getMessage()
			);
		}
	}

	/**
	 * Creates a new map based on the settings of a v2.4.1 map
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function createFromV2($request)
	{

		/**
		 * @var MapsRepository
		 */
		$mapsRepository = RepositoryFactory::get("map");
		/**
		 * @var SchemaRepository
		 */
		$schemaRepo = RepositoryFactory::get("schema");

		$mapData = $request['map'];

		try {
			$mapData['options'] = Map::prepareOptionsForWrite(self::decodeOptionsForWrite($mapData['options']));
			self::validate($mapData);
		} catch (\Exception $e) {
			return self::render(['error' => $e->getMessage()], $e->getCode() ?: 400);
		}

		$map = $mapsRepository->create([
			'options' => $mapData['options'],
			'version' => MAPSVG_VERSION
		]);

		// 1. Add tooltip/popover fields to regions and objects tables
		$schemaRegions = $map->getRegions()->getSchema();

		$addTooltipToRegions = false;
		$addPopoverToRegions = false;
		$addTooltipToObjects = false;
		$addPopoverToObjects = false;

		$goToLinkRegion = false;
		$goToLinkMarker = false;

		if (isset($mapData['options']['regions'])) {

			// Set disabled status
			$update = false;
			$statusData = array();
			foreach ($mapData['options']['regions'] as $region) {
				if (
					isset($region['href']) ||
					isset($region['disabled']) ||
					(isset($region['tooltip']) && strlen($region['tooltip']) > 0) ||
					(isset($region['popover']) && strlen($region['popover']) > 0)
				) {
					$_data = array(
						'id' => $region['id']
					);

					if (isset($region['href'])) {
						$_data['link'] = $region['href'];
						$goToLinkRegion = true;
					}
					if (isset($region['disabled'])) {
						$_data['status'] = filter_var($region['disabled'], FILTER_VALIDATE_BOOLEAN);
					}
					if (isset($region['tooltip']) && strlen($region['tooltip']) > 0) {
						$addTooltipToRegions = true;
						$_data['tooltip'] = $region['tooltip'];
					}

					if (isset($region['popover']) && strlen($region['popover']) > 0) {
						$addPopoverToRegions = true;
						$_data['popover'] = $region['popover'];
					}
					$updateData[] = $_data;
				}
			}

			if ($addPopoverToRegions) {
				$schemaRegions->addField(array(
					"name"    => "popover",
					"label"   => "Popover",
					"type"    => "textarea",
					"db_type" => "text",
					"visible" => true,
					"html" => true,
					"help" => "Use plain text or HTML"
				));
			}
			if ($addTooltipToRegions) {
				$schemaRegions->addField(array(
					"name"    => "tooltip",
					"label"   => "Tooltip",
					"type"    => "textarea",
					"db_type" => "text",
					"visible" => true,
					"html" => true,
					"help" => "Use plain text or HTML"
				));
			}
			if ($addPopoverToRegions || $addTooltipToRegions) {
				$schemaRepo->update($schemaRegions);
			}

			if (count($updateData) > 0) {
				$map->getRegions()->createOrUpdateAll($updateData);
			}
		}

		if (isset($mapData['options']['markers'])) {
			foreach ($mapData['options']['markers'] as $marker) {
				if (isset($marker['tooltip']) && strlen($marker['tooltip']) > 0) {
					$addTooltipToObjects = true;
				}
				if (isset($marker['popover']) && strlen($marker['popover']) > 0) {
					$addPopoverToObjects = true;
				}
			}

			$schemaObjects = $map->getObjects()->getSchema();

			if ($addPopoverToObjects) {
				$schemaObjects->addField(array(
					"name"    => "popover",
					"label"   => "Popover",
					"type"    => "textarea",
					"db_type" => "text",
					"visible" => true,
					"html" => true,
					"help" => "Use plain text or HTML"
				));
			}
			if ($addTooltipToObjects) {
				$schemaObjects->addField(array(
					"name"    => "tooltip",
					"label"   => "Tooltip",
					"type"    => "textarea",
					"db_type" => "text",
					"visible" => true,
					"html" => true,
					"help" => "Use plain text or HTML"
				));
			}
			if ($addPopoverToObjects || $addTooltipToObjects) {
				$schemaRepo->update($schemaObjects);
			}
		}

		// 2. Add data from map.options.regions to the regions table
		// 3. Convert map.options.markers to objects and insert to the objects table
		if (isset($mapData['options']['markers'])) {
			foreach ($mapData['options']['markers'] as $marker) {
				$object = array(
					'location' => array(
						'img' => $marker['src']
					)
				);
				if (isset($marker['href'])) {
					$object['link'] = $marker['href'];
					$goToLinkMarker = true;
				}
				if (isset($marker['geoCoords'])) {
					$object['location']['geoPoint'] = array("lat" => $marker['geoCoords'][0], "lng" => $marker['geoCoords'][1]);
				}
				if (isset($marker['x']) && isset($marker['y'])) {
					$object['location']['svgPoint'] = array("x" => $marker['x'], "y" => $marker['y']);
				}
				$map->getObjects()->create($object);
			}
		}
		// 4. Move events
		$oldEvents = [
			'afterLoad' => ['afterLoad'],
			'beforeLoad' => ['beforeLoad'],
			'onClick' => ['click.region', 'click.marker'],
			'mouseOver' => ['mouseover.region', 'mouseover.marker'],
			'mouseOut' => ['mouseout.region', 'mouseout.marker']
		];

		$mapData['options']['events'] = array();
		foreach ($oldEvents as $oldEvtName => $newEvents) {
			if (isset($mapData['options'][$oldEvtName])) {
				foreach ($newEvents as $newEventName) {
					$map->options['events'][$newEventName] = $mapData['options'][$oldEvtName];
				}
			}
		}

		// 5. If gauge == ON add the "choropleth" fields to regions
		// TODO Vyacheslav: Проверить работу после апгрейда choropleth механик
		if (isset($mapData['options']['choropleth']) && isset($mapData['options']['choropleth']['on']) && filter_var($mapData['options']['choropleth']['on'], FILTER_VALIDATE_BOOLEAN)) {
			$map->options['choropleth']['sourceField'] = 'stat';
			$schemaRegions->addField(array(
				"name" => "stat",
				"label" => "Stat",
				"type" => "text",
				"db_type" => "varchar(10)",
				"visible" => true
			));
			$schemaRepo->update($schemaRegions);
			foreach ($mapData['options']['regions'] as $region) {
				if (isset($region['gaugeValue'])) {
					$newRegionData = array(
						'id' => $region['id'],
						'stat' => $region['gaugeValue']
					);
					$map->getRegions()->update($newRegionData);
				}
			}
		}

		// 6. Convert menu
		if (isset($map->options['menu']) && isset($map->options['menu']['on']) && filter_var($map->options['menu']['on'], FILTER_VALIDATE_BOOLEAN)) {
			$map->options['menu']['source'] = 'regions';
			$map->options['containers'] = ["leftSidebar" => ["on" => true]];
		} elseif (isset($map->options['menuMarkers']) && isset($map->options['menuMarkers']['on']) && filter_var($map->options['menuMarkers']['on'], FILTER_VALIDATE_BOOLEAN)) {
			$map->options['menuMarkers']['source'] = 'database';
			$map->options['containers'] = ["leftSidebar" => ["on" => true]];
		}

		// 7. Convert templates, set actions
		if (!isset($map->options['tooltips'])) {
			$map->options['tooltips'] = [];
		}
		$map->options['tooltips']['on'] = true;
		$map->options['actions']['region']['click']['showPopover'] = true;
		$map->options['actions']['region']['click']['showDetails'] = false;
		$map->options['actions']['marker']['click']['showPopover'] = true;
		$map->options['actions']['marker']['click']['showDetails'] = false;
		$map->options['actions']['directoryItem']['click']['showPopover'] = true;
		$map->options['actions']['directoryItem']['click']['showDetails'] = false;
		if ($goToLinkMarker) {
			$map->options['actions']['marker']['click']['showPopover'] = false;
			$map->options['actions']['marker']['click']['goToLink'] = true;
		}
		if ($goToLinkRegion) {
			$map->options['actions']['region']['click']['showPopover'] = false;
			$map->options['actions']['region']['click']['goToLink'] = true;
		}
		$map->options['templates']['popoverMarker'] = '{{popover}}';
		$map->options['templates']['popoverRegion'] = '{{popover}}';
		$map->options['templates']['tooltipMarker'] = '{{tooltip}}';
		$map->options['templates']['tooltipRegion'] = '{{tooltip}}';

		$map->options = Map::sanitizeOptionsForWrite($map->options);
		$mapsRepository->update($map);

		return self::render(['map' => $map], 200);;
	}

	/**
	 * Creates a copy of a map
	 * @param \WP_REST_Request $request
	 *
	 * @return \WP_REST_Response
	 * @throws \Exception
	 */
	public static function copy($request)
	{
		$repository = RepositoryFactory::get("map");
		try {
			$newMap = $repository->copy($request['id'], self::decodeOptionsForWrite($request['options']));
		} catch (\Exception $e) {
			return self::render(['error' => $e->getMessage()], $e->getCode() ?: 400);
		}
		return self::render(['map' => $newMap], 200);
	}

	/**
	 * Updates a map
	 * @param \WP_REST_Request $request
	 *
	 * @return \WP_REST_Response
	 * @throws \Exception
	 */
	public static function update($request)
	{
		$mapData = (array)$request['map'];

		$mapsRepository = RepositoryFactory::get("map");
		$map = $mapsRepository->findById($request['id']);
		if (!$map || !$map->id) {
			return self::render(['error' => 'Map not found.'], 404);
		}
		$mapData['id'] = $map->id;

		// Validate and authorize before any write. The URL selects the map.
		try {
			if (isset($mapData['options'])) {
				$mapData['options'] = Map::prepareOptionsForWrite(
					self::decodeOptionsForWrite($mapData['options']),
					is_array($map->options) ? $map->options : []
				);
			}
			self::validate($mapData);
		} catch (\Exception $e) {
			return self::render(["error" => $e->getMessage()], $e->getCode() ?: 400);
		}

		if (AppEngine::version($map->options) === 8 || isset($request['mapsvg_legacy_version'])) {
			try {
				$version = (new AppDraftStore())->saveLegacy((int) $map->id, $mapData, (int) ($request['mapsvg_legacy_version'] ?? 0), get_current_user_id());
				return self::render(['legacyVersion' => $version], 200);
			} catch (\Throwable $error) { return self::render(['error' => $error->getMessage()], $error->getCode() ?: 500); }
		}
		if (isset($mapData['options'])) $mapData['options'][AppEngine::KEY] = AppEngine::version($map->options);
		$map->update($mapData);
		$mapsRepository->update($map);

		return self::render([], 200);
	}

	/**
	 * Updates a map status by ID
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function delete($request)
	{

		$mapsRepository = RepositoryFactory::get("map");
		$map = $mapsRepository->findById($request['id']);
		$map->setStatus(0);
		$mapsRepository->update($map);

		(new DataToMapsRepository())->deleteByMapId((int) $request['id']);

		return self::render([], 200);
	}
}
