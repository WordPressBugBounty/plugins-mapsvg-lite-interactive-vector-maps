<?php

namespace MapSVG;

return function () {

    $db = Database::get();

    $schemaTable = $db->mapsvg_prefix . 'schema';
    $settingsTable = $db->mapsvg_prefix . 'settings';

    if (!$db->get_var($db->prepare('SHOW TABLES LIKE %s', $db->esc_like($schemaTable)))) {
        return;
    }

    // Repair the internal flag lost by older region schema editor saves.
    $defaults = json_decode(file_get_contents(__DIR__ . '/../../Core/schema/region.json'), true);
    $orphanedField = null;
    foreach ($defaults['fields'] as $field) {
        if ($field['name'] === 'orphaned') $orphanedField = $field;
    }
    $schemaSql = SchemaSqlDefinition::identifier($schemaTable);
    $schemas = $db->get_results("SELECT id,name,fields FROM {$schemaSql} WHERE type='region'", ARRAY_A);
    foreach ($schemas as $row) {
        $fields = json_decode($row['fields'], true);
        if (!is_array($fields)) continue;
        $table = $db->mapsvg_prefix . $row['name'];
        try { $tableSql = SchemaSqlDefinition::identifier($table); }
        catch (\InvalidArgumentException $e) { continue; }
        if (!$db->get_var($db->prepare('SHOW TABLES LIKE %s', $db->esc_like($table)))) continue;
        $column = $db->get_var("SHOW COLUMNS FROM {$tableSql} LIKE 'orphaned'");
        if (!$column && $db->query("ALTER TABLE {$tableSql} ADD COLUMN `orphaned` tinyint(1) NOT NULL DEFAULT 0") === false) {
            throw new \RuntimeException('Could not restore the internal region column.');
        }
        $originalFields = $fields;
        $found = false;
        foreach ($fields as $index => $field) {
            if (($field['name'] ?? '') === 'orphaned') {
                $fields[$index] = $orphanedField;
                $found = true;
            }
        }
        if (!$found) $fields[] = $orphanedField;
        if ($fields !== $originalFields && $db->update($schemaTable, ['fields' => wp_json_encode($fields, JSON_UNESCAPED_UNICODE)], ['id' => (int) $row['id']]) === false) {
            throw new \RuntimeException('Could not restore internal region metadata.');
        }
    }

    if (!$db->get_var($db->prepare('SHOW TABLES LIKE %s', $db->esc_like($settingsTable)))) return;
    $columns = array_column($db->get_results("SHOW COLUMNS FROM `{$schemaTable}`"), 'Field');
    if (!in_array('postType', $columns, true)) {
        return;
    }

    MappablePostTypes::syncOption();

    // Permanently deleted WP posts left MapSVG rows with an empty Post link.
    PostDataOrphanCleanup::cleanupAll();
};
