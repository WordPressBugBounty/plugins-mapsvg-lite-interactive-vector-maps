<?php

namespace MapSVG;

/**
 * Validates MapSVG license against mapsvg.com API for the current domain.
 * Caches result in Options for Plugins list notices.
 */
class LicenseStatus
{
	const OPTION_KEY = 'license_status';
	const CACHE_TTL = 86400; // 24 hours

	const CODE_INVALID_KEY = 'invalid_key';
	const CODE_INACTIVE = 'inactive';
	const CODE_PRODUCT_MISMATCH = 'product_mismatch';
	const CODE_USER_MISMATCH = 'user_mismatch';
	const CODE_DOMAIN_REQUIRED = 'domain_required';
	const CODE_DOMAIN_BLOCKED = 'domain_blocked';
	const CODE_DOMAIN_LIMIT = 'domain_limit';
	const CODE_DOMAIN_MISMATCH = 'domain_mismatch';
	const CODE_DOMAIN_NOT_REGISTERED = 'domain_not_registered';
	const CODE_LOCALHOST_PENDING = 'localhost_pending';
	/** @deprecated Prefer localhost_pending (manual Allow). */
	const CODE_LOCALHOST_LIMIT = 'localhost_limit';
	const CODE_BAD_REQUEST = 'bad_request';
	const CODE_UPSTREAM = 'upstream';

	const CONNECTION_ERROR_MESSAGE = 'Could not connect to MapSVG Dashboard. Please try again.';

	/** @var string[] */
	const KNOWN_CODES = [
		self::CODE_INVALID_KEY,
		self::CODE_INACTIVE,
		self::CODE_PRODUCT_MISMATCH,
		self::CODE_USER_MISMATCH,
		self::CODE_DOMAIN_REQUIRED,
		self::CODE_DOMAIN_BLOCKED,
		self::CODE_DOMAIN_LIMIT,
		self::CODE_DOMAIN_MISMATCH,
		self::CODE_DOMAIN_NOT_REGISTERED,
		self::CODE_LOCALHOST_PENDING,
		self::CODE_LOCALHOST_LIMIT,
		self::CODE_BAD_REQUEST,
		self::CODE_UPSTREAM,
	];

	/**
	 * Host sent to Dashboard for license checks (from home_url).
	 * Dashboard stores the full hostname (www stripped); multisite subdomains are distinct slots.
	 */
	public static function currentDomain()
	{
		$host = wp_parse_url(home_url(), PHP_URL_HOST);
		return is_string($host) ? strtolower($host) : '';
	}

	/**
	 * @return array{
	 *   ok: bool,
	 *   message: string,
	 *   code: string,
	 *   checkedAt: int,
	 *   warning: string,
	 *   warningCode: string,
	 *   domainsUsed: int|null,
	 *   domainsMax: int|null
	 * }
	 */
	public static function getCached()
	{
		$defaults = [
			'ok' => false,
			'message' => '',
			'code' => '',
			'checkedAt' => 0,
			'warning' => '',
			'warningCode' => '',
			'domainsUsed' => null,
			'domainsMax' => null,
		];
		$raw = Options::get(self::OPTION_KEY);
		if (is_string($raw) && $raw !== '') {
			$decoded = json_decode($raw, true);
			if (is_array($decoded)) {
				$merged = array_merge($defaults, $decoded);
				$merged['code'] = self::normalizeCode($merged['code'] ?? '');
				$merged['warningCode'] = self::normalizeCode($merged['warningCode'] ?? '');
				return $merged;
			}
		}
		return $defaults;
	}

	/**
	 * @param bool $ok
	 * @param string $message
	 * @param string $code
	 * @param array{warning?: string, warningCode?: string, domainsUsed?: int|null, domainsMax?: int|null} $extra
	 */
	public static function setCached($ok, $message = '', $code = '', $extra = [])
	{
		$ok = (bool) $ok;
		$payload = [
			'ok' => $ok,
			'message' => (string) $message,
			'code' => $ok ? '' : self::normalizeCode($code),
			'checkedAt' => time(),
			'warning' => '',
			'warningCode' => '',
			'domainsUsed' => null,
			'domainsMax' => null,
		];
		if ($ok) {
			$wCode = self::normalizeCode($extra['warningCode'] ?? '');
			if ($wCode === self::CODE_DOMAIN_LIMIT) {
				$payload['warning'] = (string) ($extra['warning'] ?? self::defaultMessageForCode(self::CODE_DOMAIN_LIMIT));
				$payload['warningCode'] = $wCode;
				if (isset($extra['domainsUsed']) && $extra['domainsUsed'] !== null && $extra['domainsUsed'] !== '') {
					$payload['domainsUsed'] = (int) $extra['domainsUsed'];
				}
				if (isset($extra['domainsMax']) && $extra['domainsMax'] !== null && $extra['domainsMax'] !== '') {
					$payload['domainsMax'] = (int) $extra['domainsMax'];
				}
			}
		}
		Options::set(self::OPTION_KEY, wp_json_encode($payload));
	}

