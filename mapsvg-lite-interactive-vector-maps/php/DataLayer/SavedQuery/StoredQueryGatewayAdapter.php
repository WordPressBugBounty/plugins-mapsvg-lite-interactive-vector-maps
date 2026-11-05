<?php

declare(strict_types=1);
namespace MapSVG\DataLayer\SavedQuery;

use MapSVG\DataLayer\Collection\CollectionQueryExecutionService;
use MapSVG\Shared\SavedQuery\StoredQueryGateway;
use MapSVG\Shared\SavedQuery\StoredQueryDefinition;
use MapSVG\Shared\SavedQuery\StoredQueryChanged;

/** App receives neutral DTOs; existing catalog/schema/execution stays behind this adapter. */
final class StoredQueryGatewayAdapter implements StoredQueryGateway
{
    private SavedQueryStore $store;
    private CollectionQueryExecutionService $execution;
    private int $siteId;
    public function __construct(SavedQueryStore $store, CollectionQueryExecutionService $execution, int $siteId)
    {
        if ($siteId < 1) throw new \InvalidArgumentException('Query site must be positive.');
        $this->store = $store;
        $this->execution = $execution;
        $this->siteId = $siteId;
    }
    public function findByName(string $name): ?StoredQueryDefinition
    {
        $this->assertSite();
        $saved = $this->store->queryByName($name);
        if ($saved === null) return null;
        $schema = $this->store->resolveSchema($saved['schemaId']);
        if ($schema === null || !$schema->isLocal()) throw new \UnexpectedValueException('Query collection is unavailable.');
        return new StoredQueryDefinition(array(
            'id' => $saved['id'], 'name' => $saved['name'], 'schemaId' => $saved['schemaId'],
            'input' => $saved['input'], 'rpc' => $saved['rpc'] ?? null,
            'fields' => QuerySchemaProjection::fields($schema),
            'schemaRevision' => QuerySchemaProjection::revision($schema),
        ));
    }
    public function execute(StoredQueryDefinition $definition, array $input): array
    {
        $this->assertSite();
        $current = $this->findByName($definition->name());
        if ($current === null || !hash_equals($definition->revision(), $current->revision())) {
            throw new StoredQueryChanged('Query definition changed; resolve again.');
        }
        $schema = $this->store->resolveSchema($current->schemaId());
        if ($schema === null || !hash_equals($current->schemaRevision(), QuerySchemaProjection::revision($schema))) {
            throw new StoredQueryChanged('Query schema changed; resolve again.');
        }
        return $this->execution->execute($schema, $input);
    }
    private function assertSite(): void
    {
        if (function_exists('get_current_blog_id') && (int) get_current_blog_id() !== $this->siteId) {
            throw new \LogicException('Query gateway belongs to a different WordPress site.');
        }
    }
}
