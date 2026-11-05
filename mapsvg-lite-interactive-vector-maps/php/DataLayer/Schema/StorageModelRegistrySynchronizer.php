<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

use MapSVG\DataLayer\StorageModelRegistry;
use MapSVG\Schema;

final class StorageModelRegistrySynchronizer implements SchemaRegistrySynchronizer
{
    private StorageModelRegistry $registry;

    public function __construct(StorageModelRegistry $registry)
    {
        $this->registry = $registry;
    }

    public function refresh(Schema $schema): void
    {
        $this->registry->refresh($schema);
    }

    public function invalidate(?string $logicalTable = null): void
    {
        $this->registry->invalidate($logicalTable);
    }
}
