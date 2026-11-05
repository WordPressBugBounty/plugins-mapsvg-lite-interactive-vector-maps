<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Import;

use Plasma\Model;
use Plasma\Plasma;

/**
 * Accepts one importer-sized physical batch and writes bounded Plasma batches.
 *
 * One MapSVG flush is atomic: if any Plasma sub-batch fails, all prior
 * sub-batches from that flush are rolled back.
 */
final class PlasmaBulkWriter implements BulkWriter
{
    public const MAX_INPUT_ROWS = 5000;
    public const STORAGE_BATCH_ROWS = 1000;

    private Plasma $client;
    private Model $model;
    /** @var string[] */
    private array $conflictFields;

    /** @param string[] $conflictFields */
    public function __construct(
        Plasma $client,
        Model $model,
        array $conflictFields
    ) {
        if ($conflictFields === array()) {
            throw new \InvalidArgumentException(
                'Bulk upsert requires at least one conflict field.'
            );
        }

        foreach ($conflictFields as $field) {
            if (!is_string($field)
                || !preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $field)) {
                throw new \InvalidArgumentException(
                    'Bulk conflict fields must be safe identifiers.'
                );
            }
        }

        $this->client = $client;
        $this->model = $model;
        $this->conflictFields = array_values(array_unique($conflictFields));
    }

    public function insertMany(array $rows): BulkWriteResult
    {
        return $this->write(
            $rows,
            BulkWriteResult::MODE_INSERT
        );
    }

    public function upsertMany(array $rows): BulkWriteResult
    {
        return $this->write(
            $rows,
            BulkWriteResult::MODE_UPSERT
        );
    }

    /** @param array<int,array<string,mixed>> $rows */
    private function write(array $rows, string $mode): BulkWriteResult
    {
        $rows = $this->normalizeRows($rows, $mode);
        if ($rows === array()) {
            return new BulkWriteResult($mode, 0, 0);
        }

        $storageBatches = 0;
        $processedRows = 0;

        $this->client->transaction(function () use (
            $rows,
            $mode,
            &$storageBatches,
            &$processedRows
        ): void {
            foreach (array_chunk(
                $rows,
                self::STORAGE_BATCH_ROWS
            ) as $chunk) {
                $count = $mode === BulkWriteResult::MODE_UPSERT
                    ? $this->model->upsertMany(array(
                        'data' => $chunk,
                        'conflictFields' => $this->conflictFields,
                    ))
                    : $this->model->createMany(array('data' => $chunk));

                if ($count !== count($chunk)) {
                    throw new \RuntimeException(
                        'Plasma bulk write processed an unexpected row count.'
                    );
                }
                $processedRows += $count;
                $storageBatches++;
            }
        });

        return new BulkWriteResult(
            $mode,
            $processedRows,
            $storageBatches
        );
    }

    /**
     * Validate the entire importer flush before opening the transaction.
     *
     * @param array<int,mixed> $rows
     * @return array<int,array<string,mixed>>
     */
    private function normalizeRows(array $rows, string $mode): array
    {
        if (!$this->isList($rows)) {
            throw new \InvalidArgumentException(
                'Bulk data must be a list of row arrays.'
            );
        }

        if (count($rows) > self::MAX_INPUT_ROWS) {
            throw new \LengthException(
                'MapSVG bulk flush exceeds the importer batch limit.'
            );
        }
        if ($rows === array()) {
            return array();
        }
        if (!is_array($rows[0]) || $rows[0] === array()) {
            throw new \InvalidArgumentException(
                'Every bulk row must be a non-empty array.'
            );
        }

        $columns = array_keys($rows[0]);
        $expected = $columns;
        sort($expected);

        $knownFields = $this->model->getFieldTypes();
        foreach ($columns as $column) {
            if (!is_string($column)
                || !preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $column)) {
                throw new \InvalidArgumentException(
                    'Bulk columns must be safe identifiers.'
                );
            }
            if ($knownFields !== array()
                && !array_key_exists($column, $knownFields)) {
                throw new \InvalidArgumentException(
                    'Unknown field for schema-backed bulk write: ' . $column
                );
            }
        }

        if ($mode === BulkWriteResult::MODE_UPSERT) {
            foreach ($this->conflictFields as $field) {
                if (!in_array($field, $columns, true)) {
                    throw new \InvalidArgumentException(
                        'Every upsert row must contain conflict field: '
                        . $field
                    );
                }
            }
        }

        $normalized = array();
        foreach ($rows as $row) {
            if (!is_array($row) || $row === array()) {
                throw new \InvalidArgumentException(
                    'Every bulk row must be a non-empty array.'
                );
            }
            $actual = array_keys($row);
            sort($actual);
            if ($actual !== $expected) {
                throw new \InvalidArgumentException(
                    'Every bulk row must contain the same columns.'
                );
            }

            $ordered = array();
            foreach ($columns as $column) {
                $ordered[$column] = $row[$column];
            }
            $normalized[] = $ordered;
        }

        return $normalized;
    }

    private function isList(array $value): bool
    {
        return $value === array()
            || array_keys($value) === range(0, count($value) - 1);
    }
}
