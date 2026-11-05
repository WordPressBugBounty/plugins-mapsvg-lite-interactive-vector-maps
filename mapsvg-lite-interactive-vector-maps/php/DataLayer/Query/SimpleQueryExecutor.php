<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

use MapSVG\DataLayer\Mapping\RecordMapper;

/** Executes only validated Plasma plans and maps rows back to public data. */
final class SimpleQueryExecutor
{
    private QueryStore $store;
    private RecordMapper $mapper;

    public function __construct(QueryStore $store, RecordMapper $mapper)
    {
        $this->store = $store;
        $this->mapper = $mapper;
    }

    public function execute(QueryPlan $plan): QueryExecution
    {
        if ($plan->isAdvanced()) {
            throw new AdvancedQueryRequired($plan->advancedReasons());
        }

        $storageRows = $this->store->findMany($plan->options());
        $hardLimit = $plan->hardRowLimit();
        if ($hardLimit !== null && count($storageRows) > $hardLimit) {
            throw new \LengthException(
                'Query exceeds the guarded All rows limit of ' . $hardLimit . '.'
            );
        }

        $hasMore = $plan->fetchesExtraRow()
            && count($storageRows) > $plan->perpage();
        $publicRows = array();
        foreach ($storageRows as $row) {
            if (!is_array($row)) {
                throw new \UnexpectedValueException('Query store rows must be arrays.');
            }
            $public = $this->mapper->fromStorage($row);
            if ($public === null) {
                throw new \UnexpectedValueException('Query mapper returned no public row.');
            }
            $projection = $plan->publicSelect();
            if ($projection !== null) {
                $projected = array();
                foreach ($projection as $name) {
                    if ($name === 'id'
                        && (!array_key_exists('id', $public) || $public['id'] === null)) {
                        throw new \UnexpectedValueException(
                            'Prisma query rows require a public id.'
                        );
                    }
                    if (array_key_exists($name, $public)) {
                        $projected[$name] = $public[$name];
                    }
                }
                $public = $projected;
            }
            $publicRows[] = $public;
        }
        if ($hasMore) {
            array_pop($publicRows);
        }

        $total = $plan->needsCount()
            ? $this->store->count($plan->countOptions())
            : null;

        return new QueryExecution(
            $publicRows,
            $hasMore,
            $total,
            $plan->page(),
            $plan->perpage()
        );
    }
}
