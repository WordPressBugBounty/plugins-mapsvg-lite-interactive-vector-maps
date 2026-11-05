<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Import;

use Plasma\Adapter\DatabaseAdapter;
use Plasma\Adapter\DialectAwareAdapter;

/** MySQL snapshot handoff with live/stage/backup recovery guarantees. */
final class TableSwapService
{
    private DatabaseAdapter $adapter;
    private TableSwapJournal $journal;
    /** @var callable */
    private $suffixFactory;

    public function __construct(
        DatabaseAdapter $adapter,
        TableSwapJournal $journal,
        ?callable $suffixFactory = null
    ) {
        if (!$adapter instanceof DialectAwareAdapter) {
            throw new \InvalidArgumentException(
                'Table swap requires a dialect-aware database adapter.'
            );
        }
        $dialect = strtolower($adapter->getDialect());
        if (!in_array($dialect, array('mysql', 'mariadb'), true)) {
            throw new \InvalidArgumentException(
                'Table swap is supported only for MySQL/MariaDB.'
            );
        }
        if ($adapter->getTransactionDepth() !== 0) {
            throw new \LogicException(
                'Table swap cannot start inside a database transaction.'
            );
        }

        $this->adapter = $adapter;
        $this->journal = $journal;
        $this->suffixFactory = $suffixFactory
            ?? static function (): string {
                return dechex(time()) . '_' . bin2hex(random_bytes(3));
            };
    }

    /**
     * @param callable(string):mixed $populateStage
     * @param callable():void $handoff
     */
    public function replace(
        string $liveTable,
        callable $populateStage,
        callable $handoff
    ): TableSwapResult {
        $liveTable = $this->logicalName($liveTable);
        return $this->withTableLock(
            $liveTable,
            function () use (
                $liveTable,
                $populateStage,
                $handoff
            ): TableSwapResult {
                return $this->replaceLocked(
                    $liveTable,
                    $populateStage,
                    $handoff
                );
            }
        );
    }

    /**
     * @param callable(string):mixed $populateStage
     * @param callable():void $handoff
     */
    private function replaceLocked(
        string $liveTable,
        callable $populateStage,
        callable $handoff
    ): TableSwapResult {
        if ($this->adapter->getTransactionDepth() !== 0) {
            throw new \LogicException(
                'Table swap cannot run inside a database transaction.'
            );
        }
        $this->recoverLocked($liveTable);

        $suffix = $this->suffix();
        $stageTable = $this->temporaryName($liveTable, '_stg_', $suffix);
        $backupTable = $this->temporaryName($liveTable, '_bak_', $suffix);
        $this->journal->start(new TableSwapJournalEntry(
            $liveTable,
            $stageTable,
            $backupTable,
            TableSwapJournalEntry::PHASE_STAGING
        ));

        try {
            $this->createLike($stageTable, $liveTable);
        } catch (\Throwable $error) {
            $this->recoverAfterFailure($liveTable, $error);
            throw $error;
        }

        try {
            $value = call_user_func($populateStage, $stageTable);
        } catch (\Throwable $error) {
            $this->recoverAfterFailure($liveTable, $error);
            throw $error;
        }

        try {
            $this->swapIntoLive($liveTable, $stageTable, $backupTable);
            $this->journal->updatePhase(
                $liveTable,
                TableSwapJournalEntry::PHASE_SWAPPED
            );
        } catch (\Throwable $error) {
            $this->recoverAfterFailure($liveTable, $error);
            throw $error;
        }

        try {
            $this->runHandoff($liveTable, $handoff);
        } catch (\Throwable $handoffError) {
            $this->recoverAfterFailure($liveTable, $handoffError);
            throw $handoffError;
        }

        $cleanupError = null;
        $backupRetained = false;
        try {
            $this->drop($backupTable);
            try {
                $this->journal->clear($liveTable);
            } catch (\Throwable $error) {
                $cleanupError = $error->getMessage();
            }
        } catch (\Throwable $error) {
            $backupRetained = true;
            $cleanupError = $error->getMessage();
        }

        return new TableSwapResult(
            $value,
            $stageTable,
            $backupTable,
            $backupRetained,
            $cleanupError
        );
    }

