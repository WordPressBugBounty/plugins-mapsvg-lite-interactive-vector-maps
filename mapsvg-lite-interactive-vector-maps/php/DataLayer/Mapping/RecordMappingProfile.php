<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Mapping;

use MapSVG\Schema;

/** Explicit table-specific JSON/null conventions layered over field-type mapping. */
final class RecordMappingProfile
{
    public const JSON_RAW = 'raw';
    public const JSON_ASSOC = 'assoc';
    public const JSON_OBJECT = 'object';

    /** @var array<string, string> */
    private array $jsonFields;
    private bool $omitNullWrites;
    /** @var array<string, true> */
    private array $nullAsEmptyFields;

    /** @param array<string, string> $jsonFields @param string[] $nullAsEmptyFields */
    public function __construct(
        array $jsonFields = array(),
        bool $omitNullWrites = false,
        array $nullAsEmptyFields = array()
    ) {
        foreach ($jsonFields as $field => $mode) {
            if (!is_string($field) || !preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $field)) {
                throw new \InvalidArgumentException('Invalid JSON mapping field.');
            }
            if (!in_array($mode, array(self::JSON_RAW, self::JSON_ASSOC, self::JSON_OBJECT), true)) {
                throw new \InvalidArgumentException('Invalid JSON mapping mode.');
            }
        }
        foreach ($nullAsEmptyFields as $field) {
            if (!is_string($field) || !preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $field)) {
                throw new \InvalidArgumentException('Invalid null-as-empty mapping field.');
            }
        }
        $this->jsonFields = $jsonFields;
        $this->omitNullWrites = $omitNullWrites;
        $this->nullAsEmptyFields = array_fill_keys($nullAsEmptyFields, true);
    }

    public static function forSchema(Schema $schema): self
    {
        $name = strtolower((string) $schema->getName());

        if ($name === 'maps' || $name === 'map') {
            return new self(array('options' => self::JSON_RAW));
        }
        if ($name === 'schema') {
            return new self(array(
                'fields' => self::JSON_OBJECT,
                'apiEndpoints' => self::JSON_ASSOC,
                'bindings' => self::JSON_ASSOC,
                'zodSettings' => self::JSON_ASSOC,
            ), true);
        }
        if ($name === 'import_settings') {
            return new self(
                array('preflightMeta' => self::JSON_RAW),
                false,
                array('preflightMeta')
            );
        }

        return new self();
    }

    public function jsonMode(string $field): ?string
    {
        return $this->jsonFields[$field] ?? null;
    }

    public function omitsNullWrites(): bool
    {
        return $this->omitNullWrites;
    }

    public function readsNullAsEmpty(string $field): bool
    {
        return isset($this->nullAsEmptyFields[$field]);
    }
}
