<?php

namespace MapSVG;

return function () {

    $db = Database::get();

    // Keep this published migration independent of the legacy schema writer.
    $identifier = static function ($name): string {
        if (!is_string($name) || strlen($name) < 1 || strlen($name) > 64
            || !preg_match('/\A[A-Za-z0-9_]+\z/D', $name)) {
            throw new \InvalidArgumentException('Invalid migration table identifier.');
        }
        return '`' . $name . '`';
    };

    $schemaTable = $db->mapsvg_prefix . 'schema';
    $settingsTable = $db->mapsvg_prefix . 'settings';

    if (!$db->get_var($db->prepare('SHOW TABLES LIKE %s', $db->esc_like($schemaTable)))) {
        return;
    }

    // Invalid legacy metadata skips only this repair, not post-type backfills.
    // Keep the helper local: migrations can be required again on a retry.
    $restoreOrphaned = static function () use ($db, $schemaTable, $identifier): void {
        $defaultsFile = __DIR__ . '/../../Core/schema/region.json';
        $raw = is_readable($defaultsFile) ? file_get_contents($defaultsFile) : false;
        $defaults = is_string($raw) ? json_decode($raw, true) : null;
        if (!is_array($defaults) || !isset($defaults['fields']) || !is_array($defaults['fields'])) {
            return;
        }
        $orphanedField = null;
        foreach ($defaults['fields'] as $field) {
            if (is_array($field) && ($field['name'] ?? '') === 'orphaned') $orphanedField = $field;
        }
        if ($orphanedField === null) {
            return;
        }
        $schemaSql = $identifier($schemaTable);
        $schemas = $db->get_results("SELECT id,name,fields FROM {$schemaSql} WHERE type='region'", ARRAY_A);
        if (!is_array($schemas)) return;
        foreach ($schemas as $row) {
            if (!is_array($row) || !isset($row['id'], $row['name'], $row['fields'])
                || !is_numeric($row['id']) || (int) $row['id'] < 1
                || !is_string($row['name']) || $row['name'] === '' || !is_string($row['fields'])) continue;
            $fields = json_decode($row['fields'], true);
            if (!is_array($fields)) continue;
            $table = $db->mapsvg_prefix . $row['name'];
            try { $tableSql = $identifier($table); }
            catch (\InvalidArgumentException $e) { continue; }
            if (!$db->get_var($db->prepare('SHOW TABLES LIKE %s', $db->esc_like($table)))) continue;
            $column = $db->get_var("SHOW COLUMNS FROM {$tableSql} LIKE 'orphaned'");
            if (!$column && $db->query("ALTER TABLE {$tableSql} ADD COLUMN `orphaned` tinyint(1) NOT NULL DEFAULT 0") === false) {
                throw new \RuntimeException('Could not restore the internal region column.');
            }
            $originalFields = $fields;
            $found = false;
            foreach ($fields as $index => $field) {
                if (is_array($field) && ($field['name'] ?? '') === 'orphaned') {
                    $fields[$index] = $orphanedField;
                    $found = true;
                }
            }
            if (!$found) $fields[] = $orphanedField;
            if ($fields !== $originalFields && $db->update($schemaTable, ['fields' => wp_json_encode($fields, JSON_UNESCAPED_UNICODE)], ['id' => (int) $row['id']]) === false) {
                throw new \RuntimeException('Could not restore internal region metadata.');
            }
        }
    };
    $restoreOrphaned();

    if (!$db->get_var($db->prepare('SHOW TABLES LIKE %s', $db->esc_like($settingsTable)))) return;
    $columnRows = $db->get_results("SHOW COLUMNS FROM `{$schemaTable}`");
    if (!is_array($columnRows)) return;
    $columns = array_column($columnRows, 'Field');
    if (!in_array('postType', $columns, true)) {
        return;
    }

    MappablePostTypes::syncOption();

    // Permanently deleted WP posts left MapSVG rows with an empty Post link.
    PostDataOrphanCleanup::cleanupAll();
};
