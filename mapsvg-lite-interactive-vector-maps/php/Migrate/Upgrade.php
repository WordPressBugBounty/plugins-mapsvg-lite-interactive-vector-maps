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
     * Retry failed upgrades after one hour, or immediately with admin dbUpgrade.
     * The pause belongs to this release; a newer plugin can retry independently.
     */
    function run()
    {
        if (!$this->isForcedDbUpgrade() && $this->migrationBackoffActive()) {
            return;
        }

        $dbVersion = $this->isSettingsTableExists() ? Options::get('db_version') : '1.0.0';


        // START common
        // Allow forcing DB upgrade from the admin page even if it's done already.
        // Properly sanitize and unslash the dbUpgrade parameter
        if (is_admin()) {
            if (isset($_GET['dbUpgrade'])) {
                $dbVersion = sanitize_text_field(wp_unslash($_GET['dbUpgrade']));
            } else {
                $db = Database::get();
                $schemaTableName = $db->mapsvg_prefix . "schema";
                $schemaTableExists = $db->get_var('SHOW TABLES LIKE \'' . $schemaTableName . '\'');
                if (!$schemaTableExists) {
                    $dbVersion = "5.0.0";
                }
            }
        }

        // END


        // Check if the current map version is outdated
        if (is_null($dbVersion) || version_compare($dbVersion, MAPSVG_VERSION, '<')) {
            // Get all migration files with version numbers higher than the current version
            $migrations = $this->getPendingMigrations($dbVersion);


            // Apply each migration to the map options
            foreach ($migrations as $migrationFile) {
                try {
                    $this->applyMigration($migrationFile);
                } catch (\Throwable $e) {
                    Logger::error("[SERVER-005] Migration failed: " . get_class($e) . ': ' . $e->getMessage() . " — Read more: https://mapsvg.com/docs/errors#SERVER-005");
                    // Recovery listeners can terminate the request; persist first.
                    if (function_exists('set_transient')) {
                        set_transient($this->migrationBackoffKey(), time(), 3600);
                    }
                    if (function_exists('do_action')) do_action('mapsvg_migration_failed', $e, basename($migrationFile, '.php'));
                    return;
                }
            }

            Options::set('db_version', MAPSVG_VERSION);
            if (function_exists('delete_transient')) {
                delete_transient($this->migrationBackoffKey());
            }
        }
    }

    private function isForcedDbUpgrade(): bool
    {
        return is_admin() && isset($_GET['dbUpgrade']);
    }

    private function migrationBackoffKey(): string
    {
        return 'mapsvg_migration_backoff_' . MAPSVG_VERSION;
    }

    private function migrationBackoffActive(): bool
    {
        return function_exists('get_transient') && (bool) get_transient($this->migrationBackoffKey());
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

            // next.php is a release-time scaffold, never an executable version.
            // Integration branches can also contain published migrations newer
            // than their plugin header; leave those for the appropriate release.
            if (!preg_match('/\A\d+\.\d+\.\d+\z/D', $version)
                || version_compare($version, MAPSVG_VERSION, '>')) {
                continue;
            }

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
            throw new \RuntimeException("[SERVER-010] MapSVG: Migration file is not callable: $migrationFile — Read more: https://mapsvg.com/docs/errors#SERVER-010");
        }
    }
}
