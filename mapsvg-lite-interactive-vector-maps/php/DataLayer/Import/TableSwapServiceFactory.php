<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Import;

use MapSVG\DataLayer\DataLayerV2;

/** Explicit composition root for snapshot table handoff. */
final class TableSwapServiceFactory
{
    public static function fromDataLayer(
        DataLayerV2 $dataLayer,
        ?callable $suffixFactory = null
    ): TableSwapService {
        $adapter = $dataLayer->client()->getAdapter();
        return new TableSwapService(
            $adapter,
            new DatabaseTableSwapJournal($adapter),
            $suffixFactory
        );
    }

    private function __construct()
    {
    }
}
