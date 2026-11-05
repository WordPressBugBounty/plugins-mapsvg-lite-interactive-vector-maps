<?php

declare(strict_types=1);

namespace MapSVG\App\Data\Query;

use MapSVG\Shared\Collection\CollectionReadSchema;
use MapSVG\Shared\Collection\CollectionSchemaCatalog;
use MapSVG\Shared\QueryRpc\RpcJson;

/** Editor-authorized logical schema catalog; field definitions stay behind getSchema. */
final class SchemaCatalogQuery implements BatchAwareQueryResolver
{
    private const MAX_SCHEMAS = 5000;

    private CollectionSchemaCatalog $catalog;
    private int $siteId;

    public function __construct(CollectionSchemaCatalog $catalog, int $siteId)
    {
        if ($siteId < 1) {
            throw new \InvalidArgumentException('Schema catalog site must be positive.');
        }
        $this->catalog = $catalog;
        $this->siteId = $siteId;
    }

    public function authorize(object $context, \stdClass $params): void
    {
        if (!$context instanceof QueryAccessContext
            || $context->siteId() !== $this->siteId
            || $context->userId() < 1
            || !$context->canEditQueries()) {
            throw new QueryRejected('forbidden');
        }
    }

    public function validateParams(\stdClass $params): \stdClass
    {
        try {
            RpcJson::object($params, array());
            return new \stdClass();
        } catch (\InvalidArgumentException $error) {
            throw new QueryRejected('invalid_params');
        }
    }

    public function batchPolicy(\stdClass $params, object $context): QueryBatchPolicy
    {
        $this->authorize($context, $params);
        $this->validateParams($params);
        $schemas = $this->schemas();
        return new QueryBatchPolicy(RpcJson::canonicalHash((object) array(
            'revision' => self::revision($schemas),
            'siteId' => $context->siteId(),
            'userId' => $context->userId(),
        )), count($schemas));
    }

    public function execute(\stdClass $params, object $context)
    {
        $this->authorize($context, $params);
        $this->validateParams($params);
        $schemas = $this->schemas();
        $items = array_map(static function (CollectionReadSchema $schema): array {
            return array(
                'schemaId' => $schema->id(),
                'name' => $schema->name(),
                'title' => $schema->title(),
                'type' => $schema->type(),
                'revision' => $schema->revision(),
            );
        }, $schemas);

        return array(
            'items' => $items,
            'count' => count($items),
            'revision' => self::revision($schemas),
        );
    }

    /** @return CollectionReadSchema[] */
    private function schemas(): array
    {
        $schemas = $this->catalog->listSchemas();
        if (count($schemas) > self::MAX_SCHEMAS) {
            throw new QueryRejected('query_budget_exceeded');
        }
        foreach ($schemas as $schema) {
            if (!$schema instanceof CollectionReadSchema) {
                throw new \UnexpectedValueException('Invalid schema catalog result.');
            }
        }
        return array_values($schemas);
    }

    /** @param CollectionReadSchema[] $schemas */
    private static function revision(array $schemas): string
    {
        $items = array_map(static function (CollectionReadSchema $schema): \stdClass {
            return (object) array('schemaId' => $schema->id(), 'revision' => $schema->revision());
        }, $schemas);
        return RpcJson::canonicalHash($items);
    }
}
