<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

/** One validated, composable contribution to the advanced SQL query. */
interface AdvancedQueryExtension
{
    /** @param array<string, mixed> $options */
    public function apply(
        array &$options,
        AdvancedSqlBuilder $builder,
        AdvancedQueryContext $context
    ): void;
}
