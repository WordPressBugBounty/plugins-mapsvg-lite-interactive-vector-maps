<?php

namespace MapSVG;

/** Read-only post-editor catalog. Current Page Queries own the source; history does not. */
final class PostTypeMapBindings
{
    private $db;
    private $maps;
    private $queries;
    private $drafts;

    public function __construct($db = null)
    {
        $this->db = $db ?? Database::get();
        if (!preg_match('/\A[A-Za-z0-9_]+\z/D', $this->db->mapsvg_prefix)) {
            throw new \InvalidArgumentException('Invalid MapSVG table prefix.');
        }
    }

    private function exists(string $suffix): bool
    {
        $table = $this->db->mapsvg_prefix . $suffix;
        return (bool) $this->db->get_var($this->db->prepare('SHOW TABLES LIKE %s', $this->db->esc_like($table)));
    }

    /** @return array<int,array{id:int,title:string}> */
    public function mapsForSchema(int $schemaId): array
    {
        $prefix = $this->db->mapsvg_prefix;
        if ($this->maps === null) {
            $this->maps = $this->db->get_results("SELECT id, title, options FROM `{$prefix}maps`") ?: [];
            $this->queries = [];
            if ($this->exists('saved_queries')) {
                foreach ($this->db->get_results("SELECT id, name, schema_id FROM `{$prefix}saved_queries`") ?: [] as $query) {
                    $this->queries[(string) $query->id] = (int) $query->schema_id;
                    $this->queries[(string) $query->name] = (int) $query->schema_id;
                }
            }
            $this->drafts = [];
            if ($this->exists('map_drafts')) {
                foreach ($this->db->get_results("SELECT map_id, snapshot FROM `{$prefix}map_drafts` WHERE deleted_at IS NULL") ?: [] as $draft) {
                    $snapshot = json_decode($draft->snapshot, true);
                    if (is_array($snapshot['options'] ?? null)) $this->drafts[(int) $draft->map_id][] = $snapshot['options'];
                }
            }
        }
        $legacyIds = (new DataToMapsRepository())->findMapIdsBySchemaId($schemaId);
        $maps = [];
        foreach ($this->maps as $map) {
            $id = (int) $map->id;
            $options = json_decode($map->options, true);
            foreach (array_merge([$options], $this->drafts[$id] ?? []) as $candidate) {
                if (!is_array($candidate) || !self::usesSchema($candidate, $schemaId, $this->queries, in_array($id, $legacyIds, true))) continue;
                $maps[] = ['id' => $id, 'title' => $map->title ?: 'Map #' . $id];
                break;
            }
        }
        return $maps;
    }

    /** Legacy links only apply to retained builtin bindings, never override a named Query. */
    public static function usesSchema(array $options, int $schemaId, array $queries, bool $legacyLinked): bool
    {
        $pages = $options['scenes'] ?? [];
        if (!$pages) return $legacyLinked;
        foreach ($pages as $page) {
            $queryId = $page['dataBindings']['objects']['queryId'] ?? 'getObjects';
            if (!is_string($queryId)) continue;
            if ($queryId === 'getObjects' ? $legacyLinked : ($queries[$queryId] ?? null) === $schemaId) return true;
        }
        return false;
    }
}
