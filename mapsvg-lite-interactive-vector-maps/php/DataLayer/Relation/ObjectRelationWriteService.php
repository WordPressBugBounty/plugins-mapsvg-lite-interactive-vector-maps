<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Relation;

/** Coordinates object-row DML with its shared-r2o projection. */
final class ObjectRelationWriteService
{
    private DatabaseTransactionRunner $transactions;
    private RegionRelationStore $relations;
    private string $objectsTable;

    public function __construct(
        DatabaseTransactionRunner $transactions,
        RegionRelationStore $relations,
        string $objectsTable
    ) {
        self::assertIdentifier($objectsTable, 'objects table');
        $this->transactions = $transactions;
        $this->relations = $relations;
        $this->objectsTable = $objectsTable;
    }

    /** @return mixed */
    public function create(callable $writeRow)
    {
        return $this->write($writeRow, true);
    }

    /** @return mixed */
    public function update(callable $writeRow)
    {
        return $this->write($writeRow, false);
    }

    /** @param int|string $objectId @return mixed */
    public function delete($objectId, callable $deleteRow)
    {
        $objectId = self::id($objectId);
        return $this->transactions->run(function () use (
            $objectId,
            $deleteRow
        ) {
            $result = call_user_func($deleteRow);
            $this->relations->deleteForObject(
                $this->objectsTable,
                $objectId
            );
            return $result;
        });
    }

    /** @return mixed */
    public function clear(callable $deleteRows)
    {
        return $this->transactions->run(function () use ($deleteRows) {
            $result = call_user_func($deleteRows);
            $this->relations->deleteForObjectsTable($this->objectsTable);
            return $result;
        });
    }

    /** @return mixed */
    private function write(callable $writeRow, bool $requireReplacement)
    {
        return $this->transactions->run(function () use (
            $writeRow,
            $requireReplacement
        ) {
            $write = call_user_func($writeRow);
            if (!$write instanceof ObjectRelationWriteResult) {
                throw new \UnexpectedValueException(
                    'Object row callback must return ObjectRelationWriteResult.'
                );
            }
            if ($requireReplacement && !$write->replacesRelations()) {
                throw new \LogicException(
                    'Object creation must publish an explicit relation set.'
                );
            }
            if ($write->replacesRelations()) {
                $this->relations->replaceForObject(
                    $this->objectsTable,
                    $write->objectId(),
                    $write->links()
                );
            }
            return $write->record();
        });
    }

    /** @param int|string $value */
    private static function id($value): string
    {
        if (!is_int($value) && !is_string($value)) {
            throw new \InvalidArgumentException(
                'Object ID must be a string or integer.'
            );
        }
        $value = (string) $value;
        if ($value === '') {
            throw new \InvalidArgumentException('Object ID must not be empty.');
        }
        return $value;
    }

    private static function assertIdentifier(
        string $identifier,
        string $label
    ): void {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $identifier)) {
            throw new \InvalidArgumentException(
                'Invalid ' . $label . ' identifier.'
            );
        }
    }
}
