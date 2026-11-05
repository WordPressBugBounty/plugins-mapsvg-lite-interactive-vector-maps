<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

use Plasma\Adapter\DatabaseAdapter;

/** Reads complete physical table metadata through the active Plasma adapter. */
final class AdapterPhysicalTableInspector implements PhysicalTableInspector
{
    private DatabaseAdapter $adapter;
    private string $physicalPrefix;

    public function __construct(
        DatabaseAdapter $adapter,
        string $physicalPrefix
    ) {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $physicalPrefix)) {
            throw new \InvalidArgumentException(
                'Invalid MapSVG physical table prefix.'
            );
        }
        $this->adapter = $adapter;
        $this->physicalPrefix = $physicalPrefix;
    }

    public function physicalTableName(string $logicalTable): string
    {
        $this->assertIdentifier($logicalTable, 'logical table');
        $physical = $this->physicalPrefix . $logicalTable;
        $this->assertIdentifier($physical, 'physical table');
        return $physical;
    }

    public function inspect(string $logicalTable): ?TableDefinition
    {
        $physical = $this->physicalTableName($logicalTable);
        $like = $this->adapter->escapeLike($physical);
        $existsSql = $this->adapter->prepare(
            'SHOW TABLES LIKE %s',
            $like
        );
        if ($this->adapter->getVar($existsSql) === null) {
            return null;
        }

        $columnRows = $this->adapter->query(
            'SHOW FULL COLUMNS FROM ' . self::quoteIdentifier($physical)
        );
        if ($columnRows === array()) {
            throw new \RuntimeException(
                'Physical table has no inspectable columns: ' . $physical
            );
        }
        $columns = array();
        foreach ($columnRows as $row) {
            if (!is_array($row)) {
                throw new \RuntimeException(
                    'Unexpected physical column metadata.'
                );
            }
            $name = $this->value($row, 'Field');
            $this->assertIdentifier($name, 'column');
            $default = $this->rawValue($row, 'Default');
            $columns[] = new ColumnDefinition(
                $name,
                $this->value($row, 'Type'),
                strtoupper($this->value($row, 'Null')) === 'YES',
                stripos($this->value($row, 'Extra'), 'auto_increment') !== false,
                $default !== null,
                $default
            );
        }

        $indexRows = $this->adapter->query(
            'SHOW INDEX FROM ' . self::quoteIdentifier($physical)
        );
        $groupedIndexes = array();
        foreach ($indexRows as $row) {
            if (!is_array($row)) {
                throw new \RuntimeException(
                    'Unexpected physical index metadata.'
                );
            }
            $keyName = $this->value($row, 'Key_name');
            $columnName = $this->value($row, 'Column_name');
            $this->assertIdentifier($keyName, 'index');
            if ($columnName === '') {
                throw new \RuntimeException(
                    'Functional indexes are not supported by TableManager.'
                );
            }
            $this->assertIdentifier($columnName, 'index column');
            $sequence = (int) $this->rawValue($row, 'Seq_in_index');
            if ($sequence < 1) {
                throw new \RuntimeException('Index sequence metadata is invalid.');
            }
            $groupedIndexes[$keyName][$sequence] = array(
                'column' => $columnName,
                'prefix' => $this->positiveIntOrNull(
                    $this->rawValue($row, 'Sub_part')
                ),
                'type' => strtoupper($this->value($row, 'Index_type')),
                'nonUnique' => (int) $this->rawValue($row, 'Non_unique'),
            );
        }

        $indexes = array();
        foreach ($groupedIndexes as $keyName => $parts) {
            ksort($parts, SORT_NUMERIC);
            $first = reset($parts);
            if (!is_array($first)) {
                throw new \RuntimeException('Index metadata is incomplete.');
            }
            $type = IndexDefinition::INDEX;
            if ($keyName === 'PRIMARY') {
                $type = IndexDefinition::PRIMARY;
            } elseif ($first['type'] === 'FULLTEXT') {
                $type = IndexDefinition::FULLTEXT;
            } elseif ($first['nonUnique'] === 0) {
                $type = IndexDefinition::UNIQUE;
            }

            $indexColumns = array();
            foreach ($parts as $part) {
                $indexColumns[] = new IndexColumn(
                    (string) $part['column'],
                    $part['prefix']
                );
            }
            $indexes[] = new IndexDefinition(
                (string) $keyName,
                $type,
                $indexColumns
            );
        }

        list($engine, $charset, $collation) =
            $this->tableOptions($physical, $like);

        return new TableDefinition(
            $logicalTable,
            $physical,
            $columns,
            $indexes,
            $engine,
            $charset,
            $collation
        );
    }

    /** @return array{0:string,1:string,2:string} */
    private function tableOptions(
        string $physical,
        string $escapedLike
    ): array {
        $statusSql = $this->adapter->prepare(
            'SHOW TABLE STATUS LIKE %s',
            $escapedLike
        );
        $rows = $this->adapter->query($statusSql);
        if ($rows === array()) {
            return array('InnoDB', 'utf8', 'utf8_unicode_ci');
        }
        $row = $rows[0];
        if (!is_array($row)) {
            throw new \RuntimeException(
                'Unexpected physical table-status metadata: ' . $physical
            );
        }
        $engine = $this->value($row, 'Engine');
        $collation = $this->value($row, 'Collation');
        if ($engine === '') {
            $engine = 'InnoDB';
        }
        if ($collation === '') {
            $collation = 'utf8_unicode_ci';
        }
        $separator = strpos($collation, '_');
        $charset = $separator === false
            ? $collation
            : substr($collation, 0, $separator);
        if ($charset === '') {
            $charset = 'utf8';
        }
        return array($engine, $charset, $collation);
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

    /** @param mixed $value */
    private function positiveIntOrNull($value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }
        $integer = (int) $value;
        if ($integer < 1) {
            throw new \RuntimeException(
                'Index prefix metadata must be positive.'
            );
        }
        return $integer;
    }

    private static function quoteIdentifier(string $identifier): string
    {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $identifier)) {
            throw new \InvalidArgumentException(
                'Invalid SQL identifier.'
            );
        }
        return '`' . $identifier . '`';
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
