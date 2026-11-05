<?php

namespace MapSVG;

/** Installation-level usage/onboarding transport; credentials stay on the server. */
class AiUsageController extends Controller
{
    public static function register(): void
    {
        register_rest_route('mapsvg/v1', '/ai/usage', [
            'methods' => 'GET', 'callback' => [self::class, 'usage'],
            'permission_callback' => [self::class, 'allowed'],
        ]);
        register_rest_route('mapsvg/v1', '/ai/credit-packs', [
            'methods' => 'GET', 'callback' => [self::class, 'creditPacks'],
            'permission_callback' => [self::class, 'allowed'],
        ]);
        register_rest_route('mapsvg/v1', '/ai/credit-purchases', [
            'methods' => 'POST', 'callback' => [self::class, 'creditPurchase'],
            'permission_callback' => [self::class, 'allowed'],
        ]);
        register_rest_route('mapsvg/v1', '/ai/lite-enrollment', [
            'methods' => 'POST', 'callback' => [self::class, 'enroll'],
            'permission_callback' => [self::class, 'allowed'],
        ]);
    }

    public static function allowed(): bool
    {
        return current_user_can('manage_options');
    }

    private static function reply(array $data, int $status = 200): \WP_REST_Response
    {
        $response = self::render($data, $status);
        $response->header('Cache-Control', 'private, no-store');
        return $response;
    }

    public static function usage($request): \WP_REST_Response
    {
        if (!self::allowed()) {
            return self::reply(['error' => 'Only site administrators can view AI usage.'], 403);
        }
        if (SiteCredential::token() === '') {
            return self::reply(['error' => 'Activate your MapSVG license to access AI features.', 'code' => 'activation_required'], 403);
        }
        $response = wp_remote_get(rtrim(MAPSVG_API_URL, '/') . '/ai-usage/site', [
            'timeout' => 20, 'redirection' => 0, 'limit_response_size' => 262144,
            'headers' => array_merge(SiteCredential::headers(), ['Accept' => 'application/json']),
        ]);
        if (is_wp_error($response)) {
            return self::reply(['error' => LicenseStatus::CONNECTION_ERROR_MESSAGE], 502);
        }
        $status = (int) wp_remote_retrieve_response_code($response);
        $data = json_decode(wp_remote_retrieve_body($response), true);
        if ($status !== 200 || !is_array($data) || !isset($data['licenses']) || !is_array($data['licenses'])) {
            $activationRequired = in_array($status, [401, 403], true);
            return self::reply([
                'error' => $activationRequired
                    ? 'Recheck your MapSVG license activation to access AI usage.'
                    : 'Could not load AI usage. Please try again.',
                'code' => $activationRequired ? 'activation_required' : 'usage_unavailable',
            ], $activationRequired ? 403 : 502);
        }
        // This API is explicitly site/license-scoped. Do not proxy account sessions or caller IDs.
        return self::reply(['licenses' => $data['licenses']]);
    }

