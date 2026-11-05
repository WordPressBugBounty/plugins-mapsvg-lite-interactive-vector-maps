<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

use MapSVG\Schema;
use Plasma\Adapter\DatabaseAdapter;

/** Applies recoverable one-statement-at-a-time MySQL table changes. */
final class TableManager
{
    private DatabaseAdapter $adapter;
    private PhysicalTableInspector $inspector;
    private SchemaTableDefinitionFactory $definitions;
    private SchemaDiff $diff;
    private MysqlTableRenderer $renderer;

    public function __construct(
        DatabaseAdapter $adapter,
        PhysicalTableInspector $inspector,
        SchemaTableDefinitionFactory $definitions,
        ?SchemaDiff $diff = null,
        ?MysqlTableRenderer $renderer = null
    ) {
        $this->adapter = $adapter;
        $this->inspector = $inspector;
        $this->definitions = $definitions;
        $this->diff = $diff ?? new SchemaDiff();
        $this->renderer = $renderer ?? new MysqlTableRenderer($adapter);
    }

    public function definitionFor(Schema $schema): TableDefinition
    {
        return $this->definitions->fromSchema($schema);
    }

    /** Inspect existing identifiers before any write, even when physical updates are skipped. */
    public function validateForWrite(Schema $schema): void
    {
        $expected = $this->definitionFor($schema);
        $actual = $this->inspector->inspect($expected->logicalName());
        if ($actual !== null) {
            foreach ($actual->columns() as $column) SchemaSqlDefinition::identifier($column->name());
        }
    }

    public function plan(
        Schema $schema,
        ?Schema $previousSchema = null,
        ?TableDiffPolicy $policy = null
    ): TableChangePlan {
        $expected = $this->definitionFor($schema);
        $actual = $this->inspector->inspect($expected->logicalName());
        $previous = $previousSchema === null
            ? null
            : $this->definitionFor($previousSchema);

        return $this->diff->plan(
            $actual,
            $expected,
            $previous,
            $policy ?? TableDiffPolicy::nonDestructive()
        );
    }

    public function synchronize(
        Schema $schema,
        ?Schema $previousSchema = null,
        ?TableDiffPolicy $policy = null
    ): TableChangePlan {
        $expected = $this->definitionFor($schema);
        $actual = $this->inspector->inspect($expected->logicalName());
        $previous = $previousSchema === null
            ? null
            : $this->definitionFor($previousSchema);
        $plan = $this->diff->plan(
            $actual,
            $expected,
            $previous,
            $policy ?? TableDiffPolicy::nonDestructive()
        );
        foreach ($plan->operations() as $operation) {
            $this->adapter->execute(
                $this->renderer->operationSql($operation, $expected)
            );
        }
        return $plan;
    }

    public function rename(string $fromLogical, string $toLogical): bool
    {
        if ($fromLogical === $toLogical) {
            return false;
        }
        $from = $this->inspector->inspect($fromLogical);
        if ($from === null) {
            return false;
        }
        if ($this->inspector->inspect($toLogical) !== null) {
            throw new \RuntimeException(
                'Cannot rename MapSVG table: target already exists.'
            );
        }
        $toPhysical = $this->inspector->physicalTableName($toLogical);
        $this->adapter->execute($this->renderer->renameTableSql(
            $from->physicalName(),
            $toPhysical
        ));
        return true;
    }

    public function drop(string $logicalTable): bool
    {
        $definition = $this->inspector->inspect($logicalTable);
        if ($definition === null) {
            return false;
        }
        $this->adapter->execute(
            $this->renderer->dropTableSql($definition->physicalName())
        );
        return true;
    }

    public function exists(string $logicalTable): bool
    {
        return $this->inspector->inspect($logicalTable) !== null;
    }
}
