<?php
namespace MapSVG;

/** Installs only a ZIP explicitly uploaded in this administrator request. Never obtains a package URL. */
final class UploadedPaidAddonInstaller
{
    private const SLUGS = ['mapsvg-personal', 'mapsvg-professional', 'mapsvg-business'];
    private const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
    private const MAX_EXPANDED_BYTES = 300 * 1024 * 1024;

    public static function maxUploadBytes(): int
    {
        $hostLimit = function_exists('wp_max_upload_size') ? (int) wp_max_upload_size() : self::MAX_UPLOAD_BYTES;
        return max(0, min(self::MAX_UPLOAD_BYTES, $hostLimit));
    }

    private static function error(string $code, string $message, int $status = 409): \WP_Error
    {
        return new \WP_Error($code, $message, ['status' => $status]);
    }

    public static function capability()
    {
        if (!current_user_can('install_plugins') || !current_user_can('activate_plugins'))
            return self::error('installation_permission', 'Your WordPress account cannot install and activate plugins. Ask a site administrator to install the ZIP.', 403);
        if ((defined('DISALLOW_FILE_MODS') && DISALLOW_FILE_MODS) ||
            (function_exists('wp_is_file_mod_allowed') && !wp_is_file_mod_allowed('mapsvg_uploaded_upgrade')))
            return self::error('file_modifications_disabled', 'Plugin installation is disabled on this site. Ask your site administrator or hosting provider to install the ZIP.');
        if (!defined('MAPSVG_PLAN') || MAPSVG_PLAN !== 'mapsvg-lite')
            return self::error('lite_required', 'Keep MapSVG Lite active before installing its add-on.');
        require_once ABSPATH . 'wp-admin/includes/file.php';
        if (get_filesystem_method([], WP_PLUGIN_DIR) !== 'direct')
            return self::error('filesystem_credentials_required', 'This host requires filesystem credentials. Install the ZIP using WordPress Plugins → Add New Plugin → Upload Plugin.');
        return true;
    }

