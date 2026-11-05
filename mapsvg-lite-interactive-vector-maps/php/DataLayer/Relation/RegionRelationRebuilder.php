<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Relation;

use Plasma\Adapter\DatabaseAdapter;

/** Rebuilds one objects-table projection in bounded retry-safe batches. */
final class RegionRelationRebuilder
{
    private DatabaseAdapter $adapter;
    private DatabaseTransactionRunner $transactions;
    private RegionRelationStore $store;
    private RegionRelationNormalizer $normalizer;
    private string $objectsTable;
    private string $physicalObjectsTable;
    private string $primaryKey;
    private string $scope;

    public function __construct(
        DatabaseAdapter $adapter,
        DatabaseTransactionRunner $transactions,
        RegionRelationStore $store,
        RegionRelationNormalizer $normalizer,
        string $objectsTable,
        string $physicalObjectsTable,
        string $primaryKey
    ) {
        self::assertIdentifier($objectsTable, 'objects table');
        self::assertIdentifier(
            $physicalObjectsTable,
            'physical objects table'
        );
        self::assertIdentifier($primaryKey, 'primary key');

        $this->adapter = $adapter;
        $this->transactions = $transactions;
        $this->store = $store;
        $this->normalizer = $normalizer;
        $this->objectsTable = $objectsTable;
        $this->physicalObjectsTable = $physicalObjectsTable;
        $this->primaryKey = $primaryKey;
        $this->scope = hash('sha256', implode('|', array(
            $objectsTable,
            $physicalObjectsTable,
            $primaryKey,
            implode(',', $normalizer->fieldNames()),
        )));
    }

    public function begin(int $batchSize = 500): RegionRelationRebuildCheckpoint
    {
        if (!$this->normalizer->hasRelationFields()) {
            return RegionRelationRebuildCheckpoint::start(
                $this->scope,
                $batchSize,
                true
            );
        }

        $checkpoint = RegionRelationRebuildCheckpoint::start(
            $this->scope,
            $batchSize
        );
        $this->transactions->run(function (): void {
            $this->store->deleteForObjectsTable($this->objectsTable);
        });
        return $checkpoint;
    }

    public function runToCompletion(
        int $batchSize = 500
    ): RegionRelationRebuildCheckpoint {
        $checkpoint = $this->begin($batchSize);
        while (!$checkpoint->isComplete()) {
            $checkpoint = $this->runBatch($checkpoint);
        }
        return $checkpoint;
    }

    public function runBatch(
        RegionRelationRebuildCheckpoint $checkpoint
    ): RegionRelationRebuildCheckpoint {
        $this->assertCheckpoint($checkpoint);
        if ($checkpoint->isComplete()) {
            return $checkpoint;
        }

        return $this->transactions->run(function () use (
            $checkpoint
        ): RegionRelationRebuildCheckpoint {
            $rows = $this->nextBatch(
                $checkpoint->lastId(),
                $checkpoint->batchSize()
            );
            if ($rows === array()) {
                return $checkpoint->finish();
            }

            $processed = 0;
            $inserted = 0;
            $lastId = null;
            foreach ($rows as $row) {
                if (!is_array($row)) {
                    throw new \UnexpectedValueException(
                        'Relation rebuild rows must be arrays.'
                    );
                }
                $objectId = self::id(
                    $row[$this->primaryKey] ?? null,
                    'relation rebuild primary key'
                );
                if ($lastId !== null && $objectId === $lastId) {
                    throw new \UnexpectedValueException(
                        'Relation rebuild returned a duplicate primary key.'
                    );
                }

                $inserted += $this->store->replaceForObject(
                    $this->objectsTable,
                    $objectId,
                    $this->normalizer->linksFromRecord($row)
                );
                $processed++;
                $lastId = $objectId;
            }

            if ($lastId === null) {
                throw new \LogicException(
                    'Non-empty relation rebuild batch produced no cursor.'
                );
            }

            return $checkpoint->advance(
                $lastId,
                $processed,
                $inserted
            );
        });
    }

    /** @return array<int,array<string,mixed>> */
    private function nextBatch(?string $lastId, int $batchSize): array
    {
        $columns = array($this->primaryKey);
        foreach ($this->normalizer->fieldNames() as $fieldName) {
            self::assertIdentifier($fieldName, 'relation field');
            $columns[] = $fieldName;
        }
        $select = implode(', ', array_map(
            array(__CLASS__, 'quoteIdentifier'),
            array_values(array_unique($columns))
        ));
        $primary = self::quoteIdentifier($this->primaryKey);
        $sql = 'SELECT ' . $select
            . ' FROM ' . self::quoteIdentifier($this->physicalObjectsTable);
        $params = array();

        if ($lastId !== null) {
            $sql .= ' WHERE ' . $primary . ' > %s';
            $params[] = $lastId;
        }
        $sql .= ' ORDER BY ' . $primary . ' ASC LIMIT %d';
        $params[] = $batchSize;

        return $this->adapter->query(
            $this->adapter->prepare($sql, ...$params)
        );
    }

    private function assertCheckpoint(
        RegionRelationRebuildCheckpoint $checkpoint
    ): void {
        if ($checkpoint->scope() !== $this->scope) {
            throw new \InvalidArgumentException(
                'Relation rebuild checkpoint belongs to another scope.'
            );
        }
    }

    /** @param mixed $value */
    private static function id($value, string $label): string
    {
        if (!is_int($value) && !is_string($value)) {
            throw new \UnexpectedValueException(
                $label . ' must be a string or integer.'
            );
        }
        $value = (string) $value;
        if ($value === '') {
            throw new \UnexpectedValueException(
                $label . ' must not be empty.'
            );
        }
        return $value;
    }

    private static function quoteIdentifier(string $identifier): string
    {
        self::assertIdentifier($identifier, 'SQL');
        return '`' . $identifier . '`';
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
