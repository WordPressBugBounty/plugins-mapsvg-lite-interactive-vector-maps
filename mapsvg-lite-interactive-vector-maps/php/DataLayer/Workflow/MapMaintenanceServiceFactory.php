<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Workflow;

use MapSVG\DataLayer\DataLayerV2;
use MapSVG\Schema;

/** Composition root for maps-catalog maintenance. */
final class MapMaintenanceServiceFactory
{
    public static function forSchema(
        DataLayerV2 $dataLayer,
        Schema $schema
    ): MapMaintenanceService {
        if ($schema->isRemote()) {
            throw new \InvalidArgumentException(
                'Remote schemas cannot use local map maintenance.'
            );
        }

        $resolution = $dataLayer->resolveSchema($schema);
        foreach (array('status', 'statusChangedAt') as $field) {
            if (!array_key_exists($field, $resolution->actualColumns())) {
                throw new \UnexpectedValueException(
                    'Map maintenance field is missing from physical storage: '
                    . $field
                );
            }
        }

        return new MapMaintenanceService(
            $dataLayer->client()->getAdapter(),
            $resolution->physicalTable()
        );
    }

    private function __construct()
    {
    }
}
