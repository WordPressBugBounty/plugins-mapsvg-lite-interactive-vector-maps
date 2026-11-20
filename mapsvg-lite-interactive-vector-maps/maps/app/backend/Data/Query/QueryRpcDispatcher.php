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
        'app_changed' => 'App changed. Reload its settings.',
        'app_not_found' => 'App is unavailable.',
        'query_changed' => 'Query definition changed. Refresh and retry.',
        'resource_not_found' => 'Requested data source is unavailable.',
    );
    public function __construct(QueryRegistry $registry, ?callable $reportError = null)
    {
        $this->registry = $registry;
        $this->reportError = $reportError;
    }

    public function dispatch(QueryRpcRequest $request, object $context)
    {
        $results = array();
        $cache = array(); // Successful results only; never survives this dispatch/context.
        foreach ($request->calls() as $call) {
            $outcome = $this->run($call, $context, $cache, $request->isBatch());
            if ($request->isBatch()) $outcome->requestId = $call->requestId;
            $results[] = $outcome;
        }
        return $request->isBatch() ? $results : $results[0];
    }

    private function run(\stdClass $call, object $context, array &$cache, bool $batch): \stdClass
    {
        try {
            $query = $this->registry->find($call->query);
            if ($query === null) throw new QueryRejected('query_not_found');
            if ($batch && $query instanceof SingleCallQueryResolver) throw new QueryRejected('invalid_params');
            $query->authorize($context, RpcJson::copy($call->params, RpcJson::PARAMS_BYTES));
            $params = $query->validateParams(RpcJson::copy($call->params, RpcJson::PARAMS_BYTES));
            $params = RpcJson::object(RpcJson::copy($params, RpcJson::PARAMS_BYTES));
            $policy = $query instanceof BatchAwareQueryResolver
                ? $query->batchPolicy($params, $context) : new QueryBatchPolicy(null);
            $key = $policy->reuseKey() === null ? null : hash('sha256', $call->query . "\0" . $policy->reuseKey());
            if ($key !== null && array_key_exists($key, $cache)) {
                $result = $cache[$key];
            } else {
                $result = $query->execute($params, $context);
            }
            $nodes = 0;
            $result = $query instanceof QueryResultAdmission
                ? $query->copyResult($result, null, $nodes)
                : RpcJson::copyResult($result);
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
