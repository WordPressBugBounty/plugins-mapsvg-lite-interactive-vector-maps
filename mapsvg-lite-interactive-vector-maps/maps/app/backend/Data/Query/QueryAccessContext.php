<?php

declare(strict_types=1);
namespace MapSVG\App\Data\Query;

/** Implementations are constructed by trusted server composition, never from JSON params. */
interface QueryAccessContext
{
    public function siteId(): int;
    public function userId(): int;
    public function canEditQueries(): bool;
}
