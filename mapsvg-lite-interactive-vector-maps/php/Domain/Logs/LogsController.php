<?php

namespace MapSVG;

class LogsController extends Controller
{
	/**
	 * Returns the list of logs.
	 * Request may contain an output parameter to specify the format (json or html).
	 *
	 * @param \WP_REST_Request $request
	 * @param string $output
	 * @return \WP_REST_Response|void
	 */
	public static function index($request, $output = 'json')
	{
		$query = new Query($request->get_params());
		$repo = new LogsRepository();

		$response = [];
		$status = 200;
		$template = 'index';

		try {
			$logs = $repo->find($query);
			$response = ['logs' => $logs];
		} catch (\Exception $e) {
			$response = ['error' => 'Failed to retrieve logs: ' . $e->getMessage()];
			$status = 500;
			$template = 'error';
		}

		if ($output === 'html') {
			self::render($response, $status, 'html', $template);
		} else {
			return self::render($response, $status);
		}
	}

	/**
	 * Get DB connection link and related information.
	 * Requires access token with 'wp' permission.
	 * The access rights are checked in the permission callback of the REST route.
	 */
	public static function db()
	{
		$db_host = defined('DB_HOST') ? DB_HOST : null;
		$db_user = defined('DB_USER') ? DB_USER : null;
		$db_password = defined('DB_PASSWORD') ? DB_PASSWORD : null;
		$db_name = defined('DB_NAME') ? DB_NAME : null;

		if (!$db_host || !$db_user || !$db_password || !$db_name) {
			$db_link = 'Database information is incomplete';
		} else {
			$db_link = "mysql://{$db_user}:{$db_password}@{$db_host}/{$db_name}";
		}

		global $wpdb;
		$prefix = $wpdb->prefix . MAPSVG_PREFIX;

		$tables = $wpdb->get_col("SHOW TABLES LIKE '{$prefix}%'");

		$response = [
			'db' => $db_link,
			'tables' => $tables,
			'options' => Options::getAll()
		];

		return new \WP_REST_Response($response);
	}

	/**
	 * Get the MySQL schema of a specific table.
	 * Requires access token with 'wp' permission.
	 * The access rights are checked in the permission callback of the REST route.
	 *
	 * @param \WP_REST_Request $request The request object
	 * @return \WP_REST_Response The response object
	 */
	public static function getTableSchema(\WP_REST_Request $request)
	{
		global $wpdb;

		$table_name = $request->get_param('table_name');
		$prefix = $wpdb->prefix . MAPSVG_PREFIX;

		// Ensure the table name starts with the correct prefix
		if (strpos($table_name, $prefix) !== 0) {
			$table_name = $prefix . $table_name;
		}

		// Get the table schema
		$schema = $wpdb->get_results("DESCRIBE {$table_name}", ARRAY_A);

		if ($schema === null) {
			return new \WP_REST_Response([
				'error' => 'Failed to retrieve table schema or table does not exist.'
			], 404);
		}

		return new \WP_REST_Response([
			'table_name' => $table_name,
			'schema' => $schema
		]);
	}
}
