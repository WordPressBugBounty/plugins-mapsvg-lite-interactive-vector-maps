<?php

declare(strict_types=1);

namespace MapSVG\Integration;

/** Owns only the final JSON response of the ID-based saved Query POST route. */
final class SavedQueryExecutionResponseEncoder
{
    public static function register(): void
    {
        if (has_filter('rest_pre_serve_request', array(self::class, 'serve')) === false) {
            add_filter('rest_pre_serve_request', array(self::class, 'serve'), 20, 4);
        }
    }

    public static function serve($served, $response, $request, $server)
    {
        if ($served || $request->get_method() !== 'POST'
            || !preg_match('/\A\/mapsvg\/v1\/rpc\z/Di', $request->get_route())) {
            return $served;
        }
        // Preserve the existing v1 HTTP size policy, independently of v9 RPC.
        return RestResponseJsonEncoder::serve($response, $request, $server, null);
    }
}
