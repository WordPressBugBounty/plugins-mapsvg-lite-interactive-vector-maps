<?php

declare(strict_types=1);
namespace MapSVG\App\Data\Query;

/** Opt-in for trusted read resolvers; called only after per-call access/parameter checks. */
interface BatchAwareQueryResolver extends QueryResolver
{
    public function batchPolicy(\stdClass $params, object $context): QueryBatchPolicy;
}
