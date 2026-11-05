<?php

declare(strict_types=1);

namespace MapSVG\DataLayer;

/** Read physical MapSVG table metadata through the active WordPress connection. */
final class WpdbTableInspector implements StorageTableInspector
{
    /** @var object */
    private $wpdb;

    private string $pluginPrefix;

    /**
     * @param object|null $wpdbInstance WordPress wpdb-compatible object
     */
    public function __construct($wpdbInstance = null, ?string $pluginPrefix = null)
    {
        if ($wpdbInstance === null) {
            global $wpdb;
            $wpdbInstance = $wpdb;
        }
        if (!is_object($wpdbInstance) || !isset($wpdbInstance->prefix)) {
            throw new \RuntimeException('WordPress $wpdb is not available.');
        }

        $pluginPrefix = $pluginPrefix ?? (defined('MAPSVG_PREFIX') ? MAPSVG_PREFIX : null);
        if (!is_string($pluginPrefix) || !preg_match('/^[A-Za-z0-9_]+$/D', $pluginPrefix)) {
            throw new \InvalidArgumentException('MapSVG table prefix is invalid.');
        }

        $this->wpdb = $wpdbInstance;
        $this->pluginPrefix = $pluginPrefix;
    }

    public function physicalTableName(string $logicalTable): string
    {
        $this->assertIdentifier($logicalTable, 'logical table');
        $physical = (string) $this->wpdb->prefix . $this->pluginPrefix . $logicalTable;
        $this->assertIdentifier($physical, 'physical table');
        return $physical;
    }

    public function columns(string $logicalTable): array
    {
        $physical = $this->physicalTableName($logicalTable);
        $output = defined('ARRAY_A') ? ARRAY_A : 'ARRAY_A';
        $rows = $this->wpdb->get_results(
            'SHOW FULL COLUMNS FROM `' . $physical . '`',
            $output
        );

        $lastError = isset($this->wpdb->last_error) ? (string) $this->wpdb->last_error : '';
        if ($rows === false || $lastError !== '') {
            throw new \RuntimeException('Could not inspect MapSVG storage table: ' . $physical);
        }
        if (!is_array($rows)) {
            throw new \RuntimeException('Unexpected wpdb column metadata result.');
        }

        $columns = array();
        foreach ($rows as $row) {
            $row = is_object($row) ? get_object_vars($row) : (array) $row;
            $name = $this->value($row, 'Field');
            if ($name === '') {
                throw new \RuntimeException('Column metadata is missing its field name.');
            }
            $this->assertIdentifier($name, 'column');

            $columns[$name] = array(
                'name' => $name,
                'type' => $this->value($row, 'Type'),
                'nullable' => strtoupper($this->value($row, 'Null')) === 'YES',
                'key' => $this->value($row, 'Key'),
                'default' => $this->rawValue($row, 'Default'),
                'extra' => $this->value($row, 'Extra'),
                'collation' => $this->rawValue($row, 'Collation'),
            );
        }

        return $columns;
    }

    /** @param array<string, mixed> $row */
    private function value(array $row, string $key): string
    {
        $value = $this->rawValue($row, $key);
        return $value === null ? '' : (string) $value;
    }

    /** @param array<string, mixed> $row @return mixed */
    private function rawValue(array $row, string $key)
    {
        foreach ($row as $candidate => $value) {
            if (strcasecmp((string) $candidate, $key) === 0) {
                return $value;
            }
        }
        return null;
    }

    private function assertIdentifier(string $identifier, string $label): void
    {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $identifier)) {
            throw new \InvalidArgumentException('Invalid ' . $label . ' identifier.');
        }
    }
}
