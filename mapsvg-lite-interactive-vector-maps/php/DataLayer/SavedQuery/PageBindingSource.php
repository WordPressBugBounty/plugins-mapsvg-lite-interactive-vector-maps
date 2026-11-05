<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\SavedQuery;

use MapSVG\App\Data\Query\QueryRejected;
use MapSVG\Schema;
use MapSVG\Shared\Collection\CollectionQueryProjection;
use MapSVG\Shared\SavedQuery\SavedQueryInput;

/** Query owns its source. App collection keys are consulted only for retained v8 builtins. */
final class PageBindingSource
{
    public static function defaultPageId(array $options): string
    {
        $selected = $options['stateGraph']['defaultStateId'] ?? null;
        foreach ($options['stateGraph']['states'] ?? array() as $state) {
            if (($state['id'] ?? null) === $selected && isset($state['sceneId'])) return $state['sceneId'];
        }
        foreach ($options['scenes'] ?? array() as $page) {
            if ('scene:' . $page['id'] === $selected) return $page['id'];
        }
        return $options['scenes'][0]['id'] ?? 'scene-1';
    }

    /** @return array{query:?array,schema:Schema} */
    public static function resolve($map, string $role, array $binding, ?SavedQueryStore $store = null): array
    {
        $store = $store ?? new SavedQueryStore();
        $id = $binding['queryId'] ?? ($role === 'objects' ? 'getObjects' : 'getRegions');
        if (!in_array($id, array('getObjects', 'getRegions'), true)) {
            $query = $store->query($id) ?? $store->queryByName($id);
            if (!$query) throw new QueryRejected('query_not_found');
            $schema = $store->resolveSchema((int) $query['schemaId']);
            if (!$schema || (int) $schema->id !== (int) $query['schemaId'] || !$schema->isLocal()) throw new QueryRejected('resource_not_found');
        } else {
            if ($id !== ($role === 'objects' ? 'getObjects' : 'getRegions')) throw new QueryRejected('invalid_params');
            $query = null;
            $repository = method_exists($map, 'getLegacyBindingRepository') ? $map->getLegacyBindingRepository($role)
                : ($role === 'objects' ? $map->getObjects() : $map->getRegions());
            $schema = $repository ? $repository->getSchema() : null;
            if (!$schema || !$schema->isLocal()) throw new QueryRejected('resource_not_found');
        }
        if ($role === 'regions' && !$schema->hasSvgBinding()) throw new QueryRejected('invalid_binding_schema');
        $selected = $query ? CollectionQueryProjection::fields(SavedQueryInput::members($query['input'])) : null;
        if ($selected !== null && !in_array('id', $selected, true)) throw new QueryRejected('invalid_binding_schema');
        return array('query' => $query, 'schema' => $schema);
    }

    /** Explicit new-App creation only. Opening an existing App never creates Queries. */
    public static function createDefaults($map, array &$createdIds, array &$createdFolderIds): void
    {
        $store = new SavedQueryStore();
        $defaults = new DefaultCollectionQuery($store);
        foreach (array('objects', 'regions') as $role) {
            $builtin = $role === 'objects' ? 'getObjects' : 'getRegions';
            $pages = array_filter($map->options['scenes'] ?? array(), static function ($page) use ($role, $builtin) {
                return ($page['dataBindings'][$role]['queryId'] ?? $builtin) === $builtin;
            });
            if ($pages === array()) continue;
            $legacy = $map->getLegacyBindingRepository($role);
            if (!$legacy || !$legacy->getSchema()->isLocal()) continue;
            $schema = \MapSVG\RepositoryFactory::get('schema')->findByName($legacy->getSchema()->name);
            if (!$schema) throw new \RuntimeException('Created Collection schema is unavailable.');
            $query = $defaults->create($schema, $createdFolderIds);
            $createdIds[] = $query['id'];
            foreach ($map->options['scenes'] as &$page) {
                if (($page['dataBindings'][$role]['queryId'] ?? $builtin) !== $builtin) continue;
                $binding = PageBindingQuery::binding($map->options, $role, $page['id']);
                $binding['queryId'] = $query['id'];
                $binding['perPage'] = null;
                $page['dataBindings'][$role] = $binding;
            }
            unset($page);
        }
        $complete = !empty($map->options['scenes']);
        foreach ($map->options['scenes'] ?? array() as $page) foreach (array('objects', 'regions') as $role) {
            if (in_array($page['dataBindings'][$role]['queryId'] ?? '', array('', 'getObjects', 'getRegions'), true)) $complete = false;
        }
        if ($complete) unset($map->options['database']['schemas'], $map->options['database']['objectsTableName'], $map->options['database']['regionsTableName']);
    }

    /** Runtime metadata describes the returned logical fields, without endpoints or credentials. */
    public static function resultSchema(Schema $source, array $input): array
    {
        $selected = CollectionQueryProjection::fields($input);
        $fields = array();
        $allowed = array_flip(array('name', 'type', 'label', 'options', 'multiselect', 'searchable', 'readonly',
            'visible', 'protected', 'post_type', 'markerField', 'markersByFieldEnabled', 'markersByField', 'defaultMarkerPath'));
        foreach ($source->getFields() as $field) {
            if ($selected !== null && !in_array($field->name, $selected, true)) continue;
            $fields[] = array_intersect_key((array) $field, $allowed);
        }
        // All runtime records have a logical id, including Collections with a custom primary key.
        if (!in_array('id', array_column($fields, 'name'), true)) {
            $primary = $source->getField($source->getPrimaryKeyFieldName());
            $fields[] = array('name' => 'id', 'type' => 'id', 'label' => $primary->label ?? 'ID');
        }
        return array('id' => (int) $source->id, 'name' => $source->name, 'title' => $source->title,
            'type' => $source->type, 'objectNameSingular' => $source->objectNameSingular,
            'objectNamePlural' => $source->objectNamePlural, 'primaryKeyField' => 'id', 'strict' => true,
            'postType' => $source->postType, 'bindings' => $source->bindings, 'fields' => $fields);
    }
}
