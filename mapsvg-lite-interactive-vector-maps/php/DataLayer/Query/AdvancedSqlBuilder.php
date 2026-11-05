<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

use Plasma\QueryBuilder;

/** Builds one trusted MySQL advanced SELECT. */
final class AdvancedSqlBuilder
{
    private const BASE_ALIAS = 'mapsvg_base';
    private const COUNT_ALIAS = 'mapsvg_advanced_count';

    private AdvancedQueryContext $context;
    /** @var string[] */
    private array $selectFields = array();
    /** @var array<string, string> */
    private array $computedSelects = array();
    /** @var string[] */
    private array $where = array();
    /** @var string[] */
    private array $having = array();
    /** @var string[] */
    private array $orderBy = array();
    private int $take = 0;
    private int $skip = 0;
    private bool $paginationSet = false;

    public function __construct(AdvancedQueryContext $context)
    {
        $this->context = $context;
    }

    /** @param string[] $fields */
    public function setSelectFields(array $fields): void
    {
        $seen = array();
        foreach ($fields as $field) {
            if (!is_string($field)) {
                throw new \InvalidArgumentException(
                    'Advanced select fields must be strings.'
                );
            }
            $this->assertPhysicalField($field);
            if (isset($seen[$field])) {
                throw new \InvalidArgumentException(
                    'Advanced select fields must not contain duplicates.'
                );
            }
            $seen[$field] = true;
        }
        $this->selectFields = array_values($fields);
    }

    public function applySimpleWhere(array $where): void
    {
        if ($where === array()) {
            return;
        }
        $limits = $this->context->limits();
        $compiler = new QueryBuilder(
            $this->context->resolution()->logicalTable(),
            $this->context->adapter(),
            array(
                'maxDepth' => $limits->maxDepth(),
                'maxConditions' => $limits->maxConditions(),
                'maxListValues' => $limits->maxListValues(),
            ),
            $this->context->actualFields()
        );
        $compiled = $compiler->buildWhere($where);
        if (strpos($compiled, ' WHERE ') !== 0) {
            throw new \LogicException('Plasma did not return a WHERE clause.');
        }
        $this->addWhere(substr($compiled, 7));
    }

    public function addComputedSelect(string $alias, string $expression): void
    {
        self::assertIdentifier($alias, 'computed select alias');
        $expression = trim($expression);
        if ($expression === '' || strpos($expression, ';') !== false) {
            throw new \InvalidArgumentException(
                'Computed select expression is invalid.'
            );
        }
        if (isset($this->computedSelects[$alias])) {
            throw new \LogicException(
                'Computed select alias already exists: ' . $alias
            );
        }
        $this->computedSelects[$alias] = $expression;
    }

    public function hasComputedSelect(string $alias): bool
    {
        return isset($this->computedSelects[$alias]);
    }

    public function addWhere(string $clause): void
    {
        $this->where[] = $this->clause($clause, 'WHERE');
    }

    public function addHaving(string $clause): void
    {
        $this->having[] = $this->clause($clause, 'HAVING');
    }

    public function addPreparedWhere(string $template, array $params): void
    {
        $this->addWhere($this->prepare($template, $params));
    }

    public function addPreparedHaving(string $template, array $params): void
    {
        $this->addHaving($this->prepare($template, $params));
    }

    public function addFieldOrder(string $field, string $direction): void
    {
        $this->assertPhysicalField($field);
        $this->orderBy[] = $this->column($field)
            . ' ' . $this->direction($direction);
    }

    public function addAliasOrder(string $alias, string $direction): void
    {
        self::assertIdentifier($alias, 'order alias');
        if (!isset($this->computedSelects[$alias])) {
            throw new \LogicException('Unknown computed order alias: ' . $alias);
        }
        $this->orderBy[] = self::quoteIdentifier($alias)
            . ' ' . $this->direction($direction);
    }

    public function setPagination(int $take, int $skip): void
    {
        if ($take < 0 || $skip < 0) {
            throw new \InvalidArgumentException(
                'Advanced pagination values must be non-negative.'
            );
        }
        $this->take = $take;
        $this->skip = $skip;
        $this->paginationSet = true;
    }

    public function column(string $field): string
    {
        $this->assertPhysicalField($field);
        return self::quoteIdentifier(self::BASE_ALIAS)
            . '.' . self::quoteIdentifier($field);
    }

    public function prepare(string $template, array $params): string
    {
        if ($template === '' || strpos($template, ';') !== false) {
            throw new \InvalidArgumentException(
                'Advanced SQL template is invalid.'
            );
        }
        return $params === array()
            ? $template
            : $this->context->adapter()->prepare($template, ...$params);
    }

