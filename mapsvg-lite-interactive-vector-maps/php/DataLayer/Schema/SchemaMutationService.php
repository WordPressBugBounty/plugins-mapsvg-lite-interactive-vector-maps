<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

use MapSVG\Schema;

/**
 * Orders non-transactional DDL, data transforms, metadata persistence,
 * and registry refresh so failed physical work never publishes new metadata.
 */
final class SchemaMutationService
{
    private TableManager $tables;
    private SchemaDataTransformPlanner $transformPlanner;
    private SchemaDataTransformExecutor $transformExecutor;
    private ?SchemaRegistrySynchronizer $registry;

    public function __construct(
        TableManager $tables,
        SchemaDataTransformPlanner $transformPlanner,
        SchemaDataTransformExecutor $transformExecutor,
        ?SchemaRegistrySynchronizer $registry = null
    ) {
        $this->tables = $tables;
        $this->transformPlanner = $transformPlanner;
        $this->transformExecutor = $transformExecutor;
        $this->registry = $registry;
    }

    /** @param callable $persist fn(Schema): mixed @return mixed */
    public function create(Schema $schema, callable $persist)
    {
        SchemaSqlDefinition::validate($schema);
        $plan = null;
        if ($this->hasPhysicalTable($schema)) {
            $plan = $this->tables->synchronize(
                $schema,
                null,
                TableDiffPolicy::nonDestructive()
            );
        }

        try {
            $result = call_user_func($persist, $schema);
        } catch (\Throwable $error) {
            if ($plan !== null && $plan->createsTable()) {
                try {
                    $this->tables->drop((string) $schema->getName());
                } catch (\Throwable $cleanupError) {
                    \MapSVG\Logger::error(
                        '[SCHEMA-CREATE-ROLLBACK] Failed to drop '
                        . (string) $schema->getName()
                        . ': ' . $cleanupError->getMessage()
                    );
                }
            }
            throw $error;
        }

        $this->refresh($schema);
        return $result;
    }

    /** @param callable $persist fn(Schema): mixed @return mixed */
    public function update(
        Schema $previous,
        Schema $next,
        callable $persist,
        bool $skipPhysical = false
    ) {
        $previousName = trim((string) $previous->getName());
        $nextName = trim((string) $next->getName());
        if ((string) $previous->getName() !== (string) $next->getName()) {
            throw new \DomainException('Collection names are immutable. Create a new Collection and rebind references instead of renaming it.');
        }
        SchemaSqlDefinition::validate($next);
        if ($skipPhysical && $this->hasPhysicalTable($next)) $this->tables->validateForWrite($next);
        $previousHasPhysicalTable = $this->hasPhysicalTable($previous);
        $nextHasPhysicalTable = $this->hasPhysicalTable($next);

        if (!$skipPhysical && $nextHasPhysicalTable) {
            $this->tables->synchronize(
                $next,
                $previous,
                TableDiffPolicy::explicitEdit()
            );
            $definition = $this->tables->definitionFor($next);
            $this->transformExecutor->execute(
                $definition->physicalName(),
                $this->transformPlanner->plan($previous, $next)
            );
        }

        $result = call_user_func($persist, $next);
        if ($previousName !== ''
            && ($previousName !== $nextName
                || ($previousHasPhysicalTable && !$nextHasPhysicalTable))) {
            $this->invalidate($previousName);
        }
        $this->refresh($next);
        return $result;
    }

    public function repair(Schema $schema): TableChangePlan
    {
        if (!$this->hasPhysicalTable($schema)) {
            return new TableChangePlan(array());
        }
        $plan = $this->tables->synchronize(
            $schema,
            null,
            TableDiffPolicy::nonDestructive()
        );
        $this->refresh($schema);
        return $plan;
    }

    /**
     * Explicit deletion keeps legacy ordering: table, dependent cleanup,
     * metadata. Registry state changes only after every step succeeds.
     *
     * @param callable $persistDelete fn(Schema): mixed
     * @param callable|null $cleanup fn(Schema): void
     * @return mixed
     */
    public function delete(
        Schema $schema,
        callable $persistDelete,
        ?callable $cleanup = null
    ) {
        $name = trim((string) $schema->getName());
        if ($this->hasPhysicalTable($schema)) {
            $this->tables->drop($name);
        }
        if ($cleanup !== null) {
            call_user_func($cleanup, $schema);
        }
        $result = call_user_func($persistDelete, $schema);
        if ($name !== '') {
            $this->invalidate($name);
        }
        return $result;
    }

    public function tableManager(): TableManager
    {
        return $this->tables;
    }

    private function hasPhysicalTable(Schema $schema): bool
    {
        if (method_exists($schema, 'isLocal') && !$schema->isLocal()) {
            return false;
        }
        return in_array(
            strtolower((string) ($schema->type ?? '')),
            array('object', 'post', 'region'),
            true
        );
    }

    private function refresh(Schema $schema): void
    {
        if ($this->registry !== null && $this->hasPhysicalTable($schema)) {
            $this->registry->refresh($schema);
        }
    }

    private function invalidate(string $logicalTable): void
    {
        if ($this->registry !== null) {
            $this->registry->invalidate($logicalTable);
        }
    }
}
