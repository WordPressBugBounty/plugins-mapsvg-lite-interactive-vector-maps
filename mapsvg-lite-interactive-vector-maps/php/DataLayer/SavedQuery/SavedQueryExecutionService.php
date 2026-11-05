<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\SavedQuery;

use MapSVG\DataLayer\Collection\CollectionQueryExecutionService;
use MapSVG\Schema;
use MapSVG\Shared\SavedQuery\SavedQueryInput;

/** Executes saved definitions using a server-resolved schema, including map bindings. */
final class SavedQueryExecutionService
{
    private SavedQueryStore $store;
    private CollectionQueryExecutionService $queries;

    public function __construct(
        ?SavedQueryStore $store = null,
        ?callable $runner = null,
        ?CollectionQueryExecutionService $queries = null
    ) {
        if ($runner !== null && $queries !== null) {
            throw new \InvalidArgumentException(
                'Provide either a Collection query runner or executor, not both.'
            );
        }
        $this->store = $store ?? new SavedQueryStore();
        $this->queries = $queries ?? new CollectionQueryExecutionService($runner);
    }

    /** @return array{rows:array,count:int} */
    public function execute(string $id, array $pagination = array(), array $runtime = array()): array
    {
        $saved = $this->store->query($id);
        if (!$saved) throw new \OutOfBoundsException('Query not found.');
        return $this->executeSaved($saved, $this->resolveSchema($saved), $pagination, $runtime);
    }

    private function resolveSchema(array $saved): Schema
    {
        $schema = $this->store->resolveSchema($saved['schemaId']);
        if (!$schema) throw new \UnexpectedValueException('Linked table is unavailable.');
        if (method_exists($schema, 'isLocal') && !$schema->isLocal()) {
            throw new \InvalidArgumentException('Only local MapSVG tables are supported.');
        }
        return $schema;
    }

    /** Execute the same definition snapshot that passed the caller's access/Map checks. */
    private function executeSaved(array $saved, Schema $schema, array $pagination, array $runtime): array
    {
        $input = SavedQueryInput::members($saved['input']);
        if ($runtime !== array()) {
            $overlay = self::runtimeWhere($schema, $runtime);
            if ($overlay !== array()) {
                $input['where'] = empty($input['where'])
                    ? $overlay
                    : array('AND' => array($input['where'], $overlay));
            }
        }
        foreach (array('skip', 'take') as $key) {
            if (!array_key_exists($key, $pagination)) continue;
            if (!is_int($pagination[$key]) || $pagination[$key] < 0) {
                throw new \InvalidArgumentException($key . ' must be a non-negative integer.');
            }
            $input[$key] = $pagination[$key];
        }
        if (!isset($input['take'])) $input['take'] = 50;
        // Plain Store DTOs can contain detached empty stdClass values. Compare
        // structure and scalar types instead of object identities or loose ==.
        if (serialize($this->store->query($saved['id'])) !== serialize($saved)) {
            throw new \UnexpectedValueException('Query changed; reload before executing.');
        }
        return $this->executeInput($schema, $input);
    }

    /**
     * Compatibility facade for legacy callers.
     *
     * New direct Collection and named Saved Query paths depend on the neutral
     * CollectionQueryExecutionService instead.
     */
    public function executeInput(Schema $schema, array $input): array
    {
        return $this->queries->execute($schema, $input);
    }

    public static function boundQueryId($map, string $role): ?string
    {
        if (!in_array($role, array('objects', 'regions'), true)) return null;
        $scenes = is_object($map) && isset($map->options['scenes']) && is_array($map->options['scenes']) ? $map->options['scenes'] : array();
        foreach ($scenes as $scene) {
            if (!is_array($scene) || ($scene['id'] ?? '') !== 'scene-1') continue;
            $id = $scene['dataBindings'][$role]['queryId'] ?? null;
            if (!is_string($id) || $id === '' || $id === 'getObjects' || $id === 'getRegions') return null;
            return $id;
        }
        return null;
    }

