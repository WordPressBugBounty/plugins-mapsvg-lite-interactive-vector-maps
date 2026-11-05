<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

/** Validates and maps the supported Prisma-style boolean/scalar filter subset. */
final class PrismaWhereTranslator
{
    private QueryFieldResolver $fields;
    private QueryLimits $limits;
    private int $nodes = 0;
    /** @var string[] */
    private array $advancedReasons = array();

    public function __construct(QueryFieldResolver $fields, QueryLimits $limits)
    {
        $this->fields = $fields;
        $this->limits = $limits;
    }

    /** @param array<string, mixed> $where */
    public function translate(array $where): PrismaWhereTranslation
    {
        $this->nodes = 0;
        $this->advancedReasons = array();
        if (self::isList($where) && $where !== array()) {
            throw new \InvalidArgumentException('Prisma where must be an object.');
        }

        $translated = $this->predicate($where, 0);
        return new PrismaWhereTranslation($translated, $this->advancedReasons);
    }

    /** @param array<string, mixed> $predicate @return array<string, mixed> */
    private function predicate(array $predicate, int $depth): array
    {
        $this->budget($depth);
        $translated = array();
        foreach ($predicate as $name => $value) {
            if (!is_string($name)) {
                throw new \InvalidArgumentException(
                    'Prisma predicates must be objects with named fields.'
                );
            }
            if (in_array($name, array('AND', 'OR', 'NOT'), true)) {
                $translated[$name] = $this->booleanGroup($name, $value, $depth + 1);
                continue;
            }

            if ($name === 'distance') {
                $this->validateAdvancedFieldValue($value, $depth + 1);
                $this->advancedReasons[] = 'distance';
                continue;
            }

            $field = $this->fields->resolve($name);
            if ($field->isMultiselect()) {
                throw new \InvalidArgumentException(
                    'Legacy multiselect JSON predicates are not supported by the simple Prisma path.'
                );
            }
            if ($field->isLocation() || $field->isRelation()) {
                $this->validateAdvancedFieldValue($value, $depth + 1);
                $this->advancedReasons[] = $field->isLocation()
                    ? 'location:' . $name
                    : 'relation:' . $name;
                continue;
            }
            $translated[$field->storageName()] = $this->fieldValue(
                $field,
                $value,
                $depth + 1
            );
        }
        return $translated;
    }

    private function booleanGroup(string $operator, $value, int $depth): array
    {
        $this->budget($depth);
        if (!is_array($value)) {
            throw new \InvalidArgumentException(
                'Prisma boolean groups require predicate objects or lists.'
            );
        }
        if ($value === array()) {
            return array();
        }

        $list = self::isList($value);
        $children = $list ? $value : array($value);
        $translated = array();
        foreach ($children as $child) {
            if (!is_array($child) || (self::isList($child) && $child !== array())) {
                throw new \InvalidArgumentException(
                    'Prisma boolean-group children must be predicate objects.'
                );
            }
            $translated[] = $this->predicate($child, $depth + 1);
        }

        return $list ? $translated : $translated[0];
    }

    private function fieldValue(
        ResolvedQueryField $field,
        $value,
        int $depth
    ) {
        $this->budget($depth);
        if (!is_array($value)) {
            return $this->fields->normalizeEquality($field, $value);
        }
        if ($value === array() || self::isList($value)) {
            throw new \InvalidArgumentException(
                'Prisma field filters require a non-empty operator object.'
            );
        }

        $operators = array();
        foreach ($value as $operator => $operand) {
            if (!is_string($operator)) {
                throw new \InvalidArgumentException('Prisma field operators require names.');
            }
            $operators[$operator] = $this->operator(
                $field,
                $operator,
                $operand,
                $depth + 1
            );
        }
        return $operators;
    }

