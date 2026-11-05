<?php
declare(strict_types=1);
namespace MapSVG\Integration;

use MapSVG\Shared\QueryRpc\RpcJson;

/** Shared HTTP tail, invoked only by explicit WordPress resource route owners. */
final class RestResponseJsonEncoder
{
    public static function serve($response,$request,$server,?int $maxBytes=RpcJson::RESPONSE_BYTES): bool
    {
        // WordPress has already authenticated/dispatched and sent status and headers.
        if($request->get_method()==='HEAD')return true;
        $options=0;
        try {
            $embed=false;
            if(isset($_GET['_embed']))$embed=function_exists('rest_parse_embed_param')?rest_parse_embed_param($_GET['_embed']):true;
            $data=$server->response_to_data($response,$embed);
            $data=apply_filters('rest_pre_echo_response',$data,$server,$request);
            if($response->get_status()===204 || $data===null)return true;
            $options=$request->has_param('_pretty')?JSON_PRETTY_PRINT:0;
            $options=apply_filters('rest_json_encode_options',$options,$request);
            $json=self::encode($data,$options);
            $output=self::output($json,$maxBytes);
            if($maxBytes!==null && strlen($output)>$maxBytes)throw new \LengthException('REST HTTP response exceeds its bound.');
        } catch(\Throwable $error) {
            // Core's native error shape; do not disclose plugin/filter exception details.
            status_header(500);
            // Equivalent to core's single WP_Error response, also on WordPress 5.0–5.6.
            $failure=array('code'=>'rest_encode_error','message'=>'JSON response encoding failed.','data'=>array('status'=>500));
            // This error contains no floats. Keep core's selected formatting/options when valid.
            try {$json=wp_json_encode($failure,$options);}
            catch(\Throwable $ignored) {$json=false;}
            if(!is_string($json) || ($maxBytes!==null && strlen($json)>$maxBytes))$json='{"code":"rest_encode_error","message":"JSON response encoding failed.","data":{"status":500}}';
            try {$output=self::output($json,$maxBytes);}
            catch(\LengthException $ignored) {
                $server->send_header('Content-Type','application/json; charset='.get_option('blog_charset'));
                $output=$json;
            }
        }
        // The host setting has been restored before any output or subsequent serve hooks.
        echo $output;
        return true;
    }

    private static function encode($data,$options): string
    {
        $previous=ini_get('serialize_precision');
        if($previous===false)throw new \RuntimeException('JSON precision is unavailable.');
        try {
            if($previous!=='-1') {
                if(ini_set('serialize_precision','-1')===false)throw new \RuntimeException('JSON precision is unavailable.');
            }
            if(ini_get('serialize_precision')!=='-1')throw new \RuntimeException('JSON precision is unavailable.');
            $json=wp_json_encode($data,$options);
            if(ini_get('serialize_precision')!=='-1' || !is_string($json) || json_last_error()!==JSON_ERROR_NONE)throw new \RuntimeException('JSON encoding failed.');
            return $json;
        } finally {
            if(ini_get('serialize_precision')!==$previous && (ini_set('serialize_precision',(string)$previous)===false || ini_get('serialize_precision')!==$previous)) {
                throw new \RuntimeException('JSON precision could not be restored.');
            }
        }
    }

    private static function output(string $json,?int $maxBytes): string
    {
        // Core validates/enables this callback before dispatch and before this hook.
        $callback=$_GET['_jsonp']??false;
        if($callback && $maxBytes!==null && strlen($callback)+strlen($json)+6>$maxBytes)throw new \LengthException('REST HTTP response exceeds its bound.');
        return $callback?'/**/'.$callback.'('.$json.')':$json;
    }
}
