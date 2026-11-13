<?php

namespace MapSVG;

/** Public raw Collection reads belong to published legacy/builtin bindings, never Query sources. */
final class PublicReadAccess
{
    /** No request/user cache: publication changes must take effect in the same process. */
    private static function maps(bool $withOptions = false): array
    {
        $db = Database::get();
        $prefix = $db->mapsvg_prefix;
        if (!preg_match('/\A[A-Za-z0-9_]+\z/D', $prefix)) throw new \InvalidArgumentException('Invalid MapSVG table prefix.');
        // Missing live rows are existing legacy publications; zero is deliberately unpublished.
        $columns = $withOptions ? 'm.id,m.options' : 'm.id';
        $rows = $db->get_results("SELECT {$columns} FROM `{$prefix}maps` m LEFT JOIN `{$prefix}map_live_versions` live ON live.map_id=m.id WHERE live.version_id IS NULL OR live.version_id>0", ARRAY_A);
        if ($db->last_error || !is_array($rows)) throw new \RuntimeException('Public App access could not be verified.');
        return $rows;
    }

    public static function mapIds(): array
    {
        return array_map('intval', array_column(self::maps(), 'id'));
    }

    public static function collectionNames(): array
    {
        $names = [];
        foreach (self::maps(true) as $row) {
            $options = json_decode($row['options'], true);
            if (!is_array($options)) continue;
            $pages = AppEngine::version($options) !== 8 && \MapSVG\DataLayer\SavedQuery\GlobalQueriesFeature::isEnabled()
                ? ($options['scenes'] ?? [[]]) : [[]];
            if (!$pages) $pages = [[]];
            foreach ($pages as $page) foreach (['objects' => 'getObjects', 'regions' => 'getRegions'] as $role => $builtin) {
                // Named Queries own predicates/projections/access. A binding never opens their raw source.
                if (($page['dataBindings'][$role]['queryId'] ?? $builtin) !== $builtin) continue;
                $name = $options['database']['schemas'][$role]['name']
                    ?? $options['database'][$role . 'TableName'] ?? $role . '_' . $row['id'];
                if (is_string($name) && preg_match('/\A[A-Za-z0-9_-]+\z/D', $name)
                    && !RepositoryFactory::isInternalSchemaName($name)) $names[$name] = true;
            }
        }
        return array_keys($names);
    }

    public static function collection(string $name): bool
    {
        return in_array($name, self::collectionNames(), true);
    }

    /** Also called by controllers so direct legacy aliases cannot skip the route boundary. */
    public static function collectionError($name): ?\WP_Error
    {
        if (!is_string($name) || !preg_match('/\A[A-Za-z0-9_-]+\z/D', $name)) {
            return new \WP_Error('mapsvg_invalid_collection', 'Invalid collection name.', ['status' => 400]);
        }
        if (RepositoryFactory::isInternalSchemaName($name)) {
            return new \WP_Error('mapsvg_internal_collection', 'Internal repositories are not available through collection routes.', ['status' => 403]);
        }
        if (current_user_can('edit_posts')) return null;
        if (!self::collection($name)) return new \WP_Error('mapsvg_collection_not_found', 'Collection not found.', ['status' => 404]);
        return null;
    }
}
