<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

/** Public-row result of one fully executed simple plan. */
final class QueryExecution
{
    /** @var array<int, array<string, mixed>> */
    private array $rows;
    private bool $hasMore;
    private ?int $total;
    private int $page;
    private int $perpage;

    /** @param array<int, array<string, mixed>> $rows */
    public function __construct(
        array $rows,
        bool $hasMore,
        ?int $total,
        int $page,
        int $perpage
    ) {
        $this->rows = array_values($rows);
        $this->hasMore = $hasMore;
        $this->total = $total;
        $this->page = $page;
        $this->perpage = $perpage;
    }

    /** @return array<int, array<string, mixed>> */
    public function rows(): array
    {
        return $this->rows;
    }

    public function hasMore(): bool
    {
        return $this->hasMore;
    }

    public function total(): ?int
    {
        return $this->total;
    }

    public function page(): int
    {
        return $this->page;
    }

    public function perpage(): int
    {
        return $this->perpage;
    }
}
