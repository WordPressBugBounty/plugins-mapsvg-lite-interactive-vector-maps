<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Relation;

/** Prepares one domain record completely before transactional row/r2o writes. */
interface ObjectWritePreparer
{
    /** @param mixed $record */
    public function prepare(
        $record,
        bool $convertLatLngToAddress = false
    ): ObjectWritePreparationResult;
}
