<?php

namespace MapSVG;

/** Retained intent checked before creating/opening a new Map. Not browser evidence. */
final class AiMapCreationRequirements
{
    public static function schema(): array
    {
        return array('type' => 'object', 'properties' => array(
            'directory' => array('type' => 'boolean'),
            'directoryBinding' => array('type' => 'string', 'enum' => array('objects', 'regions')),
            'directoryFields' => array('type' => 'array', 'maxItems' => 20, 'items' => array('type' => 'string')),
            'filtersBinding' => array('type' => 'string', 'enum' => array('objects', 'regions')),
            'clearButton' => array('type' => 'boolean'),
            'filters' => array('type' => 'array', 'maxItems' => 20, 'items' => array('type' => 'object', 'properties' => array(
                'parameterName' => array('type' => 'string'),
                'type' => array('type' => 'string', 'enum' => array('select', 'search', 'text', 'checkbox', 'checkboxes', 'radio', 'distance')),
                'multiselect' => array('type' => 'boolean'), 'searchFallback' => array('type' => 'boolean'),
            ), 'required' => array('parameterName', 'type', 'multiselect', 'searchFallback'), 'additionalProperties' => false)),
        ), 'required' => array('directory', 'directoryBinding', 'directoryFields', 'filtersBinding', 'clearButton', 'filters'), 'additionalProperties' => false);
    }

    public static function normalize(array $value): array
    {
        $properties = self::schema()['properties'];
        if (array_diff(array_keys($value), array_keys($properties)) || array_diff(array_keys($properties), array_keys($value))
            || !is_bool($value['directory']) || !is_bool($value['clearButton'])
            || !in_array($value['directoryBinding'], array('objects', 'regions'), true)
            || !in_array($value['filtersBinding'], array('objects', 'regions'), true)
            || !is_array($value['directoryFields']) || count($value['directoryFields']) > 20
            || !is_array($value['filters']) || count($value['filters']) > 20
            || (!$value['directory'] && $value['directoryFields']) || (!$value['filters'] && $value['clearButton'])) {
            throw new \InvalidArgumentException('Supply the complete bounded Directory/Filters creation requirements object.');
        }
        foreach ($value['directoryFields'] as $field) if (!self::path($field)) {
            throw new \InvalidArgumentException('Directory fields must be actual template data paths, e.g. post.meta.status.');
        }
        $names = array();
        foreach ($value['filters'] as $filter) {
            if (!is_array($filter) || array_diff(array_keys($filter), array('parameterName', 'type', 'multiselect', 'searchFallback'))
                || !self::path($filter['parameterName'] ?? null)
                || !in_array($filter['type'] ?? null, $properties['filters']['items']['properties']['type']['enum'], true)
                || !is_bool($filter['multiselect'] ?? null) || !is_bool($filter['searchFallback'] ?? null)
                || in_array($filter['parameterName'], $names, true)
                || ($filter['multiselect'] && $filter['type'] !== 'select')
                || ($filter['searchFallback'] && $filter['type'] !== 'search')) {
                throw new \InvalidArgumentException('Each requested filter needs a unique parameterName, supported native type and boolean multiselect/searchFallback.');
            }
            $names[] = $filter['parameterName'];
        }
        return array('directory' => $value['directory'], 'directoryBinding' => $value['directoryBinding'],
            'directoryFields' => array_values(array_unique(array_map(static function ($field) use ($value) {
                return self::directoryPath($field, $value['directoryBinding']);
            }, $value['directoryFields']))),
            'filtersBinding' => $value['filtersBinding'], 'clearButton' => $value['clearButton'],
            'filters' => array_map(static function ($field) {
                return array('parameterName' => $field['parameterName'], 'type' => $field['type'],
                    'multiselect' => $field['multiselect'], 'searchFallback' => $field['searchFallback']);
            }, array_values($value['filters'])));
    }

