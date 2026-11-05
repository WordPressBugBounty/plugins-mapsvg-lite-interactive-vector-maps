<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Import;

/** Outcome of deterministic recovery for one journaled snapshot swap. */
final class TableSwapRecoveryResult
{
    public const NONE = 'none';
    public const CLEARED_STAGE = 'cleared_stage';
    public const RESTORED_PREVIOUS_LIVE = 'restored_previous_live';
    public const CLEANED_COMMITTED_BACKUP = 'cleaned_committed_backup';
    public const CLEARED_STALE_JOURNAL = 'cleared_stale_journal';

    private string $action;

    public function __construct(string $action)
    {
        if (!in_array($action, self::actions(), true)) {
            throw new \InvalidArgumentException('Unknown table-swap recovery action.');
        }
        $this->action = $action;
    }

    /** @return string[] */
    public static function actions(): array
    {
        return array(
            self::NONE,
            self::CLEARED_STAGE,
            self::RESTORED_PREVIOUS_LIVE,
            self::CLEANED_COMMITTED_BACKUP,
            self::CLEARED_STALE_JOURNAL,
        );
    }

    public function action(): string
    {
        return $this->action;
    }
}
