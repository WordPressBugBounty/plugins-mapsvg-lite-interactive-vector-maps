<?php

declare(strict_types=1);

namespace MapSVG\Integration;

/** Precision-safe final writer for saved Query CRUD, not execution or folders. */
final class SavedQueryResponseEncoder
{
    public static function register(): void
    {
        if (has_filter('rest_pre_serve_request', array(self::class, 'serve')) === false) {
            add_filter('rest_pre_serve_request', array(self::class, 'serve'), 20, 4);
        }
    }

    public static function serve($served, $response, $request, $server)
    {
        if ($served || !preg_match('/\A\/mapsvg\/v1\/queries(?:\/[a-zA-Z0-9-]{1,64})?\z/Di', $request->get_route())) {
            return $served;
        }
        // The existing catalog has no aggregate HTTP limit. Individual saved
        // definitions retain their Store limits; do not import the RPC ceiling.
        return RestResponseJsonEncoder::serve($response, $request, $server, null);
    }
}
