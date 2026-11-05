<?php

namespace MapSVG;

/** Structural owner; invoked by the pending migration, never by autosave. */
final class AppDraftStorageInstaller
{
    public static function install($db): void
    {
        $prefix = $db->mapsvg_prefix;
        if (!preg_match('/\A[A-Za-z0-9_]+\z/D', $prefix)) {
            throw new \InvalidArgumentException('Invalid MapSVG table prefix.');
        }
        $charset = $db->db->get_charset_collate();
        $definitions = [
            'map_live_versions' => "
                map_id BIGINT UNSIGNED NOT NULL,
                version_id BIGINT UNSIGNED NOT NULL,
                author_id BIGINT UNSIGNED NOT NULL,
                updated_at DATETIME NOT NULL,
                PRIMARY KEY (map_id)",
            'map_drafts' => "
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                map_id BIGINT UNSIGNED NOT NULL,
                title VARCHAR(255) NOT NULL,
                snapshot LONGTEXT NOT NULL,
                revision BIGINT UNSIGNED NOT NULL DEFAULT 1,
                source_version_id BIGINT UNSIGNED NULL,
                author_id BIGINT UNSIGNED NOT NULL,
                created_at DATETIME NOT NULL,
                updated_at DATETIME NOT NULL,
                legacy_key VARCHAR(191) NULL,
                migration TINYINT UNSIGNED NOT NULL DEFAULT 0,
                deleted_at DATETIME NULL,
                PRIMARY KEY (id), KEY map_id (map_id),
                UNIQUE KEY legacy_key (legacy_key)",
            'map_versions' => "
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                map_id BIGINT UNSIGNED NOT NULL,
                draft_id BIGINT UNSIGNED NULL,
                title VARCHAR(255) NOT NULL,
                snapshot LONGTEXT NOT NULL,
                source_version_id BIGINT UNSIGNED NULL,
                author_id BIGINT UNSIGNED NOT NULL,
                created_at DATETIME NOT NULL,
                kind VARCHAR(32) NOT NULL,
                engine TINYINT UNSIGNED NOT NULL DEFAULT 9,
                published_at DATETIME NULL,
                request_id VARCHAR(64) NULL,
                PRIMARY KEY (id), KEY history (map_id, id),
                UNIQUE KEY publication_request (map_id, request_id)"
        ];
        foreach ($definitions as $name => $definition) {
            $table = $prefix . $name;
            if (!$db->get_var($db->prepare('SHOW TABLES LIKE %s', $db->esc_like($table)))) {
                if ($db->query("CREATE TABLE `{$table}` ({$definition}) ENGINE=InnoDB {$charset}") === false) {
                    throw new \RuntimeException('Cannot install App draft storage.');
                }
            }
        }
        // Upgrade already-installed React preview storage without rewriting snapshots.
        foreach (['map_drafts' => 'deleted_at'] as $name => $column) {
            $table = $prefix . $name;
            if (!$db->get_var($db->prepare("SHOW COLUMNS FROM `{$table}` LIKE %s", $column))) {
                if ($db->query("ALTER TABLE `{$table}` ADD `{$column}` DATETIME NULL") === false) {
                    throw new \RuntimeException('Cannot upgrade App lifecycle storage.');
                }
            }
        }
        $versions = $prefix . 'map_versions';
        if (!$db->get_var($db->prepare("SHOW COLUMNS FROM `{$versions}` LIKE %s", 'engine'))) {
            if ($db->query("ALTER TABLE `{$versions}` ADD engine TINYINT UNSIGNED NOT NULL DEFAULT 9") === false) throw new \RuntimeException('Cannot install version engine identity.');
        }
        $drafts = $prefix . 'map_drafts';
        if (!$db->get_var($db->prepare("SHOW COLUMNS FROM `{$drafts}` LIKE %s", 'migration'))) {
            if ($db->query("ALTER TABLE `{$drafts}` ADD migration TINYINT UNSIGNED NOT NULL DEFAULT 0") === false) throw new \RuntimeException('Cannot install draft migration metadata.');
            // Backfill only unpublished conversions from the earlier v9 preview storage.
            if ($db->query("UPDATE `{$drafts}` d LEFT JOIN `{$versions}` source ON source.id=d.source_version_id AND source.map_id=d.map_id SET d.migration=1 WHERE (d.legacy_key=CONCAT('engine-v9:',d.map_id) OR source.engine=8) AND NOT EXISTS (SELECT 1 FROM `{$versions}` published WHERE published.map_id=d.map_id AND published.draft_id=d.id AND published.kind='publication')") === false) throw new \RuntimeException('Cannot backfill draft migration metadata.');
        }
        // Atomic publication requires transactional production storage too.
        $maps = $prefix . 'maps';
        if ($db->get_var($db->prepare('SHOW TABLES LIKE %s', $db->esc_like($maps)))) {
            $status = $db->get_row($db->prepare('SHOW TABLE STATUS LIKE %s', $db->esc_like($maps)));
            if ($status && strcasecmp($status->Engine, 'InnoDB') !== 0 && $db->query("ALTER TABLE `{$maps}` ENGINE=InnoDB") === false) {
                throw new \RuntimeException('Atomic App publication requires InnoDB.');
            }
        }
    }
}
