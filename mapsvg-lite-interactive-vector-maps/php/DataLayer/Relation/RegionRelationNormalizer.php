<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Relation;

use MapSVG\Schema;

/** Converts schema-owned relation fields into deterministic r2o targets. */
final class RegionRelationNormalizer
{
    /** @var string[] */
    private array $fieldNames;

    public function __construct(Schema $schema)
    {
        $fields = array();
        foreach ($schema->getRelationFields() as $field) {
            $name = trim((string) ($field->name ?? ''));
            self::assertIdentifier($name, 'relation field');
            $fields[$name] = true;
        }
        $this->fieldNames = array_keys($fields);
    }

    public function hasRelationFields(): bool
    {
        return $this->fieldNames !== array();
    }

    /** @return string[] */
    public function fieldNames(): array
    {
        return $this->fieldNames;
    }

    /** @param array<string,mixed>|object $record */
    public function hasRelationInput($record): bool
    {
        $data = self::recordData($record);
        foreach ($this->fieldNames as $fieldName) {
            if (array_key_exists($fieldName, $data)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param array<string,mixed>|object $record
     * @return RegionRelationLink[]
     */
    public function linksFromRecord($record): array
    {
        $data = self::recordData($record);
        $links = array();

        foreach ($this->fieldNames as $fieldName) {
            if (!array_key_exists($fieldName, $data)) {
                continue;
            }
            foreach (self::valueItems($data[$fieldName]) as $item) {
                $link = self::linkFromItem($item);
                if ($link === null) {
                    continue;
                }
                $links[$link->identity()] = $link;
            }
        }

        return array_values($links);
    }

    /** @param mixed $record @return array<string,mixed> */
    private static function recordData($record): array
    {
        if (is_object($record) && method_exists($record, 'getData')) {
            $record = $record->getData();
        } elseif (is_object($record)) {
            $record = get_object_vars($record);
        }
        if (!is_array($record)) {
            throw new \InvalidArgumentException(
                'Relation source record must be an array or object.'
            );
        }
        return $record;
    }

    /** @param mixed $value @return array<int,mixed> */
    private static function valueItems($value): array
    {
        if (is_string($value)) {
            $value = trim($value);
            if ($value === '' || $value === '[]') {
                return array();
            }
            $decoded = json_decode($value, true);
            if (!is_array($decoded)) {
                return array();
            }
            $value = $decoded;
        }
        return is_array($value) ? array_values($value) : array();
    }

    /** @param mixed $item */
    private static function linkFromItem($item): ?RegionRelationLink
    {
        if (is_object($item)) {
            $item = get_object_vars($item);
        }
        if (!is_array($item)) {
            return null;
        }

        $table = $item['tableName'] ?? ($item['table_name'] ?? null);
        $regionId = $item['id'] ?? ($item['region_id'] ?? null);
        if (!is_string($table)
            || (!is_int($regionId) && !is_string($regionId))) {
            return null;
        }

        try {
            return new RegionRelationLink($table, $regionId);
        } catch (\InvalidArgumentException $error) {
            return null;
        }
    }

    private static function assertIdentifier(
        string $identifier,
        string $label
    ): void {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $identifier)) {
            throw new \InvalidArgumentException(
                'Invalid ' . $label . ' identifier.'
            );
        }
    }
}
