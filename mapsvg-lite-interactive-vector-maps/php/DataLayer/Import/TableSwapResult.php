<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Import;

/** Result of a completed live/stage table handoff. */
final class TableSwapResult
{
    /** @var mixed */
    private $value;
    private string $stageTable;
    private string $backupTable;
    private bool $backupRetained;
    private ?string $cleanupError;

    /** @param mixed $value */
    public function __construct(
        $value,
        string $stageTable,
        string $backupTable,
        bool $backupRetained = false,
        ?string $cleanupError = null
    ) {
        $this->value = $value;
        $this->stageTable = $stageTable;
        $this->backupTable = $backupTable;
        $this->backupRetained = $backupRetained;
        $this->cleanupError = $cleanupError;
    }

    /** @return mixed */
    public function value()
    {
        return $this->value;
    }

    public function stageTable(): string
    {
        return $this->stageTable;
    }

    public function backupTable(): string
    {
        return $this->backupTable;
    }

    public function backupRetained(): bool
    {
        return $this->backupRetained;
    }

    public function cleanupError(): ?string
    {
        return $this->cleanupError;
    }
}
