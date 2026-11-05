<?php

declare(strict_types=1);
namespace MapSVG\App\Http;

final class QueryRpcRoutes
{
    public static function register(QueryRpcController $controller): void
    {
        if (!$controller->available()) return;
        register_rest_route('mapsvg/v9', '/rpc', array(array(
            'methods' => 'POST',
            'callback' => array($controller, 'execute'),
            // Public queries must reach their per-query policy; no blanket editor gate.
            // WP REST authentication still runs first. Do not bypass or reimplement it here.
            'permission_callback' => '__return_true',
            'allow_batch' => array('v1' => false),
        )));
    }
    public static function url(): string { return rest_url('mapsvg/v9/rpc'); }
}
