<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

use MapSVG\Schema;

/** WordPress-owned boundary for resolving post filters/search into scalar IDs. */
interface PostIdResolver
{
    /** @param array<string, mixed> $filter @return array<int, int|string> */
    public function resolveFilter(Schema $schema, array $filter): array;

    /** @return array<int, int|string> */
    public function resolveSearch(Schema $schema, string $term): array;
}
