<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Workflow;

use MapSVG\DataLayer\Relation\RegionRelationStore;
use Plasma\Adapter\DatabaseAdapter;

/** Physical collection clear preserving legacy TRUNCATE ordering. */
final class CollectionClearService
{
    private DatabaseAdapter $adapter;
    private string $physicalTable;
    private ?RegionRelationStore $relations;
    private ?string $objectsTable;

    public function __construct(
        DatabaseAdapter $adapter,
        string $physicalTable,
        ?RegionRelationStore $relations = null,
        ?string $objectsTable = null
    ) {
        self::assertIdentifier($physicalTable, 'physical collection table');
        if (($relations === null) !== ($objectsTable === null)) {
            throw new \InvalidArgumentException(
                'Relation store and objects-table scope must be configured together.'
            );
        }
        if ($objectsTable !== null) {
            self::assertIdentifier($objectsTable, 'objects table');
        }

        $this->adapter = $adapter;
        $this->physicalTable = $physicalTable;
        $this->relations = $relations;
        $this->objectsTable = $objectsTable;
    }

    /** Returns the number of scoped r2o rows deleted after TRUNCATE. */
    public function clear(): int
    {
        $this->adapter->execute(
            'TRUNCATE TABLE ' . self::quoteIdentifier($this->physicalTable)
        );

        if ($this->relations === null || $this->objectsTable === null) {
            return 0;
        }

        return $this->relations->deleteForObjectsTable($this->objectsTable);
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
