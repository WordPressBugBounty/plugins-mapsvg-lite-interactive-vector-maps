<?php

namespace MapSVG;

/** Cleanup cannot interpret an App-local absence as permission to delete shared data. */
final class AppRegionCleanupReferences
{
    private $db;
    public function __construct($db = null) { $this->db = $db ?? Database::get(); }

    public function assertUnshared(Schema $schema, int $mapId, string $pageId, array $options): void
    {
        $prefix = $this->db->mapsvg_prefix;
        if (!preg_match('/\A[A-Za-z0-9_]+\z/D', $prefix)) throw new \RuntimeException('Invalid storage prefix.', 500);
        $queries = $this->db->get_results($this->db->prepare("SELECT id,name FROM `{$prefix}saved_queries` WHERE schema_id=%d FOR UPDATE", $schema->id), ARRAY_A);
        $this->assertRead($queries);
        $queryIds = array_merge(array_column($queries, 'id'), array_column($queries, 'name'));
        $legacyName = $options['database']['schemas']['regions']['name'] ?? $options['database']['regionsTableName'] ?? 'regions_' . $mapId;
        $pageQueryIds = $legacyName === $schema->name ? array_merge($queryIds, ['getRegions']) : $queryIds;
        foreach ($options['scenes'] ?? [] as $page) {
            $builtin = ($page['dataBindings']['regions']['queryId'] ?? 'getRegions') === 'getRegions' && $legacyName === $schema->name;
            if (($page['id'] ?? '') !== $pageId && ($builtin || self::references($page, $schema, $pageQueryIds))) {
                throw new \RuntimeException('This Regions Collection is shared with another Page. Review shared records individually in Database.', 409);
            }
        }
        foreach ($options['stateGraph']['states'] ?? [] as $state) {
            if (($state['sceneId'] ?? $pageId) !== $pageId && self::references($state, $schema, $pageQueryIds)) {
                throw new \RuntimeException('This Regions Collection is shared with another Page. Review shared records individually in Database.', 409);
            }
        }
        foreach ([['maps', 'id', 'options', '1=1'], ['map_drafts', 'map_id', 'snapshot', 'deleted_at IS NULL'], ['map_versions', 'map_id', 'snapshot', '1=1']] as $table) {
            list($suffix, $owner, $column, $where) = $table;
            $last = 0;
            do {
                $rows = $this->db->get_results($this->db->prepare("SELECT id,{$column} AS document FROM `{$prefix}{$suffix}` WHERE {$owner}<>%d AND {$where} AND id>%d ORDER BY id LIMIT 16", $mapId, $last), ARRAY_A);
                $this->assertRead($rows);
                foreach ($rows as $row) {
                    $last = (int) $row['id'];
                    $document = json_decode($row['document'], true);
                    if (!is_array($document)) throw new \RuntimeException('Cannot verify shared Collection references.', 409);
                    if (self::references($document, $schema, $queryIds)) throw new \RuntimeException('This Regions Collection is shared with another App. Review shared records individually in Database.', 409);
                }
            } while (count($rows) === 16);
        }
    }

    /** Includes Scene change values, named/ID Query references and retained v8 schema keys. */
    public static function references(array $document, Schema $schema, array $queryIds): bool
    {
        foreach ($document as $key => $value) {
            if (is_array($value) && self::references($value, $schema, $queryIds)) return true;
            if (is_string($value) && (in_array($value, $queryIds, true) || $value === $schema->name)) return true;
            if ($key === 'schemaId' && is_scalar($value) && (string) $value === (string) $schema->id) return true;
        }
        return false;
    }

    private function assertRead($rows): void
    {
        $connection = $this->db->db ?? $this->db;
        if (!is_array($rows) || !empty($connection->last_error)) throw new \RuntimeException('Cannot verify shared Collection references.', 500);
    }
}
