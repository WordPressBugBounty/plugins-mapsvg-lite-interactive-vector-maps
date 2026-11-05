<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

interface PhysicalTableInspector
{
    public function physicalTableName(string $logicalTable): string;

    /** Return null when the physical table does not exist. */
    public function inspect(string $logicalTable): ?TableDefinition;
}
