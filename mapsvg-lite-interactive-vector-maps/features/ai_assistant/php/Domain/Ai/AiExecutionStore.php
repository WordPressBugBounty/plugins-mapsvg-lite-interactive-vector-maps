<?php
namespace MapSVG;

/** Atomic native-option receipts; independent of WordPress external transient caches. */
final class AiExecutionStore
{
    private static function valid(string $key): void
    {
        if(!preg_match('/\Amapsvg_ai_(?:cmd|transport)_[a-zA-Z0-9_]+\z/D',$key)||strlen($key)>180)throw new \InvalidArgumentException('Invalid executor receipt key.');
    }
    private static function forget(string $key): void
    {
        wp_cache_delete($key,'options');wp_cache_delete('notoptions','options');
    }
    private static function raw(string $key)
    {
        self::valid($key);self::forget($key);return get_option($key,false);
    }
    private static function encode($value,int $ttl): string
    {
        $payload=serialize($value);if(strlen($payload)>8000000)throw new \RuntimeException('Executor receipt exceeds its storage limit.');
        return wp_json_encode(['version'=>1,'payload'=>base64_encode($payload),'expiresAt'=>time()+$ttl]);
    }
    private static function value(array $frame)
    {
        if(($frame['version']??null)!==1||!is_string($frame['payload']??null)||($bytes=base64_decode($frame['payload'],true))===false)throw new \RuntimeException('Invalid executor receipt.');
        // Only locally constructed DTOs are stored; preserve Saved Query empty objects.
        $value=@unserialize($bytes,['allowed_classes'=>['stdClass']]);
        if($value===false&&$bytes!=='b:0;')throw new \RuntimeException('Invalid executor receipt payload.');
        return $value;
    }
    public static function read(string $key)
    {
        $raw=self::raw($key);$frame=is_string($raw)?json_decode($raw,true):null;
        return is_array($frame)&&($frame['expiresAt']??0)>time()?self::value($frame):false;
    }
    /** Reclaim only the exact expired value; a concurrent fresh owner is never deleted. */
    public static function claim(string $key,$value,int $ttl): bool
    {
        self::valid($key);$raw=self::raw($key);
        if(is_string($raw)){$old=json_decode($raw,true);if(!is_array($old)||($old['expiresAt']??PHP_INT_MAX)>time())return false;self::removeExpected($key,$raw);}
        return add_option($key,self::encode($value,$ttl),'',false);
    }
    public static function put(string $key,$expected,$value,int $ttl): bool
    {
        global $wpdb;$raw=self::raw($key);$old=is_string($raw)?json_decode($raw,true):null;
        if(!is_array($old)||($old['expiresAt']??0)<=time()||serialize(self::value($old))!==serialize($expected))return false;
        $next=self::encode($value,$ttl);if($next===$raw)return true;
        $result=$wpdb->query($wpdb->prepare("UPDATE `{$wpdb->options}` SET option_value=%s WHERE option_name=%s AND BINARY option_value=%s",$next,$key,$raw));
        self::forget($key);return $result===1;
    }
    private static function removeExpected(string $key,string $raw): bool
    {
        global $wpdb;$removed=$wpdb->query($wpdb->prepare("DELETE FROM `{$wpdb->options}` WHERE option_name=%s AND BINARY option_value=%s",$key,$raw));self::forget($key);return $removed===1;
    }
    public static function release(string $key,$expected): bool
    {
        $raw=self::raw($key);$old=is_string($raw)?json_decode($raw,true):null;
        return is_array($old)&&serialize(self::value($old))===serialize($expected)&&self::removeExpected($key,$raw);
    }
    public static function cleanup(): void
    {
        global $wpdb;$rows=$wpdb->get_results($wpdb->prepare("SELECT option_name,option_value FROM `{$wpdb->options}` WHERE option_name LIKE %s OR option_name LIKE %s ORDER BY option_id LIMIT 200",$wpdb->esc_like('mapsvg_ai_cmd_').'%',$wpdb->esc_like('mapsvg_ai_transport_').'%'),ARRAY_A);
        foreach($rows as $row){$data=json_decode($row['option_value'],true);if(is_array($data)&&($data['expiresAt']??PHP_INT_MAX)<=time())self::removeExpected($row['option_name'],$row['option_value']);}
    }
}
