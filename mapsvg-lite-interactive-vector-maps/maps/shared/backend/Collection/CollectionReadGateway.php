<?php

declare(strict_types=1);

namespace MapSVG\Shared\Collection;

/** Neutral read seam. Implementations may use DataLayer, but never expose Schema/Repository objects. */
interface CollectionReadGateway
{
    public function findSchema(int $schemaId): ?CollectionReadSchema;

    /** Exact-case immutable name lookup; ambiguous catalog identities must fail closed. */
    public function findSchemaByName(string $name): ?CollectionReadSchema;

    /** @return array{rows:array,count:int} */
    public function read(CollectionReadSchema $schema, array $input): array;
}