    /** Return every missing piece so one same-turn retry can repair the payload. */
    public static function missing(array $requirements, array $options): array
    {
        $missing = array();
        if (($requirements['directory'] || $requirements['filters']) && ($options['layout']['mountMode'] ?? null) !== 'tree') $missing[] = 'canonical tree Layout with configured nodes/grids';
        if ($requirements['directory']) {
            if (($options['menu']['on'] ?? null) !== true) $missing[] = 'menu.on=true';
            if (($options['menu']['binding'] ?? null) !== $requirements['directoryBinding']) $missing[] = 'menu.binding=' . $requirements['directoryBinding'];
            if (!self::hasBinding($options, $requirements['directoryBinding'])) $missing[] = 'Page ' . $requirements['directoryBinding'] . ' Query binding';
            if (!self::placed($options, 'directory')) $missing[] = 'Directory node attached to a Page Layout slot';
            $html = self::directoryHtml($options);
            $normalized = is_string($html) ? preg_replace('/\.\[\d+\]/', '', $html) : '';
            if (preg_match('/\{\{\{?\s*' . ($requirements['directoryBinding'] === 'objects' ? 'Object' : 'Region') . '\./', $normalized)) $missing[] = 'Directory templates use plain row paths such as {{title}}, not Object./Region. prefixes';
            foreach ($requirements['directoryFields'] as $original) if (strpos($normalized, $field = self::directoryPath($original, $requirements['directoryBinding'])) === false) $missing[] = 'Directory template field ' . $field;
        }
        if ($requirements['filters']) {
            if (($options['filters']['on'] ?? null) !== true) $missing[] = 'filters.on=true';
            if (($options['filters']['binding'] ?? null) !== $requirements['filtersBinding']) $missing[] = 'filters.binding=' . $requirements['filtersBinding'];
            if (!self::hasBinding($options, $requirements['filtersBinding'])) $missing[] = 'Page ' . $requirements['filtersBinding'] . ' Query binding';
            if (!self::placed($options, 'filters')) $missing[] = 'Filters node attached to a Page Layout slot';
            if ($requirements['clearButton'] && ($options['filters']['clearButton'] ?? null) !== true) $missing[] = 'filters.clearButton=true';
            foreach ($requirements['filters'] as $wanted) {
                $matches = array_values(array_filter($options['filtersSchema'] ?? array(), static function ($field) use ($wanted) {
                    return is_array($field) && ($field['parameterName'] ?? null) === $wanted['parameterName'];
                }));
                $field = $matches[0] ?? array();
                if (count($matches) !== 1 || ($field['type'] ?? null) !== $wanted['type']
                    || (bool) ($field['multiselect'] ?? false) !== $wanted['multiselect']
                    || ($wanted['searchFallback'] && ($field['searchFallback'] ?? null) !== true)) {
                    $missing[] = 'native ' . $wanted['type'] . ($wanted['multiselect'] ? ' multiselect' : '') . ' filter ' . $wanted['parameterName'];
                    continue;
                }
                if (in_array($wanted['type'], array('select', 'checkboxes', 'radio'), true) && empty($field['options'])) $missing[] = 'source-derived options for ' . $wanted['parameterName'];
            }
        }
        return array_values(array_unique($missing));
    }

    private static function directoryPath(string $path, string $role): string
    {
        return preg_replace($role === 'objects' ? '/^Object\./' : '/^Region\./', '', $path);
    }

    /** Missing HTML inherits the Directory module's title row; explicit blanks do not. */
    private static function directoryHtml(array $options): string
    {
        $templates = $options['templates'] ?? array();
        if (!array_key_exists('directoryItem', $templates)) return '{{title}}';
        $template = $templates['directoryItem'];
        if (is_array($template) && !array_key_exists('html', $template)) return '{{title}}';
        $html = is_array($template) ? $template['html'] : $template;
        return is_string($html) ? $html : '';
    }

    private static function path($value): bool
    {
        return is_string($value) && strlen($value) <= 200 && preg_match('/^[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*$/D', $value);
    }

    private static function hasBinding(array $options, string $role): bool
    {
        // Creation provisions default Saved Queries after the private Collections
        // and SVG Regions exist. Only an explicitly supplied binding needs an ID
        // here; requiring a future generated ID rejects the native defaults.
        if (empty($options['scenes'])) return true;
        $id = \MapSVG\DataLayer\SavedQuery\PageBindingSource::defaultPageId($options);
        foreach ($options['scenes'] ?? array() as $page) if (($page['id'] ?? null) === $id) {
            $bindings = $page['dataBindings'] ?? array();
            if (!is_array($bindings)) return false;
            if (!array_key_exists($role, $bindings)) return true;
            $queryId = $bindings[$role]['queryId'] ?? null;
            return is_string($queryId) && trim($queryId) !== ''
                && $queryId !== ($role === 'regions' ? 'getObjects' : 'getRegions');
        }
        return false;
    }

    private static function placed(array $options, string $type): bool
    {
        if (($options['layout']['mountMode'] ?? '') !== 'tree') return true;
        $nodes = array(); $parents = array(); $roots = array();
        foreach ($options['nodes'] ?? array() as $node) {
            $nodes[$node['id']] = $node;
            foreach ($node['children'] ?? array() as $child) $parents[$child] = $node['id'];
        }
        foreach ($options['layout']['grids'] ?? array() as $grid) foreach ($grid as $item) $roots[] = $item['id'];
        foreach ($nodes as $id => $node) if ($node['type'] === $type && ($node['settings']['on'] ?? true) !== false) {
            $seen = array();
            while (!isset($seen[$id])) {
                if (in_array($id, $roots, true)) return true;
                $seen[$id] = true;
                if (!isset($parents[$id])) break;
                $id = $parents[$id];
            }
        }
        return false;
    }
}
