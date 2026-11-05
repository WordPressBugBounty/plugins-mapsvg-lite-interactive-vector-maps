<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Mapping;

use MapSVG\Schema;

/** Schema-driven record orchestrator; specialized codecs own field representations. */
final class SchemaRecordMapper implements RecordMapper
{
    private Schema $schema;
    private RecordMappingProfile $profile;
    private string $schemaPrimaryKey;
    private string $primaryKey;
    private LegacyJsonCodec $json;
    private ChoiceFieldCodec $choices;
    private LocationFieldCodec $locations;

    public function __construct(
        Schema $schema,
        ?RecordMappingProfile $profile = null,
        ?string $storagePrimaryKey = null
    ) {
        if (method_exists($schema, 'isLocal') && !$schema->isLocal()) {
            throw new \InvalidArgumentException('Remote schemas have no local record mapping.');
        }

        $this->schema = $schema;
        $this->profile = $profile ?? RecordMappingProfile::forSchema($schema);
        $this->schemaPrimaryKey = (string) $schema->getPrimaryKeyFieldName();
        $this->primaryKey = $storagePrimaryKey ?? $this->schemaPrimaryKey;
        $this->assertIdentifier($this->schemaPrimaryKey, 'schema primary key');
        $this->assertIdentifier($this->primaryKey, 'storage primary key');
        $this->json = new LegacyJsonCodec();
        $this->choices = new ChoiceFieldCodec($this->json);
        $this->locations = new LocationFieldCodec($this->json);
    }

    public function storagePrimaryKey(): string
    {
        return $this->primaryKey;
    }

    public function toStorage($record): array
    {
        $data = $this->normalizePrimaryKeyAliases($this->recordData($record));

        $storage = array();
        foreach ($data as $name => $value) {
            if (!is_string($name)) {
                continue;
            }
            if ($value === null && $this->profile->omitsNullWrites()) {
                continue;
            }

            $field = $this->schema->getField($name);
            if (!$field) {
                if ($name === $this->primaryKey) {
                    $this->assertScalarOrNull($value, 'Primary-key value');
                    $storage[$name] = $value;
                }
                continue;
            }

            $jsonMode = $this->profile->jsonMode($name);
            if ($jsonMode !== null) {
                $storage[$name] = $this->json->encodeProfile($value);
                continue;
            }

            $this->merge($storage, $this->encodeField($field, $value));
        }

        return $storage;
    }

    public function fromStorage(array $row): ?array
    {
        if ($row === array()) {
            return null;
        }

        $primaryValue = array_key_exists($this->primaryKey, $row)
            ? $row[$this->primaryKey]
            : ($row[$this->schemaPrimaryKey] ?? ($row['id'] ?? null));
        if ($this->schemaPrimaryKey !== $this->primaryKey
            && array_key_exists($this->primaryKey, $row)) {
            $row[$this->schemaPrimaryKey] = $row[$this->primaryKey];
        }

        $public = array('id' => $this->publicId($primaryValue));

        foreach ($this->schema->getFields() as $field) {
            $name = isset($field->name) ? (string) $field->name : '';
            if ($name === '') {
                continue;
            }

            $jsonMode = $this->profile->jsonMode($name);
            if ($jsonMode !== null) {
                if (array_key_exists($name, $row)) {
                    $public[$name] = $this->json->decodeProfile(
                        $row[$name],
                        $jsonMode,
                        $this->profile->readsNullAsEmpty($name)
                    );
                }
                continue;
            }

            $this->merge($public, $this->decodeField($field, $row));
        }

        return $public;
    }

