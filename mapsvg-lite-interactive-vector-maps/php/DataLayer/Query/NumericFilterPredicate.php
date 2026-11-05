<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

/** Explicit numeric comparisons from native App filter controls. */
final class NumericFilterPredicate
{
    public static function read(object $field, $value): ?array
    {
        if (!is_array($value) || !array_key_exists('operator', $value)) return null;
        $operator = $value['operator'];
        if (!is_string($operator) || !in_array($operator, ['gt', 'gte', 'lt', 'lte'], true)
            || array_diff(array_keys($value), ['operator', 'value']) || !array_key_exists('value', $value)) {
            throw new \InvalidArgumentException('Invalid numeric filter comparison.');
        }
        if (!in_array($field->type ?? '', ['number', 'integer'], true)
            && !preg_match('/^(?:tinyint|smallint|mediumint|int|integer|bigint|decimal|numeric|float|double|real)\b/i', (string) ($field->db_type ?? ''))) {
            throw new \InvalidArgumentException('Comparison filters require a numeric field.');
        }
        $operand = $value['value'];
        if ((!is_string($operand) && !is_int($operand) && !is_float($operand))
            || !is_numeric($operand) || !is_finite((float) $operand)) {
            throw new \InvalidArgumentException('Comparison filters require a finite number.');
        }
        return [$operator => (float) $operand];
    }
}
