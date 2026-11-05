<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Compatibility;

use MapSVG\ApiDataSource;
use MapSVG\DataLayer\DataLayerFactory;
use MapSVG\DataLayer\RuntimeBackendSelector;
use MapSVG\DbDataSource;
use MapSVG\Schema;

final class RepositoryDataSourceFactory
{
    /** @return ApiDataSource|DbDataSource|PlasmaDataSource */
    public static function forSchema(Schema $schema)
    {
        $backend = RuntimeBackendSelector::backendForSchema($schema);

        if ($backend === RuntimeBackendSelector::REMOTE) {
            return new ApiDataSource($schema);
        }
        if ($backend === RuntimeBackendSelector::LEGACY) {
            return new DbDataSource($schema);
        }

        return new PlasmaDataSource(
            $schema,
            DataLayerFactory::createV2(
                null,
                array('observe' => false)
            )
        );
    }

    private function __construct()
    {
    }
}
