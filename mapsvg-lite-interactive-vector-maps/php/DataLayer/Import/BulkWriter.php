<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Import;

/** Storage-facing bounded batch writer for already physical MapSVG rows. */
interface BulkWriter
{
    /** @param array<int,array<string,mixed>> $rows */
    public function insertMany(array $rows): BulkWriteResult;

    /** @param array<int,array<string,mixed>> $rows */
    public function upsertMany(array $rows): BulkWriteResult;
}