    /** @param array<int, scalar> $values */
    public function inCondition(string $field, array $values): string
    {
        $this->assertPhysicalField($field);
        if ($values === array()) {
            return '0 = 1';
        }
        if (count($values) > $this->context->limits()->maxListValues()) {
            throw new \LengthException(
                'Advanced IN list exceeds the server limit.'
            );
        }
        $params = array();
        foreach ($values as $value) {
            if (!is_scalar($value)
                || is_bool($value)
                || (is_float($value) && !is_finite($value))) {
                throw new \InvalidArgumentException(
                    'Advanced IN values must be finite strings or numbers.'
                );
            }
            $params[] = $value;
        }
        return $this->prepare(
            $this->column($field)
                . ' IN ('
                . implode(', ', array_fill(0, count($params), '%s'))
                . ')',
            $params
        );
    }

    public function querySql(): string
    {
        $sql = 'SELECT ' . implode(', ', $this->querySelects())
            . ' FROM ' . $this->fromSql();
        $sql .= $this->whereSql();
        $sql .= $this->havingSql();
        if ($this->orderBy !== array()) {
            $sql .= ' ORDER BY ' . implode(', ', $this->orderBy);
        }
        if ($this->paginationSet) {
            $sql .= ' LIMIT ' . $this->take;
            if ($this->skip > 0) {
                $sql .= ' OFFSET ' . $this->skip;
            }
        }
        return $sql;
    }

    public function countSql(): string
    {
        $primaryKey = $this->context->resolution()->primaryKey();
        $selects = array(
            $this->column($primaryKey)
                . ' AS ' . self::quoteIdentifier($primaryKey),
        );
        foreach ($this->computedSelects as $alias => $expression) {
            $selects[] = $expression
                . ' AS ' . self::quoteIdentifier($alias);
        }

        $inner = 'SELECT ' . implode(', ', $selects)
            . ' FROM ' . $this->fromSql()
            . $this->whereSql()
            . $this->havingSql();

        return 'SELECT COUNT(*) FROM (' . $inner . ') AS '
            . self::quoteIdentifier(self::COUNT_ALIAS);
    }

    /** @return string[] */
    private function querySelects(): array
    {
        $selects = array();
        if ($this->selectFields === array()) {
            $selects[] = self::quoteIdentifier(self::BASE_ALIAS) . '.*';
        } else {
            foreach ($this->selectFields as $field) {
                $selects[] = $this->column($field)
                    . ' AS ' . self::quoteIdentifier($field);
            }
        }
        foreach ($this->computedSelects as $alias => $expression) {
            $selects[] = $expression
                . ' AS ' . self::quoteIdentifier($alias);
        }
        return $selects;
    }

    private function fromSql(): string
    {
        return self::quoteIdentifier(
            $this->context->resolution()->physicalTable()
        ) . ' AS ' . self::quoteIdentifier(self::BASE_ALIAS);
    }

    private function whereSql(): string
    {
        return $this->where === array()
            ? ''
            : ' WHERE (' . implode(') AND (', $this->where) . ')';
    }

    private function havingSql(): string
    {
        return $this->having === array()
            ? ''
            : ' HAVING (' . implode(') AND (', $this->having) . ')';
    }

    private function assertPhysicalField(string $field): void
    {
        self::assertIdentifier($field, 'physical field');
        if (!$this->context->hasPhysicalField($field)) {
            throw new \UnexpectedValueException(
                'Advanced query field is missing from the physical table: '
                . $field
            );
        }
    }

    private function clause(string $clause, string $label): string
    {
        $clause = trim($clause);
        if ($clause === '') {
            throw new \InvalidArgumentException(
                $label . ' clause is invalid.'
            );
        }
        return $clause;
    }

    private function direction(string $direction): string
    {
        $direction = strtoupper($direction);
        if (!in_array($direction, array('ASC', 'DESC'), true)) {
            throw new \InvalidArgumentException(
                'Sort direction must be asc or desc.'
            );
        }
        return $direction;
    }

    public static function quoteIdentifier(string $identifier): string
    {
        self::assertIdentifier($identifier, 'SQL identifier');
        return '`' . $identifier . '`';
    }

    private static function assertIdentifier(
        string $identifier,
        string $label
    ): void {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $identifier)) {
            throw new \InvalidArgumentException('Invalid ' . $label . '.');
        }
    }
}
