<?php
namespace MapSVG\Distribution;

/** Runs before replacement/deletion, for manual, bulk, ZIP and automatic updates. */
final class UpdateGuard
{
    private static $registered = false;
    private static $activation = [];
    private static $recovery;

    /** Only the hash-pinned bridge archive may cross the normal v9 → v8 package guard. */
    public static function recoverLegacy($upgrader, string $plugin, string $archive, string $sha256, callable $run)
    {
        if (!is_file($archive) || !hash_equals($sha256, hash_file('sha256', $archive))) return new \WP_Error('mapsvg_recovery_integrity', 'The MapSVG recovery package is damaged.');
        $previous = self::$recovery;
        self::$recovery = ['upgrader' => $upgrader, 'plugin' => $plugin];
        try { return $run(); }
        finally { self::$recovery = $previous; }
    }

    public static function register(): void
    {
        if (self::$registered) return;
        self::$registered = true;
        add_filter('upgrader_pre_install', [self::class, 'rememberActivation'], 1, 2);
        add_filter('upgrader_source_selection', [self::class, 'checkSource'], 20, 4);
    }

    public static function rememberActivation($result, $extra)
    {
        if (!empty($extra['plugin'])) {
            $plugin = $extra['plugin'];
            $headers = self::headers(WP_PLUGIN_DIR . '/' . $plugin);
            if (in_array($headers['distribution'], ['lite', 'addon', 'bridge'], true)) {
                $network = (array) get_site_option('active_sitewide_plugins', []);
                self::$activation[$plugin] = [
                    'site' => in_array($plugin, (array) get_option('active_plugins', []), true),
                    'network' => $network[$plugin] ?? null,
                ];
            }
        }
        return $result;
    }

    private static function rejected($extra, string $code, string $message)
    {
        // Core can silently deactivate the target before source_selection. Its old
        // files still exist here; restore only that target when our guard rejects it.
        $plugin = $extra['plugin'] ?? '';
        $before = self::$activation[$plugin] ?? null;
        if ($before && $before['site']) {
            $active = (array) get_option('active_plugins', []);
            if (!in_array($plugin, $active, true)) { $active[] = $plugin; sort($active); update_option('active_plugins', $active); }
        }
        if ($before && $before['network'] !== null) {
            $active = (array) get_site_option('active_sitewide_plugins', []);
            $active[$plugin] = $before['network']; update_site_option('active_sitewide_plugins', $active);
        }
        return new \WP_Error($code, $message);
    }

    public static function headers(string $file): array
    {
        return get_file_data($file, [
            'name' => 'Plugin Name', 'version' => 'Version',
            'distribution' => 'MapSVG Distribution', 'api' => 'MapSVG Add-on API',
            'min_lite' => 'MapSVG Requires Lite', 'slug' => 'Text Domain',
            'legacy_version' => 'MapSVG Legacy Version', 'legacy_sha256' => 'MapSVG Legacy SHA256',
        ]);
    }

    public static function compatible(string $liteVersion, int $api, string $minimum, int $requiredApi): bool
    {
        return $api > 0 && $requiredApi === $api && $minimum !== '' &&
            version_compare($liteVersion, $minimum, '>=');
    }

    public static function checkSource($source, $remoteSource, $upgrader, $extra = [])
    {
        if (is_wp_error($source) || !is_dir($source)) return $source;
        if (self::$recovery && self::$recovery['upgrader'] === $upgrader && self::$recovery['plugin'] === ($extra['plugin'] ?? '')) return $source;
        $candidate = null;
        foreach (glob(trailingslashit($source) . '*.php') ?: [] as $file) {
            $headers = self::headers($file);
            if ($headers['name'] && in_array($headers['distribution'], ['lite', 'addon', 'bridge'], true)) {
                if ($candidate) return self::rejected($extra, 'mapsvg_package', 'Invalid MapSVG package: multiple plugin entry points.');
                $candidate = $headers;
            }
        }
        $current = !empty($extra['plugin']) ? self::headers(WP_PLUGIN_DIR . '/' . $extra['plugin']) : null;
        // A valid v9 target can never be replaced by an old standalone/wrong-SKU package.
        $completed = get_option('mapsvg_legacy_upgrade_result');
        $handoff = $current && $candidate && $current['distribution'] === 'bridge' && $candidate['distribution'] === 'addon' &&
            ($completed['status'] ?? '') === 'complete' && ($completed['plugin_file'] ?? '') === ($extra['plugin'] ?? '') &&
            ($completed['slug'] ?? '') === $current['slug'] && ($completed['version'] ?? '') === $current['version'] &&
            ($completed['legacy_version'] ?? '') === ($current['legacy_version'] ?? '') &&
            ($completed['legacy_sha256'] ?? '') === ($current['legacy_sha256'] ?? '');
        if ($current && in_array($current['distribution'], ['lite', 'addon', 'bridge'], true) &&
            (!$candidate || $candidate['slug'] !== $current['slug'] || ($candidate['distribution'] !== $current['distribution'] && !$handoff))) {
            return self::rejected($extra, 'mapsvg_package', 'The update package does not match this MapSVG plugin.');
        }
        if (!$candidate) return $source; // Other plugins and old standalone packages.
        if (in_array($candidate['distribution'], ['addon', 'bridge'], true)) {
            // The standalone bridge owns first-time Lite installation. Once Lite
            // is active it has the same compatibility contract as other add-ons.
            if ($candidate['distribution'] === 'bridge' &&
                (!defined('MAPSVG_PLAN') || MAPSVG_PLAN !== 'mapsvg-lite')) return $source;
            if (!defined('MAPSVG_PLAN') || MAPSVG_PLAN !== 'mapsvg-lite' ||
                !defined('MAPSVG_VERSION') || !defined('MAPSVG_ADDON_API_VERSION') ||
                !self::compatible(MAPSVG_VERSION, MAPSVG_ADDON_API_VERSION, $candidate['min_lite'], (int) $candidate['api'])) {
                return self::rejected($extra, 'mapsvg_lite_required', sprintf(
                    '%s requires active MapSVG Lite %s or newer with add-on API %s. Update Lite first.',
                    $candidate['name'], $candidate['min_lite'], $candidate['api']
                ));
            }
        } else {
            // Even an expired paid license must keep working after a free Lite update.
            $active = array_unique(array_merge((array) get_option('active_plugins', []),
                array_keys((array) get_site_option('active_sitewide_plugins', []))));
            foreach ($active as $plugin) {
                $paid = self::headers(WP_PLUGIN_DIR . '/' . $plugin);
                if (in_array($paid['distribution'], ['addon', 'bridge'], true) && !self::compatible(
                    $candidate['version'], (int) $candidate['api'], $paid['min_lite'], (int) $paid['api']
                )) {
                    return self::rejected($extra, 'mapsvg_paid_incompatible', sprintf(
                        'This Lite update is incompatible with active %s. Use a compatible release pair; your current plugins have been retained.', $paid['name']
                    ));
                }
            }
        }
        return $source;
    }
}
