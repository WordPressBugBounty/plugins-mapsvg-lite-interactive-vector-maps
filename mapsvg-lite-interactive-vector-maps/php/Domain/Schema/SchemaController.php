<?php

namespace MapSVG;

use MapSVG\DataLayer\Schema\SchemaSqlDefinition;


class SchemaController extends Controller
{
	/**
	 * Returns all schemas
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function index($request)
	{
		$schemaRepository = RepositoryFactory::get("schema");
		$response   = array();
		$query = new Query($request->get_params());
		$response = $schemaRepository->find($query);

		return new \WP_REST_Response($response, 200);
	}

	/**
	 * Returns a schema by its catalog ID.
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function get($request)
	{
		$schemaRepository = RepositoryFactory::get("schema");
		$schema = $schemaRepository->findById((int) $request['id']);
		if (!$schema) {
			return self::render(['error' => 'Schema not found.'], 404);
		}

		return self::render(['schema' => $schema], 200);
	}

	/**
	 * Creates new schema
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function create($request)
	{

		if (!isset($request['schema'])) {
			return new \WP_REST_Response(["data" => ["error" => "Schema is required"]], 400);
		}
		try {
			$data = SchemaSqlDefinition::input(static::formatReceivedData($request['schema']));
		} catch (\InvalidArgumentException $e) {
			return self::render(['error' => $e->getMessage()], 400);
		}
		try { \MapSVG\Core\PostDataFeature::assertSchema($data); }
        catch (\DomainException $error) { return self::render(['error' => $error->getMessage()], 403); }
		$schemaRepository = RepositoryFactory::get("schema");

		$validationError = static::validatePostSupports($data);
		if ($validationError !== null) {
			return new \WP_REST_Response(["data" => ["error" => $validationError]], 400);
		}

		static::normalizePostSupports($data);

		// Sanitize objectNamePlural into a MySQL-safe table name suffix
		$name = static::sanitizeSchemaName($data["objectNamePlural"] ?? '');
		if ($name === null) {
			return new \WP_REST_Response(["data" => ["error" => "Object name plural must yield a valid table name (letters, numbers, underscores)"]], 400);
		}
		$data["name"] = $name;

		$schemaExists = $schemaRepository->findByName($data["name"]);
		if ($schemaExists) {
			return new \WP_REST_Response(["data" => ["error" => "Data source with the name '" . $data["name"] . "' already exists"]], 400);
		}

		if (($data["type"] ?? '') === "post" && !empty($data["postType"])) {
			$existingPostSchema = $schemaRepository->findOne([
				'type' => 'post',
				'postType' => $data['postType'],
			]);
			if ($existingPostSchema !== null) {
				return new \WP_REST_Response([
					"data" => [
						"error" => "A data source for post type '" . $data["postType"] . "' already exists",
					],
				], 400);
			}
		}

		if (SchemaRepository::tableExists($data["name"])) {
			return new \WP_REST_Response(["data" => ["error" => "Database table for '" . $data["name"] . "' already exists"]], 400);
		}

		$response = array();
		try {
			$response['schema'] = $schemaRepository->create($data);
		} catch (\InvalidArgumentException $e) {
			return self::render(['error' => $e->getMessage()], $e->getCode() ?: 400);
		}

		if (($data["type"] ?? '') === "post" && !empty($data["regionSupport"])) {
			$schemaRepository->ensureRegionsField($response['schema']);
		}


		MappablePostTypes::syncOption();


		return self::render($response, 200);
	}

	/**
	 * Sanitize a string for use as a MapSVG table name suffix (after mapsvg prefix).
	 * Allows only [a-z0-9_], collapses underscores, and rejects empty results.
	 *
	 * @param mixed $raw
	 * @return string|null
	 */
	private static function sanitizeSchemaName($raw): ?string
	{
		if (!is_string($raw) || $raw === '') {
			return null;
		}

		$name = strtolower((string) $raw);
		$name = preg_replace('/[\s\-\.]+/', '_', $name);
		$name = preg_replace('/[^a-z0-9_]/', '', $name);
		$name = preg_replace('/_+/', '_', $name);
		$name = trim($name, '_');

		return $name !== '' ? $name : null;
	}

