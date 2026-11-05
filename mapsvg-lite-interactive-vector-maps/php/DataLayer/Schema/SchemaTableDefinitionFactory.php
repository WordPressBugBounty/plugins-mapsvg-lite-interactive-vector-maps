<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

use MapSVG\Schema;

/** Maps MapSVG UI fields to their current physical MySQL representation. */
final class SchemaTableDefinitionFactory
{
    private string $physicalPrefix;
    private string $engine;

    public function __construct(
        string $physicalPrefix,
        string $engine = 'InnoDB'
    ) {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $physicalPrefix)) {
            throw new \InvalidArgumentException(
                'Invalid MapSVG physical table prefix.'
            );
        }
        if (!preg_match('/^[A-Za-z0-9_]+$/D', $engine)) {
            throw new \InvalidArgumentException('Invalid storage engine.');
        }
        $this->physicalPrefix = $physicalPrefix;
        $this->engine = $engine;
    }

    public function fromSchema(Schema $schema): TableDefinition
    {
        if (method_exists($schema, 'isLocal') && !$schema->isLocal()) {
            throw new \InvalidArgumentException(
                'Remote schemas have no physical MapSVG table.'
            );
        }
        $schema = clone $schema;
        SchemaSqlDefinition::validate($schema);
        SchemaSqlDefinition::identifier($this->physicalPrefix . $schema->getName());
        $logicalName = trim((string) $schema->getName());
        $this->assertIdentifier($logicalName, 'schema table');

        $columns = array();
        $idFields = array();
        $fulltext = array();
        foreach ($schema->getFields() as $rawField) {
            $field = is_object($rawField)
                ? get_object_vars($rawField)
                : (array) $rawField;
            $name = trim((string) ($field['name'] ?? ''));
            $type = strtolower(trim((string) ($field['type'] ?? 'text')));
            $this->assertIdentifier($name, 'schema field');

            if ($type === 'id') {
                $idFields[] = $name;
            }
            if ($type === 'location') {
                foreach ($this->locationColumns() as $column) {
                    $columns[] = $column;
                }
            } else {
                $columns[] = $this->columnForField($name, $type, $field);
                if ($this->hasTextSidecar($type, $field)) {
                    $columns[] = $this->choiceTextColumn($name, $field);
                }
            }

            $searchColumn = $this->fulltextColumn($name, $type, $field);
            if ($searchColumn !== null) {
                $fulltext[] = $searchColumn;
            }
        }

        if (count($idFields) !== 1) {
            throw new \InvalidArgumentException(
                'Schema must contain exactly one id field.'
            );
        }
        $primaryName = $idFields[0];
        $primaryColumn = null;
        foreach ($columns as $column) {
            if ($column->name() === $primaryName) {
                $primaryColumn = $column;
                break;
            }
        }
        if ($primaryColumn === null) {
            throw new \LogicException('Primary-key column was not generated.');
        }

        $prefixLength = preg_match(
            '/^(?:char|varchar|text|tinytext|mediumtext|longtext)\b/D',
            $primaryColumn->type()
        ) ? 40 : null;
        $indexes = array(new IndexDefinition(
            'PRIMARY',
            IndexDefinition::PRIMARY,
            array(new IndexColumn($primaryName, $prefixLength))
        ));
        if ($fulltext !== array()) {
            $indexes[] = new IndexDefinition(
                '_keywords',
                IndexDefinition::FULLTEXT,
                array_map(
                    static fn (string $column): IndexColumn =>
                        new IndexColumn($column),
                    array_values(array_unique($fulltext))
                )
            );
        }

        return new TableDefinition(
            $logicalName,
            $this->physicalPrefix . $logicalName,
            $columns,
            $indexes,
            $this->engine,
            'utf8',
            'utf8_unicode_ci'
        );
    }

    /** @param array<string, mixed> $field */
    private function columnForField(
        string $name,
        string $type,
        array $field
    ): ColumnDefinition {
        $dbType = trim((string) ($field['db_type'] ?? ''));
        if ($dbType === '') {
            $dbType = $this->defaultDbType($type);
        }
        if ($type === 'select' && $this->isMultiselect($field)) {
            $dbType = 'text';
        }
        $autoIncrement = !empty($field['auto_increment']);
        // MySQL PRIMARY KEY columns are implicitly NOT NULL. Make that
        // invariant explicit in the physical definition for every MapSVG id
        // field, including string region IDs that are not AUTO_INCREMENT.
        $nullable = ($type === 'id' || $autoIncrement)
            ? false
            : empty($field['not_null']);
        $hasDefault = array_key_exists('db_default', $field);
        $default = $hasDefault
            ? $field['db_default']
            : null;

        return new ColumnDefinition(
            $name,
            $dbType,
            $nullable,
            $autoIncrement,
            $hasDefault,
            $default
        );
    }

    /** @param array<string, mixed> $field */
    private function choiceTextColumn(
        string $name,
        array $field
    ): ColumnDefinition {
        $hasDefault = array_key_exists('db_default', $field);
        $label = null;
        if ($hasDefault && isset($field['options'])
            && is_iterable($field['options'])) {
            foreach ($field['options'] as $rawOption) {
                $option = is_object($rawOption)
                    ? get_object_vars($rawOption)
                    : (array) $rawOption;
                if ((string) ($option['value'] ?? '')
                    === (string) $field['db_default']) {
                    $label = $option['label'] ?? null;
                    break;
                }
            }
        }
        return new ColumnDefinition(
            $name . '_text',
            'varchar(255)',
            true,
            false,
            $hasDefault,
            $label
        );
    }

    /** @return ColumnDefinition[] */
    private function locationColumns(): array
    {
        return array(
            new ColumnDefinition('location_lat', 'float(10,7)'),
            new ColumnDefinition('location_lng', 'float(10,7)'),
            new ColumnDefinition('location_x', 'float'),
            new ColumnDefinition('location_y', 'float'),
            new ColumnDefinition('location_address', 'text'),
            new ColumnDefinition('location_img', 'varchar(255)'),
            new ColumnDefinition(
                'location_geocoding_status',
                'tinyint unsigned',
                false,
                false,
                true,
                6
            ),
        );
    }

    /** @param array<string, mixed> $field */
    private function hasTextSidecar(string $type, array $field): bool
    {
        return ($type === 'select' && !$this->isMultiselect($field))
            || $type === 'radio'
            || $type === 'status';
    }

    /** @param array<string, mixed> $field */
    private function isMultiselect(array $field): bool
    {
        return isset($field['multiselect'])
            && filter_var($field['multiselect'], FILTER_VALIDATE_BOOLEAN);
    }

    /** @param array<string, mixed> $field */
    private function fulltextColumn(
        string $name,
        string $type,
        array $field
    ): ?string {
        if (empty($field['searchable'])) {
            return null;
        }
        $dbType = strtolower(trim((string) ($field['db_type'] ?? '')));
        if ($dbType === '') {
            $dbType = $this->defaultDbType($type);
        }
        if ($type === 'select' && $this->isMultiselect($field)) {
            $dbType = 'text';
        }
        if (!preg_match('/^(?:varchar|text|longtext|mediumtext|tinytext)\b/D', $dbType)) {
            return null;
        }
        if ($type === 'text') {
            $searchType = strtolower((string) ($field['searchType'] ?? 'fulltext'));
            if ($searchType !== 'fulltext') {
                return null;
            }
        }
        if ($type === 'location') {
            return 'location_address';
        }
        if (($type === 'select' && !$this->isMultiselect($field))
            || $type === 'radio') {
            return $name . '_text';
        }
        return $name;
    }

    private function defaultDbType(string $type): string
    {
        $types = array(
            'id' => 'int(11)',
            'text' => 'varchar(255)',
            'title' => 'varchar(255)',
            'textarea' => 'text',
            'number' => 'varchar(255)',
            'select' => 'varchar(255)',
            'checkbox' => 'tinyint(1)',
            'checkboxes' => 'text',
            'radio' => 'varchar(255)',
            'status' => 'varchar(255)',
            'image' => 'text',
            'images' => 'text',
            'date' => 'varchar(50)',
            'datetime' => 'varchar(50)',
            'post' => 'int(11)',
            'region' => 'text',
            'relation' => 'text',
            'regions' => 'text',
            'colorpicker' => 'varchar(255)',
            'json' => 'text',
        );
        return $types[$type] ?? 'varchar(255)';
    }

    private function assertIdentifier(
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
