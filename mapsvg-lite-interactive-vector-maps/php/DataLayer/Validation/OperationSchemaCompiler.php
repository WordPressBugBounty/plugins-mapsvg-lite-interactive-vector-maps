<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Validation;

use MapSVG\DataLayer\Query\QueryLimits;
use MapSVG\Schema;

/**
 * Compiles portable JSON Schema contracts for typed collection operations.
 *
 * Record semantics come from Schema::zodSettings when present. Structural
 * operation/query typing is supplemented from MapSVG field metadata so users
 * never have to define query types separately.
 */
final class OperationSchemaCompiler
{
    private const DRAFT = 'https://json-schema.org/draft/2020-12/schema';

    private QueryLimits $limits;

    public function __construct(?QueryLimits $limits = null)
    {
        $this->limits = $limits ?? new QueryLimits();
    }

    /** @return array<string,mixed> */
    public function recordSchema(Schema $schema): array
    {
        $systemSchema = SystemModelSchemaRegistry::forSchema($schema);
        if ($systemSchema !== null) {
            return $systemSchema;
        }

        $settings = $schema->zodSettings ?? null;
        if ($settings !== null && $settings !== '') {
            $settings = Schema::normalizeZodSettings($settings);
            if ($settings !== null) {
                $decoded = json_decode($settings['jsonSchema'], true);
                if (!is_array($decoded)) {
                    throw new \InvalidArgumentException(
                        'Record JSON Schema must decode to an object.'
                    );
                }
                if (isset($decoded['properties']) && $decoded['properties'] === array()) {
                    $decoded['properties'] = new \stdClass();
                }
                return $decoded;
            }
        }

        $properties = array();
        foreach ($schema->getFields() as $field) {
            $name = (string) ($field->name ?? '');
            if ($name === '') {
                continue;
            }
            $properties[$name] = $this->derivedRecordProperty($field);
        }

        return array(
            '$schema' => self::DRAFT,
            'type' => 'object',
            'properties' => $properties === array() ? new \stdClass() : $properties,
        );
    }

    /** @return array<string,mixed> */
    public function createInputSchema(Schema $schema): array
    {
        $root = $this->recordSchema($schema);
        $properties = $this->operationProperties($schema, $root);
        $excluded = array();

        foreach ($schema->getFields() as $field) {
            $name = (string) ($field->name ?? '');
            if ($name === '') {
                continue;
            }
            if ($this->isGeneratedId($field) || $this->isReadonly($field)) {
                unset($properties[$name]);
                $excluded[$name] = true;
            }
        }

        $root['properties'] = $properties === array() ? new \stdClass() : $properties;
        $required = isset($root['required']) && is_array($root['required'])
            ? array_values(array_filter(
                $root['required'],
                static function ($name) use ($excluded): bool {
                    return is_string($name) && !isset($excluded[$name]);
                }
            ))
            : array();

        $primary = (string) $schema->getPrimaryKeyFieldName();
        $primaryField = $primary !== '' ? $schema->getField($primary) : null;
        if ($primaryField !== null
            && !$this->isGeneratedId($primaryField)
            && !$this->isReadonly($primaryField)
            && isset($properties[$primary])) {
            if (!in_array($primary, $required, true)) {
                $required[] = $primary;
            }
        }

        if ($required === array()) {
            unset($root['required']);
        } else {
            $root['required'] = array_values(array_unique($required));
        }

        return $root;
    }

    /** @return array<string,mixed> */
    public function updateInputSchema(Schema $schema): array
    {
        $record = $this->recordSchema($schema);
        $properties = $this->operationProperties($schema, $record);

        foreach ($schema->getFields() as $field) {
            $name = (string) ($field->name ?? '');
            if ($name === '' || !$this->isReadonly($field)) {
                continue;
            }
            unset($properties[$name]);
        }

        $primary = (string) $schema->getPrimaryKeyFieldName();
        $primaryField = $primary !== '' ? $schema->getField($primary) : null;
        if ($primaryField !== null && !isset($properties[$primary])) {
            $properties[$primary] = $this->derivedRecordProperty($primaryField);
        }

        if ($primary !== '') {
            if ($primaryField !== null) {
                $properties['id'] = $this->derivedRecordProperty($primaryField);
            } elseif (isset($properties[$primary])
                && is_array($properties[$primary])) {
                $properties['id'] = $this->withoutNull(
                    $properties[$primary]
                );
            } elseif (isset($properties['id'])
                && is_array($properties['id'])) {
                $properties['id'] = $this->withoutNull(
                    $properties['id']
                );
            }
        }

        $root = array(
            '$schema' => self::DRAFT,
            'type' => 'object',
            'properties' => $properties,
        );
        if (array_key_exists('additionalProperties', $record)) {
            $root['additionalProperties'] = $record['additionalProperties'];
        }

        if ($primary !== '') {
            $root['properties'] = $properties;
            $root['required'] = array('id');
        }

        return $root;
    }

