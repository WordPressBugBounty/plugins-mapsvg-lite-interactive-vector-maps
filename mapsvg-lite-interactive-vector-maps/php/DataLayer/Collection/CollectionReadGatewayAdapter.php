<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Collection;

use MapSVG\DataLayer\SavedQuery\QuerySchemaProjection;
use MapSVG\RepositoryFactory;
use MapSVG\Schema;
use MapSVG\Shared\Collection\CollectionReadChanged;
use MapSVG\Shared\Collection\CollectionReadGateway;
use MapSVG\Shared\Collection\CollectionReadSchema;
use MapSVG\Shared\Collection\CollectionSchemaCatalog;
use MapSVG\Shared\Collection\CollectionName;

/** DataLayer-owned implementation of the neutral direct Collection read seam. */
final class CollectionReadGatewayAdapter implements CollectionReadGateway, CollectionSchemaCatalog
{
    private int $siteId;
    private $schemaResolver;
    private $runner;
    private $schemaNameResolver;

    public function __construct(
        int $siteId,
        ?callable $schemaResolver = null,
        ?callable $runner = null,
        ?callable $schemaNameResolver = null
    ) {
        if ($siteId < 1) {
            throw new \InvalidArgumentException('Collection site must be positive.');
        }
        $this->siteId = $siteId;
        $this->schemaResolver = $schemaResolver ?? static function (int $schemaId): ?Schema {
            $repository = RepositoryFactory::get('schema');
            if ($repository === null) {
                return null;
            }
            $schema = $repository->findById($schemaId);
            return $schema instanceof Schema ? $schema : null;
        };
        $this->runner = $runner ?? static function (Schema $schema, array $input): array {
            return (new CollectionQueryExecutionService())->execute($schema, $input);
        };
        $this->schemaNameResolver = $schemaNameResolver ?? static function (string $name): array {
            $repository = RepositoryFactory::get('schema');
            if ($repository === null) return array();
            // Read two matches so collations/duplicate rows cannot silently create aliases.
            $result = $repository->find(new \MapSVG\Query(array(
                'filters' => array('name' => $name), 'perpage' => 2,
            )));
            return is_array($result['items'] ?? null) ? $result['items'] : array();
        };
    }

    public function findSchemaByName(string $name): ?CollectionReadSchema
    {
        $this->assertSite();
        CollectionName::validate($name);
        $matches = call_user_func($this->schemaNameResolver, $name);
        if (!is_array($matches)) throw new \UnexpectedValueException('Invalid Collection catalog result.');
        if (count($matches) > 1) return null;
        $schema = $matches[0] ?? null;
        if (!$schema instanceof Schema || !$schema->isLocal() || $schema->getName() !== $name) return null;
        return self::snapshot($schema);
    }

    public function findSchema(int $schemaId): ?CollectionReadSchema
    {
        $this->assertSite();
        if ($schemaId < 1) {
            return null;
        }
        $schema = call_user_func($this->schemaResolver, $schemaId);
        if (!$schema instanceof Schema || (int) $schema->id !== $schemaId || !$schema->isLocal()) {
            return null;
        }

        return self::snapshot($schema);
    }

    public function listSchemas(): array
    {
        $this->assertSite();
        $repository = RepositoryFactory::get('schema');
        if ($repository === null) {
            return array();
        }
        $result = $repository->find();
        $schemas = is_array($result) && is_array($result['items'] ?? null)
            ? $result['items']
            : array();
        $snapshots = array();
        foreach ($schemas as $schema) {
            if ($schema instanceof Schema && $schema->isLocal()) {
                $snapshots[] = self::snapshot($schema);
            }
        }
        usort($snapshots, static function (CollectionReadSchema $a, CollectionReadSchema $b): int {
            return $a->id() <=> $b->id();
        });
        return $snapshots;
    }

    public function read(CollectionReadSchema $snapshot, array $input): array
    {
        $this->assertSite();
        $schema = call_user_func($this->schemaResolver, $snapshot->id());
        if (!$schema instanceof Schema || !$schema->isLocal()
            || !hash_equals($snapshot->revision(), QuerySchemaProjection::revision($schema))) {
            throw new CollectionReadChanged('Collection schema changed; resolve again.');
        }

        $result = call_user_func($this->runner, $schema, $input);
        if (!is_array($result) || !is_array($result['rows'] ?? null)
            || !is_int($result['count'] ?? null) || $result['count'] < 0) {
            throw new \UnexpectedValueException('Collection read returned an invalid result.');
        }
        return array('rows' => array_values($result['rows']), 'count' => $result['count']);
    }

    private static function snapshot(Schema $schema): CollectionReadSchema
    {
        return new CollectionReadSchema(
            (int) $schema->id,
            (string) $schema->getName(),
            (string) $schema->getTitle(),
            (string) ($schema->type ?? ''),
            QuerySchemaProjection::fields($schema),
            QuerySchemaProjection::revision($schema)
        );
    }

    private function assertSite(): void
    {
        if (function_exists('get_current_blog_id')
            && (int) get_current_blog_id() !== $this->siteId) {
            throw new \LogicException('Collection gateway belongs to a different WordPress site.');
        }
    }
}
