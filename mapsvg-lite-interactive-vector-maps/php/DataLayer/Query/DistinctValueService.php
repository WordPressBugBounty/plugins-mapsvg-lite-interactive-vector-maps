<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

use MapSVG\DataLayer\StorageSchemaResolution;
use Plasma\Adapter\DatabaseAdapter;

/** Validated physical-column DISTINCT reader for compatibility facades. */
final class DistinctValueService
{
    private DatabaseAdapter $adapter;
    private StorageSchemaResolution $resolution;

    public function __construct(
        DatabaseAdapter $adapter,
        StorageSchemaResolution $resolution
    ) {
        $this->adapter = $adapter;
        $this->resolution = $resolution;
    }

    /** @return array<int,mixed> */
    public function values(string $fieldName): array
    {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $fieldName)) {
            return array();
        }
        if (!array_key_exists($fieldName, $this->resolution->actualColumns())) {
            return array();
        }

        $field = AdvancedSqlBuilder::quoteIdentifier($fieldName);
        $table = AdvancedSqlBuilder::quoteIdentifier(
            $this->resolution->physicalTable()
        );
        $rows = $this->adapter->query(
            'SELECT DISTINCT ' . $field
            . ' AS `value` FROM ' . $table
            . ' WHERE ' . $field . ' IS NOT NULL'
            . ' AND ' . $field . " != ''"
        );

        $values = array();
        foreach ($rows as $row) {
            if (!is_array($row) || !array_key_exists('value', $row)) {
                throw new \UnexpectedValueException(
                    'Distinct-value rows must contain the value alias.'
                );
            }
            $values[] = $row['value'];
        }
        return $values;
    }
}
