<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Validation;

/** Serialize authoritative validation values without host-level numeric rounding. */
final class ValidationJson
{
    public static function encode($value, int $flags): string
    {
        $previous = ini_get('serialize_precision');
        if ($previous === false || ($previous !== '-1'
            && (!function_exists('ini_set') || ini_set('serialize_precision', '-1') === false))) {
            throw new \RuntimeException('Validation numeric serialization is unavailable.');
        }
        try {
            $json = json_encode($value, $flags);
            if (ini_get('serialize_precision') !== '-1' || !is_string($json)) {
                throw new \RuntimeException('Validation JSON encoding failed.');
            }
            return $json;
        } finally {
            if (ini_get('serialize_precision') !== $previous
                && (!function_exists('ini_set') || ini_set('serialize_precision', $previous) === false)) {
                throw new \RuntimeException('Validation numeric serialization precision could not be restored.');
            }
        }
    }
}
