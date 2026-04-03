<?php

namespace MapSVG;

/**
 * Manages the background geocoding queue.
 *
 * The queue is stored as a JSON object in the MapSVG options table, keyed by table
 * name so multiple tables can be geocoded concurrently without a numeric pointer.
 * The "needs geocoding" state lives directly in the row data:
 *   - location_address = '{"raw":"..."}' → forward geocode needed
 *   - location_lat set, location_address empty, convert_latlng_to_address=true → reverse geocode needed
 *
 * The cron handler queries up to BATCH_SIZE rows per table on each run and reschedules
 * itself every second until all queued tables are fully geocoded.
 */
class GeocodingQueue
{
	const OPTION_KEY  = 'mapsvg_geocoding_queue';
	const CRON_HOOK   = 'mapsvg_geocode_batch';
	const BATCH_SIZE  = 45; // stay under Google's 50 req/sec hard limit
	const TTL         = WEEK_IN_SECONDS;

	// ─── Queue storage (wp_options via transients — longtext, no size limit) ─

	/**
	 * Returns the full queue array keyed by table name.
	 *
	 * @return array<string, array{table: string, language: string, convert_latlng_to_address: bool}>
	 */
	public static function get(): array
	{
		$raw = get_transient(self::OPTION_KEY);
		if (empty($raw)) {
			return [];
		}
		$decoded = json_decode($raw, true);
		return is_array($decoded) ? $decoded : [];
	}

	private static function save(array $queue): void
	{
		if (empty($queue)) {
			delete_transient(self::OPTION_KEY);
		} else {
			set_transient(self::OPTION_KEY, wp_json_encode($queue, JSON_UNESCAPED_UNICODE), self::TTL);
		}
	}

	// ─── Public API ─────────────────────────────────────────────────────────

	/**
	 * Add a table to the queue and schedule the cron if not already running.
	 *
	 * @param bool $paidGeocoding When true the daily limit is bypassed and geocoding
	 *                            runs as fast as the API allows (user accepts charges).
	 */
	public static function add(string $tableName, string $language, bool $convertLatlngToAddress, bool $paidGeocoding = false): void
	{
		$queue = self::get();
		$queue[$tableName] = [
			'table'                     => $tableName,
			'language'                  => $language,
			'convert_latlng_to_address' => $convertLatlngToAddress,
			'paid_geocoding'            => $paidGeocoding,
		];
		self::save($queue);
		self::schedule();
	}

	/**
	 * Schedule the next cron run (no-op if one is already pending).
	 */
	public static function schedule(): void
	{
		if (!wp_next_scheduled(self::CRON_HOOK)) {
			wp_schedule_single_event(time(), self::CRON_HOOK);
		}
	}

	/**
	 * Returns the number of rows still pending per queued table.
	 *
	 * @return array<string, array{pending: int}>
	 */
	public static function getStatus(): \stdClass
	{
		$queue = self::get();
		if (empty($queue)) {
			return new \stdClass();
		}

		$db     = Database::get();
		$status = new \stdClass();

		foreach ($queue as $tableName => $config) {
			$fullTable              = esc_sql($db->mapsvg_prefix . $tableName);
			$convertLatlngToAddress = !empty($config['convert_latlng_to_address']);
			$where                  = self::buildWhereClause($convertLatlngToAddress);

			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$count                    = (int) $db->get_var("SELECT COUNT(*) FROM `{$fullTable}` WHERE {$where}");
			$status->$tableName = ['pending' => $count];
		}

		return $status;
	}

	// ─── Cron handler ───────────────────────────────────────────────────────