    /** @return array{rows:array,count:int} */
    public function executeBound($map, string $role, string $id, array $pagination = array(), array $runtime = array(), bool $requireBinding = true): array
    {
        if (!is_object($map)
            || filter_var($map->id ?? null, FILTER_VALIDATE_INT, array('options' => array('min_range' => 1))) === false
            || (isset($map->status) && (int) $map->status === 0)) {
            throw new \OutOfBoundsException('Map not found.');
        }
        if ($requireBinding && self::boundQueryId($map, $role) !== $id) {
            throw new \DomainException('Query is not bound to this map source.');
        }
        $saved = $this->store->query($id);
        if (!$saved) throw new \OutOfBoundsException('Query not found.');
        // Old public map loading has no named parameter/access contract. Do not let it bypass v9 policy.
        if (isset($saved['rpc']) && (!function_exists('current_user_can') || !current_user_can('edit_posts'))) {
            throw new \DomainException('This Query requires the named RPC path for public reads.');
        }

        $method = $role === 'objects' ? 'getObjects' : 'getRegions';
        $repository = $map->{$method}();
        $schema = $repository && method_exists($repository, 'getSchema') ? $repository->getSchema() : null;
        if (!$schema instanceof Schema || (int) $schema->id !== (int) $saved['schemaId']) {
            throw new \UnexpectedValueException('Query is linked to a different map collection.');
        }
        if ($role === 'regions' && empty($runtime['filters']['includeOrphans'])
            && in_array('orphaned', $schema->getFieldNames(), true)) {
            $runtime['filterout']['orphaned'] = 1;
        }
        return $this->executeSaved($saved, $this->resolveSchema($saved), $pagination, $runtime);
    }

    /** Converts the supported legacy map filter subset into an additional Prisma predicate. */
    public static function runtimeWhere(Schema $schema, array $runtime): array
    {
        if (array_diff(array_keys($runtime), array('filters', 'filterout', 'search', 'searchField'))) {
            throw new \InvalidArgumentException('Unsupported map query option.');
        }
        $fieldNames = array();
        $searchable = array();
        foreach ($schema->getFields() as $field) {
            $fieldNames[$field->name] = true;
            if (!empty($field->searchable) && in_array($field->type, array('text', 'textarea'), true)) {
                $searchable[] = $field->name;
            }
        }
        $conditions = array();
        foreach (array('filters', 'filterout') as $kind) {
            $values = $runtime[$kind] ?? array();
            if (!is_array($values)) throw new \InvalidArgumentException($kind . ' must be an object.');
            foreach ($values as $name => $value) {
                if ($name === 'includeOrphans' && $kind === 'filters') {
                    if ($schema->type !== 'region' || !function_exists('current_user_can') || !current_user_can('edit_posts')) {
                        throw new \InvalidArgumentException('includeOrphans is available to editors only.');
                    }
                    continue;
                }
                if (!is_string($name) || !isset($fieldNames[$name])) {
                    throw new \InvalidArgumentException('Unsupported map filter: ' . (string) $name);
                }
                if ($value === '' || $value === null || $value === array()) continue;
                $comparison = \MapSVG\DataLayer\Query\NumericFilterPredicate::read($schema->getField($name), $value);
                if ($comparison !== null) {
                    $predicate = [$name => $comparison];
                } elseif (is_array($value) && array_values($value) === $value && $value !== array()) {
                    foreach ($value as $part) {
                        if (!is_scalar($part)) throw new \InvalidArgumentException('Invalid map filter value.');
                    }
                    $predicate = array($name => array('in' => $value));
                } elseif (is_scalar($value)) {
                    $predicate = array($name => $value);
                } else {
                    throw new \InvalidArgumentException('Unsupported map filter value for ' . $name);
                }
                $conditions[] = $kind === 'filterout' ? array('NOT' => $predicate) : $predicate;
            }
        }
        $search = $runtime['search'] ?? '';
        if (!is_string($search)) throw new \InvalidArgumentException('Search must be a string.');
        if ($search !== '') {
            $searchField = $runtime['searchField'] ?? '';
            if (!is_string($searchField)) throw new \InvalidArgumentException('Search field must be a string.');
            $fields = $searchField !== '' ? array($searchField) : $searchable;
            if ($fields === array()) throw new \InvalidArgumentException('This collection has no searchable text fields.');
            $searchConditions = array();
            foreach ($fields as $name) {
                if (!in_array($name, $searchable, true)) {
                    throw new \InvalidArgumentException('Unsupported map search field: ' . $name);
                }
                $searchConditions[] = array($name => array('contains' => $search));
            }
            $conditions[] = count($searchConditions) === 1 ? $searchConditions[0] : array('OR' => $searchConditions);
        }
        if ($conditions === array()) return array();
        return count($conditions) === 1 ? $conditions[0] : array('AND' => $conditions);
    }
}
