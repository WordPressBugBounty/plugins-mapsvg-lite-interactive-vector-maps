<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Import;

/** Immutable result of one importer-sized storage flush. */
final class BulkWriteResult
{
    public const MODE_INSERT = 'insert';
    public const MODE_UPSERT = 'upsert';

    private string $mode;
    private int $processedRows;
    private int $storageBatches;

    public function __construct(
        string $mode,
        int $processedRows,
        int $storageBatches
    ) {
        if (!in_array($mode, array(
            self::MODE_INSERT,
            self::MODE_UPSERT,
        ), true)) {
            throw new \InvalidArgumentException('Unknown bulk write mode.');
        }
        if ($processedRows < 0 || $storageBatches < 0) {
            throw new \InvalidArgumentException(
                'Bulk write counts must not be negative.'
            );
        }

        if ($processedRows === 0 && $storageBatches !== 0) {
            throw new \InvalidArgumentException(
                'Empty bulk writes cannot report storage batches.'
            );
        }
        if ($processedRows > 0 && $storageBatches === 0) {
            throw new \InvalidArgumentException(
                'Non-empty bulk writes require storage batches.'
            );
        }

        $this->mode = $mode;
        $this->processedRows = $processedRows;
        $this->storageBatches = $storageBatches;
    }

    public function mode(): string
    {
        return $this->mode;
    }

    public function processedRows(): int
    {
        return $this->processedRows;
    }

    public function storageBatches(): int
    {
        return $this->storageBatches;
    }
}
