<?php

declare(strict_types=1);
namespace MapSVG\App\Data\Query;

/** Limits work admitted between operations. Cannot interrupt an already-running SQL statement. */
final class QueryWorkBudget
{
    private int $rows = 0;
    private int $executions = 0;
    private int $maxRows;
    private int $maxExecutions;
    private float $deadline;
    private $clock;
    public function __construct(int $maxRows, int $maxExecutions, float $maxSeconds, callable $clock)
    {
        if ($maxRows < 1 || $maxExecutions < 1 || !is_finite($maxSeconds) || $maxSeconds <= 0) {
            throw new \InvalidArgumentException('Invalid Query work limits.');
        }
        $this->maxRows = $maxRows;
        $this->maxExecutions = $maxExecutions;
        $this->clock = $clock;
        $this->deadline = $this->now() + $maxSeconds;
    }
    public function assertTime(): void
    {
        if ($this->now() >= $this->deadline) throw new QueryRejected('query_budget_exceeded');
    }
    public function reserve(int $rowLimit): void
    {
        $this->assertTime();
        if ($rowLimit < 0 || $rowLimit > $this->maxRows - $this->rows || $this->executions >= $this->maxExecutions) {
            throw new QueryRejected('query_budget_exceeded');
        }
        $this->rows += $rowLimit;
        $this->executions++;
    }
    private function now(): float
    {
        $now = (float) ($this->clock)();
        if (!is_finite($now)) throw new \LogicException('Invalid Query clock.');
        return $now;
    }
}
