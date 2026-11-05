<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

use Plasma\Model;

final class PlasmaQueryStore implements QueryStore
{
    private Model $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    public function findMany(array $options): array
    {
        return $this->model->findMany($options);
    }

    public function count(array $options): int
    {
        return $this->model->count($options);
    }
}
