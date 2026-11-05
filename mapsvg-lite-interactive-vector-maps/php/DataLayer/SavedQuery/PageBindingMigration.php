<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\SavedQuery;

use MapSVG\DataLayer\Validation\ValidationJson;
use MapSVG\RepositoryFactory;
use MapSVG\Schema;

/** Pending v9 data backfill. Never invoked by Map reads, autosave or publication. */
final class PageBindingMigration
{
    private $db;
    private SavedQueryStore $store;
    private DefaultCollectionQuery $defaults;
    private $schemaByName;
    private $report;
    private array $queriesBySchema = array();

    public function __construct($db, ?SavedQueryStore $store = null, ?callable $schemaByName = null, ?callable $report = null)
    {
        if (!preg_match('/\A[A-Za-z0-9_]+\z/D', $db->mapsvg_prefix)) throw new \InvalidArgumentException('Invalid migration table prefix.');
        $this->db = $db;
        $this->store = $store ?? new SavedQueryStore($db);
        $this->defaults = new DefaultCollectionQuery($this->store);
        $this->schemaByName = $schemaByName ?? static function (string $name) use ($db) {
            $schema = RepositoryFactory::get('schema')->findByName($name);
            if (!$schema || $schema->name !== $name || !$schema->isLocal()) return null;
            if (!SavedQueryStorageInstaller::exists($db, $db->mapsvg_prefix . $name)) return null;
            return $schema;
        };
        $this->report = $report ?? static function (string $message): void { \MapSVG\Logger::error('[PAGE-BINDING-MIGRATION] ' . $message); };
    }

    private function table(string $name): string { return '`' . $this->db->mapsvg_prefix . $name . '`'; }
    private static function json($value): string { return ValidationJson::encode($value, JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION); }
    private static function copy($value) { return unserialize(serialize($value)); }
    private function read(): void
    {
        $connection = isset($this->db->db) && is_object($this->db->db) ? $this->db->db : $this->db;
        if (!empty($connection->last_error)) throw new \RuntimeException('Page binding migration read failed.');
    }
    private function sql(string $sql)
    {
        $result = $this->db->query($sql);
        if ($result === false) throw new \RuntimeException('Page binding migration write failed.');
        return $result;
    }

    public function run(): void
    {
        if (!SavedQueryStorageInstaller::exists($this->db, $this->db->mapsvg_prefix . 'maps')) return;
        $rows = $this->db->get_results('SELECT `id` FROM ' . $this->table('maps') . ' ORDER BY `id`');
        $this->read();
        foreach ($rows ?: array() as $identity) {
            $id = (int) $identity->id;
            $this->queriesBySchema = array();
            $this->sql('START TRANSACTION');
            try {
                // Same lock order as draft saves/publication: Map, then mutable drafts.
                $map = $this->db->get_row($this->db->prepare('SELECT `options` FROM ' . $this->table('maps') . ' WHERE `id` = %d FOR UPDATE', $id));
                $this->read();
                if ($map) {
                    $options = json_decode($map->options);
                    if ($options instanceof \stdClass && (int) ($options->_mapsvgEngine ?? 9) !== 8) {
                        $before = self::json($options);
                        $this->migrateOptions($options, $id);
                        if ($before !== self::json($options)) $this->sql($this->db->prepare('UPDATE ' . $this->table('maps') . ' SET `options` = %s WHERE `id` = %d', self::json($options), $id));
                    } elseif (!$options instanceof \stdClass) ($this->report)('Map ' . $id . ': invalid options JSON retained.');
                    $drafts = $this->db->get_results($this->db->prepare('SELECT `id`, `snapshot`, `revision` FROM ' . $this->table('map_drafts') . ' WHERE `map_id` = %d AND `deleted_at` IS NULL FOR UPDATE', $id));
                    $this->read();
                    foreach ($drafts ?: array() as $draft) {
                        $snapshot = json_decode($draft->snapshot);
                        if (!$snapshot instanceof \stdClass || !($snapshot->options ?? null) instanceof \stdClass) {
                            ($this->report)('Draft ' . $draft->id . ': invalid snapshot JSON retained.');
                            continue;
                        }
                        $before = self::json($snapshot);
                        $this->migrateOptions($snapshot->options, $id);
                        if ($before === self::json($snapshot)) continue;
                        $written = $this->sql($this->db->prepare('UPDATE ' . $this->table('map_drafts') . ' SET `snapshot` = %s, `revision` = `revision` + 1 WHERE `id` = %d AND `map_id` = %d AND `revision` = %d', self::json($snapshot), (int) $draft->id, $id, (int) $draft->revision));
                        if ($written !== 1) throw new \RuntimeException('Draft changed during Page binding migration.');
                    }
                }
                $this->sql('COMMIT');
            } catch (\Throwable $error) {
                $this->db->query('ROLLBACK');
                $this->queriesBySchema = array();
                throw $error;
            }
        }
    }