	/**
	 * Updates schema
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function update($request)
	{
		$schemaRepository = RepositoryFactory::get("schema");
		try {
			$data = SchemaSqlDefinition::input(static::formatReceivedData($request['schema']));
		} catch (\InvalidArgumentException $e) {
			return self::render(['error' => $e->getMessage()], 400);
		}

        try {
            \MapSVG\Core\PostDataFeature::assertSchema($data);
            \MapSVG\Core\PostDataFeature::assertSchema($schemaRepository->findById((int) $request['id']));
        } catch (\DomainException $error) { return self::render(['error' => $error->getMessage()], 403); }

		$validationError = static::validatePostSupports($data);
		if ($validationError !== null) {
			return new \WP_REST_Response(["data" => ["error" => $validationError]], 400);
		}

		static::normalizePostSupports($data);

		$data['id'] = (int) $request['id'];
		$current = $schemaRepository->findById($data['id']);
		if (!$current) return self::render(['error' => 'Schema not found.'], 404);

		if (array_key_exists('name', $data)) {
			if ($current && (!is_string($data['name']) || $data['name'] !== $current->getName())) {
				return new \WP_REST_Response(["data" => ["error" => "Collection names are immutable. Create a new Collection and rebind references instead of renaming it."]], 409);
			}
		}
		// The existing update path does not write the immutable name.
		unset($data['name']);

		try {
			$schema = $schemaRepository->update($data);
			if (($schema->type ?? '') === 'post' && !empty($schema->regionSupport)) {
				$schemaRepository->ensureRegionsField($schema);
			}
		} catch (\InvalidArgumentException $e) {
			return self::render(['error' => $e->getMessage()], $e->getCode() ?: 400);
		}

		MappablePostTypes::syncOption();

		return self::render([], 200);
	}

	/**
	 * Deletes a schema, its data table, and clears related Google Sheets cron / post-type options.
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function delete($request)
	{
		$schemaRepository = RepositoryFactory::get("schema");
		$schemaId = (int) $request['id'];
		$schema = $schemaRepository->findById($schemaId);

		if (!$schema) {
			return new \WP_REST_Response(["data" => ["error" => "Schema not found"]], 404);
		}

		if ($schema->hasSvgBinding()) {
			return new \WP_REST_Response(["data" => ["error" => "Region data sources cannot be deleted"]], 403);
		}

		// Reject referenced Collections before clearing cron/sync or installation options.
		try {
			$schemaRepository->delete($schemaId);
		} catch (\DomainException $error) {
			return new \WP_REST_Response(["data" => ["error" => $error->getMessage()]], 409);
		}

		if (!empty($schema->name)) {
			do_action('mapsvg_schema_deleted', $schema);
		}

		(new DataToMapsRepository())->deleteBySchemaId($schemaId);

		MappablePostTypes::syncOption();

		return self::render([], 200);
	}

	/**
	 * Post DS must enable at least one of marker/region support.
	 *
	 * @param array $data
	 * @return string|null Error message or null if valid.
	 */
	private static function validatePostSupports(array $data): ?string
	{
		if (($data['type'] ?? '') !== 'post') {
			return null;
		}

		$marker = !empty($data['markerSupport']);
		$region = !empty($data['regionSupport']);
		if (!$marker && !$region) {
			return 'Enable Marker support and/or Region support for a WP Posts data source.';
		}

		return null;
	}

	/**
	 * @param array $data
	 */
	private static function normalizePostSupports(array &$data): void
	{
		if (($data['type'] ?? '') !== 'post') {
			return;
		}

		if (!array_key_exists('markerSupport', $data)) {
			$data['markerSupport'] = 1;
		} else {
			$data['markerSupport'] = (int) (bool) $data['markerSupport'];
		}

		if (!array_key_exists('regionSupport', $data)) {
			$data['regionSupport'] = 0;
		} else {
			$data['regionSupport'] = (int) (bool) $data['regionSupport'];
		}
	}

	/**
	 * Workaround for Apache mod_sec module that blocks request by special words
	 * such as "select, table, database, varchar".
	 * Those words are replaced by MapSVG with special placeholders on the client side
	 * before sending the data to server. Then those placeholders need to be replaced back with the words.
	 *
	 * @param array $data
	 * @return array
	 */
	public static function formatReceivedData($data)
	{

		if (isset($data)) {
			if (!is_string($data)) {
				$data = wp_json_encode($data, JSON_UNESCAPED_UNICODE);
			}
			$data = str_replace("!mapsvg-encoded-slct", "select",   $data);
			$data = str_replace("!mapsvg-encoded-tbl",  "table",    $data);
			$data = str_replace("!mapsvg-encoded-db",   "database", $data);
			$data = str_replace("!mapsvg-encoded-vc",   "varchar",  $data);
			$data = str_replace("!mapsvg-encoded-int",   "int(11)",  $data);
			$data = json_decode($data, true);
		}
		return $data;
	}
}
