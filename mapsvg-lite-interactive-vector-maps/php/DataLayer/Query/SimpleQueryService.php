<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

use MapSVG\DataLayer\Validation\OperationValidationService;
use MapSVG\Query;

/** Shared execution seam for legacy Repository and React Admin Prisma queries. */
final class SimpleQueryService
{
    private LegacyQueryPlanner $legacyPlanner;
    private PrismaQueryPlanner $prismaPlanner;
    private SimpleQueryExecutor $executor;
    private ?AdvancedQueryExecutor $advancedExecutor;
    private ?OperationValidationService $operationValidator;

    public function __construct(
        LegacyQueryPlanner $legacyPlanner,
        PrismaQueryPlanner $prismaPlanner,
        SimpleQueryExecutor $executor,
        ?AdvancedQueryExecutor $advancedExecutor = null,
        ?OperationValidationService $operationValidator = null
    ) {
        $this->legacyPlanner = $legacyPlanner;
        $this->prismaPlanner = $prismaPlanner;
        $this->executor = $executor;
        $this->advancedExecutor = $advancedExecutor;
        $this->operationValidator = $operationValidator;
    }

    /**
     * @param callable $objectFactory fn(array<string,mixed>): mixed
     * @param array<string, mixed> $context
     * @return array<string, mixed>
     */
    public function findLegacy(
        Query $query,
        callable $objectFactory,
        array $context = array()
    ): array {
        $plan = $this->legacyPlanner->plan($query, $context);
        $execution = $this->executePlan($plan);
        return (new LegacyCollectionResponseAdapter($objectFactory))->adapt($execution);
    }

    /** @param array<string, mixed> $query @return array{rows:array,count:int} */
    public function findPrisma(array $query): array
    {
        if ($this->operationValidator !== null) {
            $this->operationValidator->validateFindMany($query);
        }
        $plan = $this->prismaPlanner->plan($query);
        $execution = $this->executePlan($plan);
        return (new PrismaQueryResponseAdapter())->adapt($execution);
    }

    /** Compose a saved predicate/projection with the existing complete Map filter planner. */
    public function findPageBinding(array $input, Query $runtime, array $context = array()): array
    {
        $base = $this->planPrisma($input);
        if (!$base->isPlasma()) throw new AdvancedQueryRequired($base->advancedReasons());
        $filter = $this->planLegacy($runtime, $context);
        $options = $base->options();
        $extra = $filter->isAdvanced() ? $filter->advancedOptions() : $filter->options();
        $parts = array_filter(array($options['where'] ?? array(), $extra['where'] ?? array()));
        $where = count($parts) > 1 ? array('AND' => array_values($parts)) : (reset($parts) ?: array());
        if ($filter->isAdvanced()) {
            $extra['where'] = $where;
            $extra['select'] = $options['select'] ?? array();
            $extra['skip'] = $options['skip'] ?? 0;
            $extra['take'] = $options['take'];
            $extra['orderBy'] = array();
            foreach ($options['orderBy'] ?? array() as $group) foreach ($group as $field => $direction) {
                $extra['orderBy'][] = array('kind' => 'field', 'field' => $field, 'direction' => $direction);
            }
            $plan = QueryPlan::advanced(QueryPlan::PRISMA_RESPONSE, $filter->advancedReasons(), 1,
                $options['take'], $extra, false, null, true, $base->publicSelect());
        } else {
            $options['where'] = $where;
            $plan = QueryPlan::plasma(QueryPlan::PRISMA_RESPONSE, $options,
                $where === array() ? array() : array('where' => $where), 1,
                $options['take'], false, null, true, $base->publicSelect());
        }
        return (new PrismaQueryResponseAdapter())->adapt($this->executePlan($plan));
    }

    private function executePlan(QueryPlan $plan): QueryExecution
    {
        if ($plan->isAdvanced() && $this->advancedExecutor !== null) {
            return $this->advancedExecutor->execute($plan);
        }
        return $this->executor->execute($plan);
    }

    public function planLegacy(
        Query $query,
        array $context = array()
    ): QueryPlan {
        return $this->legacyPlanner->plan($query, $context);
    }

    /** @param array<string, mixed> $query */
    public function planPrisma(array $query): QueryPlan
    {
        if ($this->operationValidator !== null) {
            $this->operationValidator->validateFindMany($query);
        }
        return $this->prismaPlanner->plan($query);
    }
}
