<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

use MapSVG\DataLayer\Mapping\RecordMapper;
use MapSVG\DataLayer\Mapping\RecordMappingProfile;
use MapSVG\DataLayer\Mapping\SchemaRecordMapper;
use MapSVG\DataLayer\StorageSchemaResolution;
use MapSVG\Schema;

/**
 * Maps schema-catalog rows while writing only columns that physically exist.
 */
final class SchemaCatalogRecordMapper implements RecordMapper
{
    private SchemaRecordMapper $mapper;
    /** @var array<string, true> */
    private array $physicalColumns;

    public function __construct(
        Schema $catalogSchema,
        StorageSchemaResolution $resolution
    ) {
        $this->mapper = new SchemaRecordMapper(
            $catalogSchema,
            RecordMappingProfile::forSchema($catalogSchema),
            $resolution->primaryKey()
        );
        $this->physicalColumns = array_fill_keys(
            array_keys($resolution->actualColumns()),
            true
        );
    }

    public function toStorage($record): array
    {
        $this->validateZodSettingsRecord($record);
        return $this->physicalOnly($this->mapper->toStorage($record));
    }

    public function fromStorage(array $row): ?array
    {
        if (array_key_exists('zodSettings', $row)) {
            Schema::normalizeZodSettings($row['zodSettings']);
        }

        $public = $this->mapper->fromStorage($row);
        if ($public === null) {
            return null;
        }
        foreach (array_keys($public) as $field) {
            if ($field !== 'id' && !isset($this->physicalColumns[$field])) {
                unset($public[$field]);
            }
        }
        return $public;
    }

    public function toStorageCriteria(array $criteria): array
    {
        $mapped = $this->mapper->toStorageCriteria($criteria);
        foreach ($mapped as $column => $_value) {
            if (!isset($this->physicalColumns[$column])) {
                throw new \UnexpectedValueException(
                    'Schema-catalog criterion is missing from physical storage: '
                    . $column
                );
            }
        }
        return $mapped;
    }

    public function storagePrimaryKey(): string
    {
        return $this->mapper->storagePrimaryKey();
    }

    /** @param mixed $record */
    private function validateZodSettingsRecord($record): void
    {
        if (is_object($record) && method_exists($record, 'getData')) {
            $record = $record->getData();
        } elseif (is_object($record)) {
            $record = get_object_vars($record);
        }

        if (is_array($record) && array_key_exists('zodSettings', $record)) {
            Schema::normalizeZodSettings($record['zodSettings']);
        }
    }

    /** @param array<string, mixed> $values @return array<string, mixed> */
    private function physicalOnly(array $values): array
    {
        $filtered = array();
        foreach ($values as $column => $value) {
            if (isset($this->physicalColumns[$column])) {
                $filtered[$column] = $value;
            }
        }
        return $filtered;
    }
}
