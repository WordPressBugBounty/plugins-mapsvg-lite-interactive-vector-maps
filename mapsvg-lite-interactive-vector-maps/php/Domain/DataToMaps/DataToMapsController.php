<?php

namespace MapSVG;

class DataToMapsController extends Controller
{
	/**
	 * GET /data-to-maps?schemaId=
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function index($request)
	{
		$schemaId = (int) $request->get_param('schemaId');
		if ($schemaId <= 0) {
			return self::render(['error' => 'schemaId is required'], 400);
		}

		$repo = new DataToMapsRepository();
		return self::render(['mapIds' => $repo->findMapIdsBySchemaId($schemaId)], 200);
	}

	/**
	 * PUT /data-to-maps  body: { schemaId, mapId }
	 * Sets the map's object data source link (replaces previous rows for this mapId).
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function upsert($request)
	{
		$schemaId = (int) ($request['schemaId'] ?? 0);
		$mapId = (int) ($request['mapId'] ?? 0);

		if ($schemaId <= 0 || $mapId <= 0) {
			return self::render(['error' => 'schemaId and mapId are required'], 400);
		}

		$schemaRepo = RepositoryFactory::get('schema');
		$schema = $schemaRepo->findById($schemaId);
		if (!$schema) {
			return self::render(['error' => 'Schema not found'], 404);
		}

		if (($schema->type ?? '') !== 'post') {
			// Non-post DS: still clear map link rows; no upsert needed for panel map list.
			$repo = new DataToMapsRepository();
			$repo->deleteByMapId($mapId);
			return self::render(['ok' => true, 'linked' => false], 200);
		}

		$repo = new DataToMapsRepository();
		$repo->setMapSchema($mapId, $schemaId);

		return self::render(['ok' => true, 'linked' => true], 200);
	}

	/**
	 * DELETE /data-to-maps?mapId=  or ?schemaId=&mapId=
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function delete($request)
	{
		$schemaId = (int) $request->get_param('schemaId');
		$mapId = (int) $request->get_param('mapId');
		$repo = new DataToMapsRepository();

		if ($schemaId > 0 && $mapId > 0) {
			$repo->deleteBySchemaAndMap($schemaId, $mapId);
		} elseif ($mapId > 0) {
			$repo->deleteByMapId($mapId);
		} elseif ($schemaId > 0) {
			$repo->deleteBySchemaId($schemaId);
		} else {
			return self::render(['error' => 'schemaId and/or mapId required'], 400);
		}

		return self::render(['ok' => true], 200);
	}
}
