<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

/** Deterministic physical diff with explicit ownership and edit policy. */
final class SchemaDiff
{
    public function plan(
        ?TableDefinition $actual,
        TableDefinition $expected,
        ?TableDefinition $previous = null,
        ?TableDiffPolicy $policy = null
    ): TableChangePlan {
        $policy = $policy ?? TableDiffPolicy::nonDestructive();
        if ($actual === null) {
            return new TableChangePlan(array(
                TableOperation::createTable($expected),
            ));
        }
        if ($actual->physicalName() !== $expected->physicalName()) {
            throw new \InvalidArgumentException(
                'SchemaDiff requires the same physical table.'
            );
        }

        $actualPrimary = $actual->index('PRIMARY');
        $expectedPrimary = $expected->index('PRIMARY');
        $previousPrimary = $previous === null
            ? null
            : $previous->index('PRIMARY');
        $primaryChangedByEdit = $previous !== null
            && !$this->indexesEquivalent($previousPrimary, $expectedPrimary);
        if ($actualPrimary !== null
            && $expectedPrimary !== null
            && !$actualPrimary->equivalentTo($expectedPrimary)
            && $policy->canReplaceOwnedIndexes()
            && $primaryChangedByEdit) {
            throw new \RuntimeException(
                'Primary-key changes require a dedicated migration.'
            );
        }

        $dropIndexes = array();
        $addColumns = array();
        $modifyColumns = array();
        $dropColumns = array();
        $addIndexes = array();
        $preserved = array();

        $ownedIndexNames = array('PRIMARY', '_keywords');
        foreach ($ownedIndexNames as $name) {
            $actualIndex = $actual->index($name);
            $expectedIndex = $expected->index($name);
            $previousIndex = $previous === null
                ? null
                : $previous->index($name);
            $changedByEdit = $previous !== null
                && !$this->indexesEquivalent($previousIndex, $expectedIndex);
            if ($actualIndex !== null
                && ($expectedIndex === null
                    || !$actualIndex->equivalentTo($expectedIndex))
                && $policy->canReplaceOwnedIndexes()
                && $changedByEdit) {
                $dropIndexes[] = TableOperation::dropIndex($name);
            }
        }

        foreach ($expected->columns() as $name => $column) {
            $actualColumn = $actual->column($name);
            if ($actualColumn === null) {
                $addColumns[] = TableOperation::addColumn($column);
                continue;
            }
            $previousColumn = $previous === null
                ? null
                : $previous->column($name);
            $introducedByEdit = $previous !== null
                && $previousColumn === null;
            if ($introducedByEdit
                && !$column->equivalentTo($actualColumn)
                && $policy->canModifyColumns()) {
                throw new \RuntimeException(
                    'Cannot claim an existing unowned column with a different definition: '
                    . $name
                );
            }
            $changedByEdit = $previousColumn !== null
                && !$column->equivalentTo($previousColumn);
            if (!$column->equivalentTo($actualColumn)
                && $policy->canModifyColumns()
                && $changedByEdit) {
                $modifyColumns[] = TableOperation::modifyColumn($column);
            }
        }

        foreach ($actual->columns() as $name => $_column) {
            if ($expected->column($name) !== null) {
                continue;
            }
            $ownedByPrevious = $previous !== null
                && $previous->column($name) !== null;
            $usedByUnknownIndex = $this->usedByUnknownIndex($actual, $name);
            if ($ownedByPrevious
                && !$usedByUnknownIndex
                && $policy->canDropOwnedColumns()) {
                $dropColumns[] = TableOperation::dropColumn($name);
            } else {
                $preserved[] = $name;
            }
        }

        foreach ($ownedIndexNames as $name) {
            $actualIndex = $actual->index($name);
            $expectedIndex = $expected->index($name);
            $previousIndex = $previous === null
                ? null
                : $previous->index($name);
            $changedByEdit = $previous !== null
                && !$this->indexesEquivalent($previousIndex, $expectedIndex);
            if ($expectedIndex === null) {
                continue;
            }
            if ($actualIndex === null) {
                $addIndexes[] = TableOperation::addIndex($expectedIndex);
            } elseif (!$actualIndex->equivalentTo($expectedIndex)
                && $policy->canReplaceOwnedIndexes()
                && $changedByEdit) {
                $addIndexes[] = TableOperation::addIndex($expectedIndex);
            }
        }

        return new TableChangePlan(array_merge(
            $dropIndexes,
            $addColumns,
            $modifyColumns,
            $dropColumns,
            $addIndexes
        ), $preserved);
    }

    private function indexesEquivalent(
        ?IndexDefinition $left,
        ?IndexDefinition $right
    ): bool {
        if ($left === null || $right === null) {
            return $left === $right;
        }
        return $left->equivalentTo($right);
    }

    private function usedByUnknownIndex(
        TableDefinition $actual,
        string $columnName
    ): bool {
        foreach ($actual->indexes() as $name => $index) {
            if (in_array($name, array('PRIMARY', '_keywords'), true)) {
                continue;
            }
            foreach ($index->columns() as $column) {
                if ($column->name() === $columnName) {
                    return true;
                }
            }
        }
        return false;
    }

}
