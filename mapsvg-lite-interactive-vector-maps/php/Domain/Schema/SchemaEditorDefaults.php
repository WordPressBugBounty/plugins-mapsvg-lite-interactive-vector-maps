<?php
namespace MapSVG;

/** Collection-owned editor preferences; never alter record fields or physical tables. */
final class SchemaEditorDefaults
{
    private $db;

    public function __construct($db = null) { $this->db = $db ?? Database::get(); }

    private function table(string $name): string
    {
        $table = $this->db->mapsvg_prefix . $name;
        if (!preg_match('/\A[A-Za-z0-9_]+\z/D', $table)) throw new \InvalidArgumentException('Invalid table name.');
        return '`' . $table . '`';
    }

    private function row(int $id): array
    {
        $row = $this->db->get_row($this->db->prepare('SELECT id,name,type,bindings FROM ' . $this->table('schema') . ' WHERE id=%d', $id), ARRAY_A);
        if (!$row || !in_array($row['type'], ['object', 'post', 'api'], true) || RepositoryFactory::isInternalSchemaName($row['name'])) {
            throw new \InvalidArgumentException('Object Collection not found.', 404);
        }
        return $row;
    }

    private static function bindings($raw): array
    {
        if ($raw === null || $raw === '' || $raw === 'null') return [];
        $value = is_string($raw) ? json_decode($raw, true) : $raw;
        if (!is_array($value)) throw new \UnexpectedValueException('Invalid Collection bindings; existing metadata was preserved.', 409);
        return $value;
    }

    public static function defaults(array $bindings): array
    {
        $editor = $bindings['editor'] ?? [];
        if (!is_array($editor)) return [];
        $result = [];
        if (is_string($editor['regionsTableName'] ?? null) && $editor['regionsTableName'] !== '') $result['regionsTableName'] = $editor['regionsTableName'];
        if (is_int($editor['mapId'] ?? null) && $editor['mapId'] >= 0) $result['mapId'] = $editor['mapId'];
        if (is_string($editor['defaultMarkerImage'] ?? null)) $result['defaultMarkerImage'] = $editor['defaultMarkerImage'];
        return $result;
    }

    public function get(int $id): array { return self::defaults(self::bindings($this->row($id)['bindings'])); }

    public function update(int $id, array $patch, bool $onlyMissing = false): array
    {
        if (array_diff(array_keys($patch), ['regionsTableName', 'mapId', 'defaultMarkerImage'])) throw new \InvalidArgumentException('Unknown editor preference.', 400);
        if (array_key_exists('defaultMarkerImage', $patch)) {
            $image = $patch['defaultMarkerImage'];
            if (!is_string($image) || strlen($image) > 2048) throw new \InvalidArgumentException('Invalid marker image.', 400);
            if ($image !== '') {
                $catalog = array_map(static function ($file) { return (string) $file->relativeUrl; }, (new MarkersRepository())->find());
                if (!in_array($image, $catalog, true)) throw new \InvalidArgumentException('Choose an existing marker image.', 400);
            }
        }
        if (array_key_exists('regionsTableName', $patch)) {
            $name = $patch['regionsTableName'];
            if (!is_string($name) || !preg_match('/\A[A-Za-z0-9_]{1,64}\z/D', $name)) throw new \InvalidArgumentException('Invalid Region Collection.', 400);
            $type = $this->db->get_var($this->db->prepare('SELECT type FROM ' . $this->table('schema') . ' WHERE name=%s', $name));
            if ($type !== 'region') throw new \InvalidArgumentException('Region Collection not found.', 404);
        }
        if (array_key_exists('mapId', $patch)) {
            if (!is_int($patch['mapId']) || $patch['mapId'] < 0) throw new \InvalidArgumentException('Invalid map preference.', 400);
            if ($patch['mapId'] > 0 && !$this->db->get_var($this->db->prepare('SELECT id FROM ' . $this->table('maps') . ' WHERE id=%d', $patch['mapId']))) {
                throw new \InvalidArgumentException('Map not found.', 404);
            }
        }
        // Merge against current metadata on every retry, so independent choices and
        // unrelated SVG/extension bindings cannot overwrite each other.
        for ($attempt = 0; $attempt < 4; $attempt++) {
            $row = $this->row($id);
            $bindings = self::bindings($row['bindings']);
            $existing = self::defaults($bindings);
            $next = $onlyMissing ? $existing + $patch : array_merge($existing, $patch);
            if ($next === $existing) return $existing;
            $bindings['editor'] = array_merge(is_array($bindings['editor'] ?? null) ? $bindings['editor'] : [], $next);
            $where = $row['bindings'] === null ? 'bindings IS NULL' : $this->db->prepare('BINARY bindings=BINARY %s', $row['bindings']);
            $changed = $this->db->query($this->db->prepare('UPDATE ' . $this->table('schema') . " SET bindings=%s WHERE id=%d AND {$where}", wp_json_encode($bindings), $id));
            if ($changed === false) throw new \RuntimeException('Could not save editor preferences.');
            if ($changed === 1) return $next;
        }
        throw new \RuntimeException('Collection preferences changed; please retry.', 409);
    }

