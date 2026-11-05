<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

/** Server-side bounds shared by legacy and Prisma-style query planning. */
final class QueryLimits
{
    private int $maxPageSize;
    private int $maxUnboundedRows;
    private int $maxListValues;
    private int $maxDepth;
    private int $maxConditions;

    public function __construct(
        int $maxPageSize = 1000,
        int $maxUnboundedRows = 10000,
        int $maxListValues = 1000,
        int $maxDepth = 32,
        int $maxConditions = 1000
    ) {
        foreach (array(
            'maxPageSize' => $maxPageSize,
            'maxUnboundedRows' => $maxUnboundedRows,
            'maxListValues' => $maxListValues,
            'maxDepth' => $maxDepth,
            'maxConditions' => $maxConditions,
        ) as $name => $value) {
            if ($value < 1) {
                throw new \InvalidArgumentException($name . ' must be a positive integer.');
            }
        }

        $this->maxPageSize = $maxPageSize;
        $this->maxUnboundedRows = $maxUnboundedRows;
        $this->maxListValues = $maxListValues;
        $this->maxDepth = $maxDepth;
        $this->maxConditions = $maxConditions;
    }

    public function maxPageSize(): int
    {
        return $this->maxPageSize;
    }

    public function maxUnboundedRows(): int
    {
        return $this->maxUnboundedRows;
    }

    public function maxListValues(): int
    {
        return $this->maxListValues;
    }

    public function maxDepth(): int
    {
        return $this->maxDepth;
    }

    public function maxConditions(): int
    {
        return $this->maxConditions;
    }
}
