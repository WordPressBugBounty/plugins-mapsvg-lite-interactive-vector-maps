<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Repository;

/** Internal domain-facing normal-CRUD contract. */
interface CrudRepository
{
    /** @return object|null */
    public function findById($id);

    /** @param array<string, mixed> $where @return object|null */
    public function findOne(array $where);

    /** @param array<string, mixed>|object $record @return object */
    public function create($record);

    /** @param array<string, mixed>|object $record @return object */
    public function update($record);

    public function delete($id): int;
}
