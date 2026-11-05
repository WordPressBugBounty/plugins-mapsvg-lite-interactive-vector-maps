<?php

declare(strict_types=1);
namespace MapSVG\Shared\SavedQuery;

/** Saved Query JSON boundary: associative PHP objects, explicit empty JSON objects. */
final class SavedQueryInput
{
    /** Decode input without PHP's associative JSON decoding erasing empty objects. */
    public static function fromJson(string $json)
    {
        $value = json_decode($json, false, 512, JSON_THROW_ON_ERROR);
        // Historical Store writes encoded an empty PHP input as []. Reads repair
        // only its representation; persistence changes only on an ordinary save.
        if ($value === array()) $value = new \stdClass();
        return self::fromValue($value, true);
    }

    public static function fromValue($value, bool $legacy = false)
    {
        if (!self::isObject($value)) {
            throw new \InvalidArgumentException('Query input must be a Prisma JSON object.');
        }
        $input = self::copy($value);
        $members = (array) $input;
        if (array_key_exists('where', $members)) {
            $members['where'] = self::predicate($members['where'], $legacy);
        }
        return $members === array() ? new \stdClass() : $members;
    }

    /** Internal APIs retain an array root; nested empty objects stay JSON objects. */
    public static function members($value): array
    {
        return (array) self::fromValue($value);
    }

    private static function isObject($value): bool
    {
        return (is_object($value) && get_class($value) === \stdClass::class)
            || (is_array($value) && ($value === array() || array_values($value) !== $value));
    }

    private static function predicate($value, bool $legacy, int $depth = 0)
    {
        if ($depth > 24) throw new \LengthException('Query predicate is too deeply nested.');
        if ($value === array()) {
            if (!$legacy) throw new \InvalidArgumentException('Prisma where must be an object.');
            return new \stdClass();
        }
        if (!self::isObject($value)) throw new \InvalidArgumentException('Prisma where must be an object.');
        $members = (array) $value;
        foreach (array('AND', 'OR', 'NOT') as $operator) {
            if (!array_key_exists($operator, $members)) continue;
            $group = $members[$operator];
            if (is_array($group) && array_values($group) === $group) {
                foreach ($group as $index => $child) $group[$index] = self::predicate($child, $legacy, $depth + 1);
                $members[$operator] = $group;
            } else {
                $members[$operator] = self::predicate($group, $legacy, $depth + 1);
            }
        }
        return $members === array() ? new \stdClass()
            : (array_values($members) === $members ? (object) $members : $members);
    }

    /** Keep empty objects and every list/scalar; never use JSON_FORCE_OBJECT. */
    public static function copy($value, int $depth = 0)
    {
        if ($depth > 64) throw new \LengthException('Query input is too deeply nested.');
        if (is_object($value) && get_class($value) === \stdClass::class) {
            $members = get_object_vars($value);
            if ($members === array()) return new \stdClass();
            // Numeric JSON object keys may look like a PHP list after casting.
            // Keep their object identity instead of admitting them as select/in.
            if (array_values($members) === $members) {
                $object = new \stdClass();
                foreach ($members as $key => $item) $object->{(string) $key} = self::copy($item, $depth + 1);
                return $object;
            }
            $value = $members;
        }
        if (is_array($value)) {
            $result = array();
            foreach ($value as $key => $item) $result[$key] = self::copy($item, $depth + 1);
            return $result;
        }
        if ($value === null || is_string($value) || is_bool($value) || is_int($value)
            || (is_float($value) && is_finite($value))) return $value;
        throw new \InvalidArgumentException('Query input must contain plain JSON values.');
    }
}
