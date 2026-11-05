<?php
declare(strict_types=1);
namespace MapSVG\Integration;

/** Owns only the final WordPress HTTP serialization of the v9 RPC route. */
final class NamedQueryRpcResponseEncoder
{
    public static function register(): void
    { if(has_filter('rest_pre_serve_request',array(self::class,'serve'))===false)add_filter('rest_pre_serve_request',array(self::class,'serve'),20,4); }

    public static function serve($served,$response,$request,$server)
    {
        if($served || $request->get_route()!=='/mapsvg/v9/rpc')return $served;
        return RestResponseJsonEncoder::serve($response,$request,$server);
    }
}
