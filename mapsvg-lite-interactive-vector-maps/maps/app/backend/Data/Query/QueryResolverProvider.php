<?php

declare(strict_types=1);
namespace MapSVG\App\Data\Query;

interface QueryResolverProvider
{
    public function find(string $name): ?QueryResolver;
}
