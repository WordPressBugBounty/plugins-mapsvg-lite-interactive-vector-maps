<?php

declare(strict_types=1);
namespace MapSVG\App\Data\Query;

use MapSVG\Shared\QueryRpc\RpcJson;
use MapSVG\Shared\SavedQuery\StoredQueryGateway;

/** Resolve each call from the current catalog, never keep a cross-request permission cache. */
final class StoredQueryProvider implements QueryResolverProvider
{
    private StoredQueryGateway $gateway;
    private int $siteId;
    public function __construct(StoredQueryGateway $gateway, int $siteId)
    {
        if ($siteId < 1) throw new \InvalidArgumentException('Query site must be positive.');
        $this->gateway = $gateway;
        $this->siteId = $siteId;
    }
    public function find(string $name): ?QueryResolver
    {
        $definition = $this->gateway->findByName(RpcJson::queryName($name));
        if ($definition === null) return null;
        if ($definition->name() !== $name) throw new \UnexpectedValueException('Query name lookup mismatch.');
        return new StoredQueryResolver($this->gateway, $definition, $this->siteId);
    }
}
