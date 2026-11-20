<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

/** Input complexity bounds shared by legacy and Prisma-style query planning. No result row limits. */
final class QueryLimits
{
    private int $maxListValues;
    private int $maxDepth;
    private int $maxConditions;

    public function __construct(
        int $maxListValues = 1000,
        int $maxDepth = 32,
        int $maxConditions = 1000
    ) {
        foreach (array(
            'maxListValues' => $maxListValues,
            'maxDepth' => $maxDepth,
            'maxConditions' => $maxConditions,
        ) as $name => $value) {
            if ($value < 1) {
                throw new \InvalidArgumentException($name . ' must be a positive integer.');
            }
        }

        $this->maxListValues = $maxListValues;
        $this->maxDepth = $maxDepth;
        $this->maxConditions = $maxConditions;
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