    /** Transform only known binding paths; preserve opaque JSON dictionaries and code. */
    public function migrateOptions(\stdClass $options, int $mapId): void
    {
        if (!isset($options->scenes) || $options->scenes === array()) {
            $options->scenes = array((object) array('id' => 'scene-1', 'title' => 'Default'));
        }
        if (!is_array($options->scenes)) throw new \UnexpectedValueException('Invalid Pages in Map ' . $mapId);
        $original = self::copy($options);
        foreach ($options->scenes as $page) $this->page($options, $page, $mapId);

        // Normalize binding overrides from their original effective Scene, including v1 parents.
        foreach ($options->stateGraph->states ?? array() as $state) {
            if (!$state instanceof \stdClass || !is_array($state->changes ?? null)) continue;
            $effective = self::copy($original);
            $current = self::copy($options);
            foreach ($this->stateChanges($original, $state->id) as $change) {
                if (!is_array($change->path ?? null) || !in_array($change->path[0] ?? '', array('scenes', 'menu'), true)) continue;
                self::apply($effective, $change->path, $change->value ?? null, !empty($change->remove));
                self::apply($current, $change->path, $change->value ?? null, !empty($change->remove));
            }
            foreach ($effective->scenes as $page) {
                if (($page->id ?? '') !== ($state->sceneId ?? null)) continue;
                $this->page($effective, $page, $mapId);
                $inherited = null;
                foreach ($current->scenes as $candidate) if (($candidate->id ?? null) === $page->id) $inherited = $candidate->dataBindings ?? null;
                if (self::json($inherited) === self::json($page->dataBindings ?? null)) break;
                $state->changes = array_values(array_filter($state->changes, static function ($change) use ($state) {
                    $path = $change->path ?? array();
                    return array_slice($path, 0, 3) !== array('scenes', '@' . $state->sceneId, 'dataBindings');
                }));
                $state->changes[] = (object) array('path' => array('scenes', '@' . $state->sceneId, 'dataBindings'), 'value' => $page->dataBindings);
                break;
            }
        }
        // Keep v8 source metadata for rollback, unresolved providers and historical snapshots.
    }

    private function page(\stdClass $options, $page, int $mapId): void
    {
        if (!$page instanceof \stdClass || !is_string($page->id ?? null)) throw new \UnexpectedValueException('Invalid Page in Map ' . $mapId);
        foreach (array('objects', 'regions') as $role) {
            $builtin = $role === 'objects' ? 'getObjects' : 'getRegions';
            $binding = $page->dataBindings->{$role} ?? new \stdClass();
            if ($binding === array()) $binding = new \stdClass();
            if (!$binding instanceof \stdClass) throw new \UnexpectedValueException('Invalid Page binding in Map ' . $mapId);
            $selected = $binding->queryId ?? $builtin;
            if ($selected !== '' && $selected !== $builtin) {
                if (!is_string($selected)) throw new \UnexpectedValueException('Invalid Query identity in Map ' . $mapId);
                $query = $this->store->query($selected);
                if (!$query && preg_match('/\A[a-z][a-zA-Z0-9]{0,119}\z/D', $selected)) $query = $this->store->queryByName($selected);
                if ($query) $this->fileDefault($query, $role, $mapId);
                continue;
            }
            $name = $options->database->schemas->{$role}->name ?? $options->database->{$role . 'TableName'} ?? $role . '_' . $mapId;
            $schema = is_string($name) && preg_match('/\A[A-Za-z_][A-Za-z0-9_]*\z/D', $name) ? ($this->schemaByName)($name) : null;
            if (!$schema || !$schema->isLocal() || !$schema->getField($schema->getPrimaryKeyFieldName()) || ($role === 'regions' && !$schema->hasSvgBinding())) {
                ($this->report)('Map ' . $mapId . ' / ' . $role . ': unavailable or unsupported source retained.');
                continue;
            }
            $query = $this->defaultQuery($schema, $role, $mapId);
            $legacy = PageBindingQuery::binding(json_decode(self::json($options), true), $role, $page->id);
            foreach (array('orderBy', 'filterout', 'pagination', 'disableOn') as $key) {
                if (!property_exists($binding, $key) && array_key_exists($key, $legacy)) $binding->{$key} = $legacy[$key];
            }
            if (!property_exists($binding, 'refetch')) $binding->refetch = $options->database->{$role === 'objects' ? 'autoRefetch' : 'regionsAutoRefetch'} ?? (object) array('on' => false, 'value' => 5, 'unit' => 's');
            $binding->queryId = $query['id'];
            if (!isset($page->dataBindings) || $page->dataBindings === array()) $page->dataBindings = new \stdClass();
            $page->dataBindings->{$role} = $binding;
        }
    }