	/**
	 * Process one batch per queued table. Called by WP Cron.
	 */
	public static function process(): void
	{
		$queue = self::get();
		if (empty($queue)) {
			return;
		}

		// ── Daily budget check ───────────────────────────────────────────────
		// Skip when any queued table has paid_geocoding enabled — the user accepted
		// charges and wants no daily cap. Geocoding::get() still tracks usage.
		$anyPaid = array_filter($queue, fn($c) => !empty($c['paid_geocoding']));

		if (empty($anyPaid)) {
			$today      = gmdate('Y-m-d');
			$dailyDate  = Options::get('geocoding_daily_date');
			$dailyCount = (int) Options::get('geocoding_daily_count');
			$dailyLimit = (int) (Options::get('google_geocoding_daily_limit') ?: 1300);

			if ($dailyDate === $today && $dailyCount >= $dailyLimit) {
				// Schedule next run 5 minutes after UTC midnight
				wp_schedule_single_event(strtotime('tomorrow') + 300, self::CRON_HOOK);
				return;
			}
		}

		$db  = Database::get();
		$geo = new Geocoding();

		foreach ($queue as $tableName => $config) {
			$convertLatlngToAddress = !empty($config['convert_latlng_to_address']);
			$language               = $config['language'] ?? 'en';
			$fullTable              = esc_sql($db->mapsvg_prefix . $tableName);
			$where                  = self::buildWhereClause($convertLatlngToAddress);

			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$rows = $db->get_results(
				$db->prepare(
					// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
					"SELECT id, location_lat, location_lng, location_address FROM `{$fullTable}` WHERE {$where} LIMIT %d",
					self::BATCH_SIZE
				),
				ARRAY_A
			);

			if (empty($rows)) {
				unset($queue[$tableName]);
				continue;
			}

			foreach ($rows as $row) {
				$update = self::geocodeRow($row, $convertLatlngToAddress, $language, $geo);
				if (!empty($update)) {
					$db->update($db->mapsvg_prefix . $tableName, $update, ['id' => $row['id']]);
				}
			}
		}

		self::save($queue);

		if (!empty($queue)) {
			wp_schedule_single_event(time() + 1, self::CRON_HOOK);
		}
	}

	// ─── Helpers ────────────────────────────────────────────────────────────

	/**
	 * Builds the SQL WHERE clause to find rows that need geocoding.
	 */
	private static function buildWhereClause(bool $convertLatlngToAddress): string
	{
		$forwardGeocode = "location_address LIKE '{\"raw\":%'";

		if ($convertLatlngToAddress) {
			$reverseGeocode = "(location_lat IS NOT NULL AND location_lat != 0 AND (location_address IS NULL OR location_address = ''))";
			return "({$forwardGeocode} OR {$reverseGeocode})";
		}

		return $forwardGeocode;
	}

	/**
	 * Geocodes a single row and returns the DB update array (empty on failure).
	 */
	private static function geocodeRow(
		array $row,
		bool $convertLatlngToAddress,
		string $language,
		Geocoding $geo
	): array {
		$addressJson = $row['location_address'] ?? '';
		$lat         = $row['location_lat'] ?? null;
		$lng         = $row['location_lng'] ?? null;

		$hasRawAddress  = !empty($addressJson) && strpos($addressJson, '"raw"') !== false;
		$hasCoordsOnly  = !empty($lat) && (float) $lat !== 0.0 && (empty($addressJson) || $addressJson === '');

		if ($hasRawAddress) {
			// Forward geocode: raw address string → lat/lng + full address
			$decoded    = json_decode($addressJson, true);
			$rawAddress = $decoded['raw'] ?? '';
			if (!$rawAddress) {
				return [];
			}

			$response = $geo->get($rawAddress, true, true);

			if (isset($response['status']) && $response['status'] === 'OK') {
				$result = $response['results'][0];
				return [
					'location_lat'     => $result['geometry']['location']['lat'],
					'location_lng'     => $result['geometry']['location']['lng'],
					'location_address' => self::buildAddressJson($result),
				];
			}

			// Permanent error (quota etc.) — mark processed to avoid infinite retries
			if (isset($response['status']) && in_array($response['status'], ['OVER_DAILY_LIMIT', 'OVER_QUERY_LIMIT', 'REQUEST_DENIED'], true)) {
				return ['location_address' => ''];
			}

			return [];
		}

		if ($hasCoordsOnly && $convertLatlngToAddress) {
			// Reverse geocode: lat/lng → full address
			$response = $geo->get("{$lat},{$lng}", true, true);

			if (isset($response['status']) && $response['status'] === 'OK') {
				$result = $response['results'][1] ?? $response['results'][0];
				return ['location_address' => self::buildAddressJson($result)];
			}

			// Mark as processed on permanent error
			if (isset($response['status']) && in_array($response['status'], ['OVER_DAILY_LIMIT', 'OVER_QUERY_LIMIT', 'REQUEST_DENIED'], true)) {
				return ['location_address' => ''];
			}

			return [];
		}

		return [];
	}

	/**
	 * Builds the location_address JSON from a Google Geocoding API result item.
	 */
	private static function buildAddressJson(array $result): string
	{
		$address = ['formatted' => $result['formatted_address']];
		foreach ($result['address_components'] as $component) {
			$type            = $component['types'][0];
			$address[$type]  = $component['long_name'];
			if ($component['short_name'] !== $component['long_name']) {
				$address[$type . '_short'] = $component['short_name'];
			}
		}
		return wp_json_encode($address, JSON_UNESCAPED_UNICODE);
	}
}
