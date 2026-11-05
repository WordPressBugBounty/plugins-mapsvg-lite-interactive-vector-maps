<?php

namespace MapSVG;

/**
 * Controller Class for purchase code.
 * @package MapSVG
 */
class PurchasecodeController extends Controller
{

	/**
	 * Checks and updates purchase code in the database
	 * @param $request
	 *
	 * @return \WP_REST_Response
	 */
	public static function update($request)
	{

		$licenseKey = $request['purchase_code'];

		$result = LicenseStatus::validate($licenseKey, false);

		$code = isset($result['code']) ? LicenseStatus::normalizeCode($result['code']) : '';
		$isLocalhostPending = $code === LicenseStatus::CODE_LOCALHOST_PENDING
			|| $code === LicenseStatus::CODE_LOCALHOST_LIMIT;

		// Save key on success and on localhost pending so Recheck / Allow flow works.
		if (!empty($result['ok']) || $isLocalhostPending) {
			Options::set('purchase_code', $licenseKey);
		}

		if (!empty($result['ok'])) {
			$payload = [];
			if (!empty($result['warningCode'])) {
				$payload['warning'] = $result['warning'] ?? '';
				$payload['warningCode'] = $result['warningCode'];
				if (isset($result['domainsUsed'])) {
					$payload['domainsUsed'] = $result['domainsUsed'];
				}
				if (isset($result['domainsMax'])) {
					$payload['domainsMax'] = $result['domainsMax'];
				}
			}
			return self::render($payload, 200);
		}

		if ($isLocalhostPending) {
			LicenseStatus::setCached(
				false,
				$result['error'] ?? $result['message'] ?? '',
				$code
			);
		}

		$payload = ['error' => $result['error'] ?? $result['message']];
		if (!empty($result['code'])) {
			$payload['code'] = $result['code'];
		}
		if (!empty($result['connectionError'])) {
			$payload['connectionError'] = true;
		}
		return self::render($payload, 400);
	}

	/**
	 * Clear the saved license key on this site only (no Dashboard domain remove).
	 *
	 * @param mixed $request
	 * @return \WP_REST_Response
	 */
	public static function deactivate($request)
	{
		SiteCredential::deactivate();
		Options::delete('purchase_code');
		Options::set('license_activate_prompt_dismissed', 0);
		LicenseStatus::setCached(false, 'Enter your MapSVG purchase code to enable updates.');
		return self::render(['ok' => true], 200);
	}

	/** Proxy the site-specific support identity; never send its bearer secret to JavaScript. */
	public static function supportIdentity($request)
	{
		if (SiteCredential::token() === '') {
			return self::render(['error' => 'Activate your MapSVG license to connect support.'], 403);
		}
		$response = wp_remote_get(rtrim(MAPSVG_API_URL, '/') . '/gleap/identity', [
			'timeout' => 20, 'redirection' => 0, 'headers' => SiteCredential::headers(),
		]);
		if (is_wp_error($response)) {
			return self::render(['error' => LicenseStatus::CONNECTION_ERROR_MESSAGE], 502);
		}
		$status = (int) wp_remote_retrieve_response_code($response);
		$data = json_decode(wp_remote_retrieve_body($response), true);
		if ($status !== 200 || !is_array($data) || empty($data['userId']) || empty($data['hash'])) {
			return self::render(['error' => 'Could not connect support. Recheck your license activation.'], $status >= 400 ? $status : 502);
		}
		return self::render($data, 200);
	}
}
