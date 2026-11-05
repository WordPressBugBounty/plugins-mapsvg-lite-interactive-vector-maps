<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Store;

use MapSVG\DataLayer\PlasmaProvider;
use Plasma\Adapter\DatabaseAdapter;

/** Validated access to one fixed MapSVG-owned plugin table. */
final class PluginTableStore
{
    private DatabaseAdapter $adapter;
    private string $logicalTable;
    private string $physicalTable;

    public function __construct(
        string $logicalTable,
        ?DatabaseAdapter $adapter = null
    ) {
        self::assertIdentifier($logicalTable, 'plugin table');
        $this->adapter = $adapter
            ?? (new PlasmaProvider())->createAdapter();
        $this->logicalTable = $logicalTable;
        $this->physicalTable = $this->adapter->getPrefix() . $logicalTable;
        self::assertIdentifier($this->physicalTable, 'physical plugin table');
    }

    public function adapter(): DatabaseAdapter
    {
        return $this->adapter;
    }

    public function logicalTable(): string
    {
        return $this->logicalTable;
    }

    public function physicalTable(): string
    {
        return $this->physicalTable;
    }

    public function quotedTable(): string
    {
        return self::quoteIdentifier($this->physicalTable);
    }

    public function exists(): bool
    {
        $sql = $this->adapter->prepare(
            'SHOW TABLES LIKE %s',
            $this->adapter->escapeLike($this->physicalTable)
        );
        return $this->adapter->getVar($sql) !== null;
    }

    /** @return array<int,array<string,mixed>> */
    public function all(): array
    {
        return $this->adapter->query(
            'SELECT * FROM ' . $this->quotedTable()
        );
    }

    /**
     * @param array<string,mixed> $where
     * @return array<string,mixed>|null
     */
    public function findOne(array $where): ?array
    {
        [$sql, $params] = $this->whereSql($where);
        $rows = $this->adapter->query(
            $this->adapter->prepare(
                'SELECT * FROM ' . $this->quotedTable()
                . ' WHERE ' . $sql . ' LIMIT 1',
                ...$params
            )
        );
        return $rows[0] ?? null;
    }

    /** @param array<string,mixed> $data */
    public function insert(array $data)
    {
        return $this->adapter->insert($this->logicalTable, $data);
    }

    /**
     * @param array<string,mixed> $data
     * @param array<string,mixed> $where
     */
    public function update(array $data, array $where): int
    {
        return (int) $this->adapter->update(
            $this->logicalTable,
            $data,
            $where
        );
    }

    /** @param array<string,mixed> $where */
    public function delete(array $where): int
    {
        return (int) $this->adapter->delete(
            $this->logicalTable,
            $where
        );
    }

    public function prepared(string $sql, ...$params): string
    {
        return $this->adapter->prepare($sql, ...$params);
    }

    /** @return array<int,array<string,mixed>> */
    public function query(string $sql): array
    {
        return $this->adapter->query($sql);
    }

    public function execute(string $sql): int
    {
        return $this->adapter->execute($sql);
    }

    /** @return mixed */
    public function getVar(string $sql)
    {
        return $this->adapter->getVar($sql);
    }

    /**
     * @param array<string,mixed> $where
     * @return array{0:string,1:array<int,mixed>}
     */
    private function whereSql(array $where): array
    {
        if ($where === array()) {
            throw new \InvalidArgumentException(
                'Plugin-table criteria must not be empty.'
            );
        }

        $parts = array();
        $params = array();
        foreach ($where as $field => $value) {
            self::assertIdentifier((string) $field, 'criteria field');
            if (is_array($value) || is_object($value)) {
                throw new \InvalidArgumentException(
                    'Plugin-table criteria values must be scalar or null.'
                );
            }
            if ($value === null) {
                $parts[] = self::quoteIdentifier((string) $field) . ' IS NULL';
            } else {
                $parts[] = self::quoteIdentifier((string) $field) . ' = %s';
                $params[] = $value;
            }
        }

        return array(implode(' AND ', $parts), $params);
    }

    private static function quoteIdentifier(string $identifier): string
    {
        self::assertIdentifier($identifier, 'SQL');
        return chr(96) . $identifier . chr(96);
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
