<?php

namespace MapSVG;

/**
 * WordPress REST cookie auth rejects any request that sends an invalid
 * X-WP-Nonce, even when the route itself is public (__return_true).
 *
 * Front-end pages often ship a cached nonce (page cache / CDN). A visitor
 * then gets 403 rest_cookie_invalid_nonce on filter reloads and the map
 * spinner never stops. Public GET collection/map routes must still work
 * as unauthenticated reads in that case.
 */
class RestAuth
{
    /**
     * Whether a REST route is a public MapSVG GET endpoint.
     *
     * Accepts either a rest_route query var ("/mapsvg/v1/objects/objects_2")
     * or a full request URI ("/wp-json/mapsvg/v1/objects/objects_2?...").
     */
    public static function isPublicReadRoute(string $route, array $params = []): bool
    {
        $path = self::normalizeRoute($route);
        if ($path === '') {
            return false;
        }

        // The catalog filters publication before paging; other GET subroutes may be editor-only.
        if ($path === '/mapsvg/v1/maps') return true;
        try {
            if (preg_match('~\A/mapsvg/v1/maps/([1-9][0-9]*)(?:/svg)?\z~D', $path, $matches)) {
                $query = [];
                parse_str((string) parse_url($route, PHP_URL_QUERY), $query);
                $query = array_merge($query, $params);
                if (array_key_exists('mapsvg_version', $query)) {
                    (new AppDraftStore())->publishedVersion((int) $matches[1], AppPublishedVersion::id($query['mapsvg_version']));
                    return true;
                }
                return in_array((int) $matches[1], PublicReadAccess::mapIds(), true);
            }
            if (preg_match('~\A/mapsvg/v1/(?:collection|objects|regions)/([A-Za-z0-9_-]+)(?:/([^/]+))?\z~D', $path, $matches)) {
                return PublicReadAccess::collection($matches[1]);
            }
        } catch (\Throwable $error) {
            // Failed access lookups never turn an authentication error into a public request.
            return false;
        }

        return false;
    }

    /**
     * Whether a failed cookie-nonce check should be ignored for this request.
     */
    public static function shouldAllowStaleNonce(string $errorCode, string $method, string $route, array $params = []): bool
    {
        return $errorCode === 'rest_cookie_invalid_nonce'
            && strtoupper($method) === 'GET'
            && self::isPublicReadRoute($route, $params);
    }

    /**
     * rest_authentication_errors callback: treat a stale nonce as "logged out"
     * on public GET routes instead of 403ing the request.
     *
     * @param mixed $result
     * @return mixed
     */
    public static function allowStaleNonceOnPublicGet($result)
    {
        if (!is_wp_error($result)) {
            return $result;
        }

        $method = isset($_SERVER['REQUEST_METHOD']) ? strtoupper((string) $_SERVER['REQUEST_METHOD']) : '';
        if (!self::shouldAllowStaleNonce($result->get_error_code(), $method, self::currentRestRoute(), $_GET)) {
            return $result;
        }

        wp_set_current_user(0);
        return true;
    }

    private static function currentRestRoute(): string
    {
        if (isset($GLOBALS['wp']) && is_object($GLOBALS['wp']) && isset($GLOBALS['wp']->query_vars['rest_route'])) {
            return (string) $GLOBALS['wp']->query_vars['rest_route'];
        }
        if (isset($_SERVER['REQUEST_URI'])) {
            return (string) $_SERVER['REQUEST_URI'];
        }
        return '';
    }

    private static function normalizeRoute(string $route): string
    {
        if (preg_match('/(?:\?|&)rest_route=([^&]+)/', $route, $matches)) {
            $path = rawurldecode($matches[1]);
        } else {
            $path = function_exists('wp_parse_url')
                ? wp_parse_url($route, PHP_URL_PATH)
                : parse_url($route, PHP_URL_PATH);
            if (!is_string($path) || $path === '') {
                $path = strtok($route, '?');
            }
        }
        if (!is_string($path) || $path === '') {
            return '';
        }

        $wpJson = '/wp-json';
        if (strpos($path, $wpJson) !== false) {
            $path = substr($path, strpos($path, $wpJson) + strlen($wpJson));
        }

        if ($path === '' || $path[0] !== '/') {
            $path = '/' . $path;
        }

        return rtrim($path, '/') ?: '/';
    }
}
