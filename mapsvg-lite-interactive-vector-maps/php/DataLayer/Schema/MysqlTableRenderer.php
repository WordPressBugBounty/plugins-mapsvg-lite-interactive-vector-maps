<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

use Plasma\Adapter\DatabaseAdapter;

/** Renders validated physical definitions into exact MySQL DDL. */
final class MysqlTableRenderer
{
    private DatabaseAdapter $adapter;

    public function __construct(DatabaseAdapter $adapter)
    {
        $this->adapter = $adapter;
    }

    public function operationSql(
        TableOperation $operation,
        TableDefinition $target
    ): string {
        $table = self::quoteIdentifier($target->physicalName());
        switch ($operation->type()) {
            case TableOperation::CREATE_TABLE:
                $definition = $operation->table();
                if ($definition === null) {
                    throw new \LogicException(
                        'Create-table operation has no definition.'
                    );
                }
                return $this->createTableSql($definition);
            case TableOperation::ADD_COLUMN:
                $column = $operation->column();
                if ($column === null) {
                    throw new \LogicException(
                        'Add-column operation has no column.'
                    );
                }
                return 'ALTER TABLE ' . $table
                    . ' ADD COLUMN ' . $this->columnSql($column);

            case TableOperation::MODIFY_COLUMN:
                $column = $operation->column();
                if ($column === null) {
                    throw new \LogicException(
                        'Modify-column operation has no column.'
                    );
                }
                return 'ALTER TABLE ' . $table
                    . ' MODIFY COLUMN ' . $this->columnSql($column);

            case TableOperation::DROP_COLUMN:
                $name = $operation->name();
                if ($name === null) {
                    throw new \LogicException(
                        'Drop-column operation has no column name.'
                    );
                }
                return 'ALTER TABLE ' . $table
                    . ' DROP COLUMN ' . self::quoteIdentifier($name);
            case TableOperation::DROP_INDEX:
                $name = $operation->name();
                if ($name === null) {
                    throw new \LogicException(
                        'Drop-index operation has no index name.'
                    );
                }
                return $name === 'PRIMARY'
                    ? 'ALTER TABLE ' . $table . ' DROP PRIMARY KEY'
                    : 'ALTER TABLE ' . $table
                        . ' DROP INDEX ' . self::quoteIdentifier($name);

            case TableOperation::ADD_INDEX:
                $index = $operation->index();
                if ($index === null) {
                    throw new \LogicException(
                        'Add-index operation has no index definition.'
                    );
                }
                return 'ALTER TABLE ' . $table
                    . ' ADD ' . $this->indexSql($index);
        }

        throw new \InvalidArgumentException(
            'Unsupported table operation: ' . $operation->type()
        );
    }

    public function createTableSql(TableDefinition $table): string
    {
        $parts = array();
        foreach ($table->columns() as $column) {
            $parts[] = $this->columnSql($column);
        }
        foreach ($table->indexes() as $index) {
            $parts[] = $this->indexSql($index);
        }
        return 'CREATE TABLE ' . self::quoteIdentifier($table->physicalName())
            . ' (' . implode(', ', $parts) . ')'
            . ' ENGINE=' . $table->engine()
            . ' DEFAULT CHARACTER SET ' . $table->charset()
            . ' COLLATE ' . $table->collation();
    }

    public function renameTableSql(
        string $fromPhysical,
        string $toPhysical
    ): string {
        return 'RENAME TABLE ' . self::quoteIdentifier($fromPhysical)
            . ' TO ' . self::quoteIdentifier($toPhysical);
    }

    public function dropTableSql(string $physicalName): string
    {
        return 'DROP TABLE IF EXISTS '
            . self::quoteIdentifier($physicalName);
    }

    private function columnSql(ColumnDefinition $column): string
    {
        $sql = self::quoteIdentifier($column->name())
            . ' ' . strtoupper(SchemaSqlDefinition::columnType($column->type()))
            . ($column->nullable() ? ' NULL' : ' NOT NULL');
        if ($column->hasDefault()) {
            $sql .= ' DEFAULT ' . SchemaSqlDefinition::defaultSql($column->defaultValue(), $column->type());
        }
        if ($column->autoIncrement()) {
            $sql .= ' AUTO_INCREMENT';
        }
        return $sql;
    }

    private function indexSql(IndexDefinition $index): string
    {
        $columns = array();
        foreach ($index->columns() as $column) {
            $sql = self::quoteIdentifier($column->name());
            if ($column->prefixLength() !== null) {
                $sql .= '(' . $column->prefixLength() . ')';
            }
            $columns[] = $sql;
        }
        $columnSql = '(' . implode(', ', $columns) . ')';

        switch ($index->type()) {
            case IndexDefinition::PRIMARY:
                return 'PRIMARY KEY ' . $columnSql;
            case IndexDefinition::FULLTEXT:
                return 'FULLTEXT KEY '
                    . self::quoteIdentifier($index->name())
                    . ' ' . $columnSql;
            case IndexDefinition::UNIQUE:
                return 'UNIQUE KEY '
                    . self::quoteIdentifier($index->name())
                    . ' ' . $columnSql;
            case IndexDefinition::INDEX:
                return 'KEY ' . self::quoteIdentifier($index->name())
                    . ' ' . $columnSql;
        }
        throw new \InvalidArgumentException('Unsupported index type.');
    }

    private static function quoteIdentifier(string $identifier): string
    {
        SchemaSqlDefinition::identifier($identifier);
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $identifier)) {
            throw new \InvalidArgumentException(
                'Invalid SQL identifier.'
            );
        }
        return '`' . $identifier . '`';
    }
}
