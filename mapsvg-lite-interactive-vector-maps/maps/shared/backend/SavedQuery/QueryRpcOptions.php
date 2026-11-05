<?php

declare(strict_types=1);
namespace MapSVG\Shared\SavedQuery;

use MapSVG\Shared\QueryRpc\RpcJson;

/** Stored exposure and scalar-to-predicate mappings. No executable templates. */
final class QueryRpcOptions
{
    private array $value;
    private QueryParameterSchema $parameters;
    private const OPERATORS = array('equals', 'lt', 'lte', 'gt', 'gte', 'contains', 'startsWith', 'endsWith');

    private function __construct(array $value, QueryParameterSchema $parameters)
    {
        $this->value = $value;
        $this->parameters = $parameters;
    }
    public static function fromArray(?array $raw): self
    {
        $raw = $raw ?? array('version' => 1, 'access' => 'editor', 'paramsSchema' =>
            '{"type":"object","properties":{},"additionalProperties":false}', 'bindings' => array());
        if (array_diff(array_keys($raw), array('version', 'access', 'paramsSchema', 'bindings', 'userIdField'))
            || ($raw['version'] ?? null) !== 1
            || !in_array($raw['access'] ?? null, array('disabled', 'editor', 'authenticated', 'public'), true)
            || !is_string($raw['paramsSchema'] ?? null)
            || !is_array($raw['bindings'] ?? null) || array_values($raw['bindings']) !== $raw['bindings']
            || count($raw['bindings']) > 50) throw new \InvalidArgumentException('Invalid saved Query RPC settings.');
        $schema = new QueryParameterSchema($raw['paramsSchema']);
        $properties = $schema->properties();
        $seen = array();
        foreach ($raw['bindings'] as $binding) {
            if (!is_array($binding) || array_diff(array_keys($binding), array('param', 'field', 'operator'))
                || !is_string($binding['param'] ?? null) || !array_key_exists($binding['param'], $properties)
                || isset($seen[$binding['param']]) || !is_string($binding['field'] ?? null)
                || $binding['field'] === '' || strlen($binding['field']) > 120
                || !in_array($binding['operator'] ?? null, self::OPERATORS, true)) {
                throw new \InvalidArgumentException('Invalid Query parameter binding.');
            }
            $seen[$binding['param']] = true;
        }
        if (count($seen) !== count($properties)) throw new \InvalidArgumentException('Each parameter needs one binding.');
        if (array_key_exists('userIdField', $raw)) {
            if (!is_string($raw['userIdField']) || $raw['userIdField'] === ''
                || !in_array($raw['access'], array('editor', 'authenticated'), true)) {
                throw new \InvalidArgumentException('User row policy requires authenticated access and a field.');
            }
        }
        $raw['paramsSchema'] = $schema->json();
        $copy = RpcJson::copyResult($raw, RpcJson::PARAMS_BYTES);
        return new self(json_decode(RpcJson::encode($copy), true, 512, JSON_THROW_ON_ERROR), $schema);
    }
    public function toArray(): array { return $this->value; }
    public function access(): string { return $this->value['access']; }
    public function validateParams(\stdClass $params): \stdClass { return $this->parameters->validate($params); }

    public function assertFields(array $fields, array $input): void
    {
        $properties = $this->parameters->properties();
        foreach ($this->value['bindings'] as $binding) {
            $field = $fields[$binding['field']] ?? null;
            if (!is_array($field) || !empty($field['multiselect'])
                || !in_array($field['type'] ?? null, array('id', 'text', 'textarea', 'number', 'checkbox', 'select', 'radio', 'date', 'datetime', 'color'), true)) {
                throw new \InvalidArgumentException('Query parameter requires a supported scalar field.');
            }
            $type = $properties[$binding['param']]['type'];
            if (in_array($binding['operator'], array('contains', 'startsWith', 'endsWith'), true)
                && (!in_array($field['type'], array('text', 'textarea'), true) || $type !== 'string')) {
                throw new \InvalidArgumentException('Text predicates require string parameters and text fields.');
            }
            if ($type === 'boolean' && $binding['operator'] !== 'equals') {
                throw new \InvalidArgumentException('Boolean parameters support equality only.');
            }
        }
        if (isset($this->value['userIdField'])) {
            $field = $fields[$this->value['userIdField']] ?? null;
            if (!is_array($field) || !in_array($field['type'] ?? null, array('id', 'number'), true)) {
                throw new \InvalidArgumentException('User row policy requires a numeric/id field.');
            }
        }
        $selected = QueryFieldProjection::fields($input);
        if (in_array($this->access(), array('public', 'authenticated'), true)
            && ($selected === null || !in_array('id', $selected, true))) {
            throw new \InvalidArgumentException('Exposed Queries require explicit returned fields including id.');
        }
        foreach ($selected ?? array() as $field) {
            if ($field !== 'id' && !isset($fields[$field])) throw new \InvalidArgumentException('Unknown returned Query field.');
        }
        $take = $input['take'] ?? 50;
        $skip = $input['skip'] ?? 0;
        if (!is_int($take) || $take < 1 || $take > 5000 || !is_int($skip) || $skip < 0 || $skip > 1000000) {
            throw new \InvalidArgumentException('RPC Queries require bounded pagination.');
        }
    }

    /** Add predicates; never replace saved selection, ordering or server-derived row policy. */
    public function bind(array $input, \stdClass $params, int $userId): array
    {
        $params = $this->validateParams($params);
        $where = array();
        if (!empty($input['where'])) $where[] = $input['where'];
        if (isset($this->value['userIdField'])) {
            if ($userId < 1) throw new \DomainException('User row policy requires an authenticated actor.');
            $where[] = array($this->value['userIdField'] => array('equals' => $userId));
        }
        foreach ($this->value['bindings'] as $binding) {
            if (!property_exists($params, $binding['param'])) continue;
            $where[] = array($binding['field'] => array($binding['operator'] => $params->{$binding['param']}));
        }
        if (count($where) === 1) $input['where'] = $where[0];
        elseif ($where !== array()) $input['where'] = array('AND' => $where);
        $input['take'] = $input['take'] ?? 50;
        $input['skip'] = $input['skip'] ?? 0;
        return $input;
    }
}
