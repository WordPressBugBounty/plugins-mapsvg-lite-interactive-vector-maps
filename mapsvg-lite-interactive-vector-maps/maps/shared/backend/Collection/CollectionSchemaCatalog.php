<?php

declare(strict_types=1);

namespace MapSVG\Shared\Collection;

/** Neutral catalog seam for logical Collection schemas. */
interface CollectionSchemaCatalog
{
    /** @return CollectionReadSchema[] */
    public function listSchemas(): array;
}
