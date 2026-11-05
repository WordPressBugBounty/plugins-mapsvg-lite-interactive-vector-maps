<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Relation;

use MapSVG\DataLayer\Store\CrudStore;
use Plasma\Adapter\DatabaseAdapter;

/** Strict prepared-row DML used inside relation transactions. */
final class ObjectRowWriteStore
{
    private CrudStore $rows;
    private DatabaseAdapter $adapter;
    private string $physicalTable;
    private string $primaryKey;

    public function __construct(
        CrudStore $rows,
        DatabaseAdapter $adapter,
        string $physicalTable,
        string $primaryKey
    ) {
        self::assertIdentifier($physicalTable, 'physical object table');
        self::assertIdentifier($primaryKey, 'object primary key');
        $this->rows = $rows;
        $this->adapter = $adapter;
        $this->physicalTable = $physicalTable;
        $this->primaryKey = $primaryKey;
    }

    /** @param array<string,mixed> $storage @return array<string,mixed> */
    public function create(array $storage): array
    {
        if ($storage === array()) {
            throw new \InvalidArgumentException(
                'Prepared object create data must not be empty.'
            );
        }
        $created = $this->rows->create($storage);
        $this->primaryKeyValue($created, $storage);
        return $created;
    }

    /** @param array<string,mixed> $storage */
    public function update(array $storage): int
    {
        $id = $this->primaryKeyValue($storage);
        $where = array($this->primaryKey => $id);
        $updated = $this->rows->update($storage, $where);
        if ($updated === 0 && $this->rows->findOne($where) === null) {
            throw new \UnexpectedValueException(
                'Prepared object update target does not exist.'
            );
        }
        return $updated;
    }

    /** @param int|string $id */
    public function delete($id): int
    {
        return $this->rows->delete(array(
            $this->primaryKey => self::id($id, 'object ID'),
        ));
    }

    public function clear(): int
    {
        return $this->adapter->execute(
            'DELETE FROM ' . self::quoteIdentifier($this->physicalTable)
        );
    }

    public function resetAutoIncrement(): void
    {
        $this->adapter->execute(
            'ALTER TABLE ' . self::quoteIdentifier($this->physicalTable)
            . ' AUTO_INCREMENT = 1'
        );
    }

    /**
     * @param array<string,mixed> $preferred
     * @param array<string,mixed> $fallback
     */
    public function primaryKeyValue(
        array $preferred,
        array $fallback = array()
    ): string {
        foreach (array($preferred, $fallback) as $row) {
            if (array_key_exists($this->primaryKey, $row)) {
                return self::id(
                    $row[$this->primaryKey],
                    'prepared object primary key'
                );
            }
        }
        throw new \UnexpectedValueException(
            'Prepared object row returned no primary key.'
        );
    }

    public function primaryKey(): string
    {
        return $this->primaryKey;
    }

    /** @param mixed $value */
    private static function id($value, string $label): string
    {
        if (!is_int($value) && !is_string($value)) {
            throw new \InvalidArgumentException(
                $label . ' must be a string or integer.'
            );
        }
        $value = (string) $value;
        if ($value === '') {
            throw new \InvalidArgumentException(
                $label . ' must not be empty.'
            );
        }
        return $value;
    }

    private static function quoteIdentifier(string $identifier): string
    {
        self::assertIdentifier($identifier, 'SQL');
        return '`' . $identifier . '`';
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
