<?php

namespace MapSVG;

use Clockwork\Request\Log;

/**
 * Objects Controller Class
 * @package MapSVG
 */
class ObjectsController extends Controller
{

	public static function create($request)
	{
		$repo = RepositoryFactory::get($request['_collection_name']);
		$response = array();
		if ($request[$repo->schema->objectNameSingular]) {
			$response[$repo->schema->objectNameSingular] = $repo->create($request[$repo->schema->objectNameSingular]);
			return self::render($response, 200);
		} else {
			return self::render(array(), 400);
		}

		return self::render($response, 200);
	}

	public static function get($request)
	{
		$repo = RepositoryFactory::get($request['_collection_name']);
		$response   = array();
		$response[$repo->schema->objectNameSingular] = $repo->findById($request['id']);
		if ($response[$repo->schema->objectNameSingular]) {
			return self::render($response, 200);
		} else {
			return self::render(["message" => "Object not found"], 404);
		}
	}

	public static function index($request)
	{
		$repo = RepositoryFactory::get($request['_collection_name']);
		$response   = array();

		$query = new Query($request->get_params());

		$response = $repo->find($query);

		if ($query->withSchema) {
			$response['schema'] = $repo->getSchema();
		}
		return self::render($response, 200);
	}

	public static function clear($request)
	{
		$repo = RepositoryFactory::get($request['_collection_name']);
		$repo->clear();
		return self::render([], 200);
	}

	public static function update($request)
	{
		$repo = RepositoryFactory::get($request['_collection_name']);
		$name = $repo->schema->objectNameSingular;
		$object = $repo->findById($request[$name]['id']);
		$objectData = $object->getData();
		$object->update($request[$name]);
		$repo->update($object);
		$schema = $repo->getSchema();
		if (strpos($schema->name, "posts_") !== false) {
			$objectData = $object->getData();
			if ($objectData['post']) {
				if ($request[$name]['location']) {
					update_post_meta($objectData['post']->id, "mapsvg_location", wp_json_encode($objectData['location'], JSON_UNESCAPED_UNICODE));
				} else {
					delete_post_meta($objectData['post']->id, "mapsvg_location");
				}
			}
		}
		return self::render([], 200);
	}

	public static function delete($request)
	{

		$repo = RepositoryFactory::get($request['_collection_name']);
		$name = $repo->schema->objectNameSingular;
		$object = $repo->findById($request['id']);
		$schema = $repo->getSchema();
		if (strpos($schema->name, "posts_") !== false) {
			$objectData = $object->getData();
			if ($objectData['post']) {
				if ($request[$name]['location']) {
					update_post_meta($objectData['post']->id, "mapsvg_location", wp_json_encode($objectData['location'], JSON_UNESCAPED_UNICODE));
				} else {
					delete_post_meta($objectData['post']->id, "mapsvg_location");
				}
			}
		}

		$repo->delete($request['id']);
		return self::render([], 200);
	}

	/**
	 * Imports data from a JSON payload (legacy, chunked client-side approach).
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function import($request)
	{

		$repo = RepositoryFactory::get($request['_collection_name']);
		$name = $repo->schema->objectNamePlural;
		$data = json_decode($request[$name], true);
		$convertLatLngToAddress = filter_var($request['convertLatlngToAddress'], FILTER_VALIDATE_BOOLEAN);
		$repo->import($data, $convertLatLngToAddress);

		if (isset($repo->geocodingErrors) && count($repo->geocodingErrors) > 0) {
			$response = [];
			$response["error"] = ["geocodingError" => $repo->geocodingErrors];
			return self::render($response, 400);
		} else {
			return self::render([], 200);
		}
	}

	const CSV_CRON_HOOK = 'mapsvg_csv_process_batch';

	/**
	 * Accepts a raw CSV file upload, initializes a background import job, and
	 * returns a 202 immediately.
	 *
	 * The browser then drives processing by polling importCsvProcess(). WP Cron
	 * is also scheduled as a fallback so the import continues even if the tab is
	 * closed before it finishes.
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function importCsv(\WP_REST_Request $request): \WP_REST_Response
	{
		$files = $request->get_file_params();

		if (empty($files['csv']) || $files['csv']['error'] !== UPLOAD_ERR_OK) {
			$code    = isset($files['csv']['error']) ? (int) $files['csv']['error'] : -1;
			$message = self::uploadErrorMessage($code);
			return self::render(['error' => $message], 400);
		}

		$file = $files['csv'];
		$ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
		if (!in_array($ext, ['csv', 'txt'], true)) {
			return self::render(['error' => 'Only CSV files are allowed.'], 400);
		}

		$csvDir  = MAPSVG_UPLOADS_DIR . DIRECTORY_SEPARATOR . 'csv';
		wp_mkdir_p($csvDir);
		$savedPath = $csvDir . DIRECTORY_SEPARATOR . 'import_' . time() . '_' . wp_unique_filename($csvDir, sanitize_file_name($file['name']));

		if (!move_uploaded_file($file['tmp_name'], $savedPath)) {
			return self::render(['error' => 'Could not save uploaded file.'], 500);
		}

		try {
			$repo                   = RepositoryFactory::get($request['_collection_name']);
			$convertLatlngToAddress = filter_var($request['convertLatlngToAddress'], FILTER_VALIDATE_BOOLEAN);
			$convertAddressToLatlng = filter_var($request['convertAddressToLatlng'], FILTER_VALIDATE_BOOLEAN);
			$paidGeocoding          = filter_var($request['paidGeocoding'], FILTER_VALIDATE_BOOLEAN);
			$regionsTableName       = sanitize_key($request['regionsTableName'] ?? '');

			$locationField = $repo->schema->getFieldByType('location');
			$language      = ($locationField && !empty($locationField->language)) ? $locationField->language : 'en';

			/** @var DbDataSource $source */
			$source   = $repo->source;
			$importer = new CsvImporter($repo->schema, $source);
			$init     = $importer->initialize($savedPath);

