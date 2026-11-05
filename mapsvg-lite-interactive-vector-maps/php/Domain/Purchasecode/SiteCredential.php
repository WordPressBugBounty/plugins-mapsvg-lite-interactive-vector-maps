<?php

namespace MapSVG;

/** Server-only, per-installation credential. Never put these options in admin bootstrap data. */
class SiteCredential
{
    private const CURRENT = 'mapsvg_site_auth_current';
    private static $attempted = [];

    public static function siteUrl(): string
    {
        $parts = wp_parse_url(home_url());
        $scheme = strtolower($parts['scheme'] ?? 'https');
        $host = preg_replace('/^www\./', '', strtolower($parts['host'] ?? ''));
        $port = isset($parts['port']) && !(($scheme === 'https' && $parts['port'] === 443) || ($scheme === 'http' && $parts['port'] === 80))
            ? ':' . $parts['port'] : '';
        return $scheme . '://' . $host . $port . rtrim($parts['path'] ?? '', '/');
    }

    private static function optionKey(string $licenseKey): string
    {
        return 'mapsvg_site_auth_' . hash('sha256', self::siteUrl() . "\0" . $licenseKey);
    }

    private static function insertOrRead(string $key, callable $make)
    {
        $value = get_option($key);
        if ($value !== false) {
            return $value;
        }
        if (!add_option($key, $make(), '', false)) {
            // Another request may have inserted after our cache miss.
            wp_cache_delete('notoptions', 'options');
            wp_cache_delete($key, 'options');
        }
        return get_option($key);
    }

    /** Persist before sending: retries and concurrent activation requests use the same secret. */
    public static function prepare(string $licenseKey): array
    {
        $url = self::siteUrl();
        $idKey = 'mapsvg_site_id_' . hash('sha256', $url);
        $siteId = self::insertOrRead($idKey, static function () { return wp_generate_uuid4(); });
        $key = self::optionKey($licenseKey);
        $candidate = self::insertOrRead($key, static function () use ($siteId, $url) {
            return ['siteId' => $siteId, 'siteUrl' => $url,
                'token' => 'msi_' . bin2hex(random_bytes(32)), 'active' => false];
        });
        return ['id' => $candidate['siteId'], 'url' => $url, 'token' => $candidate['token']];
    }

    /** Proof for refreshing a rotated license key, only from this same site URL. */
    public static function previousToken(): string
    {
        $key = get_option(self::CURRENT);
        $current = is_string($key) ? get_option($key) : null;
        return is_array($current) && !empty($current['active']) && $current['siteUrl'] === self::siteUrl()
            ? $current['token'] : '';
    }

    public static function confirm(string $licenseKey, $metadata): void
    {
        $key = self::optionKey($licenseKey);
        $candidate = get_option($key);
        if (!is_array($candidate) || !is_array($metadata) || empty($metadata['id']) ||
            ($metadata['siteId'] ?? '') !== $candidate['siteId'] || ($metadata['siteUrl'] ?? '') !== self::siteUrl()) {
            return;
        }
        $candidate['active'] = true;
        $candidate['remoteId'] = $metadata['id'];
        update_option($key, $candidate, false);
        update_option(self::CURRENT, $key, false);
    }

    public static function token(): string
    {
        $licenseKey = trim((string) Options::get('purchase_code'));
        if ($licenseKey === '') {
            return '';
        }
        $key = self::optionKey($licenseKey);
        $candidate = get_option($key);
        // Existing licensed installations enroll lazily without asking users to paste another token.
        if (empty($candidate['active']) && empty(self::$attempted[$key])) {
            self::$attempted[$key] = true;
            LicenseStatus::validate($licenseKey);
            $candidate = get_option($key);
        }
        return !empty($candidate['active']) ? $candidate['token'] : '';
    }

    public static function headers(): array
    {
        return ['Authorization' => 'Bearer ' . self::token(), 'X-MapSVG-Site' => self::siteUrl()];
    }

    public static function deactivate(): void
    {
        $licenseKey = trim((string) Options::get('purchase_code'));
        $key = self::optionKey($licenseKey);
        $candidate = get_option($key);
        if (!empty($candidate['active'])) {
            wp_remote_post(rtrim(MAPSVG_API_URL, '/') . '/site-credentials/deactivate', [
                'timeout' => 15, 'redirection' => 0,
                'headers' => ['Authorization' => 'Bearer ' . $candidate['token'], 'X-MapSVG-Site' => self::siteUrl()],
            ]);
            // Keep the candidate for safe retry if the remote deactivation response was lost.
            $candidate['active'] = false;
            update_option($key, $candidate, false);
        }
        delete_option(self::CURRENT);
    }
}
