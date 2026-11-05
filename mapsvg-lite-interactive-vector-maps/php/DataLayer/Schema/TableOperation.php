<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

final class TableOperation
{
    public const CREATE_TABLE = 'create_table';
    public const ADD_COLUMN = 'add_column';
    public const MODIFY_COLUMN = 'modify_column';
    public const DROP_COLUMN = 'drop_column';
    public const DROP_INDEX = 'drop_index';
    public const ADD_INDEX = 'add_index';

    private string $type;
    private ?TableDefinition $table;
    private ?ColumnDefinition $column;
    private ?IndexDefinition $index;
    private ?string $name;

    private function __construct(
        string $type,
        ?TableDefinition $table = null,
        ?ColumnDefinition $column = null,
        ?IndexDefinition $index = null,
        ?string $name = null
    ) {
        $this->type = $type;
        $this->table = $table;
        $this->column = $column;
        $this->index = $index;
        $this->name = $name;
    }

    public static function createTable(TableDefinition $table): self
    {
        return new self(self::CREATE_TABLE, $table);
    }

    public static function addColumn(ColumnDefinition $column): self
    {
        return new self(self::ADD_COLUMN, null, $column);
    }

    public static function modifyColumn(ColumnDefinition $column): self
    {
        return new self(self::MODIFY_COLUMN, null, $column);
    }

    public static function dropColumn(string $name): self
    {
        return new self(self::DROP_COLUMN, null, null, null, $name);
    }

    public static function dropIndex(string $name): self
    {
        return new self(self::DROP_INDEX, null, null, null, $name);
    }

    public static function addIndex(IndexDefinition $index): self
    {
        return new self(self::ADD_INDEX, null, null, $index);
    }

    public function type(): string { return $this->type; }
    public function table(): ?TableDefinition { return $this->table; }
    public function column(): ?ColumnDefinition { return $this->column; }
    public function index(): ?IndexDefinition { return $this->index; }
    public function name(): ?string { return $this->name; }
}
