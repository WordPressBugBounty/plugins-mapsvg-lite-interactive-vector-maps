<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\SavedQuery;

/** Pending/versioned migration owner for Query storage, without data rewrites. */
final class SavedQueryStorageInstaller
{
    public static function install($db): void
    {
        $prefix = $db->mapsvg_prefix;
        if (!is_string($prefix) || !preg_match('/\A[A-Za-z0-9_]+\z/D', $prefix)) {
            throw new \InvalidArgumentException('Invalid saved Query table prefix.');
        }
        $charset = $db->db->get_charset_collate();
        $folders = $prefix . 'query_folders';
        $queries = $prefix . 'saved_queries';
        if (!self::exists($db, $folders)) {
            self::create($db, "CREATE TABLE `{$folders}` (
                `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                `title` VARCHAR(255) NOT NULL,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB {$charset}");
        }
        if (!self::exists($db, $queries)) {
            self::create($db, "CREATE TABLE `{$queries}` (
                `id` VARCHAR(64) NOT NULL,
                `name` VARCHAR(120) NOT NULL,
                `schema_id` BIGINT UNSIGNED NOT NULL,
                `folder_id` BIGINT UNSIGNED NULL,
                `builder_json` LONGTEXT NOT NULL,
                `input_json` LONGTEXT NOT NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `name` (`name`),
                KEY `schema_id` (`schema_id`),
                KEY `folder_id` (`folder_id`)
            ) ENGINE=InnoDB {$charset}");
        }
        SavedQueryRpcInstaller::install($db);
    }

    public static function exists($db, string $table): bool
    {
        if (!preg_match('/\A[A-Za-z0-9_]+\z/D', $table)) {
            throw new \InvalidArgumentException('Invalid saved Query table.');
        }
        $value = $db->get_var($db->prepare('SHOW TABLES LIKE %s', addcslashes($table, '_%\\')));
        $connection = isset($db->db) && is_object($db->db) ? $db->db : $db;
        if (!empty($connection->last_error)) {
            throw new \RuntimeException('Query storage metadata could not be verified.');
        }
        if ($value !== null && $value !== false && $value !== $table) {
            throw new \RuntimeException('Unexpected Query storage metadata.');
        }
        return $value === $table;
    }

    private static function create($db, string $sql): void
    {
        if ($db->query($sql) === false) {
            throw new \RuntimeException('Could not create saved Query storage.');
        }
    }
}
