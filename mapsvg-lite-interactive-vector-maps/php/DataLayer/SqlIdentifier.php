<?php

declare(strict_types=1);

namespace MapSVG\DataLayer;

/**
 * SQL identifier boundary for MapSVG-owned names, including WordPress table prefixes.
 *
 * WordPress accepts `$table_prefix` values matching `[A-Za-z0-9_]`, including a
 * leading digit. Keep a conservative shared subset that rejects all-digit
 * names and unsafe characters before quoting.
 */
final class SqlIdentifier
{
    public const PATTERN = '/^(?!\d+$)[A-Za-z0-9_]+$/D';

    public static function isValid(string $name): bool
    {
        return (bool) preg_match(self::PATTERN, $name);
    }

    public static function assert(string $name, string $label = 'SQL'): void
    {
        if (!self::isValid($name)) {
            throw new \InvalidArgumentException(
                'Invalid ' . $label . ' identifier.'
            );
        }
    }

    public static function quote(string $name, string $label = 'SQL'): string
    {
        self::assert($name, $label);
        return '`' . $name . '`';
    }
}
