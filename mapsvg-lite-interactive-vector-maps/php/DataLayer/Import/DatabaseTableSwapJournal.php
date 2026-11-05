<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Import;

use Plasma\Adapter\DatabaseAdapter;

/** Durable InnoDB-backed snapshot journal on the current Plasma connection. */
final class DatabaseTableSwapJournal implements TableSwapJournal
{
    public const TABLE = 'swap_journal';

    private DatabaseAdapter $adapter;

    public function __construct(DatabaseAdapter $adapter)
    {
        $this->adapter = $adapter;
    }

    public function load(string $liveTable): ?TableSwapJournalEntry
    {
        $sql = 'SELECT `live_table`, `stage_table`, `backup_table`, `phase`'
            . ' FROM ' . $this->table()
            . ' WHERE `live_table` = %s LIMIT 1';
        $rows = $this->adapter->query(
            $this->adapter->prepare($sql, $liveTable)
        );
        if ($rows === array()) {
            return null;
        }
        $row = $rows[0];
        return new TableSwapJournalEntry(
            (string) $row['live_table'],
            (string) $row['stage_table'],
            (string) $row['backup_table'],
            (string) $row['phase']
        );
    }

    public function start(TableSwapJournalEntry $entry): void
    {
        $sql = 'INSERT INTO ' . $this->table()
            . ' (`live_table`, `stage_table`, `backup_table`, `phase`, `updated_at`)'
            . ' VALUES (%s, %s, %s, %s, %d)';
        $this->adapter->execute($this->adapter->prepare(
            $sql,
            $entry->liveTable(),
            $entry->stageTable(),
            $entry->backupTable(),
            $entry->phase(),
            time()
        ));
    }

    public function updatePhase(string $liveTable, string $phase): void
    {
        if (!in_array($phase, TableSwapJournalEntry::phases(), true)) {
            throw new \InvalidArgumentException('Unknown table-swap journal phase.');
        }
        $sql = 'UPDATE ' . $this->table()
            . ' SET `phase` = %s, `updated_at` = %d'
            . ' WHERE `live_table` = %s';
        $affected = $this->adapter->execute($this->adapter->prepare(
            $sql,
            $phase,
            time(),
            $liveTable
        ));
        if ($affected !== 1) {
            throw new \RuntimeException(
                'Table-swap journal phase update did not affect one row.'
            );
        }
    }

    public function clear(string $liveTable): void
    {
        $sql = 'DELETE FROM ' . $this->table()
            . ' WHERE `live_table` = %s';
        $this->adapter->execute(
            $this->adapter->prepare($sql, $liveTable)
        );
    }

    private function table(): string
    {
        return '`' . $this->adapter->getPrefix() . self::TABLE . '`';
    }
}
