<?php

declare(strict_types=1);
namespace MapSVG\Shared\QueryRpc;

/** JSON-only transport values; no serializer hooks or model instances. PHP 7.4 compatible. */
final class RpcJson
{
    public const REQUEST_BYTES = 262144;
    public const PARAMS_BYTES = 65536;
    public const RESPONSE_BYTES = 8388608;
    public const RESULT_BYTES = 2097152;
    public const BATCH_CALLS = 25;

    public static function encode($value): string
    {
        $previous = ini_get('serialize_precision');
        if ($previous === false || ($previous !== '-1'
            && (!function_exists('ini_set') || ini_set('serialize_precision', '-1') === false))) {
            throw new \RuntimeException('RPC numeric serialization is unavailable.');
        }
        try {
            return json_encode($value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_LINE_TERMINATORS);
        } finally {
            if ($previous !== '-1' && ini_set('serialize_precision', $previous) === false) {
                throw new \RuntimeException('RPC numeric serialization precision could not be restored.');
            }
        }
    }

    public static function copy($value, int $maxBytes)
    {
        $nodes = 0;
        $copy = self::visit($value, 0, $nodes);
        if (strlen(self::encode($copy)) > $maxBytes) throw new \LengthException('RPC JSON exceeds byte limit.');
        return $copy;
    }

    /** PHP resolver results may use associative arrays for JSON objects. */
    public static function copyResult($value, int $maxBytes, int &$nodes = 0)
    {
        $copy = self::visit($value, 2, $nodes, true);
        if (strlen(self::encode($copy)) > $maxBytes) throw new \LengthException('RPC result exceeds byte limit.');
        return $copy;
    }

    private static function visit($value, int $depth, int &$nodes, bool $resultArrays = false)
    {
        if (++$nodes > 100000 || $depth > 24) throw new \LengthException('RPC JSON is too complex.');
        if ($value === null || is_bool($value) || is_string($value) || is_int($value)) return $value;
        if (is_float($value) && is_finite($value)) return $value;
        if (is_array($value) && $resultArrays && $value !== array() && array_keys($value) !== range(0, count($value) - 1)) {
            $value = (object) $value;
        }
        if (is_array($value)) {
            if (array_keys($value) !== range(0, count($value) - 1) && $value !== array()) {
                throw new \InvalidArgumentException('RPC arrays must be lists. Decode JSON objects as stdClass.');
            }
            $copy = array();
            foreach ($value as $item) $copy[] = self::visit($item, $depth + 1, $nodes, $resultArrays);
            return $copy;
        }
        if (!is_object($value) || get_class($value) !== \stdClass::class) {
            throw new \InvalidArgumentException('RPC values must be plain JSON.');
        }
        $copy = new \stdClass();
        foreach (get_object_vars($value) as $key => $item) {
            self::visit((string) $key, $depth + 1, $nodes);
            $copy->{(string) $key} = self::visit($item, $depth + 1, $nodes, $resultArrays);
        }
        return $copy;
    }

    /** Canonical object ordering for internal identity; arrays retain order and typed values. */
    public static function canonicalHash($value): string
    {
        return hash('sha256', self::encode(self::canonical(self::copy($value, self::REQUEST_BYTES))));
    }

    private static function canonical($value)
    {
        if (is_array($value)) return array_map(array(self::class, 'canonical'), $value);
        if (!$value instanceof \stdClass) return $value;
        $members = get_object_vars($value);
        ksort($members, SORT_STRING);
        $copy = new \stdClass();
        foreach ($members as $key => $item) $copy->{(string) $key} = self::canonical($item);
        return $copy;
    }

    public static function object($value, ?array $keys = null): \stdClass
    {
        if (!is_object($value) || get_class($value) !== \stdClass::class) throw new \InvalidArgumentException('Expected RPC object.');
        if ($keys !== null && array_diff(array_keys(get_object_vars($value)), $keys)) throw new \InvalidArgumentException('Unknown RPC field.');
        return $value;
    }

    public static function queryName($name): string
    {
        if (!is_string($name) || !preg_match('/\A[a-z][a-zA-Z0-9]{0,119}\z/D', $name)) throw new \InvalidArgumentException('Invalid query name.');
        return $name;
    }

    public static function requestId($id): string
    {
        if (!is_string($id) || !preg_match('/\A[A-Za-z0-9_-]{1,64}\z/D', $id)) throw new \InvalidArgumentException('Invalid batch requestId.');
        return $id;
    }
}
