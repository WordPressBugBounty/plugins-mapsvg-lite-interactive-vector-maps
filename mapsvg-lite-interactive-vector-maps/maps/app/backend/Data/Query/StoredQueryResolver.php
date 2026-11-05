<?php

declare(strict_types=1);
namespace MapSVG\App\Data\Query;

use MapSVG\Shared\SavedQuery\StoredQueryGateway;
use MapSVG\Shared\SavedQuery\StoredQueryDefinition;
use MapSVG\Shared\SavedQuery\QueryFieldProjection;
use MapSVG\Shared\SavedQuery\StoredQueryChanged;

final class StoredQueryResolver implements BatchAwareQueryResolver, QuerySchemaMetadata
{
    private StoredQueryGateway $gateway;
    private StoredQueryDefinition $definition;
    private int $siteId;
    public function __construct(StoredQueryGateway $gateway, StoredQueryDefinition $definition, int $siteId)
    {
        $this->gateway = $gateway;
        $this->definition = $definition;
        $this->siteId = $siteId;
    }
    public function authorize(object $context, \stdClass $params): void
    {
        if (!$context instanceof QueryAccessContext || $context->siteId() !== $this->siteId
            || $context->userId() < 0) throw new QueryRejected('forbidden');
        $access = $this->definition->options()->access();
        if ($access === 'public') return;
        if ($access === 'authenticated' && $context->userId() > 0) return;
        if ($access === 'editor' && $context->userId() > 0 && $context->canEditQueries()) return;
        throw new QueryRejected('forbidden');
    }
    public function validateParams(\stdClass $params): \stdClass
    {
        try { return $this->definition->options()->validateParams($params); }
        catch (\InvalidArgumentException $error) { throw new QueryRejected('invalid_params'); }
    }
    public function batchPolicy(\stdClass $params, object $context): QueryBatchPolicy
    {
        $this->authorize($context, $params);
        $input = $this->definition->options()->bind($this->definition->input(), $params, $context->userId());
        $key = \MapSVG\Shared\QueryRpc\RpcJson::canonicalHash((object) array(
            'query' => $this->definition->name(), 'revision' => $this->definition->revision(),
            'site' => $context->siteId(), 'user' => $context->userId(),
            'editor' => $context->canEditQueries(), 'params' => $params,
        ));
        return new QueryBatchPolicy($key, $input['take']);
    }
    public function describeResult(\stdClass $params, object $context, $result): \stdClass
    {
        $this->authorize($context, $params);
        $this->validateParams($params);
        if (!$result instanceof \stdClass || ($result->queryRevision ?? null) !== $this->definition->revision()
            || ($result->schemaRevision ?? null) !== $this->definition->schemaRevision()) {
            throw new QueryRejected('query_changed');
        }
        $fields = $this->definition->fields();
        $selected = QueryFieldProjection::fields($this->definition->input());
        $visible = new \stdClass();
        foreach ($selected ?? array_keys($fields) as $name) {
            $field = $fields[$name] ?? ($name === 'id' ? array('type' => 'id', 'multiselect' => false) : null);
            if (!is_array($field) || !is_string($field['type'] ?? null)) throw new QueryRejected('query_changed');
            // No physical columns, credentials, option values, or internal validation code.
            $visible->{$name} = (object) array('type' => $field['type'], 'multiselect' => !empty($field['multiselect']));
        }
        return (object) array('schemaId' => $this->definition->schemaId(),
            'revision' => $this->definition->schemaRevision(), 'fields' => $visible);
    }
    public function execute(\stdClass $params, object $context)
    {
        // Also protect direct server use; do not rely solely on dispatcher call order.
        $this->authorize($context, $params);
        $params = $this->validateParams($params);
        $input = $this->definition->options()->bind($this->definition->input(), $params, $context->userId());
        try { $result = $this->gateway->execute($this->definition, $input); }
        catch (StoredQueryChanged $error) { throw new QueryRejected('query_changed'); }
        if (!is_array($result['rows'] ?? null) || !is_int($result['count'] ?? null)
            || $result['count'] < 0 || count($result['rows']) > $input['take']) {
            throw new \UnexpectedValueException('Invalid stored Query result.');
        }
        return array(
            'rows' => QueryFieldProjection::apply(array_values($result['rows']), $input),
            'count' => $result['count'],
            'page' => array('skip' => $input['skip'], 'take' => $input['take'],
                'hasMore' => $result['count'] > $input['skip'] + count($result['rows'])),
            'queryRevision' => $this->definition->revision(),
            'schemaRevision' => $this->definition->schemaRevision(),
        );
    }
}