    /** Only PHP's uploaded-file marker authorizes a local package path. Caller paths/URLs are never accepted. */
    public static function uploadedArchive($file)
    {
        if (!is_array($file) || !is_int($file['error'] ?? null))
            return self::error('upload_required', 'Choose a plugin ZIP before installing.', 400);
        if (in_array($file['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true))
            return self::error('upload_too_large', 'The ZIP exceeds this server’s upload limit. Use a smaller package or ask your hosting provider to increase the upload limit.', 413);
        if ($file['error'] !== UPLOAD_ERR_OK)
            return self::error('upload_failed', 'The ZIP upload did not finish. Choose the file and try again.', 400);
        $path = $file['tmp_name'] ?? null;
        if (!is_string($path) || $path === '' || !is_uploaded_file($path))
            return self::error('invalid_upload', 'A plugin ZIP must be uploaded from your computer.', 400);
        if (!is_string($file['name'] ?? null) || !preg_match('/\.zip$/i', $file['name']))
            return self::error('invalid_upload', 'Choose a .zip plugin package.', 400);
        $size = filesize($path);
        if (!is_int($size) || $size <= 0 || !is_int($file['size'] ?? null) || $file['size'] !== $size)
            return self::error('invalid_upload', 'The uploaded ZIP is empty or incomplete. Choose the file again.', 400);
        if ($size > self::maxUploadBytes())
            return self::error('upload_too_large', 'The ZIP exceeds this server’s upload limit. Ask your hosting provider to increase the upload limit.', 413);
        return $path;
    }

    private static function headers(string $file): array
    {
        return get_file_data($file, ['name' => 'Plugin Name', 'version' => 'Version',
            'slug' => 'Text Domain', 'distribution' => 'MapSVG Distribution',
            'api' => 'MapSVG Add-on API', 'minimum' => 'MapSVG Requires Lite']);
    }

    private static function compatible(array $headers): bool
    {
        return defined('MAPSVG_VERSION') && defined('MAPSVG_ADDON_API_VERSION') &&
            (int) $headers['api'] === MAPSVG_ADDON_API_VERSION &&
            (bool) preg_match('/^\d+\.\d+\.\d+$/', $headers['version']) &&
            (bool) preg_match('/^\d+\.\d+\.\d+$/', $headers['minimum']) &&
            version_compare(MAPSVG_VERSION, $headers['minimum'], '>=');
    }

    /** Inspect paths and exact purchased SKU before WordPress extracts or executes any package code. */
    public static function checkArchive(string $path, string $slug)
    {
        if (!in_array($slug, self::SLUGS, true))
            return self::error('invalid_package', 'This package does not match the purchased plan.');
        if (!class_exists('ZipArchive'))
            return self::error('zip_unavailable', 'This server needs the PHP ZIP extension. Ask your hosting provider to enable it.');
        $zip = new \ZipArchive();
        if ($zip->open($path, \ZipArchive::CHECKCONS) !== true)
            return self::error('invalid_package', 'The uploaded file is not a valid plugin ZIP.');
        $prefix = $slug . '/';
        $total = 0;
        $seen = [];
        try {
            if ($zip->numFiles < 1 || $zip->numFiles > 20000)
                return self::error('invalid_package', 'The uploaded package contains an invalid number of files.');
            for ($index = 0; $index < $zip->numFiles; $index++) {
                $entry = $zip->statIndex($index);
                if (!is_array($entry) || !is_string($entry['name'] ?? null) || !isset($entry['size']) || $entry['size'] < 0)
                    return self::error('invalid_package', 'The uploaded package contains an invalid file.');
                $name = $entry['name'];
                $key = strtolower($name);
                $total += $entry['size'];
                $fileType = 0;
                if ($zip->getExternalAttributesIndex($index, $system, $attributes))
                    $fileType = ($attributes >> 16) & 0170000;
                if (strpos($name, $prefix) !== 0 || strpos($name, '//') !== false || strpos($name, '\\') !== false || strpos($name, ':') !== false ||
                    preg_match('#(^|/)\.\.?(/|$)#', $name) || preg_match('/[\x00-\x1F\x7F]/', $name) ||
                    isset($seen[$key]) || !in_array($fileType, [0, 0100000, 0040000], true) ||
                    !empty($entry['encryption_method']) || $total > self::MAX_EXPANDED_BYTES ||
                    ($entry['size'] > 1024 * 1024 && $entry['size'] > max(1, $entry['comp_size'] ?? 0) * 1000))
                    return self::error('invalid_package', 'The uploaded package contains an unsafe or oversized file.');
                $seen[$key] = true;
            }
            $main = $zip->getFromName($prefix . $slug . '.php', 8192);
            if (!is_string($main))
                return self::error('invalid_package', 'The uploaded ZIP does not contain the purchased MapSVG add-on.');
            require_once ABSPATH . 'wp-admin/includes/file.php';
            $headerFile = wp_tempnam('mapsvg-upload-header');
            if (!$headerFile) return self::error('package_inspection_failed', 'WordPress could not inspect the uploaded package. Check temporary-directory permissions.');
            try {
                if (file_put_contents($headerFile, $main) !== strlen($main))
                    return self::error('package_inspection_failed', 'WordPress could not inspect the uploaded package.');
                $headers = self::headers($headerFile);
            } finally { @unlink($headerFile); }
            if (!$headers['name'] || $headers['slug'] !== $slug || $headers['distribution'] !== 'addon' || !self::compatible($headers))
                return self::error('package_incompatible', 'This ZIP does not match your purchased plan or requires a different Lite version. Download the correct compatible add-on from Dashboard.');
            return ['slug' => $slug, 'version' => $headers['version']];
        } finally { $zip->close(); }
    }

    public static function install(string $path, string $slug)
    {
        $capability = self::capability();
        if (is_wp_error($capability)) return $capability;
        $package = self::checkArchive($path, $slug);
        if (is_wp_error($package)) return $package;
        require_once ABSPATH . 'wp-admin/includes/plugin.php';
        require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
        $plugin = $slug . '/' . $slug . '.php';
        foreach (array_unique(array_merge((array) get_option('active_plugins', []),
            array_keys((array) get_site_option('active_sitewide_plugins', [])))) as $active) {
            if ($active === $plugin || !is_file(WP_PLUGIN_DIR . '/' . $active)) continue;
            $other = self::headers(WP_PLUGIN_DIR . '/' . $active);
            if ($other['distribution'] === 'addon' && strpos($other['slug'], 'mapsvg-') === 0)
                return self::error('paid_addon_conflict', 'Another MapSVG add-on is active. Deactivate it in WordPress Plugins before installing this plan.');
        }
        $existing = WP_PLUGIN_DIR . '/' . $plugin;
        $directory = WP_PLUGIN_DIR . '/' . $slug;
        $overwrite = is_dir($directory);
        if (is_link($directory) || is_link($existing))
            return self::error('package_conflict', 'This add-on is managed through a filesystem link. Update it through your deployment process.');
        if ($overwrite) {
            if (!is_file($existing)) return self::error('package_conflict', 'The destination directory contains an unrecognized package. Check it in WordPress Plugins before retrying.');
            $headers = self::headers($existing);
            if ($headers['slug'] !== $slug || $headers['distribution'] !== 'addon' || !self::compatible($headers))
                return self::error('package_conflict', 'The destination is not the expected compatible MapSVG add-on.');
            if (version_compare($package['version'], $headers['version'], '<'))
                return self::error('older_package', 'A newer version of this add-on is already installed. Choose an equal or newer ZIP.');
            if (!current_user_can('update_plugins'))
                return self::error('installation_permission', 'Your WordPress account cannot update the installed add-on.', 403);
        }
        $upgrader = new \Plugin_Upgrader(new \Automatic_Upgrader_Skin());
        // Pin this exact upgrader to the user-uploaded file even when other plugins
        // filter download handling. There is no remote package acquisition path.
        $localOnly = static function ($reply, $requestedPackage, $requestingUpgrader) use ($path, $upgrader) {
            return $requestingUpgrader === $upgrader ? $path : $reply;
        };
        add_filter('upgrader_pre_download', $localOnly, PHP_INT_MAX, 3);
        try {
            if ($overwrite) {
                // Use the native upgrade/backup lifecycle rather than destructive
                // install(overwrite_package), while keeping the package local.
                $updates = get_site_transient('update_plugins');
                $updates = is_object($updates) ? clone $updates : (object) [];
                $updates->response = isset($updates->response) ? $updates->response : [];
                $updates->response[$plugin] = (object) ['plugin' => $plugin, 'slug' => $slug,
                    'new_version' => $package['version'], 'package' => $path];
                $provide = static function () use ($updates) { return $updates; };
                add_filter('pre_site_transient_update_plugins', $provide, PHP_INT_MAX);
                try { $result = $upgrader->upgrade($plugin, ['clear_update_cache' => false]); }
                finally { remove_filter('pre_site_transient_update_plugins', $provide, PHP_INT_MAX); }
            } else $result = $upgrader->install($path, ['clear_update_cache' => false]);
        } finally { remove_filter('upgrader_pre_download', $localOnly, PHP_INT_MAX); }
        if (is_wp_error($result) || !$result)
            return self::error('installation_failed', 'WordPress could not install the uploaded ZIP. Check file permissions or use Plugins → Add New Plugin → Upload Plugin.');
        $activated = activate_plugin($plugin, '', false, true);
        if (is_wp_error($activated) || !is_plugin_active($plugin))
            return self::error('activation_failed', 'The add-on was installed but could not be activated. Check WordPress Plugins and activate it there.');
        wp_clean_plugins_cache(false);
        return ['installed' => true, 'reloadRequired' => true, 'slug' => $slug, 'version' => $package['version']];
    }
}
