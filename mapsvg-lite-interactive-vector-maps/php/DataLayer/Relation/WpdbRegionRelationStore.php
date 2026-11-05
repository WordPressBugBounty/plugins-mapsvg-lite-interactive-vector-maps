<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Relation;

use Plasma\Adapter\DatabaseAdapter;

/** Prepared/idempotent access to the shared global r2o table. */
final class WpdbRegionRelationStore implements RegionRelationStore
{
    private DatabaseAdapter $adapter;
    private string $logicalTable;
    private string $physicalTable;
    private int $batchSize;

    public function __construct(
        DatabaseAdapter $adapter,
        string $logicalTable = 'r2o',
        int $batchSize = 500
    ) {
        self::assertIdentifier($logicalTable, 'relation table');
        if ($batchSize < 1 || $batchSize > 1000) {
            throw new \InvalidArgumentException(
                'Relation batch size must be between 1 and 1000.'
            );
        }
        $physicalTable = $adapter->getPrefix() . $logicalTable;
        self::assertIdentifier($physicalTable, 'physical relation table');

        $this->adapter = $adapter;
        $this->logicalTable = $logicalTable;
        $this->physicalTable = $physicalTable;
        $this->batchSize = $batchSize;
    }

    public function linksForObject(
        string $objectsTable,
        $objectId,
        ?string $regionsTable = null
    ): array {
        self::assertIdentifier($objectsTable, 'objects table');
        $objectId = self::id($objectId, 'object ID');
        $params = array($objectsTable, $objectId);
        $sql = 'SELECT `regions_table`, `region_id` FROM '
            . self::quoteIdentifier($this->physicalTable)
            . ' WHERE `objects_table` = %s AND `object_id` = %s';

        if ($regionsTable !== null) {
            self::assertIdentifier($regionsTable, 'regions table');
            $sql .= ' AND `regions_table` = %s';
            $params[] = $regionsTable;
        }
        $sql .= ' ORDER BY `regions_table`, `region_id`';
        $rows = $this->adapter->query(
            $this->adapter->prepare($sql, ...$params)
        );

        $links = array();
        foreach ($rows as $row) {
            if (!is_array($row)) {
                throw new \UnexpectedValueException(
                    'Relation rows must be arrays.'
                );
            }
            $link = new RegionRelationLink(
                (string) ($row['regions_table'] ?? ''),
                $row['region_id'] ?? null
            );
            $links[$link->identity()] = $link;
        }
        return array_values($links);
    }

    public function replaceForObject(
        string $objectsTable,
        $objectId,
        array $links
    ): int {
        self::assertIdentifier($objectsTable, 'objects table');
        $objectId = self::id($objectId, 'object ID');
        $normalized = self::links($links);
        $this->deleteForObject($objectsTable, $objectId);

        $rows = array();
        foreach ($normalized as $link) {
            $rows[] = array(
                'object_id' => $objectId,
                'link' => $link,
            );
        }
        return $this->insertMany($objectsTable, $rows);
    }

    public function insertMany(string $objectsTable, array $rows): int
    {
        self::assertIdentifier($objectsTable, 'objects table');
        $normalized = array();

        foreach ($rows as $rawRow) {
            $row = is_object($rawRow)
                ? get_object_vars($rawRow)
                : (array) $rawRow;
            $objectId = self::id(
                $row['object_id'] ?? null,
                'object ID'
            );
            $link = $row['link'] ?? null;
            if (!$link instanceof RegionRelationLink) {
                throw new \InvalidArgumentException(
                    'Relation rows require a RegionRelationLink.'
                );
            }
            $key = $objectId . "\0" . $link->identity();
            $normalized[$key] = array(
                'object_id' => $objectId,
                'link' => $link,
            );
        }

        if ($normalized === array()) {
            return 0;
        }

        $inserted = 0;
        foreach (array_chunk(
            array_values($normalized),
            $this->batchSize
        ) as $chunk) {
            $inserted += $this->insertChunk($objectsTable, $chunk);
        }
        return $inserted;
    }

    public function deleteForObject(string $objectsTable, $objectId): int
    {
        self::assertIdentifier($objectsTable, 'objects table');
        return $this->deleteEquals(array(
            'objects_table' => $objectsTable,
            'object_id' => self::id($objectId, 'object ID'),
        ));
    }

    public function deleteForObjectsTable(string $objectsTable): int
    {
        self::assertIdentifier($objectsTable, 'objects table');
        return $this->deleteEquals(array(
            'objects_table' => $objectsTable,
        ));
    }

    public function deleteForRegionsTableIds(
        string $regionsTable,
        array $regionIds
    ): int {
        self::assertIdentifier($regionsTable, 'regions table');
        return $this->deleteRegionIds(
            array('`regions_table` = %s'),
            array($regionsTable),
            $regionIds
        );
    }

