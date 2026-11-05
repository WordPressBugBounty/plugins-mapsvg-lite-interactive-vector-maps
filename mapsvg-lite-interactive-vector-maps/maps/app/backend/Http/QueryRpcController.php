<?php

declare(strict_types=1);
namespace MapSVG\App\Http;

use MapSVG\App\Data\Query\QueryAccessContext;
use MapSVG\App\Data\Query\QueryRpcDispatcher;
use MapSVG\Shared\QueryRpc\QueryRpcRequest;
use MapSVG\Shared\QueryRpc\RpcJson;

/** Read-only named RPC. WP authenticates the request; every resolver authorizes its own call. */
final class QueryRpcController
{
    private $factory;
    private $context;
    private $enabled;
    public function __construct(callable $factory, callable $context, callable $enabled)
    {
        $this->factory = $factory;
        $this->context = $context;
        $this->enabled = $enabled;
    }
    public function available(): bool { return (bool) ($this->enabled)(); }

    public function execute($request)
    {
        try {
            if (!$this->available()) return $this->error('rpc_unavailable', 'Query RPC is unavailable.', 503);
            if ($request->get_method() !== 'POST') return $this->error('method_not_allowed', 'Use POST for Query RPC.', 405);
            if (!$request->is_json_content_type()) return $this->error('unsupported_media_type', 'Query RPC requires JSON.', 415);
            // Generic WP response projections would corrupt the correlated RPC envelope.
            if (array_intersect(array_keys($request->get_query_params()), array('_fields', '_embed', '_envelope', '_jsonp'))) {
                return $this->error('invalid_request', 'RPC response modifiers are not supported.', 400);
            }
            $body = $request->get_body();
            if (!is_string($body) || strlen($body) > RpcJson::REQUEST_BYTES) {
                return $this->error('request_too_large', 'Query RPC request exceeds the limit.', 413);
            }
            try { $parsed = QueryRpcRequest::fromJson($body); }
            catch (\LengthException $error) { return $this->error('request_too_large', 'Query RPC request exceeds the limit.', 413); }
            catch (\InvalidArgumentException | \JsonException $error) { return $this->error('invalid_request', 'Invalid Query RPC request.', 400); }
            // Captured AFTER WordPress REST authentication, never from params/cookies directly.
            $context = ($this->context)();
            if (!$context instanceof QueryAccessContext) throw new \LogicException('Invalid Query context provider.');
            $dispatcher = ($this->factory)($context);
            if (!$dispatcher instanceof QueryRpcDispatcher) throw new \LogicException('Invalid Query dispatcher factory.');
            return $this->response($dispatcher->dispatch($parsed, $context), 200);
        } catch (\Throwable $error) {
            return $this->error('rpc_failed', 'Query RPC could not be initialized.', 500);
        }
    }
    private function error(string $code, string $message, int $status)
    {
        return $this->response(array('result' => null, 'error' => (object) array('code' => $code, 'message' => $message)), $status);
    }
    private function response($data, int $status)
    {
        return new \WP_REST_Response(is_array($data) ? $data : get_object_vars($data), $status, array(
            'Cache-Control' => 'private, no-store, max-age=0',
            'Vary' => 'Cookie, Authorization, X-WP-Nonce',
            'X-Content-Type-Options' => 'nosniff',
        ));
    }
}
