<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Mapping;

/** Deterministic conversion between MapSVG public/domain data and one physical row. */
interface RecordMapper
{
    /** @param array<string, mixed>|object $record @return array<string, mixed> */
    public function toStorage($record): array;

    /** @param array<string, mixed> $row @return array<string, mixed>|null */
    public function fromStorage(array $row): ?array;

    /** @param array<string, mixed> $criteria @return array<string, mixed> */
    public function toStorageCriteria(array $criteria): array;

    public function storagePrimaryKey(): string;
}