    /** @return array<string,mixed> */
    public function findManyInputSchema(Schema $schema): array
    {
        $record = $this->recordSchema($schema);
        $recordProperties = $this->properties($record);
        $whereProperties = array();
        $defs = array();
        $selectNames = array();
        $orderProperties = array();

        foreach ($schema->getFields() as $field) {
            $name = (string) ($field->name ?? '');
            if ($name === '') {
                continue;
            }

            $type = strtolower((string) ($field->type ?? 'text'));
            if ($type !== 'location') {
                $selectNames[$name] = true;
            }

            $base = $this->queryScalarSchema(
                $field,
                $recordProperties[$name] ?? null
            );
            if ($base === null) {
                continue;
            }

            $operatorKey = 'op_' . substr(sha1($name), 0, 12);
            $defs[$operatorKey] = $this->operatorSchema(
                $field,
                $base,
                '#/$defs/' . $operatorKey
            );
            $whereProperties[$name] = array(
                'anyOf' => array(
                    $this->nullable($base),
                    array('$ref' => '#/$defs/' . $operatorKey),
                ),
            );

            if (!$this->isMultiselect($field)
                && !$this->isComplexFieldType($type)) {
                $orderProperties[$name] = array(
                    'type' => 'string',
                    'enum' => array('asc', 'desc'),
                );
            }
        }

        $primary = (string) $schema->getPrimaryKeyFieldName();
        if ($primary !== '' && !isset($selectNames['id'])) {
            $selectNames['id'] = true;
        }
        if ($primary !== '' && $primary !== 'id') {
            if (isset($whereProperties[$primary])) {
                $whereProperties['id'] = $whereProperties[$primary];
            }
            if (isset($orderProperties[$primary])) {
                $orderProperties['id'] = $orderProperties[$primary];
            }
        }

        $predicateProperties = $whereProperties;
        $group = array(
            'anyOf' => array(
                array('$ref' => '#/$defs/predicate'),
                array(
                    'type' => 'array',
                    'items' => array('$ref' => '#/$defs/predicate'),
                    'maxItems' => $this->limits->maxConditions(),
                ),
            ),
        );
        $predicateProperties['AND'] = $group;
        $predicateProperties['OR'] = $group;
        $predicateProperties['NOT'] = $group;

        $defs['predicate'] = array(
            'type' => 'object',
            'properties' => $predicateProperties,
            'additionalProperties' => false,
        );

        $selectEnum = array_values(array_keys($selectNames));
        $selectMapProperties = array();
        foreach ($selectEnum as $name) {
            $selectMapProperties[$name] = array('type' => 'boolean');
        }

        $orderGroup = array(
            'type' => 'object',
            'properties' => $orderProperties,
            'additionalProperties' => false,
        );

        return array(
            '$schema' => self::DRAFT,
            'type' => 'object',
            'properties' => array(
                'where' => array('$ref' => '#/$defs/predicate'),
                'select' => array(
                    'anyOf' => array(
                        array(
                            'type' => 'array',
                            'items' => array(
                                'type' => 'string',
                                'enum' => $selectEnum,
                            ),
                            'uniqueItems' => true,
                        ),
                        array(
                            'type' => 'object',
                            'properties' => $selectMapProperties,
                            'additionalProperties' => false,
                        ),
                    ),
                ),
                'orderBy' => array(
                    'anyOf' => array(
                        $orderGroup,
                        array(
                            'type' => 'array',
                            'items' => $orderGroup,
                        ),
                    ),
                ),
                'take' => array(
                    'type' => 'integer',
                    'minimum' => 0,
                    'maximum' => $this->limits->maxPageSize(),
                ),
                'skip' => array(
                    'type' => 'integer',
                    'minimum' => 0,
                ),
            ),
            'additionalProperties' => false,
            '$defs' => $defs,
        );
    }

