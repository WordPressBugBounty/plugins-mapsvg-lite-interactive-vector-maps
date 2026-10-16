<?php

namespace MapSVG;

/**
 * Class that recursively updates a map, starting from the lowest version
 * and going up through all updates until the last version.
 */
class MapUpdater
{

	protected $db;


	public function __construct()
	{
		$this->db = Database::get();
	}

	/**
	 * Checks the map version and upgrades it if necessary
	 *
	 * @param object $map	 
	 * @return Map | void
	 */
	function maybeUpdate(&$map)
	{
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
			RepositoryFactory::get('map')->update($map);
		} catch (\Throwable $e) {
			$map = $originalMap;
			Logger::error("[SERVER-013] Migration failed: " . $e->getMessage() . " — Read more: https://mapsvg.com/docs/errors#SERVER-013");
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
