<?php

namespace MapSVG;

/**
 * Restore the internal region "orphaned" field.
 *
 * A missing file, invalid JSON, or a failed query skips this step. Those are
 * not TypeErrors, and they do not abort the rest of the migration.
 *
 * @param object $db          Database proxy.
 * @param string $schemaTable Prefixed schema table name.
 * @param mixed  $defaults    Decoded region.json.
 * @return void
 */
function migration8162RestoreRegionOrphanedFields($db, $schemaTable, $defaults)
{
    if (!is_array($defaults) || !isset($defaults['fields']) || !is_array($defaults['fields'])) {
        return;
    }

    $orphanedField = null;
    foreach ($defaults['fields'] as $field) {
        if (is_array($field) && isset($field['name']) && $field['name'] === 'orphaned') {
            $orphanedField = $field;
        }
    }
    if (!is_array($orphanedField)) {
        return;
    }

    try {
        $schemaSql = SchemaSqlDefinition::identifier($schemaTable);
    } catch (\InvalidArgumentException $e) {
        return;
    }

    $schemas = $db->get_results("SELECT id,name,fields FROM {$schemaSql} WHERE type='region'", ARRAY_A);
    if (!is_array($schemas)) {
        return;
    }

    foreach ($schemas as $row) {
        if (!is_array($row) || empty($row['name']) || !is_string($row['name'])) {
            continue;
        }
        $fields = isset($row['fields']) ? json_decode($row['fields'], true) : null;
        if (!is_array($fields)) {
            continue;
        }
        $table = $db->mapsvg_prefix . $row['name'];
        try {
            $tableSql = SchemaSqlDefinition::identifier($table);
        } catch (\InvalidArgumentException $e) {
            continue;
        }
        if (!$db->get_var($db->prepare('SHOW TABLES LIKE %s', $db->esc_like($table)))) {
            continue;
        }
        $column = $db->get_var("SHOW COLUMNS FROM {$tableSql} LIKE 'orphaned'");
        if (!$column && $db->query("ALTER TABLE {$tableSql} ADD COLUMN `orphaned` tinyint(1) NOT NULL DEFAULT 0") === false) {
            throw new \RuntimeException('Could not restore the internal region column.');
        }
        $originalFields = $fields;
        $found = false;
        foreach ($fields as $index => $field) {
            if (is_array($field) && (($field['name'] ?? '') === 'orphaned')) {
                $fields[$index] = $orphanedField;
                $found = true;
            }
        }
        if (!$found) {
            $fields[] = $orphanedField;
        }
        if ($fields !== $originalFields && $db->update($schemaTable, array('fields' => wp_json_encode($fields, JSON_UNESCAPED_UNICODE)), array('id' => (int) $row['id'])) === false) {
            throw new \RuntimeException('Could not restore internal region metadata.');
        }
    }
}

return function () {

    $db = Database::get();

    $schemaTable = $db->mapsvg_prefix . 'schema';
    $settingsTable = $db->mapsvg_prefix . 'settings';

    if (!$db->get_var($db->prepare('SHOW TABLES LIKE %s', $db->esc_like($schemaTable)))) {
        return;
    }

    $raw = file_get_contents(__DIR__ . '/../../Core/schema/region.json');
    $defaults = is_string($raw) ? json_decode($raw, true) : null;
    migration8162RestoreRegionOrphanedFields($db, $schemaTable, $defaults);

    if (!$db->get_var($db->prepare('SHOW TABLES LIKE %s', $db->esc_like($settingsTable)))) {
        return;
    }
    $columnRows = $db->get_results("SHOW COLUMNS FROM `{$schemaTable}`");
    if (!is_array($columnRows)) {
        return;
    }
    $columns = array_column($columnRows, 'Field');
    if (!in_array('postType', $columns, true)) {
        return;
    }

    MappablePostTypes::syncOption();

    // Permanently deleted WP posts left MapSVG rows with an empty Post link.
    PostDataOrphanCleanup::cleanupAll();
};
