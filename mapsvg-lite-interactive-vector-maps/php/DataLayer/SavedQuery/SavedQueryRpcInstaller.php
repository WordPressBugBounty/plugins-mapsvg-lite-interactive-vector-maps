<?php

declare(strict_types=1);
namespace MapSVG\DataLayer\SavedQuery;

/** Additive/idempotent migration; existing definitions remain private by default. */
final class SavedQueryRpcInstaller
{
    public static function available($db): bool
    {
        $table = $db->mapsvg_prefix . 'saved_queries';
        if (!preg_match('/\A[A-Za-z0-9_]+\z/D', $table)) throw new \InvalidArgumentException('Invalid saved Query table.');
        $column = $db->get_var("SHOW COLUMNS FROM `{$table}` WHERE `Field` = 'rpc_json'");
        $connection = isset($db->db) && is_object($db->db) ? $db->db : $db;
        if (!empty($connection->last_error)) {
            throw new \RuntimeException('Query RPC metadata could not be verified.');
        }
        return (bool) $column;
    }

    public static function install($db): void
    {
        $table = $db->mapsvg_prefix . 'saved_queries';
        if (!preg_match('/\A[A-Za-z0-9_]+\z/D', $table)) throw new \InvalidArgumentException('Invalid saved Query table.');
        if (self::available($db)) return;
        if ($db->query("ALTER TABLE `{$table}` ADD COLUMN `rpc_json` LONGTEXT NULL") === false) {
            throw new \RuntimeException('Could not add Query RPC metadata storage.');
        }
    }
}