    private function runHandoff(string $liveTable, callable $handoff): void
    {
        $startDepth = $this->adapter->getTransactionDepth();
        if ($startDepth !== 0) {
            throw new \LogicException(
                'Snapshot handoff requires transaction depth zero.'
            );
        }

        $this->adapter->beginTransaction();
        try {
            call_user_func($handoff);
            $this->journal->updatePhase(
                $liveTable,
                TableSwapJournalEntry::PHASE_COMMITTED
            );
            if ($this->adapter->getTransactionDepth() !== 1) {
                throw new \LogicException(
                    'Snapshot handoff changed transaction depth.'
                );
            }
            $this->adapter->commit();
        } catch (\Throwable $error) {
            try {
                while ($this->adapter->getTransactionDepth() > $startDepth) {
                    $this->adapter->rollback();
                }
            } catch (\Throwable $rollbackError) {
                throw new \RuntimeException(
                    'Snapshot handoff rollback failed: '
                    . $rollbackError->getMessage(),
                    0,
                    $error
                );
            }
            throw $error;
        }
    }

    public function recover(string $liveTable): TableSwapRecoveryResult
    {
        $liveTable = $this->logicalName($liveTable);
        return $this->withTableLock(
            $liveTable,
            function () use ($liveTable): TableSwapRecoveryResult {
                return $this->recoverLocked($liveTable);
            }
        );
    }

    private function recoverLocked(
        string $liveTable
    ): TableSwapRecoveryResult {
        if ($this->adapter->getTransactionDepth() !== 0) {
            throw new \LogicException(
                'Table-swap recovery requires transaction depth zero.'
            );
        }
        $entry = $this->journal->load($liveTable);
        if ($entry === null) {
            return new TableSwapRecoveryResult(TableSwapRecoveryResult::NONE);
        }

        $liveExists = $this->tableExists($entry->liveTable());
        $stageExists = $this->tableExists($entry->stageTable());
        $backupExists = $this->tableExists($entry->backupTable());
        if (!$liveExists) {
            throw new \RuntimeException(
                'Snapshot recovery is ambiguous because the live table is missing.'
            );
        }

        if ($entry->phase() === TableSwapJournalEntry::PHASE_COMMITTED) {
            if ($stageExists) {
                throw new \RuntimeException(
                    'Committed snapshot recovery found an unexpected staging table.'
                );
            }
            if ($backupExists) {
                $this->drop($entry->backupTable());
                $this->journal->clear($liveTable);
                return new TableSwapRecoveryResult(
                    TableSwapRecoveryResult::CLEANED_COMMITTED_BACKUP
                );
            }
            $this->journal->clear($liveTable);
            return new TableSwapRecoveryResult(
                TableSwapRecoveryResult::CLEARED_STALE_JOURNAL
            );
        }

        if ($backupExists) {
            if ($stageExists) {
                throw new \RuntimeException(
                    'Uncommitted snapshot recovery found live, stage and backup together.'
                );
            }
            $this->restorePreviousLive(
                $entry->liveTable(),
                $entry->stageTable(),
                $entry->backupTable()
            );
            $this->drop($entry->stageTable());
            $this->journal->clear($liveTable);
            return new TableSwapRecoveryResult(
                TableSwapRecoveryResult::RESTORED_PREVIOUS_LIVE
            );
        }

        if ($stageExists) {
            $this->drop($entry->stageTable());
            $this->journal->clear($liveTable);
            return new TableSwapRecoveryResult(
                TableSwapRecoveryResult::CLEARED_STAGE
            );
        }

        $this->journal->clear($liveTable);
        return new TableSwapRecoveryResult(
            TableSwapRecoveryResult::CLEARED_STALE_JOURNAL
        );
    }

    private function recoverAfterFailure(
        string $liveTable,
        \Throwable $original
    ): void {
        try {
            $this->recoverLocked($liveTable);
        } catch (\Throwable $recoveryError) {
            throw new \RuntimeException(
                'Snapshot operation failed and durable recovery failed: '
                . $recoveryError->getMessage(),
                0,
                $original
            );
        }
    }

