<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Post;

/** Physical-row → legacy public domain-object hydration seam. */
interface RecordHydrator
{
    /** @param array<string,mixed> $row @return object|null */
    public function hydrate(array $row);

    /**
     * @param array<int,array<string,mixed>> $rows
     * @return array<int,object|null>
     */
    public function hydrateMany(array $rows): array;
}
