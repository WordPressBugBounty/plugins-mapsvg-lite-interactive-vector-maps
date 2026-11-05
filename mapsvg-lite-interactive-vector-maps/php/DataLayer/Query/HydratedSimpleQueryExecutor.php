<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

use MapSVG\DataLayer\Post\RecordHydrator;

/** Executes one simple Plasma legacy plan and hydrates domain objects in batch. */
final class HydratedSimpleQueryExecutor
{
    private QueryStore $store;
    private RecordHydrator $hydrator;

    public function __construct(
        QueryStore $store,
        RecordHydrator $hydrator
    ) {
        $this->store = $store;
        $this->hydrator = $hydrator;
    }

    public function execute(QueryPlan $plan): HydratedQueryExecution
    {
        if ($plan->isAdvanced()) {
            throw new AdvancedQueryRequired($plan->advancedReasons());
        }
        if ($plan->responseMode() !== QueryPlan::LEGACY_RESPONSE) {
            throw new \InvalidArgumentException(
                'Hydrated query executor supports legacy response plans only.'
            );
        }

        $storageRows = $this->store->findMany($plan->options());
        $hardLimit = $plan->hardRowLimit();
        if ($hardLimit !== null && count($storageRows) > $hardLimit) {
            throw new \LengthException(
                'Query exceeds the guarded All rows limit of '
                . $hardLimit . '.'
            );
        }

        $hasMore = $plan->fetchesExtraRow()
            && count($storageRows) > $plan->perpage();
        if ($hasMore) {
            array_pop($storageRows);
        }

        $items = $this->hydrator->hydrateMany($storageRows);
        foreach ($items as $item) {
            if ($item === null) {
                throw new \UnexpectedValueException(
                    'Hydrated query returned a null object for a physical row.'
                );
            }
        }

        $total = $plan->needsCount()
            ? $this->store->count($plan->countOptions())
            : null;

        return new HydratedQueryExecution(
            $items,
            $hasMore,
            $total,
            $plan->page(),
            $plan->perpage()
        );
    }
}
