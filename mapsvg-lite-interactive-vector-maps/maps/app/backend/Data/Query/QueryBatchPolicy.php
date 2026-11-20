<?php

declare(strict_types=1);
namespace MapSVG\App\Data\Query;

/** Request-local reuse identity, NOT an SQL plan/access grant. */
final class QueryBatchPolicy
{
    private ?string $reuseKey;
    public function __construct(?string $reuseKey)
    {
        if ($reuseKey !== null && ($reuseKey === '' || strlen($reuseKey) > 512)) {
            throw new \InvalidArgumentException('Invalid Query batch policy.');
        }
        $this->reuseKey = $reuseKey;
    }
    public function reuseKey(): ?string { return $this->reuseKey; }
}