	/**
	 * Accept only known API codes — no message-text inference.
	 */
	public static function normalizeCode($code)
	{
		$code = is_string($code) ? trim($code) : '';
		if ($code !== '' && in_array($code, self::KNOWN_CODES, true)) {
			return $code;
		}
		return '';
	}

	/**
	 * Upstream / Envato / generic HTTP failures — not actionable license messages.
	 * Do not cache or show on admin boot; Activate still returns them for growl.
	 */
	public static function isTransientUpstreamError($message)
	{
		$m = strtolower((string) $message);
		if ($m === '') {
			return false;
		}
		$needles = [
			'failed to validate code due to an error',
			'failed to query envato',
			'envato token is not set',
			'could not connect to mapsvg dashboard',
		];
		foreach ($needles as $needle) {
			if (strpos($m, $needle) !== false) {
				return true;
			}
		}
		// "… HTTP 403" / "HTTP 502" etc. from upstream wrappers
		if (preg_match('/\bhttp\s*[45]\d{2}\b/', $m)) {
			return true;
		}
		return false;
	}

	/**
	 * True when Dashboard did not return a license JSON payload (network / timeout / empty).
	 * API license rejections always include an error or message field.
	 *
	 * @param array|null $response
	 * @param mixed $data
	 */
	public static function isConnectionFailure($response, $data)
	{
		if (is_array($data) && !empty($data['error']) && self::isTransientUpstreamError($data['error'])) {
			return true;
		}
		if (is_array($data) && (!empty($data['error']) || !empty($data['message']))) {
			return false;
		}
		if (!$response || !is_array($response)) {
			return true;
		}
		if (!empty($response['error_message'])) {
			return true;
		}
		$httpOk = isset($response['status']) && $response['status'] === 'OK';
		return !$httpOk || !is_array($data);
	}

    /** License identity follows the selected v9 paid add-on; standalone remains unchanged. */
    public static function productSlug(): string
    {
        if (defined('MAPSVG_PLAN') && MAPSVG_PLAN === 'mapsvg-lite' &&
            class_exists('\\MapSVG\\Core\\PaidAddonRegistry')) {
            $selected = \MapSVG\Core\PaidAddonRegistry::instance()->selected();
            if ($selected && in_array($selected['slug'], ['mapsvg-personal', 'mapsvg-professional', 'mapsvg-business', 'mapsvg-starter', 'mapsvg-plus', 'mapsvg-pro', 'mapsvg-elite', 'mapsvg-envato'], true)) {
                return $selected['slug'];
            }
        }
        return MAPSVG_PLAN;
    }

