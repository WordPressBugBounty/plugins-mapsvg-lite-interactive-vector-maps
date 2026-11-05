<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

use MapSVG\DataLayer\Mapping\RecordMapper;
use MapSVG\DataLayer\StorageSchemaResolution;
use MapSVG\Schema;

/** Resolves public schema fields to strict physical Plasma fields. */
final class QueryFieldResolver
{
    private Schema $schema;
    private RecordMapper $mapper;
    private string $declaredPrimaryKey;
    private string $primaryKey;
    /** @var array<string, true>|null */
    private $actualFields;

    public function __construct(
        Schema $schema,
        RecordMapper $mapper,
        ?StorageSchemaResolution $resolution = null
    ) {
        $this->schema = $schema;
        $this->mapper = $mapper;
        $this->declaredPrimaryKey = (string) $schema->getPrimaryKeyFieldName();
        $this->primaryKey = $resolution === null
            ? (string) $schema->getPrimaryKeyFieldName()
            : $resolution->primaryKey();
        $this->actualFields = $resolution === null
            ? null
            : array_fill_keys(array_keys($resolution->actualColumns()), true);
    }

    public function primaryKey(): string
    {
        return $this->primaryKey;
    }

    public function resolve(string $publicName): ResolvedQueryField
    {
        if ($publicName === '') {
            throw new \InvalidArgumentException('Query field name must not be empty.');
        }

        if ($publicName === 'id' || $publicName === $this->declaredPrimaryKey) {
            $field = $this->schema->getField($this->declaredPrimaryKey);
            if (!$field) {
                $field = (object) array(
                    'name' => $this->declaredPrimaryKey,
                    'type' => 'id',
                );
            }
            return $this->resolved($publicName, $this->primaryKey, $field);
        }

        $field = $this->schema->getField($publicName);
        if (!$field) {
            throw new \InvalidArgumentException('Unknown query field: ' . $publicName);
        }

        $storageName = (string) ($field->name ?? '');
        return $this->resolved($publicName, $storageName, $field);
    }

    public function normalizeEquality(ResolvedQueryField $field, $value)
    {
        if ($value !== null
            && (!is_scalar($value)
                || (is_float($value) && !is_finite($value)))) {
            throw new \InvalidArgumentException(
                'A finite scalar query value or null is required.'
            );
        }

        // Prisma null predicates must remain SQL null predicates. Legacy callers
        // that mean an empty string normalize before reaching this method.
        if ($value === null) {
            return null;
        }

        if ($field->publicName() === 'id'
            && $field->storageName() !== $this->mapper->storagePrimaryKey()) {
            return $value;
        }

        if (in_array($field->type(), array('select', 'radio', 'status'), true)
            && !$field->isMultiselect()) {
            return $this->normalizeChoice($field, $value);
        }

        $mapped = $this->mapper->toStorageCriteria(array(
            $field->publicName() => $value,
        ));
        if (!array_key_exists($field->storageName(), $mapped)) {
            throw new \LogicException('Record mapper did not resolve the query field.');
        }
        return $mapped[$field->storageName()];
    }

    private function normalizeChoice(ResolvedQueryField $field, $value)
    {
        $schemaField = $field->schemaField();
        if (!isset($schemaField->options) || !is_iterable($schemaField->options)) {
            return $value;
        }

        foreach ($schemaField->options as $option) {
            $option = is_object($option) ? get_object_vars($option) : (array) $option;
            $matchesValue = array_key_exists('value', $option)
                && (string) $option['value'] === (string) $value;
            $matchesLabel = array_key_exists('label', $option)
                && (string) $option['label'] === (string) $value;
            if ($matchesValue || $matchesLabel) {
                return $option['value'] ?? $value;
            }
        }

        // Legacy filters compare raw values. Do not silently turn an unknown
        // option into an empty-string predicate.
        return $value;
    }

    private function resolved(
        string $publicName,
        string $storageName,
        object $field
    ): ResolvedQueryField {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $storageName)) {
            throw new \InvalidArgumentException('Invalid query storage field.');
        }

        $type = strtolower((string) ($field->type ?? 'text'));
        if ($this->actualFields !== null
            && !isset($this->actualFields[$storageName])
            && $type !== 'location') {
            throw new \UnexpectedValueException(
                'Query field is missing from the physical table: ' . $storageName
            );
        }

        $multiselect = isset($field->multiselect)
            && filter_var($field->multiselect, FILTER_VALIDATE_BOOLEAN);

        return new ResolvedQueryField(
            $publicName,
            $storageName,
            $field,
            $type,
            $multiselect
        );
    }
}
