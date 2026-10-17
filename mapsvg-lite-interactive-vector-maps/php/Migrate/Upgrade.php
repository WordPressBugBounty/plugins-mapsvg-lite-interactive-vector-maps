<?php

namespace MapSVG;

/**
 * Class that recursively updates mapsvg, starting from the lowest version
 * and going up through all updates until the last version.
 */
class Upgrade
{

    protected $db;


    public function __construct()
    {
        $this->db = Database::get();
    }

    /**
     * Checks the mapsvg version and upgrades it if necessary.
     *
     * A failed migration is logged and paused for one hour. db_version stays
     * put so the repair can run again. The pause is keyed to MAPSVG_VERSION,
     * so a newer release is not blocked by an older failure. ?dbUpgrade= on
     * an admin request bypasses the pause.
     */
    function run()
    {
        if (!$this->isForcedDbUpgrade() && $this->migrationBackoffActive()) {
            return;
        }

        $dbVersion = $this->isSettingsTableExists() ? Options::get('db_version') : '1.0.0';


        


        // Check if the current map version is outdated
        if (is_null($dbVersion) || version_compare($dbVersion, MAPSVG_VERSION, '<')) {
            $this->applyPendingMigrations($this->getPendingMigrations($dbVersion));
        }
    }

    /**
     * Run pending migrations. On failure, log and pause instead of advancing db_version.
     *
     * @param array<string, string> $migrations Version => absolute path.
     * @return bool True when every migration finished.
     */
    public function applyPendingMigrations(array $migrations)
    {
        foreach ($migrations as $migrationFile) {
            try {
                $this->applyMigration($migrationFile);
            } catch (\Throwable $e) {
                Logger::error("[SERVER-005] Migration failed: " . get_class($e) . ': ' . $e->getMessage() . " — Read more: https://mapsvg.com/docs/errors#SERVER-005");
                $this->pauseMigrationsAfterFailure();
                return false;
            }
        }

        Options::set('db_version', MAPSVG_VERSION);
        $this->clearMigrationBackoff();
        return true;
    }

    /**
     * @return bool
     */
    private function isForcedDbUpgrade()
    {
        return function_exists('is_admin') && is_admin() && isset($_GET['dbUpgrade']);
    }

    /**
     * @return string
     */
    private function migrationBackoffKey()
    {
        return 'mapsvg_migration_backoff_' . MAPSVG_VERSION;
    }

    /**
     * @return bool
     */
    private function migrationBackoffActive()
    {
        if (!function_exists('get_transient')) {
            return false;
        }
        return (bool) get_transient($this->migrationBackoffKey());
    }

    /**
     * @return void
     */
    private function pauseMigrationsAfterFailure()
    {
        if (!function_exists('set_transient')) {
            return;
        }
        $ttl = defined('HOUR_IN_SECONDS') ? (int) HOUR_IN_SECONDS : 3600;
        set_transient($this->migrationBackoffKey(), time(), $ttl);
    }

    /**
     * @return void
     */
    private function clearMigrationBackoff()
    {
        if (function_exists('delete_transient')) {
            delete_transient($this->migrationBackoffKey());
        }
    }

    /**
     * @return string|null
     */
    public function isSettingsTableExists()
    {
        $settings_table_exists = $this->db->get_var('SHOW TABLES LIKE \'' . $this->db->mapsvg_prefix . 'settings\'');
        return $settings_table_exists;
    }


    private function getPendingMigrations($currentVersion)
    {
        $migrations = [];
        $migrationDir = __DIR__ . DIRECTORY_SEPARATOR . 'Migrations';



        if (!is_dir($migrationDir)) {
            Logger::error("[SERVER-006] MapSVG: Migration directory does not exist: $migrationDir — Read more: https://mapsvg.com/docs/errors#SERVER-006");
            return $migrations;
        }

        if (!is_readable($migrationDir)) {
            Logger::error("[SERVER-007] MapSVG: Migration directory is not readable: $migrationDir — Read more: https://mapsvg.com/docs/errors#SERVER-007");
            return $migrations;
        }

        $globPattern = $migrationDir . DIRECTORY_SEPARATOR . '*.php';
        $files = glob($globPattern);

        if ($files === false) {
            Logger::error("[SERVER-008] MapSVG: glob() failed for pattern: $globPattern — Read more: https://mapsvg.com/docs/errors#SERVER-008");
            return $migrations;
        }

        if (empty($files)) {
            Logger::error("[SERVER-009] MapSVG: No migration files found in: $migrationDir — Read more: https://mapsvg.com/docs/errors#SERVER-009");
            return $migrations;
        }

        foreach ($files as $file) {
            $version = basename($file, '.php');

            if (is_null($currentVersion) || version_compare($version, $currentVersion, '>')) {
                $migrations[$version] = $file;
            }
        }


        // Sort migrations by version
        uksort($migrations, 'version_compare');

        return $migrations;
    }

    private function applyMigration($migrationFile)
    {
        $migration = require $migrationFile;

        if (is_callable($migration)) {
            $migration();
        } else {
            Logger::error("[SERVER-010] MapSVG: Migration file is not callable: $migrationFile — Read more: https://mapsvg.com/docs/errors#SERVER-010");
        }
    }
}
