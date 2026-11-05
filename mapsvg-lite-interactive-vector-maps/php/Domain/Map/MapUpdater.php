<?php

namespace MapSVG;

/**
 * Class that recursively updates a map, starting from the lowest version
 * and going up through all updates until the last version.
 */
class MapUpdater
{

	/** @var array<string, bool> Complete maps currently being migrated in this request. */
	private static $updatingMaps = [];

	/**
	 * Checks the map version and upgrades it if necessary
	 *
	 * @param object $map	 
	 * @return Map | void
	 */
	function maybeUpdate(&$map)
	{
		// Projected list rows must never be migrated or persisted.
		if (!isset($map['version']) || !isset($map['options'])) return $map;
		$mapKey = isset($map['id']) ? (string) $map['id'] : null;
		if ($mapKey !== null && isset(self::$updatingMaps[$mapKey])) return $map;
		$originalMap = $map;
		$currentVersion = isset($map["version"]) ? (string) $map["version"] : '0.0.0';
		if (version_compare($currentVersion, MAPSVG_VERSION, '>')) {
			return $map;
		}

		// Database options are normally JSON strings, including on current maps.
		// Only non-JSON JavaScript literals indicate the skipped legacy migration.
		$options = $map['options'] ?? null;
		$legacyLiteral = is_string($options) && !is_array(json_decode($options, true));
		if ($currentVersion === MAPSVG_VERSION && !$legacyLiteral) {
			return $map;
		}

		if ($mapKey !== null) self::$updatingMaps[$mapKey] = true;
		$persisting = false;
		try {
			$options = Map::fixJsonOptions($options);
			if (!is_array($options) || !isset($options['source']) || !is_string($options['source']) || $options['source'] === '') {
				throw new \UnexpectedValueException('Map options could not be recovered');
			}
			$map['options'] = $options;
			// A legacy literal can survive an incorrectly advanced map version.
			// Replay the complete ordered chain, not a hardcoded subset of files.
			$fromVersion = $legacyLiteral ? '0.0.0' : $currentVersion;
			foreach ($this->getPendingMigrations($fromVersion) as $migrationFile) {
				$this->applyMigration($map, $migrationFile);
				if (!is_array($map['options'])) {
					throw new \UnexpectedValueException('Migration produced invalid map options');
				}
			}
			$map['version'] = MAPSVG_VERSION;
			// The v2 write boundary accepts public options and a validated integer ID.
			// Validation reads the same row through a fresh repository; the per-map
			// guard prevents that read from starting this migration again.
			$publicMap = $map;
			if (isset($publicMap['id']) && is_string($publicMap['id'])) {
				$id = filter_var($publicMap['id'], FILTER_VALIDATE_INT);
				if ($id !== false && $id > 0) $publicMap['id'] = $id;
			}
			$persisting = true;
			RepositoryFactory::get('map')->update($publicMap);
		} catch (\Throwable $e) {
			$map = $originalMap;
			if ($persisting) throw $e;
			Logger::error("[SERVER-013] Migration failed: " . $e->getMessage() . " — Read more: https://mapsvg.com/docs/errors#SERVER-013");
		} finally {
			if ($mapKey !== null) unset(self::$updatingMaps[$mapKey]);
		}
		return $map;
	}

	protected function getPendingMigrations($currentVersion)
	{
		$migrations = [];
		$migrationDir = __DIR__ . DIRECTORY_SEPARATOR . 'migrations';

		// Scan the /migrations directory for files
		foreach (glob($migrationDir . DIRECTORY_SEPARATOR . '*.php') as $file) {
			$version = basename($file, '.php');

			// Check if the file's version is higher than the current version
			if (version_compare($version, $currentVersion, '>') && version_compare($version, MAPSVG_VERSION, '<=')) {
				$migrations[$version] = $file;
			}
		}

		// Sort migrations by version
		uksort($migrations, 'version_compare');

		return $migrations;
	}

	protected function applyMigration(&$map, $migrationFile)
	{
		$migration = require $migrationFile;

		if (is_callable($migration)) {
			$migration($map);
		}
	}
}
