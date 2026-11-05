<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Relation;

use Plasma\Adapter\DatabaseAdapter;

/** Atomically deletes still-orphaned region rows and their shared-r2o links. */
final class RegionOrphanDeleteService
{
    private DatabaseAdapter $adapter;
    private DatabaseTransactionRunner $transactions;
    private RegionRelationStore $relations;
    private string $regionsTable;
    private string $physicalRegionsTable;
    private string $primaryKey;
    private int $batchSize;

    public function __construct(
        DatabaseAdapter $adapter,
        DatabaseTransactionRunner $transactions,
        RegionRelationStore $relations,
        string $regionsTable,
        string $physicalRegionsTable,
        string $primaryKey,
        int $batchSize = 500
    ) {
        self::assertIdentifier($regionsTable, 'regions table');
        self::assertIdentifier(
            $physicalRegionsTable,
            'physical regions table'
        );
        self::assertIdentifier($primaryKey, 'primary key');
        if ($batchSize < 1 || $batchSize > 1000) {
            throw new \InvalidArgumentException(
                'Orphan delete batch size must be between 1 and 1000.'
            );
        }

        $this->adapter = $adapter;
        $this->transactions = $transactions;
        $this->relations = $relations;
        $this->regionsTable = $regionsTable;
        $this->physicalRegionsTable = $physicalRegionsTable;
        $this->primaryKey = $primaryKey;
        $this->batchSize = $batchSize;
    }

    /**
     * @param array<int,int|string> $candidateIds
     * @return array{deleted:int,r2oDeleted:int,ids:string[]}
     */
    public function deleteCandidates(array $candidateIds): array
    {
        $candidateIds = self::ids($candidateIds);
        if ($candidateIds === array()) {
            return self::emptyResult();
        }

        return $this->transactions->run(function () use ($candidateIds): array {
            return $this->deleteWithinTransaction($candidateIds);
        });
    }

    /** Internal App draft operation: caller already owns the DB transaction and SVG lease. */
    public function deleteWithinTransaction(array $candidateIds): array
    {
        $candidateIds = self::ids($candidateIds);
        if ($candidateIds === array()) return self::emptyResult();
        $orphanIds = $this->lockCurrentOrphans($candidateIds);
        if ($orphanIds === array()) {
            return self::emptyResult();
        }

        $r2oDeleted = $this->relations->deleteForRegionsTableIds(
            $this->regionsTable,
            $orphanIds
        );
        $deleted = $this->deleteRows($orphanIds);
        if ($deleted !== count($orphanIds)) {
            throw new \RuntimeException(
                'Locked orphan-region delete count changed unexpectedly.'
            );
        }

        return array(
            'deleted' => $deleted,
            'r2oDeleted' => $r2oDeleted,
            'ids' => $orphanIds,
        );
    }

    /** @param string[] $candidateIds @return string[] */
    private function lockCurrentOrphans(array $candidateIds): array
    {
        $found = array();
        foreach (array_chunk($candidateIds, $this->batchSize) as $chunk) {
            $placeholders = implode(
                ', ',
                array_fill(0, count($chunk), '%s')
            );
            $sql = 'SELECT ' . self::quoteIdentifier($this->primaryKey)
                . ' FROM ' . self::quoteIdentifier(
                    $this->physicalRegionsTable
                )
                . ' WHERE `orphaned` = 1 AND '
                . self::quoteIdentifier($this->primaryKey)
                . ' IN (' . $placeholders . ') FOR UPDATE';
            $rows = $this->adapter->query(
                $this->adapter->prepare($sql, ...$chunk)
            );

            foreach ($rows as $row) {
                if (!is_array($row)) {
                    throw new \UnexpectedValueException(
                        'Locked orphan rows must be arrays.'
                    );
                }
                $id = self::id(
                    $row[$this->primaryKey] ?? null,
                    'locked orphan ID'
                );
                $found[$id] = true;
            }
        }

        $ordered = array();
        foreach ($candidateIds as $id) {
            if (isset($found[$id])) {
                $ordered[] = $id;
            }
        }
        return $ordered;
    }

    /** @param string[] $orphanIds */
    private function deleteRows(array $orphanIds): int
    {
        $deleted = 0;
        foreach (array_chunk($orphanIds, $this->batchSize) as $chunk) {
            $placeholders = implode(
                ', ',
                array_fill(0, count($chunk), '%s')
            );
            $sql = 'DELETE FROM ' . self::quoteIdentifier(
                $this->physicalRegionsTable
            )
                . ' WHERE `orphaned` = 1 AND '
                . self::quoteIdentifier($this->primaryKey)
                . ' IN (' . $placeholders . ')';
            $deleted += $this->adapter->execute(
                $this->adapter->prepare($sql, ...$chunk)
            );
        }
        return $deleted;
    }

    /** @param array<int,int|string> $values @return string[] */
    private static function ids(array $values): array
    {
        $ids = array();
        foreach ($values as $value) {
            $id = self::id($value, 'orphan candidate ID');
            $ids[$id] = $id;
        }
        $ids = array_values($ids);
        sort($ids, SORT_STRING);
        return $ids;
    }

    /** @param mixed $value */
    private static function id($value, string $label): string
    {
        if (!is_int($value) && !is_string($value)) {
            throw new \InvalidArgumentException(
                $label . ' must be a string or integer.'
            );
        }
        $value = (string) $value;
        if ($value === '') {
            throw new \InvalidArgumentException(
                $label . ' must not be empty.'
            );
        }
        return $value;
    }

    /** @return array{deleted:int,r2oDeleted:int,ids:string[]} */
    private static function emptyResult(): array
    {
        return array('deleted' => 0, 'r2oDeleted' => 0, 'ids' => array());
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