    private static function creditRequest(string $path, ?array $body = null): \WP_REST_Response
    {
        if (!self::allowed()) return self::reply(['error' => 'Only site administrators can buy AI credits.'], 403);
        if (SiteCredential::token() === '') return self::reply(['error' => 'Activate your license first.', 'code' => 'activation_required'], 403);
        $options = ['timeout' => 20, 'redirection' => 0, 'limit_response_size' => 32768,
            'headers' => array_merge(SiteCredential::headers(), ['Accept' => 'application/json', 'Content-Type' => 'application/json'])];
        if ($body !== null) $options['body'] = wp_json_encode($body);
        $url = rtrim(MAPSVG_API_URL, '/') . $path;
        $response = $body === null ? wp_remote_get($url, $options) : wp_remote_post($url, $options);
        if (is_wp_error($response)) return self::reply(['error' => LicenseStatus::CONNECTION_ERROR_MESSAGE], 502);
        $status = (int) wp_remote_retrieve_response_code($response);
        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (!in_array($status, [200, 201], true) || !is_array($data)) {
            return self::reply(['error' => in_array($status, [401, 403], true) ? 'Recheck your license activation.' : 'Could not prepare checkout. Please try again.',
                'code' => in_array($status, [401, 403], true) ? 'activation_required' : 'checkout_unavailable'], in_array($status, [400, 401, 403, 409, 429], true) ? $status : 502);
        }
        if ($body === null) {
            $packs = [];
            foreach ((is_array($data['packs'] ?? null) ? $data['packs'] : []) as $pack) {
                if (!is_array($pack) || !isset($pack['priceId'], $pack['credits'], $pack['amountMinor'], $pack['currency'])) continue;
                $packs[] = ['priceId' => (string)$pack['priceId'], 'credits' => (int)$pack['credits'], 'amountMinor' => (int)$pack['amountMinor'], 'currency' => (string)$pack['currency']];
            }
            return self::reply(['packs' => $packs]);
        }
        $checkout = isset($data['checkoutUrl']) && is_string($data['checkoutUrl']) ? parse_url($data['checkoutUrl']) : false;
        $api = parse_url(MAPSVG_API_URL);
        $basePath = preg_replace('#/api/?$#', '', $api['path'] ?? '');
        if (!$checkout || !isset($data['purchaseId']) || !is_string($data['purchaseId']) ||
            !in_array($checkout['scheme'] ?? '', ['http', 'https'], true) ||
            ($checkout['scheme'] ?? '') !== ($api['scheme'] ?? '') || ($checkout['host'] ?? '') !== ($api['host'] ?? '') ||
            ($checkout['port'] ?? null) !== ($api['port'] ?? null) || isset($checkout['user']) || isset($checkout['pass']) || isset($checkout['query']) ||
            ($checkout['path'] ?? '') !== $basePath . '/ai-credits/checkout/' . $data['purchaseId'] ||
            !preg_match('/^token=[a-f0-9]{64}$/', $checkout['fragment'] ?? '')) {
            return self::reply(['error' => 'Invalid checkout response.'], 502);
        }
        return self::reply(['purchaseId' => $data['purchaseId'], 'checkoutUrl' => $data['checkoutUrl']]);
    }

    public static function creditPacks($request): \WP_REST_Response
    {
        return self::creditRequest('/ai-credits/packs');
    }

    public static function creditPurchase($request): \WP_REST_Response
    {
        $params = $request->get_json_params();
        $priceId = is_array($params) && is_string($params['priceId'] ?? null) ? $params['priceId'] : '';
        $requestId = is_array($params) && is_string($params['requestId'] ?? null) ? $params['requestId'] : '';
        if (!preg_match('/^pri_[a-z0-9]{26}$/', $priceId) || !preg_match('/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i', $requestId))
            return self::reply(['error' => 'Invalid credit purchase request.'], 400);
        return self::creditRequest('/ai-credits/purchases', ['priceId' => $priceId, 'requestId' => $requestId]);
    }

    public static function enroll($request): \WP_REST_Response
    {
        if (!self::allowed()) {
            return self::reply(['error' => 'Only site administrators can request a license.'], 403);
        }
        if (LicenseStatus::productSlug() !== 'mapsvg-lite') {
            return self::reply(['error' => 'Free license registration is available for MapSVG Lite.'], 403);
        }
        $params = $request->get_json_params();
        $email = is_array($params) && isset($params['email']) && is_string($params['email'])
            ? trim($params['email']) : '';
        if (strlen($email) > 254 || !is_email($email)) {
            return self::reply(['error' => 'Enter a valid email address.'], 400);
        }
        $response = wp_remote_post(rtrim(MAPSVG_API_URL, '/') . '/lite/enrollment', [
            'timeout' => 20, 'redirection' => 0, 'limit_response_size' => 16384,
            'headers' => ['Content-Type' => 'application/json', 'Accept' => 'application/json'],
            // No credential, user ID, callback URL, or caller-chosen site binding is accepted.
            'body' => wp_json_encode(['email' => $email]),
        ]);
        if (is_wp_error($response)) {
            return self::reply(['error' => LicenseStatus::CONNECTION_ERROR_MESSAGE], 502);
        }
        $status = (int) wp_remote_retrieve_response_code($response);
        if ($status < 200 || $status >= 300) {
            return self::reply(['error' => $status === 429
                ? 'Please wait before requesting another email.'
                : 'Could not request the email. Please try again.'], $status === 429 ? 429 : 502);
        }
        // Deliberately discard the upstream body: an enrollment response never conveys secrets.
        return self::reply(['ok' => true, 'message' => 'Check your email for the next step.', 'retryAfter' => 60]);
    }
}