			$token = CsvImportJob::create([
				'file'                   => $savedPath,
				'collection'             => $request['_collection_name'],
				'separator'              => $init['separator'],
				'headers'                => $init['headers'],
				'current_offset'         => $init['data_offset'],
				'total'                  => $init['total'],
				'convertLatlngToAddress' => $convertLatlngToAddress,
				'convertAddressToLatlng' => $convertAddressToLatlng,
				'paidGeocoding'          => $paidGeocoding,
				'regionsTableName'       => $regionsTableName,
				'language'               => $language,
			]);
		} catch (\Exception $e) {
			@unlink($savedPath); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			return self::render(['error' => $e->getMessage()], 500);
		}

		// Schedule WP Cron as a fallback for when the browser tab is closed.
		wp_schedule_single_event(time() + 10, self::CSV_CRON_HOOK, [$token]);

		return self::render([
			'token'  => $token,
			'total'  => $init['total'],
			'status' => 'pending',
		], 202);
	}

	/**
	 * Process one chunk of a background CSV import job (called by the browser).
	 * Returns progress so the client can update its UI and call again.
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function importCsvProcess(\WP_REST_Request $request): \WP_REST_Response
	{
		$token = sanitize_text_field($request['token'] ?? '');
		$job   = CsvImportJob::get($token);

		if ($job === null) {
			return self::render(['error' => 'Import job not found. It may have expired.'], 404);
		}

		if (in_array($job['status'], ['complete', 'failed'], true)) {
			return self::render($job, 200);
		}

		$result = self::runBatch($token, $job);

		// Schedule cron as a fallback in case the browser stops polling.
		// Cron will fire after 30s of browser inactivity and finish the import.
		if (!wp_next_scheduled(self::CSV_CRON_HOOK, [$token])) {
			wp_schedule_single_event(time() + 30, self::CSV_CRON_HOOK, [$token]);
		}

		return self::render($result, 200);
	}

	/**
	 * WP Cron handler: processes one chunk then reschedules itself until done.
	 * Fires as a fallback when the browser tab is closed mid-import.
	 */
	public static function importCsvCron(string $token): void
	{
		$job = CsvImportJob::get($token);
		if ($job === null || in_array($job['status'], ['complete', 'failed'], true)) {
			return;
		}

		// Try to acquire the processing lock (60s TTL).
		// If the browser is actively polling, it holds the lock and cron backs off.
		$lockKey = 'mapsvg_csv_lock_' . $token;
		if (get_transient($lockKey)) {
			// Browser is working — reschedule cron to check again later.
			wp_schedule_single_event(time() + 15, self::CSV_CRON_HOOK, [$token]);
			return;
		}
		set_transient($lockKey, 1, 60);

		// Re-read job state inside the lock so we get the latest offset.
		$job    = CsvImportJob::get($token);
		$result = self::runBatch($token, $job);

		delete_transient($lockKey);

		if ($result['status'] !== 'complete' && $result['status'] !== 'failed') {
			// Schedule the next cron batch immediately (fires on next page visit).
			wp_schedule_single_event(time(), self::CSV_CRON_HOOK, [$token]);
		}
	}

	/**
	 * Shared core logic: read next chunk from the CSV file, insert rows, update
	 * job state, and return a status array.
	 *
	 * @param string              $token
	 * @param array<string,mixed> $job
	 * @return array<string,mixed>
	 */
	private static function runBatch(string $token, array $job): array
	{
		try {
			$repo = RepositoryFactory::get($job['collection']);
			/** @var DbDataSource $source */
			$source   = $repo->source;
			$importer = new CsvImporter($repo->schema, $source);

			$chunk = $importer->importChunk(
				$job['file'],
				$job['separator'],
				$job['headers'],
				(int) $job['current_offset'],
				(bool) ($job['convertLatlngToAddress'] ?? false),
				(bool) ($job['convertAddressToLatlng'] ?? false),
				(string) ($job['regionsTableName'] ?? '')
			);
		} catch (\Exception $e) {
			CsvImportJob::update($token, ['status' => 'failed', 'error' => $e->getMessage()]);
			return ['status' => 'failed', 'error' => $e->getMessage()];
		}

		$errorCount     = (int) ($job['error_count'] ?? 0);
		$errors         = CsvImportJob::mergeErrors($job['errors'] ?? [], $chunk['errors'], $errorCount);
		$processed      = (int) $job['processed'] + $chunk['rows_processed'];
		$needsGeocoding = ($job['needs_geocoding'] ?? false) || $chunk['needs_geocoding'];
		$done           = $chunk['eof'];

		if ($done) {
			@unlink($job['file']); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged

			$geocodingQueued = false;
			if ($needsGeocoding) {
				GeocodingQueue::add(
					$job['collection'],
					$job['language'] ?? 'en',
					(bool) ($job['convertLatlngToAddress'] ?? false),
					(bool) ($job['paidGeocoding'] ?? false)
				);
				$geocodingQueued = true;
			}

			$repo->setRelationsForAllObjects();
			CsvImportJob::delete($token);

			return [
				'status'           => 'complete',
				'processed'        => $processed,
				'total'            => $job['total'],
				'geocoding_queued' => $geocodingQueued,
				'errors'           => $errors,
				'error_count'      => $errorCount,
			];
		}

		CsvImportJob::update($token, [
			'status'          => 'processing',
			'current_offset'  => $chunk['next_offset'],
			'processed'       => $processed,
			'needs_geocoding' => $needsGeocoding,
			'errors'          => $errors,
			'error_count'     => $errorCount,
		]);

		return [
			'status'      => 'processing',
			'processed'   => $processed,
			'total'       => $job['total'],
			'errors'      => $errors,
			'error_count' => $errorCount,
		];
	}

	/**
	 * Returns the current geocoding queue status (pending row counts per table).
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function geocodeStatus(\WP_REST_Request $request): \WP_REST_Response
	{
		return self::render(['queue' => GeocodingQueue::getStatus()], 200);
	}

	/**
	 * Translates a PHP file-upload error code into a human-readable message.
	 */
	private static function uploadErrorMessage(int $code): string
	{
		switch ($code) {
			case UPLOAD_ERR_INI_SIZE:
				return sprintf(
					'File is too large. Your server limits: upload_max_filesize = %s, post_max_size = %s. '
					. 'Increase these values in php.ini or ask your hosting provider.',
					ini_get('upload_max_filesize'),
					ini_get('post_max_size')
				);
			case UPLOAD_ERR_FORM_SIZE:
				return 'File exceeds the maximum form upload size.';
			case UPLOAD_ERR_PARTIAL:
				return 'File was only partially uploaded. Please try again.';
			case UPLOAD_ERR_NO_FILE:
				return 'No file was selected for upload.';
			case UPLOAD_ERR_NO_TMP_DIR:
				return 'Server error: missing temporary upload directory. Contact your hosting provider.';
			case UPLOAD_ERR_CANT_WRITE:
				return 'Server error: failed to write the uploaded file to disk. Check directory permissions.';
			case UPLOAD_ERR_EXTENSION:
				return 'A PHP extension blocked the upload. Contact your hosting provider.';
			default:
				return 'Unexpected upload error (code ' . $code . ').';
		}
	}

	public static function getDistinctValues($request)
	{
		$repo = RepositoryFactory::get($request['_collection_name']);
		$distinctValues = $repo->getDistinctValues($request['_field_name']);
		return self::render(["items" => $distinctValues], 200);
	}
}
