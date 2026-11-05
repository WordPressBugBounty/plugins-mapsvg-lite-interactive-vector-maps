<?php

declare(strict_types=1);

namespace MapSVG\App\Data\Query;

use MapSVG\Shared\Collection\CollectionQueryProjection;
use MapSVG\Shared\Collection\CollectionName;
use MapSVG\Shared\Collection\CollectionReadChanged;
use MapSVG\Shared\Collection\CollectionReadGateway;
use MapSVG\Shared\Collection\CollectionReadSchema;
use MapSVG\Shared\QueryRpc\RpcJson;

/** Editor-authorized direct Collection rows. Public exposure requires a separate explicit policy. */
final class CollectionQuery implements BatchAwareQueryResolver, QuerySchemaMetadata
{
    private CollectionReadGateway $gateway;
    private int $siteId;

    public function __construct(CollectionReadGateway $gateway, int $siteId)
    {
        if ($siteId < 1) {
            throw new \InvalidArgumentException('Collection Query site must be positive.');
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
            RpcJson::object(
                $params,
                array('name', 'where', 'select', 'orderBy', 'skip', 'take')
            );
            $result = new \stdClass();
            $result->name = CollectionName::validate($params->name ?? null);
            $result->skip = property_exists($params, 'skip')
                ? self::integer($params->skip, 0, 1000000)
                : 0;
            $result->take = property_exists($params, 'take')
                ? self::integer($params->take, 1, 500)
                : 50;

            foreach (array('where', 'select', 'orderBy') as $key) {
                if (property_exists($params, $key)) {
                    $result->{$key} = RpcJson::copy(
                        $params->{$key},
                        RpcJson::PARAMS_BYTES
                    );
                }
            }

            return $result;
        } catch (\InvalidArgumentException | \LengthException $error) {
            throw new QueryRejected('invalid_params');
        }
    }

    public function batchPolicy(\stdClass $params, object $context): QueryBatchPolicy
    {
        $this->authorize($context, $params);
        $params = $this->validateParams($params);
        $schema = $this->schema($params->name);
        $key = RpcJson::canonicalHash((object) array(
            'name' => $schema->name(),
            'revision' => $schema->revision(),
            'params' => $params,
            'siteId' => $context->siteId(),
            'userId' => $context->userId(),
        ));
        return new QueryBatchPolicy($key, $params->take);
    }

    public function execute(\stdClass $params, object $context)
    {
        $this->authorize($context, $params);
        $params = $this->validateParams($params);
        $schema = $this->schema($params->name);
        $input = self::input($params);
        try {
            $result = $this->gateway->read($schema, $input);
        } catch (CollectionReadChanged $error) {
            throw new QueryRejected('query_changed');
        } catch (\InvalidArgumentException | \LengthException $error) {
            throw new QueryRejected('invalid_params');
        }

        if (!is_array($result['rows'] ?? null)
            || !is_int($result['count'] ?? null)
            || $result['count'] < 0
            || count($result['rows']) > $params->take) {
            throw new \UnexpectedValueException('Invalid direct Collection result.');
        }

        try {
            $rows = CollectionQueryProjection::apply(
                array_values($result['rows']),
                $input
            );
        } catch (\InvalidArgumentException $error) {
            throw new QueryRejected('invalid_params');
        }

        return array(
            'rows' => $rows,
            'count' => $result['count'],
            'page' => array(
                'skip' => $params->skip,
                'take' => $params->take,
                'hasMore' => $result['count'] > $params->skip + count($result['rows']),
            ),
            'schemaRevision' => $schema->revision(),
        );
    }

    public function describeResult(\stdClass $params, object $context, $result): \stdClass
    {
        $this->authorize($context, $params);
        $params = $this->validateParams($params);
        $schema = $this->schema($params->name);
        if (!$result instanceof \stdClass
            || ($result->schemaRevision ?? null) !== $schema->revision()) {
            throw new QueryRejected('query_changed');
        }

        $input = self::input($params);
        try {
            $selected = CollectionQueryProjection::fields($input);
        } catch (\InvalidArgumentException $error) {
            throw new QueryRejected('invalid_params');
        }

        $visible = new \stdClass();
        foreach ($selected ?? array_keys($schema->fields()) as $name) {
            $field = $schema->fields()[$name] ?? null;
            if ($name === 'id' && $field === null) {
                $field = array('type' => 'id', 'multiselect' => false);
            }
            if (!is_array($field) || !is_string($field['type'] ?? null)) {
                throw new QueryRejected('invalid_params');
            }
            $visible->{$name} = (object) array(
                'type' => $field['type'],
                'multiselect' => !empty($field['multiselect']),
            );
        }

        return (object) array(
            'schemaId' => $schema->id(),
            'revision' => $schema->revision(),
            'fields' => $visible,
        );
    }


    private static function input(\stdClass $params): array
    {
        $copy = json_decode(
            RpcJson::encode(RpcJson::copy($params, RpcJson::PARAMS_BYTES)),
            true,
            512,
            JSON_THROW_ON_ERROR
        );
        if (!is_array($copy)) {
            throw new \InvalidArgumentException('Invalid Collection query input.');
        }
        unset($copy['name']);
        return $copy;
    }

    private function schema(string $name): CollectionReadSchema
    {
        $schema = $this->gateway->findSchemaByName($name);
        if ($schema === null || $schema->name() !== $name) {
            throw new QueryRejected('resource_not_found');
        }
        return $schema;
    }

    private static function integer($value, int $minimum, int $maximum): int
    {
        if ((!is_int($value) && !is_float($value))
            || !is_finite((float) $value)
            || floor((float) $value) !== (float) $value
            || $value < $minimum
            || $value > $maximum) {
            throw new \InvalidArgumentException('Expected a bounded integer.');
        }
        return (int) $value;
    }
}
