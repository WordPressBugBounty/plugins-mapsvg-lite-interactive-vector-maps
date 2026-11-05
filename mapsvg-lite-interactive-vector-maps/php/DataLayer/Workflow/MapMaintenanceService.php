<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Workflow;

use Plasma\Adapter\DatabaseAdapter;

/** Narrow maintenance operations for the maps catalog. */
final class MapMaintenanceService
{
    private DatabaseAdapter $adapter;
    private string $physicalTable;

    public function __construct(
        DatabaseAdapter $adapter,
        string $physicalTable
    ) {
        self::assertIdentifier($physicalTable, 'physical maps table');
        $this->adapter = $adapter;
        $this->physicalTable = $physicalTable;
    }

    /**
     * Preserve the legacy cleanup window exactly despite the old method name:
     * status=0 rows at least two days old are removed from the catalog only.
     */
    public function deleteSoftRemovedOlderThanTwoDays(): int
    {
        return $this->adapter->execute(
            'DELETE FROM ' . self::quoteIdentifier($this->physicalTable)
            . ' WHERE `status` = 0'
            . ' AND `statusChangedAt` <= DATE_SUB(NOW(), INTERVAL 2 DAY)'
        );
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
