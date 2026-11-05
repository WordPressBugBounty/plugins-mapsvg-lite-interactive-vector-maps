<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Store;

/** Physical-row CRUD seam used by mapped repositories. */
interface CrudStore
{
    /** @param array<string, mixed> $where @return array<string, mixed>|null */
    public function findOne(array $where): ?array;

    /** @param array<string, mixed> $data @return array<string, mixed> */
    public function create(array $data): array;

    /** @param array<string, mixed> $data @param array<string, mixed> $where */
    public function update(array $data, array $where): int;

    /** @param array<string, mixed> $where */
    public function delete(array $where): int;
}
