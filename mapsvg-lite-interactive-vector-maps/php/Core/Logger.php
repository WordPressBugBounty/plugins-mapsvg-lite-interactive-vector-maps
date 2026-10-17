<?php

namespace MapSVG;

/**
 * Logger class that sends the data from PHP to browser console.
 */
class Logger
{

	static $clockwork;
	static $logToFile;

	// Define message types as constants
	const ERROR = 'ERROR';
	const WARNING = 'WARNING';
	const INFO = 'INFO';
	const DEBUG = 'DEBUG';

	private static bool $isFinalized = false;

	/** @var bool Clockwork boot deferred until the init hook. */
	private static $clockworkBootScheduled = false;

	private static function clockworkEnabled()
	{
		return self::$clockwork;
	}



	/**
	 * Initialize the Clockwork library
	 */
	public static function init($params)
	{
		self::$clockwork = null;
		

		if ($params["logToFile"]) {
			self::$logToFile = true;
		}
	}

	/**
	 * Start Clockwork once its REST URL can be built.
	 *
	 * checkDebugMode() calls Logger::init() while the plugin file is loading, before
	 * WordPress creates $wp_rewrite. Pretty permalinks make get_rest_url() fatal at
	 * that point, so boot waits for the init hook. Plain permalinks are safe immediately.
	 *
	 * @return void
	 */
	public static function bootClockwork()
	{
		if (self::$clockwork) {
			return;
		}

		if (!Schema::canResolveRestUrl()) {
			self::scheduleClockworkBoot();
			return;
		}

		$db = Database::get();

		try {
			$host = $db->dbhost;
			$portWithParameterName = "";
			if (strpos($db->dbhost, ':') !== false) {
				list($hostPart, $port) = explode(':', $db->dbhost);
				$portWithParameterName = "port={$port};";
				$host = $hostPart;
			}
			self::$clockwork = CustomClockwork::init([
				'enable' => true,
				'api'              => Schema::resolveRestUrl('mapsvg/v1/clockwork/'),
				'register_helpers' => true,
				'storage' => 'sql',
				'storage_sql_database' => "mysql:host={$host};{$portWithParameterName}dbname={$db->dbname};charset=utf8mb4",
				'storage_sql_table' => $db->mapsvg_prefix . 'clockwork',
				'storage_sql_username' => $db->dbuser,
				'storage_sql_password' => $db->dbpassword,
				'authentication'   => "\MapSVG\LoggerAuth"
			]);
		} catch (\Throwable $e) {
			if (defined('WP_DEBUG') && WP_DEBUG) {
				// phpcs:disable WordPress.PHP.DevelopmentFunctions
				error_log("Failed to initialize Clockwork: " . $e->getMessage());
				// phpcs:enable
			}
			self::$clockwork = null;
		}
	}

	/**
	 * @return void
	 */
	private static function scheduleClockworkBoot()
	{
		if (self::$clockworkBootScheduled || !function_exists('add_action')) {
			return;
		}
		self::$clockworkBootScheduled = true;
		add_action('init', array(__CLASS__, 'bootClockwork'), 0);
	}

	/**
	 * Save the logged data for Clockwork. The data becomes accessible by an API URL
	 * /wp-json/mapsvg/v1/clockwork/
	 */
	public static function finish()
	{
		if (!self::$isFinalized) {
			
			self::$isFinalized = true;
		}
	}

	public static function sendHeaders()
	{
		if (static::clockworkEnabled()) {
			return self::$clockwork->sendHeaders();
		}
	}

	/**
	 * Return metadata for Clockwork
	 */
	public static function getMetaData($request)
	{
		
	}

	/**
	 * Add a log to Clockwork and/or file
	 */
	public static function error($data, $label = null)
	{
		$message = self::formatMessage(self::ERROR, $data);

		if (static::clockworkEnabled()) {
			clock($message);
		}
		if (static::$logToFile && WP_DEBUG) {
			// phpcs:disable WordPress.PHP.DevelopmentFunctions
			error_log($message);
			// phpcs:enable
		}
	}

	/**
	 * Add an info log
	 */
	public static function info($data, $label = null)
	{
		$message = self::formatMessage(self::INFO, $data);

		if (static::clockworkEnabled()) {
			clock($message);
		}
		if (static::$logToFile && WP_DEBUG) {
			// phpcs:disable WordPress.PHP.DevelopmentFunctions
			error_log($message);
			// phpcs:enable
		}
	}

	/**
	 * Add a database query, with timing - to Clockwork logs
	 */
	public static function addDatabaseQuery($query, $time)
	{
		
	}

	/**
	 * Format the log message with type
	 */
	private static function formatMessage($type, $data)
	{
		// phpcs:disable WordPress.PHP.DevelopmentFunctions.error_log_print_r
		$message = is_array($data) || is_object($data) ? print_r($data, true) : $data;
		// phpcs:enable
		return "[{$type}] {$message}";
	}
}
