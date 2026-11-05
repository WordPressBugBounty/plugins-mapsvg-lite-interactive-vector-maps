<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Import;

/** Durable state for one in-flight or cleanup-pending snapshot swap. */
final class TableSwapJournalEntry
{
    public const PHASE_STAGING = 'staging';
    public const PHASE_SWAPPED = 'swapped';
    public const PHASE_COMMITTED = 'committed';

    private string $liveTable;
    private string $stageTable;
    private string $backupTable;
    private string $phase;

    public function __construct(
        string $liveTable,
        string $stageTable,
        string $backupTable,
        string $phase
    ) {
        if (!in_array($phase, self::phases(), true)) {
            throw new \InvalidArgumentException('Unknown table-swap journal phase.');
        }
        foreach (array($liveTable, $stageTable, $backupTable) as $name) {
            if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $name)) {
                throw new \InvalidArgumentException(
                    'Table-swap journal contains an unsafe table name.'
                );
            }
        }
        $this->liveTable = $liveTable;
        $this->stageTable = $stageTable;
        $this->backupTable = $backupTable;
        $this->phase = $phase;
    }

    /** @return string[] */
    public static function phases(): array
    {
        return array(
            self::PHASE_STAGING,
            self::PHASE_SWAPPED,
            self::PHASE_COMMITTED,
        );
    }

    public function liveTable(): string { return $this->liveTable; }
    public function stageTable(): string { return $this->stageTable; }
    public function backupTable(): string { return $this->backupTable; }
    public function phase(): string { return $this->phase; }
}