	/**
	 * @param string $licenseKey
	 * @param bool $persistFailure
	 * @return array{ok: bool, message: string, code?: string, error?: string, connectionError?: bool}
	 */
	public static function validate($licenseKey, $persistFailure = true)
	{
		$domain = self::currentDomain();
		$url = MAPSVG_API_URL . '/licenses/' . rawurlencode($licenseKey) . '/validate/' . rawurlencode(self::productSlug());
		$url = add_query_arg([
			'domain' => $domain,
			'installed_version' => defined('MAPSVG_VERSION') ? MAPSVG_VERSION : '',
		], $url);

		$response = self::fetch($url, $domain, $licenseKey);
		$error = 'Something went wrong';
		$code = '';
		$data = null;

		if ($response && isset($response['body']) && $response['body'] !== '') {
			$data = json_decode($response['body'], true);
			if (is_array($data) && !empty($data['error'])) {
				$error = $data['error'];
				$code = isset($data['code']) ? (string) $data['code'] : '';
			} elseif (!empty($response['error_message'])) {
				$error = $response['error_message'];
			}
		} elseif (!empty($response['error_message'])) {
			$error = $response['error_message'];
		}

		$code = self::normalizeCode($code);
		$httpOk = isset($response['status']) && $response['status'] === 'OK';
		$hasError = is_array($data) && !empty($data['error']);
		$hasMessage = is_array($data) && !empty($data['message']);

		if ($httpOk && !$hasError && $hasMessage) {
			SiteCredential::confirm($licenseKey, $data['connectedSite'] ?? null);
			$extra = self::parseWarningExtra(is_array($data) ? $data : []);
			self::setCached(true, '', '', $extra);
			$out = ['ok' => true, 'message' => $data['message'], 'code' => ''];
			if (!empty($extra['warningCode'])) {
				$out['warning'] = $extra['warning'];
				$out['warningCode'] = $extra['warningCode'];
				if (array_key_exists('domainsUsed', $extra)) {
					$out['domainsUsed'] = $extra['domainsUsed'];
				}
				if (array_key_exists('domainsMax', $extra)) {
					$out['domainsMax'] = $extra['domainsMax'];
				}
			}
			return $out;
		}

		if (self::isConnectionFailure($response, $data) || self::isTransientUpstreamError($error)) {
			$error = self::CONNECTION_ERROR_MESSAGE;
			return [
				'ok' => false,
				'message' => $error,
				'error' => $error,
				'code' => self::CODE_UPSTREAM,
				'connectionError' => true,
			];
		}

		// Background refresh only: persist failure for the saved purchase_code.
		if ($persistFailure) {
			$savedKey = Options::get('purchase_code');
			if (is_string($savedKey) && $savedKey !== '' && $savedKey === $licenseKey) {
				self::setCached(false, $error, $code);
			}
		}

		return ['ok' => false, 'message' => $error, 'error' => $error, 'code' => $code];
	}

	/**
	 * Local dashboard (localhost / 127.0.0.1) bypasses SafeRemoteUrl SSRF block used by Remote::get.
	 */
	private static function fetch($url, $domain, $licenseKey)
	{
		$host = wp_parse_url($url, PHP_URL_HOST);
		$host = is_string($host) ? strtolower($host) : '';
		$isLocal = in_array($host, ['localhost', '127.0.0.1', '::1'], true);
		$args = [
			'timeout' => 30,
			'headers' => [
				'Content-Type' => 'application/json',
				'X-MapSVG-Domain' => $domain,
			],
			'redirection' => 0,
			'body' => wp_json_encode(['domain' => $domain, 'site' => SiteCredential::prepare($licenseKey)]),
		];
		$previousToken = SiteCredential::previousToken();
		if ($previousToken !== '') {
			$args['headers']['Authorization'] = 'Bearer ' . $previousToken;
		}

		if (!$isLocal) {
			return Remote::post($url, $args);
		}

		$response = wp_remote_post($url, array_merge($args, [
			'sslverify' => false,
		]));

		if (is_wp_error($response)) {
			return [
				'body' => '',
				'status' => 'ERROR',
				'error_message' => $response->get_error_message(),
			];
		}

		$code = (int) wp_remote_retrieve_response_code($response);
		return [
			'body' => wp_remote_retrieve_body($response),
			'status' => ($code >= 200 && $code < 300) ? 'OK' : 'ERROR',
			'http_code' => $code,
		];
	}

