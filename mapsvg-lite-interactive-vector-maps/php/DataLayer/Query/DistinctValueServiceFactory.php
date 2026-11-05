<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

use MapSVG\DataLayer\DataLayerV2;
use MapSVG\Schema;

/** Explicit composition root for validated local DISTINCT reads. */
final class DistinctValueServiceFactory
{
    public static function forSchema(
        DataLayerV2 $dataLayer,
        Schema $schema
    ): DistinctValueService {
        \MapSVG\Core\PostDataFeature::assertSchema($schema);
        if ($schema->isRemote()) {
            throw new \InvalidArgumentException(
                'Remote schemas cannot use local distinct-value queries.'
            );
        }
        return new DistinctValueService(
            $dataLayer->client()->getAdapter(),
            $dataLayer->resolveSchema($schema)
        );
    }

    private function __construct()
    {
    }
}
