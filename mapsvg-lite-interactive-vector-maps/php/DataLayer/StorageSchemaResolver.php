<?php

declare(strict_types=1);

namespace MapSVG\DataLayer;

use MapSVG\Schema;

/**
 * Convert MapSVG application schema into conservative Plasma storage metadata.
 */
final class StorageSchemaResolver
{
    private StorageTableInspector $inspector;

    public function __construct(StorageTableInspector $inspector)
    {
        $this->inspector = $inspector;
    }

    public function resolve(Schema $schema): StorageSchemaResolution
    {
        if (method_exists($schema, 'isLocal') && !$schema->isLocal()) {
            throw new \InvalidArgumentException('Remote MapSVG schemas have no local Plasma model.');
        }

        $logicalTable = trim((string) $schema->getName());
        $this->assertIdentifier($logicalTable, 'schema table');

        $expected = $this->expectedColumns($schema);
        $actual = $this->inspector->columns($logicalTable);
        if ($actual === array()) {
            throw new \RuntimeException('MapSVG storage table has no inspectable columns: ' . $logicalTable);
        }

        foreach ($actual as $name => $column) {
            if (!is_string($name) || !is_array($column)) {
                throw new \RuntimeException('Storage inspector returned invalid column metadata.');
            }
            $this->assertIdentifier($name, 'physical column');
        }

        $declaredPrimaryKey = trim((string) $schema->getPrimaryKeyFieldName());
        $this->assertIdentifier($declaredPrimaryKey, 'declared primary key');
        if (!isset($expected[$declaredPrimaryKey])) {
            $expected[$declaredPrimaryKey] = array(
                'mapsvgField' => $declaredPrimaryKey,
                'mapsvgType' => 'id',
                'derived' => false,
            );
        }

        $primaryKey = $this->effectivePrimaryKey($declaredPrimaryKey, $actual);
        $missing = array_values(array_diff(array_keys($expected), array_keys($actual)));
        $extra = array_values(array_diff(array_keys($actual), array_keys($expected)));
        sort($missing);
        sort($extra);
        $fields = array();
        foreach ($actual as $name => $column) {
            $fields[$name] = $this->plasmaFieldDefinition(
                $column,
                $expected[$name] ?? null
            );
        }

        $modelKey = self::modelKeyFor($logicalTable);
        $physicalTable = $this->inspector->physicalTableName($logicalTable);
        $definition = array(
            'table' => $logicalTable,
            'logicalTable' => $logicalTable,
            'primaryKey' => $primaryKey,
            'fields' => $fields,
            'relations' => array(),
            'mapsvgStorage' => array(
                'physicalTable' => $physicalTable,
                'declaredPrimaryKey' => $declaredPrimaryKey,
                'missingExpectedColumns' => $missing,
                'extraActualColumns' => $extra,
            ),
        );

        return new StorageSchemaResolution(
            $modelKey,
            $logicalTable,
            $physicalTable,
            $primaryKey,
            $declaredPrimaryKey,
            $definition,
            $expected,
            $actual,
            $missing,
            $extra
        );
    }

