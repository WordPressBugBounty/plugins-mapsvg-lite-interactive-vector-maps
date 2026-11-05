<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

final class TableDefinition
{
    private string $logicalName;
    private string $physicalName;
    /** @var array<string, ColumnDefinition> */
    private array $columns;
    /** @var array<string, IndexDefinition> */
    private array $indexes;
    private string $engine;
    private string $charset;
    private string $collation;

    /**
     * @param ColumnDefinition[] $columns
     * @param IndexDefinition[] $indexes
     */
    public function __construct(
        string $logicalName,
        string $physicalName,
        array $columns,
        array $indexes = array(),
        string $engine = 'InnoDB',
        string $charset = 'utf8',
        string $collation = 'utf8_unicode_ci'
    ) {
        self::assertIdentifier($logicalName, 'logical table');
        self::assertIdentifier($physicalName, 'physical table');
        if ($columns === array()) {
            throw new \InvalidArgumentException(
                'Table must contain at least one column.'
            );
        }

        $columnMap = array();
        foreach ($columns as $column) {
            if (!$column instanceof ColumnDefinition) {
                throw new \InvalidArgumentException(
                    'Table columns must be ColumnDefinition values.'
                );
            }
            if (isset($columnMap[$column->name()])) {
                throw new \InvalidArgumentException(
                    'Duplicate table column: ' . $column->name()
                );
            }
            $columnMap[$column->name()] = $column;
        }

        $indexMap = array();
        foreach ($indexes as $index) {
            if (!$index instanceof IndexDefinition) {
                throw new \InvalidArgumentException(
                    'Table indexes must be IndexDefinition values.'
                );
            }
            if (isset($indexMap[$index->name()])) {
                throw new \InvalidArgumentException(
                    'Duplicate table index: ' . $index->name()
                );
            }
            foreach ($index->columns() as $indexColumn) {
                $columnName = $indexColumn->name();
                if (!isset($columnMap[$columnName])) {
                    throw new \InvalidArgumentException(
                        'Index references an unknown column: '
                        . $columnName
                    );
                }
                if ($index->type() === IndexDefinition::PRIMARY) {
                    $primaryColumn = $columnMap[$columnName];
                    if ($primaryColumn->nullable()) {
                        throw new \InvalidArgumentException(
                            'Primary-key columns must be NOT NULL: '
                            . $columnName
                        );
                    }
                    if (
                        $primaryColumn->hasDefault()
                        && $primaryColumn->defaultValue() === null
                    ) {
                        throw new \InvalidArgumentException(
                            'Primary-key columns cannot default to NULL: '
                            . $columnName
                        );
                    }
                }
            }
            $indexMap[$index->name()] = $index;
        }

        foreach (array(
            'engine' => $engine,
            'charset' => $charset,
            'collation' => $collation,
        ) as $label => $value) {
            if (!preg_match('/^[A-Za-z0-9_]+$/D', $value)) {
                throw new \InvalidArgumentException(
                    'Invalid table ' . $label . ' metadata.'
                );
            }
        }

        $this->logicalName = $logicalName;
        $this->physicalName = $physicalName;
        $this->columns = $columnMap;
        $this->indexes = $indexMap;
        $this->engine = $engine;
        $this->charset = $charset;
        $this->collation = $collation;
    }

    public function logicalName(): string { return $this->logicalName; }
    public function physicalName(): string { return $this->physicalName; }
    /** @return array<string, ColumnDefinition> */
    public function columns(): array { return $this->columns; }
    /** @return array<string, IndexDefinition> */
    public function indexes(): array { return $this->indexes; }
    public function column(string $name): ?ColumnDefinition
    {
        return $this->columns[$name] ?? null;
    }
    public function index(string $name): ?IndexDefinition
    {
        return $this->indexes[$name] ?? null;
    }
    public function engine(): string { return $this->engine; }
    public function charset(): string { return $this->charset; }
    public function collation(): string { return $this->collation; }

    private static function assertIdentifier(
        string $identifier,
        string $label
    ): void {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $identifier)) {
            throw new \InvalidArgumentException(
                'Invalid ' . $label . ' identifier.'
            );
        }
    }
}
