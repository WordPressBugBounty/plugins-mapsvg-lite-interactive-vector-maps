<?php

declare(strict_types=1);
namespace MapSVG\App\Data\Query;

/** Request-local reuse identity and planned returned rows, NOT an SQL plan/access grant. */
final class QueryBatchPolicy
{
    private ?string $reuseKey;
    private int $rowLimit;
    public function __construct(?string $reuseKey, int $rowLimit)
    {
        if (($reuseKey !== null && ($reuseKey === '' || strlen($reuseKey) > 512)) || $rowLimit < 0) {
            throw new \InvalidArgumentException('Invalid Query batch policy.');
        }
        $this->reuseKey = $reuseKey;
        $this->rowLimit = $rowLimit;
    }
    public function reuseKey(): ?string { return $this->reuseKey; }
    public function rowLimit(): int { return $this->rowLimit; }
}
