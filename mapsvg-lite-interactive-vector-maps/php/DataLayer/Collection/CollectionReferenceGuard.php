<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Collection;

/** Prevents deleting the Collection behind an installation-wide Saved Query. */
final class CollectionReferenceGuard
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function assertUnreferenced(int $schemaId): void
    {
        $table = $this->db->mapsvg_prefix . 'saved_queries';
        if (!preg_match('/\A[A-Za-z0-9_]+\z/D', $table)) {
            throw new \InvalidArgumentException('Invalid Saved Query table.');
        }
        $like = method_exists($this->db, 'esc_like')
            ? $this->db->esc_like($table)
            : addcslashes($table, '_%\\');
        $found = $this->db->get_var($this->db->prepare('SHOW TABLES LIKE %s', $like));
        $connection = isset($this->db->db) && is_object($this->db->db)
            ? $this->db->db : $this->db;
        if (!empty($connection->last_error)) {
            throw new \DomainException('Saved Query references could not be verified.');
        }
        if ($found === null) {
            return;
        }
        if ($found !== $table) {
            throw new \DomainException('Saved Query references could not be verified.');
        }
        $rows = $this->db->get_results($this->db->prepare(
            'SELECT `id` FROM `' . $table . '` WHERE `schema_id` = %d LIMIT 1',
            $schemaId
        ));
        if (!empty($connection->last_error) || !is_array($rows)) {
            throw new \DomainException('Saved Query references could not be verified.');
        }
        if ($rows !== array()) {
            throw new \DomainException('This Collection is used by a Saved Query. Rebind the Query before deleting it.');
        }
    }
}
