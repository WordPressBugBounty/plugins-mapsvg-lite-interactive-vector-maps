<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

final class IndexDefinition
{
    public const PRIMARY = 'primary';
    public const FULLTEXT = 'fulltext';
    public const INDEX = 'index';
    public const UNIQUE = 'unique';

    private string $name;
    private string $type;
    /** @var IndexColumn[] */
    private array $columns;

    /** @param IndexColumn[] $columns */
    public function __construct(string $name, string $type, array $columns)
    {
        if ($name !== 'PRIMARY'
            && !preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $name)) {
            throw new \InvalidArgumentException('Invalid index identifier.');
        }
        if (!in_array($type, array(
            self::PRIMARY,
            self::FULLTEXT,
            self::INDEX,
            self::UNIQUE,
        ), true)) {
            throw new \InvalidArgumentException('Unsupported index type.');
        }
        if ($type === self::PRIMARY && $name !== 'PRIMARY') {
            throw new \InvalidArgumentException(
                'Primary index must be named PRIMARY.'
            );
        }
        if ($columns === array()) {
            throw new \InvalidArgumentException(
                'Index must contain at least one column.'
            );
        }
        foreach ($columns as $column) {
            if (!$column instanceof IndexColumn) {
                throw new \InvalidArgumentException(
                    'Index columns must be IndexColumn values.'
                );
            }
        }
        $this->name = $name;
        $this->type = $type;
        $this->columns = array_values($columns);
    }

    public function name(): string { return $this->name; }
    public function type(): string { return $this->type; }
    /** @return IndexColumn[] */
    public function columns(): array { return $this->columns; }

    public function equivalentTo(self $other): bool
    {
        if ($this->name !== $other->name
            || $this->type !== $other->type
            || count($this->columns) !== count($other->columns)) {
            return false;
        }
        foreach ($this->columns as $position => $column) {
            if (!$column->equivalentTo($other->columns[$position])) {
                return false;
            }
        }
        return true;
    }
}