    public function deleteForPairRegionIds(
        string $objectsTable,
        string $regionsTable,
        array $regionIds
    ): int {
        self::assertIdentifier($objectsTable, 'objects table');
        self::assertIdentifier($regionsTable, 'regions table');
        return $this->deleteRegionIds(
            array(
                '`objects_table` = %s',
                '`regions_table` = %s',
            ),
            array($objectsTable, $regionsTable),
            $regionIds
        );
    }

    public function copyPair(
        string $sourceObjectsTable,
        string $sourceRegionsTable,
        string $targetObjectsTable,
        string $targetRegionsTable
    ): int {
        foreach (array(
            'source objects table' => $sourceObjectsTable,
            'source regions table' => $sourceRegionsTable,
            'target objects table' => $targetObjectsTable,
            'target regions table' => $targetRegionsTable,
        ) as $label => $table) {
            self::assertIdentifier($table, $label);
        }

        if ($sourceObjectsTable === $targetObjectsTable
            && $sourceRegionsTable === $targetRegionsTable) {
            return 0;
        }

        $this->deleteEquals(array(
            'objects_table' => $targetObjectsTable,
            'regions_table' => $targetRegionsTable,
        ));

        $table = self::quoteIdentifier($this->physicalTable);
        $sql = 'INSERT INTO ' . $table
            . ' (`objects_table`, `regions_table`, `object_id`, `region_id`)'
            . ' SELECT DISTINCT %s, %s, `object_id`, `region_id`'
            . ' FROM ' . $table
            . ' WHERE `objects_table` = %s AND `regions_table` = %s';

        return $this->adapter->execute($this->adapter->prepare(
            $sql,
            $targetObjectsTable,
            $targetRegionsTable,
            $sourceObjectsTable,
            $sourceRegionsTable
        ));
    }

    /**
     * @param array<int,array{object_id:string,link:RegionRelationLink}> $chunk
     */
    private function insertChunk(string $objectsTable, array $chunk): int
    {
        $table = self::quoteIdentifier($this->physicalTable);
        $selects = array();
        $params = array();

        foreach ($chunk as $row) {
            $link = $row['link'];
            $selects[] = 'SELECT %s, %s, %s, %s FROM DUAL'
                . ' WHERE NOT EXISTS ('
                . 'SELECT 1 FROM ' . $table
                . ' WHERE `objects_table` = %s'
                . ' AND `regions_table` = %s'
                . ' AND `object_id` = %s'
                . ' AND `region_id` = %s'
                . ')';

            $values = array(
                $objectsTable,
                $link->regionsTable(),
                $row['object_id'],
                $link->regionId(),
            );
            $params = array_merge($params, $values, $values);
        }

        $sql = 'INSERT INTO ' . $table
            . ' (`objects_table`, `regions_table`, `object_id`, `region_id`) '
            . implode(' UNION ALL ', $selects);

        return $this->adapter->execute(
            $this->adapter->prepare($sql, ...$params)
        );
    }

    /**
     * @param string[] $whereParts
     * @param array<int,string> $whereParams
     * @param array<int,int|string> $regionIds
     */
    private function deleteRegionIds(
        array $whereParts,
        array $whereParams,
        array $regionIds
    ): int {
        $ids = self::ids($regionIds, 'region IDs');
        if ($ids === array()) {
            return 0;
        }

        $deleted = 0;
        foreach (array_chunk($ids, $this->batchSize) as $chunk) {
            $placeholders = implode(
                ', ',
                array_fill(0, count($chunk), '%s')
            );
            $sql = 'DELETE FROM '
                . self::quoteIdentifier($this->physicalTable)
                . ' WHERE ' . implode(' AND ', $whereParts)
                . ' AND `region_id` IN (' . $placeholders . ')';
            $deleted += $this->adapter->execute(
                $this->adapter->prepare(
                    $sql,
                    ...array_merge($whereParams, $chunk)
                )
            );
        }
        return $deleted;
    }

    /** @param array<string,string> $where */
    private function deleteEquals(array $where): int
    {
        $result = $this->adapter->delete($this->logicalTable, $where);
        if ($result === false) {
            throw new \RuntimeException('Relation delete failed.');
        }
        return (int) $result;
    }

    /** @param RegionRelationLink[] $links @return RegionRelationLink[] */
    private static function links(array $links): array
    {
        $normalized = array();
        foreach ($links as $link) {
            if (!$link instanceof RegionRelationLink) {
                throw new \InvalidArgumentException(
                    'Relation sets require RegionRelationLink values.'
                );
            }
            $normalized[$link->identity()] = $link;
        }
        return array_values($normalized);
    }

    /** @param array<int,int|string> $values @return string[] */
    private static function ids(array $values, string $label): array
    {
        $normalized = array();
        foreach ($values as $value) {
            $id = self::id($value, $label);
            $normalized[$id] = $id;
        }
        return array_values($normalized);
    }

    /** @param int|string $value */
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
