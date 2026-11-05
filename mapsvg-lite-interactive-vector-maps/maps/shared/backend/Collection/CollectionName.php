<?php

declare(strict_types=1);

namespace MapSVG\Shared\Collection;

/** Exact immutable application identity; never sanitize, coerce, or case-fold. */
final class CollectionName
{
    public static function validate($value): string
    {
        if (!is_string($value) || strlen($value) > 255
            || preg_match('/\A[\x{0009}-\x{000D}\x{0020}\x{00A0}\x{1680}\x{2000}-\x{200A}\x{2028}\x{2029}\x{202F}\x{205F}\x{3000}\x{FEFF}]*\z/u', $value)
            || !preg_match('//u', $value) || preg_match('/[\x00-\x1f\x7f]/', $value)) {
            throw new \InvalidArgumentException('Invalid Collection name.');
        }
        return $value;
    }
}
