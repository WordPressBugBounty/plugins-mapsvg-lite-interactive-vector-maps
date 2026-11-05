<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

use MapSVG\Schema;

interface SchemaRegistrySynchronizer
{
    public function refresh(Schema $schema): void;
    public function invalidate(?string $logicalTable = null): void;
}
