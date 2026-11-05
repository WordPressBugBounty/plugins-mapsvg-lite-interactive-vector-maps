<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

use Plasma\Adapter\DatabaseAdapter;

/** Validated physical table existence check for schema compatibility facades. */
final class SchemaTableExistenceService
{
    private DatabaseAdapter $adapter;
    private string $physicalPrefix;

    public function __construct(
        DatabaseAdapter $adapter,
        string $physicalPrefix
    ) {
        self::assertIdentifier($physicalPrefix, 'physical table prefix');
        $this->adapter = $adapter;
        $this->physicalPrefix = $physicalPrefix;
    }

    public function exists(string $logicalTable): bool
    {
        self::assertIdentifier($logicalTable, 'logical table');
        $physical = $this->physicalPrefix . $logicalTable;
        self::assertIdentifier($physical, 'physical table');

        $sql = $this->adapter->prepare(
            'SHOW TABLES LIKE %s',
            $this->adapter->escapeLike($physical)
        );

        return $this->adapter->getVar($sql) !== null;
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
