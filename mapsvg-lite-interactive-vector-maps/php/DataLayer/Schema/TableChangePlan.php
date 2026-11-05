<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

final class TableChangePlan
{
    /** @var TableOperation[] */
    private array $operations;
    /** @var string[] */
    private array $preservedColumns;

    /**
     * @param TableOperation[] $operations
     * @param string[] $preservedColumns
     */
    public function __construct(
        array $operations,
        array $preservedColumns = array()
    ) {
        foreach ($operations as $operation) {
            if (!$operation instanceof TableOperation) {
                throw new \InvalidArgumentException(
                    'Change plan contains an invalid operation.'
                );
            }
        }
        $this->operations = array_values($operations);
        $this->preservedColumns = array_values(array_unique(
            $preservedColumns
        ));
    }

    /** @return TableOperation[] */
    public function operations(): array { return $this->operations; }
    /** @return string[] */
    public function preservedColumns(): array
    {
        return $this->preservedColumns;
    }
    public function isNoop(): bool { return $this->operations === array(); }
    public function createsTable(): bool
    {
        return isset($this->operations[0])
            && $this->operations[0]->type()
                === TableOperation::CREATE_TABLE;
    }
}
