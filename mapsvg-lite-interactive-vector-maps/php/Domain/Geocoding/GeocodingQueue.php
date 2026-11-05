<?php

namespace MapSVG;

use MapSVG\DataLayer\Location\LegacyGeocodingProvider;
use MapSVG\DataLayer\Location\QueuedLocationGeocodingService;
use MapSVG\DataLayer\Location\QueuedLocationStore;

/**
 * Manages the background geocoding queue.
 *
 * Queue stored in a transient keyed by table name.
 * Row eligibility uses location_geocoding_status only (1 forward, 2 reverse) with schema flags.
 */
class GeocodingQueue
{
	const OPTION_KEY  = 'mapsvg_geocoding_queue';
	const CRON_HOOK   = 'mapsvg_geocode_batch';
	const BATCH_SIZE  = 45; // stay under Google's 50 req/sec hard limit
	const TTL         = WEEK_IN_SECONDS;

	// ─── Queue storage (wp_options via transients — longtext, no size limit) ─

	/**
	 * @return array<string, array<string, mixed>>
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
	 * @param bool $convertAddressToLatLng Forward (address → lat/lng) when true.
	 */
	public static function add(
		string $tableName,
		string $language,
		bool $convertLatlngToAddress,
		bool $paidGeocoding = false,
		bool $convertAddressToLatLng = true
	): void {
		$queue = self::get();
		$queue[$tableName] = [
			'table'                        => $tableName,
			'language'                     => $language,
			'convert_latlng_to_address'    => $convertLatlngToAddress,
			'convert_address_to_lat_lng'    => $convertAddressToLatLng,
			'paid_geocoding'               => $paidGeocoding,
		];
		self::save($queue);

		self::process();
	}

	public static function schedule(): void
	{
		if (! wp_next_scheduled(self::CRON_HOOK)) {
			wp_schedule_single_event(time(), self::CRON_HOOK);
		}
	}

	public static function getStatus(): \stdClass
	{
		$queue = self::get();
		if (empty($queue)) {
			return new \stdClass();
		}

		$status = new \stdClass();

		foreach ($queue as $tableName => $config) {
			$convertLatlngToAddress  = ! empty($config['convert_latlng_to_address']);
			$convertAddressToLatLng = array_key_exists('convert_address_to_lat_lng', $config)
				? ! empty($config['convert_address_to_lat_lng'])
				: true;
			$count                   = self::countPending($tableName, $convertLatlngToAddress, $convertAddressToLatLng);
			$status->$tableName      = ['pending' => $count];
		}

		return $status;
	}

	/**
	 * @param string $tableName Schema / repository table basename (no mapsvg_ prefix).
	 */
	public static function countPending(
		string $tableName,
		bool $convertLatlngToAddress,
		bool $convertAddressToLatLng = true
	): int {
		return self::storeForTable($tableName)->countPending(
			$convertLatlngToAddress,
			$convertAddressToLatLng
		);
	}

	// ─── Cron handler ───────────────────────────────────────────────────────

	public static function process(): void
	{
		$queue = self::get();
		if (empty($queue)) {
			return;
		}

		$anyPaid = array_filter($queue, fn ($c) => ! empty($c['paid_geocoding']));

		if (empty($anyPaid)) {
			$today      = gmdate('Y-m-d');
			$dailyDate  = Options::get('geocoding_daily_date');
			$dailyCount = (int) Options::get('geocoding_daily_count');
			$dailyLimit = (int) (Options::get('google_geocoding_daily_limit') ?: 1300);

			if ($dailyDate === $today && $dailyCount >= $dailyLimit) {
				wp_schedule_single_event(strtotime('tomorrow') + 300, self::CRON_HOOK);
				return;
			}
		}

		$geocoding = new QueuedLocationGeocodingService(
			new LegacyGeocodingProvider()
		);

		foreach ($queue as $tableName => $config) {
			$convertLatlngToAddress  = ! empty($config['convert_latlng_to_address']);
			$convertAddressToLatLng = array_key_exists('convert_address_to_lat_lng', $config)
				? ! empty($config['convert_address_to_lat_lng'])
				: true;
			$language = $config['language'] ?? 'en';
			$store = self::storeForTable($tableName);
			$rows = $store->pendingRows(
				$convertLatlngToAddress,
				$convertAddressToLatLng,
				self::BATCH_SIZE
			);

			if (empty($rows)) {
				unset($queue[$tableName]);
				continue;
			}

			foreach ($rows as $row) {
				$primaryKey = $row['__mapsvg_pk'] ?? null;
				unset($row['__mapsvg_pk']);
				if ($primaryKey === null || $primaryKey === '') {
					continue;
				}

				$update = $geocoding->resolveRow(
					$row,
					$convertLatlngToAddress,
					$convertAddressToLatLng,
					$language
				);
				if (!empty($update)) {
					$store->update($primaryKey, $update);
				}
			}
		}

		self::save($queue);

		if (! empty($queue)) {
			wp_schedule_single_event(time() + 1, self::CRON_HOOK);
		}
	}

	// ─── Helpers ────────────────────────────────────────────────────────────

	private static function storeForTable(
		string $tableName
	): QueuedLocationStore {
		$schemaRepository = RepositoryFactory::get('schema');
		$schema = $schemaRepository->findByName($tableName);
		if (!$schema) {
			throw new \OutOfBoundsException(
				'Queued geocoding schema not found: ' . $tableName
			);
		}

		$dataLayer = \MapSVG\DataLayer\DataLayerFactory::createV2(
			null,
			array('force' => true, 'observe' => false)
		);
		return new QueuedLocationStore($dataLayer, $schema);
	}


}
