<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Import;

interface TableSwapJournal
{
    public function load(string $liveTable): ?TableSwapJournalEntry;

    public function start(TableSwapJournalEntry $entry): void;

    public function updatePhase(string $liveTable, string $phase): void;

    public function clear(string $liveTable): void;
}
