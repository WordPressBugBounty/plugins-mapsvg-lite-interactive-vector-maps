<?php

declare(strict_types=1);
namespace MapSVG\App\Data\Query;

/** Optional permitted logical metadata for a successful, exact-revision result. */
interface QuerySchemaMetadata
{
    public function describeResult(\stdClass $params, object $context, $result): \stdClass;
}
