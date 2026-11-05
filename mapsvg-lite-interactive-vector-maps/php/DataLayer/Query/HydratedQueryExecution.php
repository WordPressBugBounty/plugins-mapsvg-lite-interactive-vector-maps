<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

/** Legacy object result of one opt-in simple Plasma query. */
final class HydratedQueryExecution
{
    /** @var object[] */
    private array $items;
    private bool $hasMore;
    private ?int $total;
    private int $page;
    private int $perpage;

    /** @param object[] $items */
    public function __construct(
        array $items,
        bool $hasMore,
        ?int $total,
        int $page,
        int $perpage
    ) {
        foreach ($items as $item) {
            if (!is_object($item)) {
                throw new \InvalidArgumentException(
                    'Hydrated query items must be objects.'
                );
            }
        }

        $this->items = array_values($items);
        $this->hasMore = $hasMore;
        $this->total = $total;
        $this->page = $page;
        $this->perpage = $perpage;
    }

    /** @return object[] */
    public function items(): array
    {
        return $this->items;
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
