<?php

declare(strict_types=1);
namespace MapSVG\App\Data\Query;

/** Explicit safe reason codes, not arbitrary exception messages. */
final class QueryRejected extends \RuntimeException
{
    private string $reason;
    public function __construct(string $reason)
    {
        if (!in_array($reason, array('app_changed', 'app_not_found', 'forbidden', 'invalid_params', 'query_not_found', 'query_changed', 'query_budget_exceeded', 'resource_not_found'), true)) {
            throw new \InvalidArgumentException('Invalid query rejection reason.');
        }
        $this->reason = $reason;
        parent::__construct($reason);
    }
    public function reason(): string { return $this->reason; }
}
