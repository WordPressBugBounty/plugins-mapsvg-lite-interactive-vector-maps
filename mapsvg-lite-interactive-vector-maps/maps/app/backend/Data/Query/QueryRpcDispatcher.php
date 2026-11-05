<?php

declare(strict_types=1);
namespace MapSVG\App\Data\Query;

use MapSVG\Shared\QueryRpc\QueryRpcRequest;
use MapSVG\Shared\QueryRpc\RpcJson;

/** In-process read dispatch. HTTP and real WordPress policy are separate composition. */
final class QueryRpcDispatcher
{
    private QueryRegistry $registry;
    private $reportError;
    private const ERRORS = array(
        'forbidden' => 'Query access denied.',
        'invalid_params' => 'Invalid query parameters.',
        'query_not_found' => 'Query is unavailable.',
        'query_failed' => 'Query execution failed.',
        'query_budget_exceeded' => 'Query request work limit reached.',
        'app_changed' => 'App changed. Reload its settings.',
        'app_not_found' => 'App is unavailable.',
        'query_changed' => 'Query definition changed. Refresh and retry.',
        'resource_not_found' => 'Requested data source is unavailable.',
        'result_too_large' => 'Query result exceeds the response limit.',
    );
    private int $maxRows;
    private int $maxExecutions;
    private float $maxSeconds;
    private $clock;
    public function __construct(QueryRegistry $registry, ?callable $reportError = null,
        int $maxRows = 10000, int $maxExecutions = 25, float $maxSeconds = 10.0, ?callable $clock = null)
    {
        $this->registry = $registry;
        $this->reportError = $reportError;
        $this->maxRows = $maxRows;
        $this->maxExecutions = $maxExecutions;
        $this->maxSeconds = $maxSeconds;
        $this->clock = $clock ?? static function (): float { return hrtime(true) / 1000000000; };
    }

    public function dispatch(QueryRpcRequest $request, object $context)
    {
        $results = array();
        $cache = array(); // Successful results only; never survives this dispatch/context.
        $budget = new QueryWorkBudget($this->maxRows, $this->maxExecutions, $this->maxSeconds, $this->clock);
        $nodes = RpcJson::BATCH_CALLS * 16;
        $remaining = RpcJson::RESPONSE_BYTES - RpcJson::BATCH_CALLS * 2048;
        foreach ($request->calls() as $call) {
            $outcome = $this->run($call, $context, $remaining, $nodes, $budget, $cache, $request->isBatch());
            if ($request->isBatch()) $outcome->requestId = $call->requestId;
            $results[] = $outcome;
        }
        return $request->isBatch() ? $results : $results[0];
    }

    private function run(\stdClass $call, object $context, int &$remaining, int &$nodes, QueryWorkBudget $budget, array &$cache, bool $batch): \stdClass
    {
        try {
            $budget->assertTime();
            $query = $this->registry->find($call->query);
            if ($query === null) throw new QueryRejected('query_not_found');
            if ($batch && $query instanceof SingleCallQueryResolver) throw new QueryRejected('invalid_params');
            $query->authorize($context, RpcJson::copy($call->params, RpcJson::PARAMS_BYTES));
            $params = $query->validateParams(RpcJson::copy($call->params, RpcJson::PARAMS_BYTES));
            $params = RpcJson::object(RpcJson::copy($params, RpcJson::PARAMS_BYTES));
            $policy = $query instanceof BatchAwareQueryResolver
                ? $query->batchPolicy($params, $context) : new QueryBatchPolicy(null, 0);
            $key = $policy->reuseKey() === null ? null : hash('sha256', $call->query . "\0" . $policy->reuseKey());
            if ($key !== null && array_key_exists($key, $cache)) {
                $result = $cache[$key];
            } else {
                $budget->reserve($policy->rowLimit());
                $result = $query->execute($params, $context);
            }
            try {
                $nextNodes = $nodes;
                $result = $query instanceof QueryResultAdmission
                    ? $query->copyResult($result,min(RpcJson::RESULT_BYTES,$remaining),$nextNodes)
                    : RpcJson::copyResult($result, min(RpcJson::RESULT_BYTES, $remaining), $nextNodes);
                $nodes = $nextNodes;
            } catch (\LengthException $error) {
                return $this->failure('result_too_large');
            }
            $remaining -= strlen(RpcJson::encode($result));
            if ($key !== null) $cache[$key] = $result;
            return (object) array('result' => $result, 'error' => null);
        } catch (QueryRejected $error) {
            return $this->failure($error->reason());
        } catch (\Throwable $error) {
            if ($this->reportError !== null) {
                try { ($this->reportError)($error, $call->query); } catch (\Throwable $ignored) {}
            }
            return $this->failure('query_failed');
        }
    }

    private function failure(string $code): \stdClass
    {
        return (object) array('result' => null, 'error' => (object) array('code' => $code, 'message' => self::ERRORS[$code]));
    }
}
