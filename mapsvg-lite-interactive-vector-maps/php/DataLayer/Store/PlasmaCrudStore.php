<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Store;

use Plasma\Model;

/** Normal single-table CRUD through one schema-backed Plasma model. */
final class PlasmaCrudStore implements CrudStore
{
    private Model $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    public function findOne(array $where): ?array
    {
        $this->assertWhere($where);
        return $this->model->findFirst(array('where' => $where));
    }

    public function create(array $data): array
    {
        if ($data === array()) {
            throw new \InvalidArgumentException('Create data must not be empty.');
        }
        return $this->model->create(array('data' => $data));
    }

    public function update(array $data, array $where): int
    {
        $this->assertWhere($where);
        return $this->model->update(array('where' => $where, 'data' => $data));
    }

    public function delete(array $where): int
    {
        $this->assertWhere($where);
        return $this->model->delete(array('where' => $where));
    }

    private function assertWhere(array $where): void
    {
        if ($where === array()) {
            throw new \InvalidArgumentException('A non-empty equality filter is required.');
        }
        foreach ($where as $field => $value) {
            if (!is_string($field) || is_array($value) || is_object($value)) {
                throw new \InvalidArgumentException(
                    'CRUD store filters must be field => scalar/null equalities.'
                );
            }
        }
    }
}