    /** @param array<string,mixed> $root @return array<string,mixed> */
    private function properties(array $root): array
    {
        return isset($root['properties']) && is_array($root['properties'])
            ? $root['properties']
            : array();
    }

    /**
     * Record JSON Schema may intentionally describe only fields with semantic
     * constraints. Operation inputs still need structural typing for every
     * MapSVG field, so supplement missing properties from field metadata.
     *
     * @param array<string,mixed> $root
     * @return array<string,mixed>
     */
    private function operationProperties(
        Schema $schema,
        array $root
    ): array {
        $properties = $this->properties($root);
        foreach ($schema->getFields() as $field) {
            $name = (string) ($field->name ?? '');
            if ($name === '' || array_key_exists($name, $properties)) {
                continue;
            }
            $properties[$name] = $this->derivedRecordProperty($field);
        }
        return $properties;
    }

    private function isGeneratedId(object $field): bool
    {
        return strtolower((string) ($field->type ?? '')) === 'id'
            && (!isset($field->auto_increment)
                || filter_var(
                    $field->auto_increment,
                    FILTER_VALIDATE_BOOLEAN
                ));
    }

    private function isReadonly(object $field): bool
    {
        return isset($field->readonly)
            && filter_var($field->readonly, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * @param array<string,mixed> $node
     * @return array<string,mixed>
     */
    private function withoutNull(array $node): array
    {
        if (isset($node['type']) && is_array($node['type'])) {
            $types = array_values(array_filter(
                $node['type'],
                static function ($type): bool {
                    return $type !== 'null';
                }
            ));
            if (count($types) === 1) {
                $node['type'] = $types[0];
            } elseif ($types !== array()) {
                $node['type'] = $types;
            }
        }

        if (isset($node['anyOf']) && is_array($node['anyOf'])) {
            $branches = array_values(array_filter(
                $node['anyOf'],
                static function ($branch): bool {
                    return !is_array($branch)
                        || ($branch['type'] ?? null) !== 'null';
                }
            ));
            if (count($branches) === 1 && is_array($branches[0])) {
                return $branches[0];
            }
            $node['anyOf'] = $branches;
        }

        return $node;
    }

    /** @return array<string,mixed> */
    private function derivedRecordProperty(object $field): array
    {
        $type = strtolower((string) ($field->type ?? 'text'));

        if ($type === 'checkbox' || $type === 'boolean') {
            return array('type' => 'boolean');
        }
        if ($type === 'location' || $type === 'post') {
            return array('type' => array('object', 'null'));
        }
        if ($type === 'region' || $type === 'regions'
            || $type === 'relation' || $type === 'image'
            || $type === 'images' || $type === 'checkboxes'
            || $this->isMultiselect($field)) {
            return array('type' => 'array');
        }

        $numeric = $this->numericKind($field);
        if ($numeric !== null) {
            return array('type' => $numeric);
        }

        $property = array('type' => 'string');
        $enum = $this->choiceValues($field);
        if ($enum !== array()) {
            $property['enum'] = $enum;
        }
        return $property;
    }

    /**
     * Query operands intentionally keep structural type/enum only. Semantic
     * record constraints such as minLength must not prevent a contains("a")
     * query against a field whose stored values have minLength=3.
     *
     * @param mixed $recordProperty
     * @return array<string,mixed>|null
     */
    private function queryScalarSchema(object $field, $recordProperty): ?array
    {
        $type = strtolower((string) ($field->type ?? 'text'));
        if ($this->isComplexFieldType($type) || $this->isMultiselect($field)) {
            return null;
        }

        $explicitType = $this->scalarTypeFromRecordProperty($recordProperty);
        if ($explicitType !== null) {
            $base = array('type' => $explicitType);
            if (is_array($recordProperty)
                && isset($recordProperty['enum'])
                && is_array($recordProperty['enum'])) {
                $base['enum'] = array_values($recordProperty['enum']);
            }
            return $base;
        }

        if ($type === 'checkbox' || $type === 'boolean') {
            return array('type' => 'boolean');
        }

        if (in_array($type, array('select', 'radio', 'status'), true)) {
            $base = array('type' => 'string');
            $values = $this->choiceValues($field);
            if ($values !== array()) {
                $base['enum'] = $values;
            }
            return $base;
        }

        $numeric = $this->numericKind($field);
        if ($numeric !== null) {
            return array('type' => $numeric);
        }

        return array('type' => 'string');
    }

    /** @param mixed $node */
    private function scalarTypeFromRecordProperty($node): ?string
    {
        if (!is_array($node)) {
            return null;
        }
        $type = $node['type'] ?? null;
        if (is_string($type)) {
            return in_array(
                $type,
                array('string', 'number', 'integer', 'boolean'),
                true
            ) ? $type : null;
        }
        if (!is_array($type)) {
            return null;
        }
        $scalar = array_values(array_filter(
            $type,
            static function ($item): bool {
                return $item !== 'null';
            }
        ));
        if (count($scalar) !== 1 || !is_string($scalar[0])) {
            return null;
        }
        return in_array(
            $scalar[0],
            array('string', 'number', 'integer', 'boolean'),
            true
        ) ? $scalar[0] : null;
    }

    /** @return array<string,mixed> */
    private function operatorSchema(
        object $field,
        array $base,
        string $selfRef
    ): array {
        $nullable = $this->nullable($base);
        $properties = array(
            'equals' => $nullable,
            'not' => array(
                'anyOf' => array(
                    $nullable,
                    array('$ref' => $selfRef),
                ),
            ),
        );

        $type = (string) ($base['type'] ?? 'string');
        $fieldType = strtolower((string) ($field->type ?? 'text'));
        $choice = in_array(
            $fieldType,
            array('select', 'radio', 'status'),
            true
        );
        $boolean = $type === 'boolean';

        if (!$boolean) {
            $properties['in'] = $this->listOf($base);
            $properties['notIn'] = $this->listOf($base);
        }

        if (!$boolean && !$choice) {
            $comparisonBase = array('type' => $type);
            foreach (array('gt', 'gte', 'lt', 'lte') as $operator) {
                $properties[$operator] = $comparisonBase;
            }
            if ($type === 'string') {
                foreach (array('contains', 'startsWith', 'endsWith') as $operator) {
                    $properties[$operator] = array('type' => 'string');
                }
            }
        }

        return array(
            'type' => 'object',
            'minProperties' => 1,
            'properties' => $properties,
            'additionalProperties' => false,
        );
    }

    /** @return array<string,mixed> */
    private function nullable(array $base): array
    {
        return array(
            'anyOf' => array(
                $base,
                array('type' => 'null'),
            ),
        );
    }

    /** @return array<string,mixed> */
    private function listOf(array $base): array
    {
        return array(
            'type' => 'array',
            'items' => $base,
            'maxItems' => $this->limits->maxListValues(),
        );
    }

    private function isMultiselect(object $field): bool
    {
        return isset($field->multiselect)
            && filter_var($field->multiselect, FILTER_VALIDATE_BOOLEAN);
    }

    private function isComplexFieldType(string $type): bool
    {
        return in_array(
            $type,
            array(
                'location',
                'region',
                'regions',
                'relation',
                'image',
                'images',
                'marker',
            ),
            true
        );
    }

    private function numericKind(object $field): ?string
    {
        $type = strtolower((string) ($field->type ?? ''));
        $dbType = strtolower((string) ($field->db_type ?? ''));

        if ($type === 'post') {
            return 'integer';
        }
        if ($type === 'number') {
            return preg_match('/^(?:tinyint|smallint|mediumint|int|bigint)\b/D', $dbType)
                ? 'integer'
                : 'number';
        }
        if ($type === 'id') {
            if (preg_match('/^(?:tinyint|smallint|mediumint|int|bigint)\b/D', $dbType)) {
                return 'integer';
            }
            if (preg_match('/^(?:float|double|decimal|numeric)\b/D', $dbType)) {
                return 'number';
            }
            return null;
        }
        if (preg_match('/^(?:tinyint|smallint|mediumint|int|bigint)\b/D', $dbType)) {
            return 'integer';
        }
        if (preg_match('/^(?:float|double|decimal|numeric)\b/D', $dbType)) {
            return 'number';
        }
        return null;
    }

    /** @return string[] */
    private function choiceValues(object $field): array
    {
        if (!isset($field->options) || !is_iterable($field->options)) {
            return array();
        }
        $values = array();
        foreach ($field->options as $option) {
            $option = is_object($option) ? get_object_vars($option) : (array) $option;
            if (!array_key_exists('value', $option)
                || $option['value'] === null
                || $option['value'] === '') {
                continue;
            }
            $values[] = (string) $option['value'];
        }
        return array_values(array_unique($values));
    }
}
