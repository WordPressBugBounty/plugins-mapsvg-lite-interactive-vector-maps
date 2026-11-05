<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

use MapSVG\DataLayer\PlasmaProvider;

final class SchemaMutationServiceFactory
{
    /** @param object|null $wpdbInstance */
    public static function create(
        $wpdbInstance = null,
        ?SchemaRegistrySynchronizer $registry = null
    ): SchemaMutationService {
        $provider = new PlasmaProvider($wpdbInstance);
        $adapter = $provider->createAdapter();
        $wpdb = $provider->wpdb();
        $engine = 'InnoDB';
        if (is_object($wpdb)
            && method_exists($wpdb, 'db_version')
            && version_compare((string) $wpdb->db_version(), '5.6.0', '<')) {
            $engine = 'MyISAM';
        }
        $definitions = new SchemaTableDefinitionFactory(
            $provider->physicalPrefix(),
            $engine
        );
        $inspector = new AdapterPhysicalTableInspector(
            $adapter,
            $provider->physicalPrefix()
        );
        $tables = new TableManager(
            $adapter,
            $inspector,
            $definitions
        );

        return new SchemaMutationService(
            $tables,
            new SchemaDataTransformPlanner(),
            new SchemaDataTransformExecutor($adapter),
            $registry
        );
    }

    private function __construct()
    {
    }
}
