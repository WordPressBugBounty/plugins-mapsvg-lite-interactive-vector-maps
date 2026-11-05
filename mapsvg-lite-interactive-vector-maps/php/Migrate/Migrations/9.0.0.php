<?php

namespace MapSVG;

return function () {

    $db = Database::get();

    AppDraftStorageInstaller::install($db);
    SvgAssetStorageInstaller::install($db);
    (new SvgAssetRegistry($db))->backfillUploads();

    $schemaTableName = $db->mapsvg_prefix . 'schema';
    if (!\MapSVG\DataLayer\SavedQuery\SavedQueryStorageInstaller::exists($db, $schemaTableName)) {
        return;
    }

    \MapSVG\DataLayer\SavedQuery\SavedQueryStorageInstaller::install($db);

    $swapJournalTable = $db->mapsvg_prefix . 'swap_journal';
    if (!$db->get_var("SHOW TABLES LIKE '{$swapJournalTable}'")) {
        $charset = $db->db->get_charset_collate();
        $db->query(
            "CREATE TABLE `{$swapJournalTable}` (
                `live_table` VARCHAR(64) NOT NULL,
                `stage_table` VARCHAR(64) NOT NULL,
                `backup_table` VARCHAR(64) NOT NULL,
                `phase` VARCHAR(20) NOT NULL,
                `updated_at` BIGINT UNSIGNED NOT NULL,
                PRIMARY KEY (`live_table`)
            ) ENGINE=InnoDB {$charset}"
        );
    }

    $columnsToAdd = [
        'regionSupport' => 'TINYINT(1) NOT NULL DEFAULT 0',
        'markerSupport' => 'TINYINT(1) NOT NULL DEFAULT 1',
        'bindings' => 'LONGTEXT NULL',
        'zodSettings' => 'LONGTEXT NULL',
    ];

    $existingColumns = array_column(
        $db->get_results("SHOW COLUMNS FROM `{$schemaTableName}`"),
        'Field'
    );

    // Schema-derived REST metadata must also be available without any linked maps.
    $settingsTable = $db->mapsvg_prefix . 'settings';
    if (in_array('postType', $existingColumns, true)
        && $db->get_var($db->prepare('SHOW TABLES LIKE %s', $db->esc_like($settingsTable)))) {
        MappablePostTypes::syncOption();
        // Remove legacy bridge rows only after schema and settings tables exist.
        PostDataOrphanCleanup::cleanupAll();
    }

    $parts = [];
    foreach ($columnsToAdd as $column => $type) {
        if (!in_array($column, $existingColumns, true)) {
            $parts[] = "ADD COLUMN `{$column}` {$type}";
        }
    }

    // stockSync was briefly added then removed — stock mapping is map-options front-only.
    if (in_array('stockSync', $existingColumns, true)) {
        $parts[] = 'DROP COLUMN `stockSync`';
    }

    if (!empty($parts)) {
        $db->query("ALTER TABLE `{$schemaTableName}` " . implode(', ', $parts));
    }

    // Backfill bindings.svg onto existing region schemas (source of truth for SVG sync).
    $existingColumnsAfter = array_column(
        $db->get_results("SHOW COLUMNS FROM `{$schemaTableName}`"),
        'Field'
    );
    if (in_array('bindings', $existingColumnsAfter, true)) {
        $defaultBindings = wp_json_encode(Schema::defaultSvgBindings());
        if ($defaultBindings !== false) {
            $db->query(
                $db->prepare(
                    "UPDATE `{$schemaTableName}`
                     SET `bindings` = %s
                     WHERE `type` = 'region'
                       AND (`bindings` IS NULL OR `bindings` = '' OR `bindings` = 'null')",
                    $defaultBindings
                )
            );
        }
    }

    $dataToMapsTable = $db->mapsvg_prefix . 'data_to_maps';
    if (!$db->get_var("SHOW TABLES LIKE '{$dataToMapsTable}'")) {
        $charset = $db->db->get_charset_collate();
        $db->query(
            "CREATE TABLE `{$dataToMapsTable}` (
                `schemaId` INT(11) NOT NULL,
                `mapId` INT(11) NOT NULL,
                `query` LONGTEXT NULL,
                PRIMARY KEY (`schemaId`, `mapId`),
                KEY `mapId` (`mapId`)
            ) {$charset}"
        );
    }

    // Backfill: existing maps with a connected post-type objects schema.
    $mapsTable = $db->mapsvg_prefix . 'maps';
    if (
        !$db->get_var("SHOW TABLES LIKE '{$mapsTable}'")
        || !$db->get_var("SHOW TABLES LIKE '{$dataToMapsTable}'")
    ) {
        return;
    }

    $maps = $db->get_results("SELECT `id`, `options` FROM `{$mapsTable}`");
    if (empty($maps)) {
        return;
    }

    foreach ($maps as $map) {
        $mapId = (int) $map->id;
        if ($mapId <= 0 || empty($map->options)) {
            continue;
        }

        $options = json_decode($map->options, true);
        if (!is_array($options)) {
            continue;
        }

        $objectsTableName = $options['database']['objectsTableName'] ?? null;
        if (empty($objectsTableName) || !is_string($objectsTableName)) {
            continue;
        }

        $schema = $db->get_row(
            $db->prepare(
                "SELECT `id`, `type` FROM `{$schemaTableName}` WHERE `name` = %s LIMIT 1",
                $objectsTableName
            )
        );

        if (!$schema || ($schema->type ?? '') !== 'post') {
            continue;
        }

        $schemaId = (int) $schema->id;
        if ($schemaId <= 0) {
            continue;
        }

        $exists = $db->get_var(
            $db->prepare(
                "SELECT 1 FROM `{$dataToMapsTable}` WHERE `schemaId` = %d AND `mapId` = %d LIMIT 1",
                $schemaId,
                $mapId
            )
        );

        if ($exists) {
            continue;
        }

        $db->query(
            $db->prepare(
                "INSERT INTO `{$dataToMapsTable}` (`schemaId`, `mapId`, `query`) VALUES (%d, %d, NULL)",
                $schemaId,
                $mapId
            )
        );
    }

    // Classify before any authoring transform. Old Published options/schemas stay v8.
    $engineStore = new \MapSVG\AppDraftStore($db);
    $engineMaps = \MapSVG\DataLayer\SavedQuery\SavedQueryStorageInstaller::exists($db, $db->mapsvg_prefix . "maps")
        ? $db->get_results("SELECT id FROM `{$db->mapsvg_prefix}maps` ORDER BY id") : [];
    foreach ($engineMaps ?: [] as $engineMap) {
        try { $engineStore->migrateEngine((int) $engineMap->id); }
        catch (\Throwable $error) { Logger::error('[V9-DRAFT-MIGRATION] Map ' . (int) $engineMap->id . ': ' . $error->getMessage()); }
    }

    // Explicit v9 backfill, after schema/source support and preceding option transforms.
    (new \MapSVG\DataLayer\SavedQuery\PageBindingMigration($db))->run();

    // Collection-owned Region/Location picker defaults; published App snapshots stay intact.
    (new SchemaEditorDefaults($db))->backfill();

};
