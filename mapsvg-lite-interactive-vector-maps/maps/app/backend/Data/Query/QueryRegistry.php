<?php

declare(strict_types=1);
namespace MapSVG\App\Data\Query;

use MapSVG\Shared\QueryRpc\RpcJson;

final class QueryRegistry
{
    /** @var array<string,QueryResolver> */
    private array $queries = array();

    private ?QueryResolverProvider $provider;
    public function __construct(?QueryResolverProvider $provider = null) { $this->provider = $provider; }

    public function register(string $name, QueryResolver $resolver): void
    {
        $name = RpcJson::queryName($name);
        if (isset($this->queries[$name])) throw new \LogicException('Query name is already registered.');
        $this->queries[$name] = $resolver;
    }

    public function find(string $name): ?QueryResolver
    {
        $name = RpcJson::queryName($name);
        $registered = $this->queries[$name] ?? null;
        $saved = $this->provider ? $this->provider->find($name) : null;
        if ($registered !== null && $saved !== null) throw new \LogicException('Registered and saved Query names collide.');
        return $registered ?? $saved;
    }
}