    private function validateAdvancedFieldValue($value, int $depth): void
    {
        $this->budget($depth);
        if (!is_array($value)) {
            $this->assertScalarOrNull($value, 'advanced field');
            return;
        }
        if ($value === array() || self::isList($value)) {
            throw new \InvalidArgumentException(
                'Advanced Prisma fields require a non-empty operator object.'
            );
        }

        foreach ($value as $operator => $operand) {
            if (!is_string($operator)) {
                throw new \InvalidArgumentException(
                    'Prisma field operators require names.'
                );
            }
            if ($operator === 'equals') {
                $this->assertScalarOrNull($operand, $operator);
                continue;
            }
            if ($operator === 'not') {
                if (is_array($operand)) {
                    $this->validateAdvancedFieldValue($operand, $depth + 1);
                } else {
                    $this->assertScalarOrNull($operand, $operator);
                }
                continue;
            }
            if ($operator === 'in' || $operator === 'notIn') {
                foreach ($this->boundedList($operand, $operator) as $item) {
                    if ($item === null || !is_scalar($item)) {
                        throw new \InvalidArgumentException(
                            $operator . ' values must be non-null scalars.'
                        );
                    }
                }
                continue;
            }
            if (in_array(
                $operator,
                array('gt', 'gte', 'lt', 'lte', 'contains', 'startsWith', 'endsWith'),
                true
            )) {
                $this->assertNonNullScalar($operand, $operator);
                continue;
            }
            throw new \InvalidArgumentException(
                'Unsupported Prisma field operator: ' . $operator
            );
        }
    }

    private function operator(
        ResolvedQueryField $field,
        string $operator,
        $value,
        int $depth
    ) {
        $this->budget($depth);

        if ($operator === 'equals') {
            $this->assertScalarOrNull($value, 'equals');
            return $this->fields->normalizeEquality($field, $value);
        }
        if ($operator === 'not') {
            if (is_array($value)) {
                if ($value === array() || self::isList($value)) {
                    throw new \InvalidArgumentException(
                        'Prisma not requires a scalar, null, or operator object.'
                    );
                }
                return $this->fieldValue($field, $value, $depth + 1);
            }
            $this->assertScalarOrNull($value, 'not');
            return $this->fields->normalizeEquality($field, $value);
        }
        if ($operator === 'in' || $operator === 'notIn') {
            $values = $this->boundedList($value, $operator);
            $normalized = array();
            foreach ($values as $item) {
                if ($item === null || !is_scalar($item)) {
                    throw new \InvalidArgumentException(
                        $operator . ' values must be non-null scalars.'
                    );
                }
                $normalized[] = $this->fields->normalizeEquality($field, $item);
            }
            return $normalized;
        }

        if (in_array($operator, array('gt', 'gte', 'lt', 'lte'), true)) {
            $this->assertNonNullScalar($value, $operator);
            return $this->fields->normalizeEquality($field, $value);
        }
        if (in_array($operator, array('contains', 'startsWith', 'endsWith'), true)) {
            $this->assertNonNullScalar($value, $operator);
            return $value;
        }

        throw new \InvalidArgumentException(
            'Unsupported Prisma field operator: ' . $operator
        );
    }

    /** @return array<int, mixed> */
    private function boundedList($value, string $operator): array
    {
        if (!is_array($value) || !self::isList($value)) {
            throw new \InvalidArgumentException(
                $operator . ' requires a list of values.'
            );
        }
        if (count($value) > $this->limits->maxListValues()) {
            throw new \LengthException(
                $operator . ' exceeds the server list limit.'
            );
        }
        return array_values($value);
    }

    private function assertScalarOrNull($value, string $operator): void
    {
        if ($value === null) {
            return;
        }
        $this->assertNonNullScalar($value, $operator);
    }

    private function assertNonNullScalar($value, string $operator): void
    {
        if (!is_scalar($value)
            || (is_float($value) && !is_finite($value))) {
            throw new \InvalidArgumentException(
                $operator . ' requires a finite scalar value.'
            );
        }
    }

    private function budget(int $depth): void
    {
        $this->nodes++;
        if ($depth > $this->limits->maxDepth()
            || $this->nodes > $this->limits->maxConditions()) {
            throw new \LengthException('Prisma filter exceeds query complexity limits.');
        }
    }

    private static function isList(array $value): bool
    {
        return $value === array()
            || array_keys($value) === range(0, count($value) - 1);
    }
}
