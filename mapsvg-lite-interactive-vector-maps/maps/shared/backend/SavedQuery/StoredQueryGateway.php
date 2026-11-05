<?php

declare(strict_types=1);
namespace MapSVG\Shared\SavedQuery;

/** Neutral boundary to the existing catalog/planner. Never exposes a Schema/Repository instance. */
interface StoredQueryGateway
{
    public function findByName(string $name): ?StoredQueryDefinition;
    /** Execute exactly this definition revision; stale definitions must fail before reading rows. */
    public function execute(StoredQueryDefinition $definition, array $input): array;
}
