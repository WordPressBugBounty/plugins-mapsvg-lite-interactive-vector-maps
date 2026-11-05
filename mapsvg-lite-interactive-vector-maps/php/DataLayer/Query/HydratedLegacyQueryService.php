<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

use MapSVG\Query;

/** Opt-in legacy read service backed by simple Plasma rows + domain hydration. */
final class HydratedLegacyQueryService
{
    private LegacyQueryPlanner $planner;
    private HydratedSimpleQueryExecutor $executor;

    public function __construct(
        LegacyQueryPlanner $planner,
        HydratedSimpleQueryExecutor $executor
    ) {
        $this->planner = $planner;
        $this->executor = $executor;
    }

    /**
     * @param array<string,mixed> $context
     * @return array<string,mixed>
     */
    public function find(
        Query $query,
        array $context = array()
    ): array {
        $plan = $this->planner->plan($query, $context);
        $execution = $this->executor->execute($plan);

        return (new HydratedLegacyCollectionResponseAdapter())
            ->adapt($execution);
    }

    /** @param array<string,mixed> $context */
    public function plan(Query $query, array $context = array()): QueryPlan
    {
        return $this->planner->plan($query, $context);
    }
}
