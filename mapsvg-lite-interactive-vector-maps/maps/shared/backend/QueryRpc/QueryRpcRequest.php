<?php

declare(strict_types=1);
namespace MapSVG\Shared\QueryRpc;

final class QueryRpcRequest
{
    private bool $batch;
    private array $calls;

    private function __construct(bool $batch, array $calls)
    {
        $this->batch = $batch;
        $this->calls = $calls;
    }

    public static function fromJson(string $json): self
    {
        if (strlen($json) > RpcJson::REQUEST_BYTES) throw new \LengthException('RPC request exceeds byte limit.');
        // Preserve {} versus [], including empty params.
        return self::fromWire(json_decode($json, false, 64, JSON_THROW_ON_ERROR));
    }

    public static function fromWire($raw): self
    {
        $value = RpcJson::copy($raw, RpcJson::REQUEST_BYTES);
        $batch = is_array($value);
        if ($batch && (count($value) < 1 || count($value) > RpcJson::BATCH_CALLS)) {
            throw new \InvalidArgumentException('Invalid RPC batch size.');
        }
        $calls = array();
        $ids = array();
        foreach ($batch ? $value : array($value) as $item) {
            $record = RpcJson::object($item, $batch ? array('requestId', 'query', 'params') : array('query', 'params'));
            $name = RpcJson::queryName($record->query ?? null);
            $params = RpcJson::object($record->params ?? null);
            if (strlen(RpcJson::encode($params)) > RpcJson::PARAMS_BYTES) throw new \LengthException('RPC params exceed byte limit.');
            $call = (object) array('query' => $name, 'params' => $params);
            if ($batch) {
                $id = RpcJson::requestId($record->requestId ?? null);
                if (isset($ids['id:' . $id])) throw new \InvalidArgumentException('Duplicate batch requestId.');
                $ids['id:' . $id] = true;
                $call->requestId = $id;
            }
            $calls[] = $call;
        }
        return new self($batch, $calls);
    }

    public function isBatch(): bool { return $this->batch; }

    /** Return detached copies so a resolver cannot rewrite later operations. */
    public function calls(): array { return array_map(static function ($call) { return RpcJson::copy($call, RpcJson::REQUEST_BYTES); }, $this->calls); }

    public function toWire()
    {
        $calls = $this->calls();
        return $this->batch ? $calls : $calls[0];
    }
}
