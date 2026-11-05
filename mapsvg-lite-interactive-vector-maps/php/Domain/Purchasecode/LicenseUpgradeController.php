<?php
namespace MapSVG;

/** Installation-scoped purchase transport. License keys and ZIP capabilities stay in PHP. */
final class LicenseUpgradeController extends Controller
{
    private const SLUGS = ['mapsvg-personal', 'mapsvg-professional', 'mapsvg-business'];

    public static function register(): void
    {
        foreach ([
            '/license-upgrades/plans' => ['GET', 'plans'],
            '/license-upgrades/purchases' => ['POST', 'purchase'],
            '/license-upgrades/purchases/(?P<id>[a-fA-F0-9-]{36})' => ['GET', 'status'],
            '/license-upgrades/download' => ['GET', 'download'],
            '/license-upgrades/install-upload' => ['POST', 'installUpload'],
        ] as $route => $definition) {
            register_rest_route('mapsvg/v1', $route, ['methods' => $definition[0],
                'callback' => [self::class, $definition[1]], 'permission_callback' => [self::class, 'allowed']]);
        }
    }

    public static function allowed(): bool { return current_user_can('manage_options'); }
    private static function uuid($value): bool
    {
        return is_string($value) && (bool) preg_match('/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i', $value);
    }
    private static function reply(array $data, int $status = 200): \WP_REST_Response
    {
        $result = self::render($data, $status);
        $result->header('Cache-Control', 'private, no-store');
        return $result;
    }
    private static function failure(string $code, string $message, int $status = 502, array $extra = []): \WP_REST_Response
    {
        return self::reply(array_merge(['error' => $message, 'code' => $code], $extra), $status);
    }
    private static function runtimeQuery(): array
    {
        return ['lite_version' => defined('MAPSVG_VERSION') ? MAPSVG_VERSION : '0.0.0',
            'addon_api' => defined('MAPSVG_ADDON_API_VERSION') ? MAPSVG_ADDON_API_VERSION : 0];
    }
    private static function api(string $path, ?array $body = null)
    {
        if (!self::allowed()) return new \WP_Error('permission_denied', 'Only site administrators can upgrade MapSVG.', ['status' => 403]);
        if (SiteCredential::token() === '') return new \WP_Error('activation_required', 'Activate your MapSVG Lite license first.', ['status' => 403]);
        $url = rtrim(MAPSVG_API_URL, '/') . $path;
        $options = ['timeout' => 30, 'redirection' => 0, 'limit_response_size' => 131072,
            'headers' => array_merge(SiteCredential::headers(), ['Accept' => 'application/json', 'Content-Type' => 'application/json'])];
        if ($body !== null) $options['body'] = wp_json_encode($body);
        $response = $body === null ? wp_remote_get($url, $options) : wp_remote_post($url, $options);
        if (is_wp_error($response)) return new \WP_Error('upgrade_unavailable', 'Could not connect to MapSVG Dashboard. Please try again.', ['status' => 502]);
        $status = (int) wp_remote_retrieve_response_code($response);
        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (!in_array($status, [200, 201], true) || !is_array($data)) {
            $activation = in_array($status, [401, 403], true);
            $publicCode = is_array($data) ? ($data['code'] ?? '') : '';
            $knownCodes = ['upgrade_purchase_superseded', 'upgrade_purchase_canceled', 'upgrade_checkout_preparing', 'upgrade_payment_processing', 'upgrade_license_changed', 'upgrade_lite_update_required'];
            $code = $activation ? 'activation_required' : (in_array($publicCode, $knownCodes, true) ? $publicCode : 'upgrade_unavailable');
            $details = ['status' => in_array($status, [400, 401, 403, 409, 429], true) ? $status : 502];
            // Dashboard discloses recovery identity only to the order's authenticated site.
            if ($code === 'upgrade_payment_processing' && self::uuid($data['purchaseId'] ?? null) &&
                is_string($data['priceId'] ?? null) && preg_match('/^pri_[a-z0-9]+$/', $data['priceId'])) {
                $details['purchaseId'] = $data['purchaseId'];
                $details['priceId'] = $data['priceId'];
            }
            return new \WP_Error($code,
                $code === 'upgrade_lite_update_required' ? 'Update MapSVG Lite before purchasing. Reopen Upgrade to see the required version.' :
                ($activation ? 'Recheck your MapSVG license activation.' : ($status === 429 ? 'Too many upgrade requests. Please try again later.' : 'Could not prepare the upgrade. Please try again.')),
                $details);
        }
        return $data;
    }
    private static function apiError(\WP_Error $error, array $extra = []): \WP_REST_Response
    {
        $data = $error->get_error_data();
        if ($error->get_error_code() === 'upgrade_payment_processing' && isset($data['purchaseId'], $data['priceId'])) {
            $extra = array_merge($extra, ['purchaseId' => $data['purchaseId'], 'priceId' => $data['priceId']]);
        }
        return self::failure($error->get_error_code(), $error->get_error_message(), (int) ($data['status'] ?? 409), $extra);
    }
    private static function downloadLink(string $id): string
    {
        return add_query_arg(['purchaseId' => $id, '_wpnonce' => wp_create_nonce('wp_rest')], rest_url('mapsvg/v1/license-upgrades/download'));
    }
    private static function publicOrder(array $data, ?string $expected = null)
    {
        $id = $data['purchaseId'] ?? null;
        if (!self::uuid($id) || ($expected !== null && $id !== $expected) || !is_string($data['licenseId'] ?? null) ||
            !in_array($data['status'] ?? '', ['creating', 'ready', 'processing', 'fulfilled', 'failed', 'expired', 'superseded', 'canceled'], true) ||
            !in_array($data['slug'] ?? '', self::SLUGS, true)) {
            return new \WP_Error('invalid_upgrade_response', 'Invalid upgrade status returned by Dashboard.', ['status' => 502]);
        }
        $result = ['purchaseId' => $id, 'licenseId' => $data['licenseId'], 'status' => $data['status'], 'slug' => $data['slug']];
        if ($result['status'] === 'fulfilled') {
            $result['manualDownloadUrl'] = self::downloadLink($id);
        }
        $email = self::accountEmail($data['accountEmail'] ?? null);
        if ($email !== null) $result['accountEmail'] = $email;
        if (is_bool($data['matchesCurrentEntitlement'] ?? null))
            $result['matchesCurrentEntitlement'] = $data['matchesCurrentEntitlement'];
        return $result;
    }
    private static function accountEmail($value): ?string
    {
        return is_string($value) && strlen($value) <= 254 && filter_var($value, FILTER_VALIDATE_EMAIL)
            ? $value : null;
    }
    private static function verifiedOrder(string $id)
    {
        if (!self::uuid($id)) return new \WP_Error('invalid_purchase', 'Invalid upgrade purchase.', ['status' => 400]);
        $data = self::api('/license-upgrades/purchases/' . rawurlencode($id) . '/site');
        if (is_wp_error($data)) return $data;
        return self::publicOrder($data, $id);
    }
    public static function plans($request): \WP_REST_Response
    {
        $data = self::api('/license-upgrades/plans?' . http_build_query(self::runtimeQuery()));
        if (is_wp_error($data)) return self::apiError($data);
        $plans = [];
        foreach (is_array($data['plans'] ?? null) ? $data['plans'] : [] as $plan) {
            if (!is_array($plan) || !preg_match('/^pri_[a-z0-9]{26}$/', $plan['priceId'] ?? '') ||
                !in_array($plan['slug'] ?? '', self::SLUGS, true) || !is_string($plan['title'] ?? null) ||
                !is_int($plan['amountMinor'] ?? null) || $plan['amountMinor'] < 0 ||
                !preg_match('/^[A-Z]{3}$/', $plan['currency'] ?? '')) continue;
            $public = array_intersect_key($plan, array_flip(['priceId', 'slug', 'title', 'amountMinor', 'currency', 'billingCycle', 'numDomainsMax', 'description', 'version']));
            if (($plan['updateRequired'] ?? false) === true) {
                if (!is_string($plan['requiresLiteVersion'] ?? null) || !preg_match('/^\d+\.\d+\.\d+$/', $plan['requiresLiteVersion']) ||
                    !is_int($plan['requiresAddonApi'] ?? null) || $plan['requiresAddonApi'] < 1) continue;
                $public['updateRequired'] = true;
                $public['requiresLiteVersion'] = $plan['requiresLiteVersion'];
                $public['requiresAddonApi'] = $plan['requiresAddonApi'];
            }
            $quota = $plan['aiCredits'] ?? null;
            if (is_array($quota) && is_numeric($quota['qty'] ?? null) && !is_string($quota['qty']) &&
                is_finite((float) $quota['qty']) && $quota['qty'] >= 0 && $quota['qty'] <= 1000000 &&
                in_array($quota['period'] ?? '', ['day', 'week', 'month', 'year'], true)) {
                $public['aiCredits'] = ['qty' => $quota['qty'], 'period' => $quota['period']];
            }
            $plans[] = $public;
        }
        $license = is_array($data['license'] ?? null)
            ? array_intersect_key($data['license'], array_flip(['id', 'slug', 'name', 'status', 'eligible'])) : null;
        $installation = null;
        if (is_array($data['installation'] ?? null)) {
            $candidate = self::publicOrder(array_merge($data['installation'], ['licenseId' => $license['id'] ?? null]));
            if (!is_wp_error($candidate) && $candidate['status'] === 'fulfilled') $installation = $candidate;
        }
        $result = ['plans' => $plans, 'license' => $license, 'installation' => $installation,
            'uploadMaxBytes' => UploadedPaidAddonInstaller::maxUploadBytes()];
        $email = self::accountEmail($data['accountEmail'] ?? null);
        if ($email !== null) $result['accountEmail'] = $email;
        return self::reply($result);
    }
    public static function purchase($request): \WP_REST_Response
    {
        $body = $request->get_json_params();
        $price = is_array($body) && is_string($body['priceId'] ?? null) ? $body['priceId'] : '';
        $id = is_array($body) ? ($body['requestId'] ?? null) : null;
        if (!preg_match('/^pri_[a-z0-9]{26}$/', $price) || !self::uuid($id)) return self::failure('invalid_purchase', 'Choose a valid upgrade plan.', 400);
        $data = self::api('/license-upgrades/purchases?' . http_build_query(self::runtimeQuery()), ['priceId' => $price, 'requestId' => $id]);
        if (is_wp_error($data)) return self::apiError($data);
        $purchaseId = $data['purchaseId'] ?? null;
        $checkout = is_string($data['checkoutUrl'] ?? null) ? parse_url($data['checkoutUrl']) : false;
        $api = parse_url(MAPSVG_API_URL);
        $base = preg_replace('#/api/?$#', '', $api['path'] ?? '');
        if (!self::uuid($purchaseId) || !$checkout || isset($checkout['user']) || isset($checkout['pass']) || isset($checkout['query']) ||
            !in_array($checkout['scheme'] ?? '', ['http', 'https'], true) ||
            ($checkout['scheme'] ?? '') !== ($api['scheme'] ?? '') || ($checkout['host'] ?? '') !== ($api['host'] ?? '') ||
            ($checkout['port'] ?? null) !== ($api['port'] ?? null) ||
            ($checkout['path'] ?? '') !== $base . '/license-upgrades/checkout/' . $purchaseId ||
            !preg_match('/^token=[a-f0-9]{64}$/', $checkout['fragment'] ?? ''))
            return self::failure('invalid_upgrade_response', 'Invalid checkout returned by Dashboard.');
        return self::reply(['purchaseId' => $purchaseId, 'checkoutUrl' => $data['checkoutUrl']]);
    }
    public static function status($request): \WP_REST_Response
    {
        $data = self::verifiedOrder((string) $request['id']);
        return is_wp_error($data) ? self::apiError($data) : self::reply($data);
    }
    /** Explicit user upload only. No executable package is requested from Dashboard. */
    public static function installUpload($request): \WP_REST_Response
    {
        if (!self::allowed()) return self::failure('permission_denied', 'Only site administrators can install MapSVG add-ons.', 403);
        $files = $request->get_file_params();
        $file = is_array($files) ? ($files['pluginZip'] ?? null) : null;
        $path = is_array($file) && is_string($file['tmp_name'] ?? null) && is_uploaded_file($file['tmp_name'])
            ? $file['tmp_name'] : null;
        $fallback = [];
        $locked = false;
        global $wpdb;
        $lock = 'mapsvg_upload_' . substr(hash('sha256', (defined('DB_NAME') ? DB_NAME : '') . "\0" . ABSPATH), 0, 40);
        try {
            $capability = UploadedPaidAddonInstaller::capability();
            if (is_wp_error($capability)) return self::apiError($capability);
            $archive = UploadedPaidAddonInstaller::uploadedArchive($file);
            if (is_wp_error($archive)) return self::apiError($archive);
            $id = $request->get_param('purchaseId');
            if (!self::uuid($id)) return self::failure('invalid_purchase', 'Choose a valid completed upgrade purchase.', 400);
            $order = self::verifiedOrder($id);
            if (is_wp_error($order)) return self::apiError($order);
            if ($order['status'] !== 'fulfilled') return self::failure('payment_pending', 'Wait for your payment to be confirmed before installing the uploaded ZIP.', 409);
            if (($order['matchesCurrentEntitlement'] ?? false) !== true)
                return self::failure('upgrade_license_changed', 'Your license plan has changed. Reopen Upgrade to use the current plan, or open MapSVG Dashboard.', 409);
            $fallback = ['manualDownloadUrl' => self::downloadLink($id)];
            if ((string) $wpdb->get_var($wpdb->prepare('SELECT GET_LOCK(%s, 0)', $lock)) !== '1')
                return self::failure('installation_busy', 'Another add-on installation is running. Please retry shortly.', 409, $fallback);
            $locked = true;
            $result = UploadedPaidAddonInstaller::install($archive, $order['slug']);
            return is_wp_error($result) ? self::apiError($result, $fallback) : self::reply($result);
        } catch (\Throwable $error) {
            return self::failure('installation_failed', 'WordPress could not finish installing the uploaded ZIP. Retry or use Plugins → Add New Plugin → Upload Plugin.', 500, $fallback);
        } finally {
            if ($locked) $wpdb->get_var($wpdb->prepare('SELECT RELEASE_LOCK(%s)', $lock));
            if ($path !== null) @unlink($path);
        }
    }
    public static function download($request): \WP_REST_Response
    {
        $order = self::verifiedOrder((string) $request['purchaseId']);
        if (is_wp_error($order)) return self::apiError($order);
        if ($order['status'] !== 'fulfilled') return self::failure('payment_pending', 'Your payment has not been confirmed.', 409);
        // Browser download only. The separate installer accepts an explicit user upload,
        // never a package URL or a server-fetched executable archive.
        $data = self::api('/license-upgrades/purchases/' . rawurlencode($order['purchaseId']) . '/download?' . http_build_query(self::runtimeQuery()), []);
        if (is_wp_error($data)) return self::apiError($data);
        $version = $data['version'] ?? '';
        $target = is_string($data['downloadUrl'] ?? null) ? parse_url($data['downloadUrl']) : false;
        $api = parse_url(MAPSVG_API_URL);
        $query = [];
        if ($target && isset($target['query'])) parse_str($target['query'], $query);
        if (($data['slug'] ?? null) !== $order['slug'] || !is_string($version) || !preg_match('/^\d+\.\d+\.\d+$/', $version) ||
            !$target || isset($target['user']) || isset($target['pass']) || isset($target['fragment']) ||
            !in_array($target['scheme'] ?? '', ['http', 'https'], true) ||
            ($target['scheme'] ?? '') !== ($api['scheme'] ?? '') || ($target['host'] ?? '') !== ($api['host'] ?? '') ||
            ($target['port'] ?? null) !== ($api['port'] ?? null) ||
            ($target['path'] ?? '') !== rtrim($api['path'] ?? '', '/') . '/addon-downloads/' . $order['slug'] . '/' . $version ||
            count($query) !== 2 || ($query['purchaseId'] ?? null) !== $order['purchaseId'] ||
            !is_string($query['token'] ?? null) || !preg_match('/^[a-f0-9]{64}$/', $query['token']))
            return self::failure('invalid_download_response', 'Could not prepare a secure download. Open MapSVG Dashboard to download Paid.');
        $url = rtrim(MAPSVG_API_URL, '/') . '/addon-downloads/' . $order['slug'] . '/' . $version . '?' .
            http_build_query(['purchaseId' => $order['purchaseId'], 'token' => $query['token']]);
        $response = self::reply([], 303);
        $response->header('Location', $url);
        $response->header('Referrer-Policy', 'no-referrer');
        return $response;
    }
}
