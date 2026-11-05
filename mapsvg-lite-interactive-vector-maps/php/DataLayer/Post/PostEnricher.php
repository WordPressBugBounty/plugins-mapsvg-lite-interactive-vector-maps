<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Post;

/** Request-scoped post enrichment boundary. */
interface PostEnricher
{
    /** @param mixed $postId @return mixed */
    public function enrich($postId);

    /**
     * Returns results aligned with input order while deduplicating work.
     *
     * @param array<int,mixed> $postIds
     * @return array<int,mixed>
     */
    public function enrichMany(array $postIds): array;
}