	/**
	 * Cached / displayed messages that came from network failures (pre-fix leftovers).
	 */
	public static function looksLikeConnectionMessage($message)
	{
		if (self::isTransientUpstreamError($message)) {
			return true;
		}
		$m = strtolower((string) $message);
		if ($m === '') {
			return false;
		}
		$needles = [
			'could not connect',
			'curl error',
			'failed to connect',
			'connection refused',
			'timed out',
			'timeout',
			'name or service not known',
			'could not resolve',
			'network is unreachable',
		];
		foreach ($needles as $needle) {
			if (strpos($m, $needle) !== false) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Fallback copy when cache has a known code but an empty message
	 * (e.g. manual DB edits / partial writes).
	 */
	public static function defaultMessageForCode($code)
	{
		switch (self::normalizeCode($code)) {
			case self::CODE_INACTIVE:
				return 'This MapSVG license has been cancelled.';
			case self::CODE_INVALID_KEY:
				return 'Invalid license key.';
			case self::CODE_PRODUCT_MISMATCH:
				return 'This license key is for a different product.';
			case self::CODE_USER_MISMATCH:
				return 'This license key belongs to a different account.';
			case self::CODE_DOMAIN_REQUIRED:
				return 'A domain is required for this license.';
			case self::CODE_DOMAIN_BLOCKED:
				return 'Domain is blocked for this license.';
			case self::CODE_DOMAIN_LIMIT:
				return 'Domain limit reached.';
			case self::CODE_DOMAIN_MISMATCH:
				return 'This domain is not allowed for this license.';
			case self::CODE_DOMAIN_NOT_REGISTERED:
				return 'This domain is not registered for this license. Add it in the MapSVG Dashboard.';
			case self::CODE_LOCALHOST_PENDING:
			case self::CODE_LOCALHOST_LIMIT:
				return 'This site is on localhost / .local domain. Confirm the installation in MapSVG Dashboard. ';
			case self::CODE_UPSTREAM:
				return self::CONNECTION_ERROR_MESSAGE;
			default:
				return '';
		}
	}

	/**
	 * Prefer API message; fall back to code default.
	 */
	public static function resolveDisplayMessage($message, $code = '')
	{
		$message = trim((string) $message);
		if ($message !== '' && self::looksLikeConnectionMessage($message)) {
			return self::CONNECTION_ERROR_MESSAGE;
		}
		if ($message !== '') {
			return $message;
		}
		if (self::normalizeCode($code) === self::CODE_UPSTREAM) {
			return self::CONNECTION_ERROR_MESSAGE;
		}
		return self::defaultMessageForCode($code);
	}

	/**
	 * Soft domain-limit warning while license remains ok (updates stay enabled).
	 */
	public static function shouldShowDomainLimitWarning($hasCode, array $status)
	{
		if (!$hasCode || empty($status['ok'])) {
			return false;
		}
		return self::normalizeCode($status['warningCode'] ?? '') === self::CODE_DOMAIN_LIMIT;
	}

	/**
	 * Build soft-warn copy from cache counts / API warning text.
	 */
	public static function softDomainLimitMessage(array $status)
	{
		$used = $status['domainsUsed'] ?? null;
		$max = $status['domainsMax'] ?? null;
		if ($used !== null && $max !== null && $used !== '' && $max !== '') {
			return 'Domain limit reached (' . (int) $used . '/' . (int) $max . ').';
		}
		$fromWarning = trim((string) ($status['warning'] ?? ''));
		if ($fromWarning !== '') {
			if (preg_match('/^Domain limit reached \((\d+)\/(\d+)\)/i', $fromWarning, $m)) {
				return 'Domain limit reached (' . $m[1] . '/' . $m[2] . ').';
			}
			return $fromWarning;
		}
		return self::defaultMessageForCode(self::CODE_DOMAIN_LIMIT);
	}

	public static function formatDomainLimitSoftAlertHtml($message, $withBootstrapIcon = true)
	{
		return self::formatMessageHtml($message)
			. ' Updates still work until October 1. After that, only the first domains on your plan'
			. ' (by registration order) will keep automatic updates.'
			. ' Removing hostnames in the '
			. self::dashboardLinkHtml('MapSVG Dashboard', $withBootstrapIcon)
			. ' is not enough while MapSVG stays active on those sites — they re-register on the next update check.'
			. ' Deactivate MapSVG or switch license on extra sites, then clean the list (or upgrade your plan).';
	}

	public static function formatDomainLimitSoftModalAlertHtml($message, $withBootstrapIcon = true)
	{
		return self::formatMessageHtml($message)
			. ' Updates still work until October 1. Deactivate MapSVG on extra sites'
			. ' (or upgrade) before then — Dashboard removals alone are re-added on the next update check.'
			. ' Details: '
			. self::dashboardLinkHtml('MapSVG Dashboard', $withBootstrapIcon)
			. '.';
	}

	/**
	 * @param array $data Decoded API body
	 * @return array{warning?: string, warningCode?: string, domainsUsed?: int|null, domainsMax?: int|null}
	 */
	private static function parseWarningExtra(array $data)
	{
		$warning = isset($data['warning']) && is_array($data['warning']) ? $data['warning'] : null;
		if (!$warning) {
			return [];
		}
		$code = self::normalizeCode($warning['code'] ?? '');
		if ($code !== self::CODE_DOMAIN_LIMIT) {
			return [];
		}
		$extra = [
			'warning' => (string) ($warning['error'] ?? self::defaultMessageForCode(self::CODE_DOMAIN_LIMIT)),
			'warningCode' => $code,
		];
		if (isset($warning['domainsUsed'])) {
			$extra['domainsUsed'] = (int) $warning['domainsUsed'];
		}
		if (isset($warning['domainsMax'])) {
			$extra['domainsMax'] = (int) $warning['domainsMax'];
		}
		return $extra;
	}

	/**
	 * Whether the admin page/modal should surface a license failure.
	 * Driven by known error codes and/or a non-connection message.
	 */
	public static function shouldShowAdminError($hasCode, $ok, $message = '', $code = '')
	{
		if (!$hasCode || $ok) {
			return false;
		}
		$c = self::normalizeCode($code);
		if ($c === self::CODE_UPSTREAM || $c === self::CODE_BAD_REQUEST) {
			return false;
		}
		$display = self::resolveDisplayMessage($message, $c);
		if ($display === '') {
			return false;
		}
		if (self::looksLikeConnectionMessage($display)) {
			return false;
		}
		return $c !== '' || trim((string) $message) !== '';
	}

	/**
	 * Escape license message for HTML; wrap domain name in <em> when present.
	 * e.g. "Domain localhost is blocked..." → Domain <em>localhost</em> is blocked...
	 */
	public static function formatMessageHtml($message)
	{
		$message = (string) $message;
		if (preg_match('/^Domain\s+(\S+)\s+is blocked/i', $message, $m)) {
			return 'Domain <em>' . esc_html($m[1]) . '</em> is blocked for this license.';
		}
		if (preg_match('/^Domain\s+(\S+)\s+is not registered/i', $message, $m)) {
			return 'Domain <em>' . esc_html($m[1]) . '</em> is not registered for this license. Add it in the MapSVG Dashboard.';
		}
		if (preg_match('/^Domain limit reached \((\d+)\/(\d+)\)/i', $message, $m)) {
			return 'Domain limit reached (' . esc_html($m[1]) . '/' . esc_html($m[2]) . ').';
		}
		if (preg_match('/^Domain limit reached\.?$/i', $message)) {
			return 'Domain limit reached.';
		}
		return esc_html($message);
	}

	public static function isInactiveLicenseMessage($message, $code = '')
	{
		return self::normalizeCode($code) === self::CODE_INACTIVE;
	}

	public static function isInvalidLicenseKeyMessage($message, $code = '')
	{
		$c = self::normalizeCode($code);
		return $c === self::CODE_INVALID_KEY || $c === self::CODE_PRODUCT_MISMATCH;
	}

	/**
	 * Cancelled / invalid key — show "Enter new license key" CTA.
	 */
	public static function needsNewLicenseKeyCta($message, $code = '')
	{
		$c = self::normalizeCode($code);
		return in_array($c, [
			self::CODE_INACTIVE,
			self::CODE_INVALID_KEY,
			self::CODE_PRODUCT_MISMATCH,
		], true);
	}

	/**
	 * Domain blocked / domain limit — actionable via Dashboard domain settings.
	 * localhost_limit is included for recheck CTA (not Dashboard domain cleanup).
	 */
	public static function isDomainRelatedMessage($message, $code = '')
	{
		$c = self::normalizeCode($code);
		return in_array($c, [
			self::CODE_DOMAIN_BLOCKED,
			self::CODE_DOMAIN_LIMIT,
			self::CODE_DOMAIN_MISMATCH,
			self::CODE_DOMAIN_NOT_REGISTERED,
			self::CODE_LOCALHOST_PENDING,
			self::CODE_LOCALHOST_LIMIT,
		], true);
	}

	/**
	 * Mask a license key as ****-****-****-ABCD (last segment visible).
	 */
	public static function maskLicenseKey($key)
	{
		$key = trim((string) $key);
		if ($key === '') {
			return '';
		}
		if (preg_match('/^(?:[^-]+-){3}([^-]+)$/', $key, $m)) {
			return '****-****-****-' . $m[1];
		}
		$len = strlen($key);
		if ($len <= 4) {
			return str_repeat('*', $len);
		}
		return str_repeat('*', $len - 4) . substr($key, -4);
	}

	public static function dashboardLinkHtml($label = 'MapSVG Dashboard', $withBootstrapIcon = true)
	{
		$icon = $withBootstrapIcon
			? ' <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i>'
			: '';
		return '<a href="https://mapsvg.com/dashboard" target="_blank" rel="noopener noreferrer">'
			. esc_html($label)
			. $icon
			. '</a>';
	}

	/**
	 * Full alert body for page header / Plugins notice (may pair with action buttons).
	 */
	public static function formatAlertHtml($message, $withBootstrapIcon = true, $code = '')
	{
		$c = self::normalizeCode($code);
		$message = self::resolveDisplayMessage($message, $c);

		if ($c === self::CODE_INACTIVE) {
			return '<strong>This MapSVG license has been cancelled.</strong> Check license status in the '
				. self::dashboardLinkHtml('MapSVG Dashboard', $withBootstrapIcon)
				. '.';
		}

		if ($c === self::CODE_INVALID_KEY || $c === self::CODE_PRODUCT_MISMATCH) {
			return '<strong>MapSVG license error:</strong> ' . self::formatMessageHtml($message);
		}

		if ($c === self::CODE_LOCALHOST_PENDING || $c === self::CODE_LOCALHOST_LIMIT) {
			return '<strong>MapSVG license pending:</strong> '
				. self::formatMessageHtml($message)
				. '<br /> Open '
				. self::dashboardLinkHtml('MapSVG Dashboard', $withBootstrapIcon) . ' → Domains → Local, allow this installation, then click “I updated domain settings”.';
		}

		if (
			$c === self::CODE_DOMAIN_BLOCKED
			|| $c === self::CODE_DOMAIN_LIMIT
			|| $c === self::CODE_DOMAIN_MISMATCH
			|| $c === self::CODE_DOMAIN_NOT_REGISTERED
		) {
			return '<strong>MapSVG license error:</strong> '
				. self::formatMessageHtml($message)
				. ' Updates are disabled. Change your domain settings in the '
				. self::dashboardLinkHtml('MapSVG Dashboard', $withBootstrapIcon)
				. '.';
		}

		return '<strong>MapSVG license error:</strong> ' . self::formatMessageHtml($message);
	}

	/**
	 * Short alert body for the license modal (no action buttons, no "Updates are disabled").
	 */
	public static function formatModalAlertHtml($message, $withBootstrapIcon = true, $code = '')
	{
		$c = self::normalizeCode($code);
		$message = self::resolveDisplayMessage($message, $c);

		if ($c === self::CODE_INACTIVE) {
			return 'This MapSVG license has been cancelled. Check license status in the '
				. self::dashboardLinkHtml('MapSVG Dashboard', $withBootstrapIcon)
				. '.';
		}

		if ($c === self::CODE_LOCALHOST_PENDING || $c === self::CODE_LOCALHOST_LIMIT) {
			return self::formatMessageHtml($message)
				. '<br /> Open '
				. self::dashboardLinkHtml('MapSVG Dashboard', $withBootstrapIcon);
		}

		if (
			$c === self::CODE_DOMAIN_BLOCKED
			|| $c === self::CODE_DOMAIN_LIMIT
			|| $c === self::CODE_DOMAIN_MISMATCH
			|| $c === self::CODE_DOMAIN_NOT_REGISTERED
		) {
			return self::formatMessageHtml($message)
				. ' Change your domain settings in the '
				. self::dashboardLinkHtml('MapSVG Dashboard', $withBootstrapIcon)
				. '.';
		}

		return self::formatMessageHtml($message);
	}

	/**
	 * Refresh cache if missing/stale (used on plugins.php).
	 * Connection failures leave the previous cache unchanged.
	 */
	public static function maybeRefresh($force = false)
	{
		$key = Options::get('purchase_code');
		if (!$key) {
			self::setCached(false, 'Enter your MapSVG purchase code to enable updates.');
			return self::getCached();
		}

		$cached = self::getCached();
		$stale = empty($cached['checkedAt']) || (time() - (int) $cached['checkedAt']) > self::CACHE_TTL;
		if ($force || $stale) {
			$result = self::validate($key);
			if (!empty($result['connectionError'])) {
				return self::getCached();
			}
			return $result;
		}
		return $cached;
	}
}