    /** @return mixed */
    private function withTableLock(string $liveTable, callable $callback)
    {
        if ($this->adapter->getTransactionDepth() !== 0) {
            throw new \LogicException(
                'Table-swap lock requires transaction depth zero.'
            );
        }
        $lock = 'mapsvg_swap_' . substr(
            hash('sha256', $this->adapter->getPrefix() . $liveTable),
            0,
            40
        );
        $acquired = (int) $this->adapter->getVar(
            $this->adapter->prepare('SELECT GET_LOCK(%s, 0)', $lock)
        );
        if ($acquired !== 1) {
            throw new \RuntimeException(
                'Another snapshot swap is active for this table.'
            );
        }

        $result = null;
        $operationError = null;
        try {
            $result = call_user_func($callback);
        } catch (\Throwable $error) {
            $operationError = $error;
        }

        $releaseError = null;
        try {
            $released = (int) $this->adapter->getVar(
                $this->adapter->prepare('SELECT RELEASE_LOCK(%s)', $lock)
            );
            if ($released !== 1) {
                throw new \RuntimeException(
                    'Could not release snapshot swap advisory lock.'
                );
            }
        } catch (\Throwable $error) {
            $releaseError = $error;
        }

        if ($operationError !== null) {
            throw $operationError;
        }
        if ($releaseError !== null) {
            throw $releaseError;
        }
        return $result;
    }

    private function tableExists(string $logicalTable): bool
    {
        $physical = $this->adapter->getPrefix()
            . $this->logicalName($logicalTable);
        $sql = 'SELECT COUNT(*) FROM information_schema.tables'
            . ' WHERE table_schema = DATABASE() AND table_name = %s';
        return (int) $this->adapter->getVar(
            $this->adapter->prepare($sql, $physical)
        ) === 1;
    }

    private function createLike(string $stage, string $live): void
    {
        $this->adapter->execute(
            'CREATE TABLE ' . $this->quote($stage)
            . ' LIKE ' . $this->quote($live)
        );
    }

    private function swapIntoLive(
        string $live,
        string $stage,
        string $backup
    ): void {
        $this->adapter->execute(
            'RENAME TABLE '
            . $this->quote($live) . ' TO ' . $this->quote($backup)
            . ', ' . $this->quote($stage) . ' TO ' . $this->quote($live)
        );
    }

    private function restorePreviousLive(
        string $live,
        string $failedStage,
        string $backup
    ): void {
        $this->adapter->execute(
            'RENAME TABLE '
            . $this->quote($live) . ' TO ' . $this->quote($failedStage)
            . ', ' . $this->quote($backup) . ' TO ' . $this->quote($live)
        );
    }

    private function drop(string $logicalTable): void
    {
        $this->adapter->execute(
            'DROP TABLE IF EXISTS ' . $this->quote($logicalTable)
        );
    }

    private function quote(string $logicalTable): string
    {
        $physical = $this->adapter->getPrefix()
            . $this->logicalName($logicalTable);
        if (!preg_match('/^[A-Za-z0-9_]+$/D', $physical)) {
            throw new \InvalidArgumentException(
                'Physical MapSVG table name is unsafe.'
            );
        }
        return '`' . $physical . '`';
    }

    private function logicalName(string $name): string
    {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $name)) {
            throw new \InvalidArgumentException(
                'MapSVG table name must be a safe logical identifier.'
            );
        }
        return $name;
    }

    private function suffix(): string
    {
        $suffix = (string) call_user_func($this->suffixFactory);
        if (!preg_match('/^[A-Za-z0-9_]+$/D', $suffix)) {
            throw new \UnexpectedValueException(
                'Table swap suffix must be a safe identifier fragment.'
            );
        }
        return $suffix;
    }

    private function temporaryName(
        string $live,
        string $kind,
        string $suffix
    ): string {
        $maxLogical = 64 - strlen($this->adapter->getPrefix());
        $tail = $kind . $suffix;
        $headLength = $maxLogical - strlen($tail);
        if ($headLength < 1) {
            throw new \LengthException(
                'Database prefix leaves no room for snapshot table names.'
            );
        }

        return $this->logicalName(
            substr($live, 0, $headLength) . $tail
        );
    }
}
