<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

interface QueryStore
{
    /** @param array<string, mixed> $options @return array<int, array<string, mixed>> */
    public function findMany(array $options): array;

    /** @param array<string, mixed> $options */
    public function count(array $options): int;
}
