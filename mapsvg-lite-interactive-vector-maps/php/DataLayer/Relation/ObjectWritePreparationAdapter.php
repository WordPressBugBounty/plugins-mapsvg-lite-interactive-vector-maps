<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Relation;

use MapSVG\DataLayer\Location\SynchronousLocationPreparationCanary;
use MapSVG\DataLayer\Mapping\SchemaRecordMapper;

/** Combines pure field mapping with explicit location preparation. */
final class ObjectWritePreparationAdapter implements ObjectWritePreparer
{
    private SchemaRecordMapper $mapper;
    private ?SynchronousLocationPreparationCanary $location;

    public function __construct(
        SchemaRecordMapper $mapper,
        ?SynchronousLocationPreparationCanary $location = null
    ) {
        $this->mapper = $mapper;
        $this->location = $location;
    }

    /** @param mixed $record */
    public function prepare(
        $record,
        bool $convertLatLngToAddress = false
    ): ObjectWritePreparationResult {
        $storage = $this->mapper->toStorage($record);
        $errors = array();

        if ($this->location !== null) {
            $data = self::recordData($record);
            $location = $this->location->prepareRecord(
                $data,
                $convertLatLngToAddress
            );
            if ($location !== null) {
                $storage = array_merge(
                    $storage,
                    $location->storage()
                );
                $errors = $location->errors();
            }
        }

        return new ObjectWritePreparationResult(
            $storage,
            $errors
        );
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
                'Object write record must be an array or object.'
            );
        }

        return $record;
    }
}
