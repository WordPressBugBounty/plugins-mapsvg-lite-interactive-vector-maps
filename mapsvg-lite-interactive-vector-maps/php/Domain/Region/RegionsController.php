<?php

namespace MapSVG;

class RegionsController extends Controller
{

	public static function index($request)
	{
		$regionsRepository = RepositoryFactory::get($request['_collection_name']);
		$response   = array();

		$query = new Query($request->get_params());

		$response = $regionsRepository->find($query);

		if ($query->withSchema) {
			$response['schema'] = $regionsRepository->getSchema();
		}
		return self::render($response, 200);
	}

	public static function create($request)
	{

		$regionsRepository = RepositoryFactory::get($request['_collection_name']);
		$response = array();
		$response['region'] = $regionsRepository->create($request['region']);
		return self::render($response, 200);
	}

	public static function get($request)
	{
		$regionsRepository = RepositoryFactory::get($request['_collection_name']);
		$response   = array();
		$response['region'] = $regionsRepository->findById($request['id']);
		if ($response['region']) {
			return self::render($response, 200);
		} else {
			return self::render(["message" => "Region not found"], 404);
		}
	}



	public static function clear($request)
	{
		$regionsRepository = RepositoryFactory::get($request['_collection_name']);
		$regionsRepository->clear();
		return self::render([], 200);
	}

	public static function update($request)
	{
		$regionsRepository = RepositoryFactory::get($request['_collection_name']);
		$regionsRepository->update($request['region']);
		return self::render([], 200);
	}

	public static function delete($request)
	{
		$regionsRepository = RepositoryFactory::get($request['_collection_name']);
		$regionsRepository->delete($request['id']);
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
		$regionsRepository = RepositoryFactory::get($request['_collection_name']);
		$data = json_decode($request['regions'], true);
		$regionsRepository->import($data);
		return self::render([], 200);
	}

	/**
	 * Accepts a raw CSV file upload and streams it server-side.
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
		$tmpPath = $csvDir . DIRECTORY_SEPARATOR . 'import_' . time() . '_' . wp_unique_filename($csvDir, sanitize_file_name($file['name']));

		if (!move_uploaded_file($file['tmp_name'], $tmpPath)) {
			return self::render(['error' => 'Could not save uploaded file.'], 500);
		}

		try {
			$repo = RepositoryFactory::get($request['_collection_name']);
			$result = $repo->importFromCsv($tmpPath, false, 'en');
		} catch (\Exception $e) {
			@unlink($tmpPath); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			return self::render(['error' => $e->getMessage()], 500);
		}

		@unlink($tmpPath); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged

		return self::render(['count' => $result['count']], 200);
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
