<?php

declare(strict_types=1);

namespace MapSVG\App\Data\Query;

use MapSVG\Shared\Collection\CollectionReadGateway;
use MapSVG\Shared\Collection\CollectionReadSchema;
use MapSVG\Shared\QueryRpc\RpcJson;

/** Editor-authorized logical schema metadata. Physical storage/endpoints/credentials never cross the seam. */
final class SchemaQuery implements BatchAwareQueryResolver
{
    private CollectionReadGateway $gateway;
    private int $siteId;

    public function __construct(CollectionReadGateway $gateway, int $siteId)
    {
        if ($siteId < 1) {
            throw new \InvalidArgumentException('Schema Query site must be positive.');
        }
        $this->gateway = $gateway;
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
            RpcJson::object($params, array('schemaId'));
            return (object) array(
                'schemaId' => self::positive($params->schemaId ?? null),
            );
        } catch (\InvalidArgumentException $error) {
            throw new QueryRejected('invalid_params');
        }
    }

    public function batchPolicy(\stdClass $params, object $context): QueryBatchPolicy
    {
        $this->authorize($context, $params);
        $params = $this->validateParams($params);
        $schema = $this->schema($params->schemaId);
        return new QueryBatchPolicy(RpcJson::canonicalHash((object) array(
            'schemaId' => $schema->id(),
            'revision' => $schema->revision(),
            'siteId' => $context->siteId(),
            'userId' => $context->userId(),
        )), 0);
    }

    public function execute(\stdClass $params, object $context)
    {
        $this->authorize($context, $params);
        $params = $this->validateParams($params);
        $schema = $this->schema($params->schemaId);
        $fields = array();
        foreach ($schema->fields() as $name => $field) {
            $fields[$name] = array(
                'type' => $field['type'],
                'multiselect' => !empty($field['multiselect']),
                'options' => is_array($field['options'] ?? null) ? $field['options'] : array(),
            );
        }
        return array(
            'schemaId' => $schema->id(),
            'name' => $schema->name(),
            'title' => $schema->title(),
            'type' => $schema->type(),
            'revision' => $schema->revision(),
            'fields' => $fields,
        );
    }

    private function schema(int $schemaId): CollectionReadSchema
    {
        $schema = $this->gateway->findSchema($schemaId);
        if ($schema === null) {
            throw new QueryRejected('resource_not_found');
        }
        return $schema;
    }

    private static function positive($value): int
    {
        if ((!is_int($value) && !is_float($value))
            || !is_finite((float) $value)
            || floor((float) $value) !== (float) $value
            || $value < 1
            || $value > min(PHP_INT_MAX, 9007199254740991)) {
            throw new \InvalidArgumentException('Expected a positive safe integer.');
        }
        return (int) $value;
    }
}