    private function defaultQuery(Schema $schema, string $role, int $mapId): array
    {
        if (isset($this->queriesBySchema[$schema->id])) return $this->queriesBySchema[$schema->id];
        foreach ($this->store->queries() as $query) {
            if ($query['schemaId'] !== (int) $schema->id || !$this->isDefault($query)) continue;
            if (!in_array($query['name'], array(DefaultCollectionQuery::baseName($schema), 'get' . ucfirst($role) . $mapId), true)) continue;
            $this->fileDefault($query, $role, $mapId);
            return $this->queriesBySchema[$schema->id] = $this->store->query($query['id']);
        }
        $folders = array();
        return $this->queriesBySchema[$schema->id] = $this->defaults->create($schema, $folders);
    }

    private function isDefault(array $query): bool
    {
        return !isset($query['rpc']) && $query['builder'] === array('combinator' => 'and', 'rules' => array())
            && self::json($query['input']) === '{"where":{}}';
    }

    private function fileDefault(array $query, string $role, int $mapId): void
    {
        if ($query['folderId'] !== null) return;
        $schema = $this->store->resolveSchema($query['schemaId']);
        if (!$schema || !$schema->isLocal() || !in_array($query['name'], array(DefaultCollectionQuery::baseName($schema), 'get' . ucfirst($role) . $mapId), true)) return;
        $folders = array();
        $this->store->updateQuery($query['id'], array('folderId' => $this->defaults->folderId($schema, $folders)));
    }

    private function stateChanges(\stdClass $options, string $id, array $seen = array()): array
    {
        if (isset($seen[$id])) throw new \UnexpectedValueException('Cyclic legacy Scene graph.');
        $seen[$id] = true;
        foreach ($options->stateGraph->states ?? array() as $state) {
            if ($state->id !== $id) continue;
            $parent = ($options->stateGraph->version ?? 2) === 1 ? ($state->parentId ?? null) : null;
            return array_merge($parent ? $this->stateChanges($options, $parent, $seen) : array(), $state->changes);
        }
        throw new \UnexpectedValueException('Missing legacy Scene.');
    }

    private static function apply(&$target, array $path, $value, bool $remove): void
    {
        $key = array_shift($path);
        if (!is_string($key) || in_array($key, array('__proto__', 'prototype', 'constructor'), true)) throw new \UnexpectedValueException('Unsafe Scene path.');
        if (is_array($target) && substr($key, 0, 1) === '@') {
            foreach ($target as &$entry) if (($entry->id ?? null) === substr($key, 1)) { self::apply($entry, $path, $value, $remove); break; }
        } elseif ($target instanceof \stdClass) {
            if ($path === array()) {
                if ($remove) unset($target->{$key});
                else $target->{$key} = self::copy($value);
            } else {
                if (!isset($target->{$key}) || $target->{$key} === array()) $target->{$key} = new \stdClass();
                self::apply($target->{$key}, $path, $value, $remove);
            }
        }
    }
}
