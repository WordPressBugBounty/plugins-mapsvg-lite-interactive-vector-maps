<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Workflow;

use MapSVG\DataLayer\Relation\RegionOrphanDeleteService;
use Plasma\Adapter\DatabaseAdapter;

/** Prefix-aware orphan mark/count/delete facade over validated physical storage. */
final class RegionOrphanService
{
    private DatabaseAdapter $adapter;
    private RegionOrphanDeleteService $deleteService;
    private string $physicalTable;
    private string $primaryKey;
    private int $batchSize;

    public function __construct(
        DatabaseAdapter $adapter,
        RegionOrphanDeleteService $deleteService,
        string $physicalTable,
        string $primaryKey,
        int $batchSize = 500
    ) {
        self::assertIdentifier($physicalTable, 'physical regions table');
        self::assertIdentifier($primaryKey, 'region primary key');
        if ($batchSize < 1 || $batchSize > 1000) {
            throw new \InvalidArgumentException(
                'Orphan workflow batch size must be between 1 and 1000.'
            );
        }

        $this->adapter = $adapter;
        $this->deleteService = $deleteService;
        $this->physicalTable = $physicalTable;
        $this->primaryKey = $primaryKey;
        $this->batchSize = $batchSize;
    }

    /** @param array<int,int|string> $ids */
    public function markByIds(array $ids, int $orphaned): void
    {
        $ids = self::ids($ids);
        if ($ids === array()) {
            return;
        }

        $table = self::quoteIdentifier($this->physicalTable);
        $primary = self::quoteIdentifier($this->primaryKey);
        $flag = $orphaned ? 1 : 0;

        foreach (array_chunk($ids, $this->batchSize) as $chunk) {
            $values = array();
            $params = array();
            foreach ($chunk as $id) {
                $values[] = '(%s, %d)';
                $params[] = $id;
                $params[] = $flag;
            }

            $sql = 'INSERT INTO ' . $table
                . ' (' . $primary . ', `orphaned`) VALUES '
                . implode(', ', $values)
                . ' ON DUPLICATE KEY UPDATE `orphaned` = VALUES(`orphaned`)';
            $this->adapter->execute(
                $this->adapter->prepare($sql, ...$params)
            );
        }
    }

    public function count(string $prefix = ''): int
    {
        $sql = 'SELECT COUNT(*) FROM '
            . self::quoteIdentifier($this->physicalTable)
            . ' WHERE `orphaned` = 1';
        $params = array();
        if ($prefix !== '') {
            $sql .= ' AND ' . self::quoteIdentifier($this->primaryKey)
                . ' LIKE %s';
            $params[] = $prefix . '%';
        }

        return (int) $this->adapter->getVar(
            $this->adapter->prepare($sql, ...$params)
        );
    }

    /** @return string[] */
    public function candidateIds(string $prefix = ''): array
    {
        $primary = self::quoteIdentifier($this->primaryKey);
        $sql = 'SELECT ' . $primary . ' AS `id` FROM '
            . self::quoteIdentifier($this->physicalTable)
            . ' WHERE `orphaned` = 1';
        $params = array();
        if ($prefix !== '') {
            $sql .= ' AND ' . $primary . ' LIKE %s';
            $params[] = $prefix . '%';
        }
        $sql .= ' ORDER BY ' . $primary . ' ASC';

        $rows = $this->adapter->query(
            $this->adapter->prepare($sql, ...$params)
        );
        $ids = array();
        foreach ($rows as $row) {
            if (!is_array($row) || !array_key_exists('id', $row)) {
                throw new \UnexpectedValueException(
                    'Orphan candidate rows must contain the id alias.'
                );
            }
            $ids[] = self::id($row['id']);
        }
        return $ids;
    }

    /** @return array{deleted:int,r2oDeleted:int,ids:string[]} */
    public function delete(string $prefix = ''): array
    {
        return $this->deleteService->deleteCandidates(
            $this->candidateIds($prefix)
        );
    }

    /** @param array<int,int|string> $values @return string[] */
    private static function ids(array $values): array
    {
        $ids = array();
        foreach ($values as $value) {
            $id = self::id($value);
            $ids[$id] = $id;
        }
        return array_values($ids);
    }

    /** @param mixed $value */
    private static function id($value): string
    {
        if (!is_int($value) && !is_string($value)) {
            throw new \InvalidArgumentException(
                'Region ID must be a string or integer.'
            );
        }
        return (string) $value;
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
