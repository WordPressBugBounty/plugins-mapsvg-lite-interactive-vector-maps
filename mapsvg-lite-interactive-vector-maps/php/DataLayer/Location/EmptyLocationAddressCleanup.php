<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Location;

use MapSVG\Database;

/**
 * Clears legacy v8 placeholder address JSON that has no formatted text.
 *
 * SVG-only markers were stored as `{"state":"","state_short":"","zip":"","county":""}`.
 * Saving those rows through LocationNormalizer used to 500; this upgrade rewrite
 * matches the customer-safe NULL/empty workaround without touching real addresses.
 */
final class EmptyLocationAddressCleanup
{
    private const BATCH_SIZE = 200;

    /**
     * @return int Number of location_address values cleared.
     */
    public static function cleanupAll(): int
    {
        $db = Database::get();
        $schemaTable = $db->mapsvg_prefix . 'schema';
        if (!$db->get_var($db->prepare(
            'SHOW TABLES LIKE %s',
            $db->esc_like($schemaTable)
        ))) {
            return 0;
        }

        $columnRows = $db->get_results("SHOW COLUMNS FROM `{$schemaTable}`");
        if (!is_array($columnRows)) {
            return 0;
        }
        $columns = array_column($columnRows, 'Field');
        if (!in_array('name', $columns, true)) {
            return 0;
        }

        $schemas = $db->get_results(
            "SELECT `name` FROM `{$schemaTable}` WHERE `name` IS NOT NULL AND `name` != ''",
            ARRAY_A
        );
        if (!is_array($schemas) || $schemas === array()) {
            return 0;
        }

        $cleared = 0;
        foreach ($schemas as $schema) {
            if (!is_array($schema) || !isset($schema['name']) || !is_string($schema['name'])) {
                continue;
            }
            $cleared += self::cleanupTableByName($db, $schema['name']);
        }

        return $cleared;
    }

    /**
     * @param mixed $db
     */
    public static function cleanupTableByName($db, string $schemaName): int
    {
        if (!($db instanceof Database)
            || !self::isIdentifier($schemaName)
            || !self::isIdentifier((string) $db->mapsvg_prefix . $schemaName)) {
            return 0;
        }

        $table = $db->mapsvg_prefix . $schemaName;
        if (!$db->get_var($db->prepare(
            'SHOW TABLES LIKE %s',
            $db->esc_like($table)
        ))) {
            return 0;
        }

        $columnRows = $db->get_results("SHOW COLUMNS FROM `{$table}`");
        if (!is_array($columnRows)) {
            return 0;
        }
        $columns = array_column($columnRows, 'Field');
        if (!in_array('location_address', $columns, true)
            || !in_array('id', $columns, true)) {
            return 0;
        }

        $cleared = 0;
        $lastId = 0;
        while (true) {
            $rows = $db->get_results($db->prepare(
                "SELECT `id`, `location_address` FROM `{$table}`"
                . " WHERE `id` > %d"
                . " AND `location_address` IS NOT NULL"
                . " AND `location_address` != ''"
                . " ORDER BY `id` ASC LIMIT %d",
                $lastId,
                self::BATCH_SIZE
            ));
            if (!is_array($rows) || $rows === array()) {
                break;
            }

            foreach ($rows as $row) {
                $id = is_object($row) ? ($row->id ?? null) : ($row['id'] ?? null);
                $address = is_object($row)
                    ? ($row->location_address ?? null)
                    : ($row['location_address'] ?? null);
                if (!is_numeric($id) || (int) $id < 1) {
                    continue;
                }
                if (!LocationNormalizer::isBlankStoredAddress($address)) {
                    continue;
                }
                $updated = $db->update(
                    $table,
                    array('location_address' => ''),
                    array('id' => (int) $id)
                );
                if ($updated === false) {
                    throw new \RuntimeException(
                        'Could not clear an empty location address.'
                    );
                }
                $cleared++;
            }

            $lastRow = end($rows);
            $nextId = is_object($lastRow)
                ? ($lastRow->id ?? null)
                : (is_array($lastRow) ? ($lastRow['id'] ?? null) : null);
            if (!is_numeric($nextId) || (int) $nextId <= $lastId) {
                break;
            }
            $lastId = (int) $nextId;
            if (count($rows) < self::BATCH_SIZE) {
                break;
            }
        }

        return $cleared;
    }

    private static function isIdentifier(string $name): bool
    {
        return $name !== ''
            && strlen($name) <= 64
            && (bool) preg_match('/\A[A-Za-z0-9_]+\z/D', $name);
    }
}
