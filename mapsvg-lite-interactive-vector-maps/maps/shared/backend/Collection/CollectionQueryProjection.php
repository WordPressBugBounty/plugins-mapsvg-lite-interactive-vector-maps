<?php

declare(strict_types=1);

namespace MapSVG\Shared\Collection;

/** Logical field projection shared by direct Collection reads and Saved Query views. */
final class CollectionQueryProjection
{
    public static function fields(array $input): ?array
    {
        if (!array_key_exists('select', $input)) {
            return null;
        }

        $select = $input['select'];
        if (!is_array($select) || $select === array()) {
            throw new \InvalidArgumentException('Invalid Collection field projection.');
        }

        if (array_values($select) === $select) {
            foreach ($select as $field) {
                if (!is_string($field) || $field === '') {
                    throw new \InvalidArgumentException('Invalid returned field.');
                }
            }
            return array_values(array_unique($select));
        }

        $fields = array();
        foreach ($select as $field => $enabled) {
            if (!is_string($field) || $field === '' || !is_bool($enabled)) {
                throw new \InvalidArgumentException('Invalid returned field.');
            }
            if ($enabled) {
                $fields[] = $field;
            }
        }

        if ($fields === array()) {
            throw new \InvalidArgumentException(
                'Collection projection must return at least one field.'
            );
        }

        return $fields;
    }

    public static function apply(array $rows, array $input): array
    {
        $fields = self::fields($input);
        if ($fields === null) {
            return $rows;
        }

        $keys = array_fill_keys($fields, true);
        return array_map(static function ($row) use ($keys): array {
            if (!is_array($row)) {
                throw new \UnexpectedValueException(
                    'Expected mapped Collection record.'
                );
            }
            return array_intersect_key($row, $keys);
        }, $rows);
    }
}
