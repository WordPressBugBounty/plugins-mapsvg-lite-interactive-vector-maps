<?php

namespace MapSVG;

/** Independent SVG resource metadata. Files are immutable once registered. */
final class SvgAssetStorageInstaller
{
    public static function install($db): void
    {
        $prefix = $db->mapsvg_prefix;
        if (!preg_match('/\A[A-Za-z0-9_]+\z/D', $prefix)) throw new \InvalidArgumentException('Invalid SVG storage prefix.');
        $charset = $db->db->get_charset_collate();
        $tables = [
            'svg_assets' => 'id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, name VARCHAR(255) NOT NULL,
                origin VARCHAR(16) NOT NULL, origin_source TEXT NULL, origin_key CHAR(64) NOT NULL,
                derived_from_asset_id BIGINT UNSIGNED NULL, latest_revision_id BIGINT UNSIGNED NULL,
                created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL,
                PRIMARY KEY (id), UNIQUE KEY origin_key (origin_key)',
            'svg_asset_revisions' => 'id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, asset_id BIGINT UNSIGNED NOT NULL,
                parent_revision_id BIGINT UNSIGNED NULL, source TEXT NOT NULL, source_key CHAR(64) NOT NULL,
                content_hash CHAR(64) NOT NULL, author_id BIGINT UNSIGNED NOT NULL, created_at DATETIME NOT NULL,
                PRIMARY KEY (id), UNIQUE KEY source_key (source_key), KEY history (asset_id,id), KEY content (asset_id,content_hash)',
        ];
        foreach ($tables as $suffix => $definition) {
            $table = $prefix . $suffix;
            if (!$db->get_var($db->prepare('SHOW TABLES LIKE %s', $db->esc_like($table)))
                && $db->query("CREATE TABLE `{$table}` ({$definition}) ENGINE=InnoDB {$charset}") === false) {
                throw new \RuntimeException('Cannot install SVG registry.', 500);
            }
        }
    }
}