    /**
     * Model keys never overlap raw MapSVG names or bundled WordPress model keys.
     */
    public static function modelKeyFor(string $logicalTable): string
    {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $logicalTable)) {
            throw new \InvalidArgumentException('Invalid schema table identifier.');
        }

        $readable = strtolower($logicalTable);
        if (strlen($readable) > 36) {
            $readable = substr($readable, 0, 36);
        }

        return 'mapsvgStorage_' . $readable . '_' . substr(hash('sha256', $logicalTable), 0, 12);
    }

    /** @return array<string, array<string, mixed>> */
    private function expectedColumns(Schema $schema): array
    {
        $expected = array();
        foreach ($schema->getFields() as $field) {
            $field = is_object($field) ? $field : (object) $field;
            $name = isset($field->name) ? trim((string) $field->name) : '';
            $type = isset($field->type) ? strtolower((string) $field->type) : 'text';
            $this->assertIdentifier($name, 'MapSVG field');

            // Location is a public/domain field expanded into physical sidecars.
            if ($type !== 'location') {
                $this->addExpected($expected, $name, $name, $type, false);
            }

            $multiselect = isset($field->multiselect) && (bool) $field->multiselect;
            if (($type === 'select' && !$multiselect) || $type === 'radio' || $type === 'status') {
                $this->addExpected($expected, $name . '_text', $name, $type, true);
            }

            if ($type === 'location') {
                foreach ($this->locationColumns() as $column => $storageType) {
                    $this->addExpected(
                        $expected,
                        $column,
                        $name,
                        $storageType,
                        true
                    );
                }
            }
        }

        return $expected;
    }

    /** @return array<string, string> */
    private function locationColumns(): array
    {
        return array(
            'location_lat' => 'location-coordinate',
            'location_lng' => 'location-coordinate',
            'location_x' => 'location-coordinate',
            'location_y' => 'location-coordinate',
            'location_address' => 'location-address',
            'location_img' => 'location-image',
            'location_geocoding_status' => 'location-status',
        );
    }

    /**
     * @param array<string, array<string, mixed>> $expected
     */
    private function addExpected(
        array &$expected,
        string $column,
        string $mapSvgField,
        string $mapSvgType,
        bool $derived
    ): void {
        $this->assertIdentifier($column, 'expected column');
        if (isset($expected[$column])) {
            return;
        }

        $expected[$column] = array(
            'mapsvgField' => $mapSvgField,
            'mapsvgType' => $mapSvgType,
            'derived' => $derived,
        );
    }

    /**
     * @param array<string, array<string, mixed>> $actual
     */
    private function effectivePrimaryKey(string $declared, array $actual): string
    {
        $physicalPrimaryKeys = array();
        foreach ($actual as $name => $column) {
            if (strtoupper((string) ($column['key'] ?? '')) === 'PRI') {
                $physicalPrimaryKeys[] = $name;
            }
        }

        if (count($physicalPrimaryKeys) > 1) {
            throw new \RuntimeException('Composite primary keys are not supported by Plasma.');
        }
        if (count($physicalPrimaryKeys) === 1) {
            return $physicalPrimaryKeys[0];
        }
        if (isset($actual[$declared])) {
            return $declared;
        }

        throw new \RuntimeException(
            'The declared MapSVG primary key does not exist in physical storage.'
        );
    }

    /**
     * @param array<string, mixed> $actual
     * @param array<string, mixed>|null $expected
     * @return array<string, mixed>
     */
    private function plasmaFieldDefinition(array $actual, ?array $expected): array
    {
        $physicalType = strtolower(trim((string) ($actual['type'] ?? '')));
        $mapsvgType = $expected === null ? null : (string) $expected['mapsvgType'];
        $plasmaType = $this->inferPlasmaType($physicalType, $mapsvgType);

        return array(
            'type' => $plasmaType,
            'physicalType' => (string) ($actual['type'] ?? ''),
            'nullable' => (bool) ($actual['nullable'] ?? true),
            'default' => $actual['default'] ?? null,
            'key' => (string) ($actual['key'] ?? ''),
            'extra' => (string) ($actual['extra'] ?? ''),
            'mapsvgField' => $expected['mapsvgField'] ?? null,
            'mapsvgType' => $mapsvgType,
            'derived' => (bool) ($expected['derived'] ?? false),
        );
    }

    private function inferPlasmaType(string $physicalType, ?string $mapsvgType): string
    {
        // Text columns may contain empty strings or historical JSON variants.
        // Cast JSON only when both metadata and physical storage prove it strict.
        if ($mapsvgType === 'json' && preg_match('/^json(?:\b|\()/D', $physicalType)) {
            return 'json';
        }

        if (in_array($mapsvgType, array('checkbox', 'boolean'), true)
            && preg_match('/^(?:bool|boolean|tinyint\s*\(\s*1\s*\)|bit\s*\(\s*1\s*\))/D', $physicalType)) {
            return 'boolean';
        }

        if (preg_match('/^bigint(?:\b|\()/D', $physicalType)) {
            return 'bigint';
        }
        if (preg_match('/^(?:tinyint|smallint|mediumint|int|integer)(?:\b|\()/D', $physicalType)) {
            return 'int';
        }
        if (preg_match('/^(?:float|double|real)(?:\b|\()/D', $physicalType)) {
            return 'float';
        }
        if (preg_match('/^(?:datetime|timestamp)(?:\b|\()/D', $physicalType)) {
            return 'datetime';
        }

        // DECIMAL/NUMERIC stay strings to avoid precision loss. Text/blob/date/time and
        // unknown legacy types are also deliberately passed through unchanged.
        return 'string';
    }

    private function assertIdentifier(string $identifier, string $label): void
    {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $identifier)) {
            throw new \InvalidArgumentException('Invalid ' . $label . ' identifier.');
        }
    }
}
