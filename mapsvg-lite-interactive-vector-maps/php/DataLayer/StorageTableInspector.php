<?php

declare(strict_types=1);

namespace MapSVG\DataLayer;

/**
 * Read-only view of physical storage metadata for one MapSVG table.
 */
interface StorageTableInspector
{
    /** Resolve a logical MapSVG table name to its physical WordPress table. */
    public function physicalTableName(string $logicalTable): string;

    /**
     * Return columns keyed by physical column name.
     *
     * @return array<string, array<string, mixed>>
     */
    public function columns(string $logicalTable): array;
}