    public function toStorageCriteria(array $criteria): array
    {
        if ($criteria === array()) {
            throw new \InvalidArgumentException('A non-empty record criterion is required.');
        }
        $criteria = $this->normalizePrimaryKeyAliases($criteria);

        $storage = array();
        foreach ($criteria as $name => $value) {
            if (!is_string($name)) {
                throw new \InvalidArgumentException('Criterion field names must be strings.');
            }
            $field = $this->schema->getField($name);
            if (!$field) {
                if ($name === $this->primaryKey) {
                    $this->assertScalarOrNull($value, 'Primary-key criterion');
                    $storage[$name] = $value;
                    continue;
                }
                throw new \InvalidArgumentException(
                    'Unknown schema criterion field: ' . $name
                );
            }
            $storage[$name] = $this->criterionValue($field, $value);
        }
        return $storage;
    }

    /** @param array<string, mixed> $values @return array<string, mixed> */
    private function normalizePrimaryKeyAliases(array $values): array
    {
        foreach (array_values(array_unique(array('id', $this->schemaPrimaryKey))) as $alias) {
            if ($alias === $this->primaryKey || !array_key_exists($alias, $values)) {
                continue;
            }
            $this->assertScalarOrNull($values[$alias], 'Public primary-key value');
            if (array_key_exists($this->primaryKey, $values)) {
                $this->assertScalarOrNull(
                    $values[$this->primaryKey],
                    'Physical primary-key value'
                );
                $same = $values[$this->primaryKey] === $values[$alias]
                    || ($values[$this->primaryKey] !== null
                        && $values[$alias] !== null
                        && (string) $values[$this->primaryKey]
                            === (string) $values[$alias]);
                if (!$same) {
                    throw new \InvalidArgumentException(
                        'Conflicting public and physical primary-key values.'
                    );
                }
            }
            $values[$this->primaryKey] = $values[$alias];
            unset($values[$alias]);
        }
        return $values;
    }

    private function assertScalarOrNull($value, string $label): void
    {
        if ($value !== null
            && (!is_scalar($value)
                || (is_float($value) && !is_finite($value)))) {
            throw new \InvalidArgumentException(
                $label . ' must be a finite scalar or null.'
            );
        }
    }

    private function criterionValue(object $field, $value)
    {
        $name = (string) $field->name;
        $type = strtolower((string) ($field->type ?? 'text'));
        if ($this->profile->jsonMode($name) !== null) {
            return $this->json->encodeProfile($value);
        }
        if ($type === 'checkbox' || $type === 'boolean') {
            return $this->encodeCheckbox($value);
        }
        if ($type === 'post') {
            return $this->extractPostId($value);
        }
        if (in_array($type, array('region', 'relation', 'image', 'marker', 'json'), true)) {
            return is_string($value) || $value === null
                ? $value
                : $this->json->encode($value);
        }
        if (in_array($type, array('status', 'select', 'radio'), true)) {
            return $this->choices->criterion($field, $value);
        }
        if ($type === 'location') {
            throw new \InvalidArgumentException(
                'Location equality criteria require a query extension.'
            );
        }
        if (is_array($value) || is_object($value)) {
            throw new \InvalidArgumentException(
                'CRUD criteria require scalar/null values.'
            );
        }
        return $value;
    }

