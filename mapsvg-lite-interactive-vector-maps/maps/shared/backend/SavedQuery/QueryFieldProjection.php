<?php

declare(strict_types=1);

namespace MapSVG\Shared\SavedQuery;

use MapSVG\Shared\Collection\CollectionQueryProjection;

/**
 * @deprecated Saved Queries and direct Collection reads share CollectionQueryProjection.
 */
final class QueryFieldProjection
{
    public static function fields(array $input): ?array
    {
        return CollectionQueryProjection::fields($input);
    }

    public static function apply(array $rows, array $input): array
    {
        return CollectionQueryProjection::apply($rows, $input);
    }
}
