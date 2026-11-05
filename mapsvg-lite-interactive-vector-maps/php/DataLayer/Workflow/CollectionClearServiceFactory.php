<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Workflow;

use MapSVG\DataLayer\DataLayerV2;
use MapSVG\DataLayer\Relation\WpdbRegionRelationStore;
use MapSVG\Schema;

/** Explicit composition root for local collection clear. */
final class CollectionClearServiceFactory
{
    public static function forSchema(
        DataLayerV2 $dataLayer,
        Schema $schema,
        bool $clearObjectRelations = false
    ): CollectionClearService {
        if ($schema->isRemote()) {
            throw new \InvalidArgumentException(
                'Remote schemas cannot use local collection clear.'
            );
        }

        $resolution = $dataLayer->resolveSchema($schema);
        $adapter = $dataLayer->client()->getAdapter();

        if (!$clearObjectRelations) {
            return new CollectionClearService(
                $adapter,
                $resolution->physicalTable()
            );
        }

        return new CollectionClearService(
            $adapter,
            $resolution->physicalTable(),
            new WpdbRegionRelationStore($adapter),
            $resolution->logicalTable()
        );
    }

    private function __construct()
    {
    }
}
