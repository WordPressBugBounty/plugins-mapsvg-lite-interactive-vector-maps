<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

final class TableDiffPolicy
{
    private bool $modifyColumns;
    private bool $dropOwnedColumns;
    private bool $replaceOwnedIndexes;

    private function __construct(
        bool $modifyColumns,
        bool $dropOwnedColumns,
        bool $replaceOwnedIndexes
    ) {
        $this->modifyColumns = $modifyColumns;
        $this->dropOwnedColumns = $dropOwnedColumns;
        $this->replaceOwnedIndexes = $replaceOwnedIndexes;
    }

    public static function nonDestructive(): self
    {
        return new self(false, false, false);
    }

    public static function explicitEdit(): self
    {
        return new self(true, true, true);
    }

    public function canModifyColumns(): bool { return $this->modifyColumns; }
    public function canDropOwnedColumns(): bool { return $this->dropOwnedColumns; }
    public function canReplaceOwnedIndexes(): bool
    {
        return $this->replaceOwnedIndexes;
    }
}
