<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

final class AdvancedQueryRequired extends \RuntimeException
{
    /** @var string[] */
    private array $reasons;

    /** @param string[] $reasons */
    public function __construct(array $reasons)
    {
        $this->reasons = array_values(array_unique($reasons));
        parent::__construct(
            'Query requires the advanced executor: ' . implode(', ', $this->reasons)
        );
    }

    /** @return string[] */
    public function reasons(): array
    {
        return $this->reasons;
    }
}