    public function seed(string $objects, string $regions, int $mapId): void
    {
        $id = (int) $this->db->get_var($this->db->prepare('SELECT id FROM ' . $this->table('schema') . ' WHERE name=%s', $objects));
        if ($id > 0) $this->update($id, ['regionsTableName' => $regions, 'mapId' => $mapId], true);
    }

    /** Idempotent metadata-only backfill; no App/draft/publication or record writes. */
    public function backfill(): void
    {
        $exists = static function ($db, $table) { return \MapSVG\DataLayer\SavedQuery\SavedQueryStorageInstaller::exists($db, $table); };
        if (!$exists($this->db, $this->db->mapsvg_prefix . 'schema') || !$exists($this->db, $this->db->mapsvg_prefix . 'maps')) return;
        $columns = array_column($this->db->get_results('SHOW COLUMNS FROM ' . $this->table('schema')), 'Field');
        if (!in_array('bindings', $columns, true)) return;
        $catalog = $this->db->get_results('SELECT id,name,type FROM ' . $this->table('schema'), ARRAY_A);
        $byName = array_column($catalog, null, 'name');
        $byId = array_column($catalog, 'name', 'id');
        $queries = [];
        if ($exists($this->db, $this->db->mapsvg_prefix . 'saved_queries')) {
            foreach ($this->db->get_results('SELECT id,name,schema_id FROM ' . $this->table('saved_queries'), ARRAY_A) as $query) {
                $queries[$query['id']] = $queries[$query['name']] = $byId[$query['schema_id']] ?? null;
            }
        }
        $maps = $this->db->get_results('SELECT id,options FROM ' . $this->table('maps') . ' ORDER BY id', ARRAY_A);
        // A Collection's original private pair wins over an older Map that later
        // reused it through a Query. Explicit saved choices still win over both.
        foreach ($maps as $map) {
            $objects = 'objects_' . $map['id']; $regions = 'regions_' . $map['id'];
            if (!isset($byName[$objects]) || !in_array($byName[$objects]['type'], ['object', 'post', 'api'], true)) continue;
            $patch = ['mapId' => (int) $map['id']];
            if (($byName[$regions]['type'] ?? '') === 'region') $patch['regionsTableName'] = $regions;
            try { $this->update((int) $byName[$objects]['id'], $patch, true); }
            catch (\UnexpectedValueException $error) { Logger::error('[EDITOR-DEFAULTS] ' . $error->getMessage()); }
        }
        foreach ($maps as $map) {
            $options = json_decode($map['options'], true);
            if (!is_array($options)) continue;
            $legacy = [
                'objects' => $options['database']['schemas']['objects']['name'] ?? $options['database']['objectsTableName'] ?? ('objects_' . $map['id']),
                'regions' => $options['database']['schemas']['regions']['name'] ?? $options['database']['regionsTableName'] ?? ('regions_' . $map['id']),
            ];
            $pairs = [$legacy];
            foreach ($options['scenes'] ?? [] as $page) {
                $pair = $legacy;
                foreach (['objects', 'regions'] as $role) {
                    $query = $page['dataBindings'][$role]['queryId'] ?? null;
                    if ($query && !in_array($query, ['getObjects', 'getRegions'], true)) $pair[$role] = $queries[$query] ?? null;
                }
                $pairs[] = $pair;
            }
            foreach ($pairs as $pair) {
                if (!is_string($pair['objects']) || !isset($byName[$pair['objects']]) || !in_array($byName[$pair['objects']]['type'], ['object', 'post', 'api'], true)) continue;
                $patch = ['mapId' => (int) $map['id']];
                if (is_string($pair['regions']) && ($byName[$pair['regions']]['type'] ?? '') === 'region') $patch['regionsTableName'] = $pair['regions'];
                try { $this->update((int) $byName[$pair['objects']]['id'], $patch, true); }
                catch (\UnexpectedValueException $error) { Logger::error('[EDITOR-DEFAULTS] ' . $error->getMessage()); }
            }
        }
    }
}
