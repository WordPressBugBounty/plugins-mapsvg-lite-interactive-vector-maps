<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Workflow;

use MapSVG\DataLayer\Relation\DatabaseTransactionRunner;
use MapSVG\DataLayer\Relation\RegionRelationStore;
use Plasma\Adapter\DatabaseAdapter;

/**
 * Copies already-created map region/object storage and the matching r2o pair.
 * Schema creation and map option updates are intentionally outside this service.
 */
final class MapTableCopyService
{
    private DatabaseAdapter $adapter;
    private DatabaseTransactionRunner $transactions;
    private RegionRelationStore $relations;

    private string $sourceRegionsLogical;
    private string $targetRegionsLogical;
    private string $sourceObjectsLogical;
    private string $targetObjectsLogical;
    private string $sourceRegionsPhysical;
    private string $targetRegionsPhysical;
    private string $sourceObjectsPhysical;
    private string $targetObjectsPhysical;

    /** @var string[] */
    private array $regionColumns;
    /** @var string[] */
    private array $objectColumns;

    public function __construct(
        DatabaseAdapter $adapter,
        DatabaseTransactionRunner $transactions,
        RegionRelationStore $relations,
        string $sourceRegionsLogical,
        string $targetRegionsLogical,
        string $sourceObjectsLogical,
        string $targetObjectsLogical,
        string $sourceRegionsPhysical,
        string $targetRegionsPhysical,
        string $sourceObjectsPhysical,
        string $targetObjectsPhysical,
        array $regionColumns,
        array $objectColumns
    ) {
        foreach (array(
            'source regions logical table' => $sourceRegionsLogical,
            'target regions logical table' => $targetRegionsLogical,
            'source objects logical table' => $sourceObjectsLogical,
            'target objects logical table' => $targetObjectsLogical,
            'source regions physical table' => $sourceRegionsPhysical,
            'target regions physical table' => $targetRegionsPhysical,
            'source objects physical table' => $sourceObjectsPhysical,
            'target objects physical table' => $targetObjectsPhysical,
        ) as $label => $identifier) {
            self::assertIdentifier($identifier, $label);
        }

        $this->adapter = $adapter;
        $this->transactions = $transactions;
        $this->relations = $relations;
        $this->sourceRegionsLogical = $sourceRegionsLogical;
        $this->targetRegionsLogical = $targetRegionsLogical;
        $this->sourceObjectsLogical = $sourceObjectsLogical;
        $this->targetObjectsLogical = $targetObjectsLogical;
        $this->sourceRegionsPhysical = $sourceRegionsPhysical;
        $this->targetRegionsPhysical = $targetRegionsPhysical;
        $this->sourceObjectsPhysical = $sourceObjectsPhysical;
        $this->targetObjectsPhysical = $targetObjectsPhysical;
        $this->regionColumns = self::columns($regionColumns, 'region');
        $this->objectColumns = self::columns($objectColumns, 'object');

        if (!in_array('regions', $this->objectColumns, true)) {
            throw new \InvalidArgumentException(
                'Object copy requires the physical regions column.'
            );
        }
    }

    /**
     * @return array{regionsCopied:int,objectsCopied:int,regionRefsUpdated:int,r2oCopied:int}
     */
    public function copy(): array
    {
        return $this->transactions->run(function (): array {
            $this->assertTargetEmpty(
                $this->targetRegionsPhysical,
                'target regions table'
            );
            $this->assertTargetEmpty(
                $this->targetObjectsPhysical,
                'target objects table'
            );

            $regionColumns = self::columnList($this->regionColumns);
            $objectColumns = self::columnList($this->objectColumns);

            $regionsCopied = $this->adapter->execute(
                'REPLACE INTO ' . self::quoteIdentifier($this->targetRegionsPhysical)
                . ' (' . $regionColumns . ') SELECT ' . $regionColumns
                . ' FROM ' . self::quoteIdentifier($this->sourceRegionsPhysical)
            );

            $objectsCopied = $this->adapter->execute(
                'INSERT INTO ' . self::quoteIdentifier($this->targetObjectsPhysical)
                . ' (' . $objectColumns . ') SELECT ' . $objectColumns
                . ' FROM ' . self::quoteIdentifier($this->sourceObjectsPhysical)
            );

            $regionRefsUpdated = $this->adapter->execute(
                $this->adapter->prepare(
                    'UPDATE ' . self::quoteIdentifier($this->targetObjectsPhysical)
                    . ' SET `regions` = REPLACE(`regions`, %s, %s)',
                    $this->sourceRegionsLogical,
                    $this->targetRegionsLogical
                )
            );

            $r2oCopied = $this->relations->copyPair(
                $this->sourceObjectsLogical,
                $this->sourceRegionsLogical,
                $this->targetObjectsLogical,
                $this->targetRegionsLogical
            );

            return array(
                'regionsCopied' => $regionsCopied,
                'objectsCopied' => $objectsCopied,
                'regionRefsUpdated' => $regionRefsUpdated,
                'r2oCopied' => $r2oCopied,
            );
        });
    }

    private function assertTargetEmpty(string $physicalTable, string $label): void
    {
        $count = (int) $this->adapter->getVar(
            'SELECT COUNT(*) FROM ' . self::quoteIdentifier($physicalTable)
        );
        if ($count !== 0) {
            throw new \LogicException(
                ucfirst($label) . ' must be empty before map data copy.'
            );
        }
    }

    /** @param mixed[] $columns @return string[] */
    private static function columns(array $columns, string $label): array
    {
        if ($columns === array()) {
            throw new \InvalidArgumentException(
                ucfirst($label) . ' copy columns must not be empty.'
            );
        }

        $validated = array();
        foreach ($columns as $column) {
            if (!is_string($column)) {
                throw new \InvalidArgumentException(
                    ucfirst($label) . ' copy column names must be strings.'
                );
            }
            self::assertIdentifier($column, $label . ' column');
            $validated[$column] = $column;
        }

        return array_values($validated);
    }

    /** @param string[] $columns */
    private static function columnList(array $columns): string
    {
        return implode(', ', array_map(
            array(self::class, 'quoteIdentifier'),
            $columns
        ));
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