    /** @return array<string, mixed> */
    private function encodeField(object $field, $value): array
    {
        $name = (string) $field->name;
        $type = strtolower((string) ($field->type ?? 'text'));

        switch ($type) {
            case 'post':
                return array($name => $this->extractPostId($value));
            case 'region':
            case 'relation':
                return array(
                    $name => is_array($value) && $value !== array()
                        ? $this->json->encode($value)
                        : '',
                );
            case 'status':
            case 'select':
            case 'radio':
                return $this->choices->encode($field, $value);
            case 'checkbox':
            case 'boolean':
                return array($name => $this->encodeCheckbox($value));
            case 'image':
            case 'marker':
            case 'checkboxes':
                return array(
                    $name => is_array($value) ? $this->json->encode($value) : $value,
                );
            case 'location':
                return $this->locations->encode($value);
            case 'json':
                return array($name => $this->json->encode($value));
            default:
                return array($name => $value);
        }
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function decodeField(object $field, array $row): array
    {
        $name = (string) $field->name;
        $type = strtolower((string) ($field->type ?? 'text'));

        switch ($type) {
            case 'id':
                return array($name => $this->publicId($row[$name] ?? null));
            case 'status':
            case 'radio':
            case 'select':
                return $this->choices->decode($field, $row);
            case 'region':
            case 'relation':
                if (empty($row[$name])) {
                    return array();
                }
                return array(
                    $name => $this->json->decode((string) $row[$name], false),
                );
            case 'post':
                if (empty($row[$name])) {
                    return array();
                }
                $postId = is_numeric($row[$name])
                    ? (int) $row[$name]
                    : $row[$name];
                return array($name => $postId);
            case 'checkbox':
            case 'boolean':
                return array($name => (bool) ($row[$name] ?? false));
            case 'checkboxes':
                $value = $row[$name] ?? null;
                if ($value === null || $value === '') {
                    return array($name => array());
                }
                // CSV already supplies JSON text; decode once without damaging
                // escaped option values. Preserve malformed legacy text for validation.
                $decoded = is_string($value)
                    ? $this->json->decode($value, true, false)
                    : $value;
                return array($name => is_array($decoded) ? $decoded : $value);
            case 'image':
            case 'marker':
                if (empty($row[$name])) {
                    return array();
                }
                return array(
                    $name => $this->json->decode((string) $row[$name], false),
                );
            case 'location':
                return array($name => $this->locations->decode($row));
            case 'datetime':
                return array($name => !empty($row[$name]) ? $row[$name] : '');
            case 'json':
                return array(
                    $name => $this->decodeJsonField($row[$name] ?? null),
                );
            default:
                return array(
                    $name => isset($row[$name])
                        ? $this->legacyScalar($row[$name], true)
                        : '',
                );
        }
    }

    private function decodeJsonField($value)
    {
        if ($value === null || $value === '' || $value === 0 || $value === '0') {
            return array();
        }
        if (is_string($value)) {
            return $this->json->decode($value, true, false);
        }
        if (is_object($value)) {
            return json_decode(
                json_encode($value, JSON_THROW_ON_ERROR),
                true,
                512,
                JSON_THROW_ON_ERROR
            );
        }
        return $value;
    }

    private function encodeCheckbox($value): int
    {
        return (int) (
            $value === true
            || $value === 'true'
            || $value === '1'
            || $value === 1
        );
    }

    /** Preserve legacy wpdb ARRAY_A scalar shapes after Plasma hydration. */
    private function legacyScalar($value, bool $nullAsEmpty)
    {
        if ($value === null) {
            return $nullAsEmpty ? '' : null;
        }
        if (is_bool($value)) {
            return $value ? '1' : '0';
        }
        if (is_int($value) || is_float($value)) {
            return (string) $value;
        }
        return $value;
    }

    private function extractPostId($value)
    {
        if (is_array($value)) {
            return $value['id'] ?? ($value['ID'] ?? null);
        }
        if (is_object($value)) {
            return $value->id ?? ($value->ID ?? null);
        }
        return $value;
    }

    private function publicId($value)
    {
        return $value === null ? null : (string) $value;
    }

    /** @param array<string, mixed> $target @param array<string, mixed> $values */
    private function merge(array &$target, array $values): void
    {
        foreach ($values as $name => $value) {
            $target[$name] = $value;
        }
    }

    /** @param array<string, mixed>|object $record @return array<string, mixed> */
    private function recordData($record): array
    {
        if (is_object($record) && method_exists($record, 'getData')) {
            return (array) $record->getData();
        }
        if (is_object($record)) {
            return get_object_vars($record);
        }
        if (is_array($record)) {
            return $record;
        }
        throw new \InvalidArgumentException('A record must be an array or object.');
    }

    private function assertIdentifier(string $identifier, string $label): void
    {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $identifier)) {
            throw new \InvalidArgumentException('Invalid ' . $label . ' identifier.');
        }
    }
}
