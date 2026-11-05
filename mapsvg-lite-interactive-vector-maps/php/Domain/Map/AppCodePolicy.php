<?php

namespace MapSVG;
require_once __DIR__ . "/../../Core/JavascriptFeature.php";

/** Executable slots in full authoring snapshots, including sparse Scene overrides. */
final class AppCodePolicy
{
    public const HOOKS = ['events', 'middlewares', 'onClick', 'mouseOver', 'mouseOut', 'menuOnClick', 'beforeLoad', 'afterLoad'];

    public static function assertUnchanged(array $options, array $previous): void
    {
        if (self::scripts($options) == self::scripts($previous)) return;
        if (!\MapSVG\Core\JavascriptFeature::isEnabled()) throw new \RuntimeException('JavaScript authoring is unavailable in this MapSVG installation.', 403);
        if (!current_user_can('unfiltered_html')) {
            throw new \RuntimeException('Changing App JavaScript requires unfiltered_html.', 403);
        }
    }

    private static function fields($value): array
    {
        return is_array($value) || $value instanceof \stdClass ? (array) $value : [];
    }

    private static function nonempty($value): bool
    {
        if (is_array($value) || $value instanceof \stdClass) {
            foreach ((array) $value as $entry) if (self::nonempty($entry)) return true;
            return false;
        }
        return $value !== null && $value !== '';
    }

    private static function targetsCode(array $path): bool
    {
        $root = $path[0] ?? null;
        if (in_array($root, self::HOOKS, true)) return true;
        if ($root === 'templates') return count($path) < 3 || $path[2] === 'js';
        if ($root === 'nodes') return count($path) < 3 || $path[2] === 'js'
            || ($path[2] === 'template' && (count($path) < 4 || $path[3] === 'js'));
        return false;
    }

    public static function scripts(array $options): array
    {
        $result = [];
        foreach (self::HOOKS as $key) {
            if (isset($options[$key]) && self::nonempty($options[$key])) {
                // JSON transport may decode dictionaries as arrays or stdClass.
                $result[$key] = json_decode(wp_json_encode($options[$key]), true);
            }
        }
        foreach (self::fields($options['templates'] ?? []) as $name => $entry) {
            $entry = self::fields($entry);
            if (self::nonempty($entry['js'] ?? null)) $result['templates'][$name] = $entry['js'];
        }
        foreach (self::fields($options['nodes'] ?? []) as $index => $node) {
            $node = self::fields($node);
            $id = (string) ($node['id'] ?? $index);
            $code = [];
            if (self::nonempty($node['js'] ?? null)) $code['js'] = $node['js'];
            $template = self::fields($node['template'] ?? []);
            if (self::nonempty($template['js'] ?? null)) $code['template'] = $template['js'];
            if ($code) $result['nodes'][] = ['id' => $id, 'code' => $code];
        }
        $graph = self::fields($options['stateGraph'] ?? []);
        foreach (self::fields($graph['states'] ?? []) as $state) {
            $state = self::fields($state);
            $overrides = [];
            foreach (self::fields($state['changes'] ?? []) as $change) {
                $change = self::fields($change);
                $path = $change['path'] ?? [];
                if (!is_array($path) || !$path) continue;
                // Reconstruct just this sparse subtree so ancestor replacements (e.g.
                // all templates or a whole node) receive the same executable-slot policy.
                $tree = $change['value'] ?? null;
                foreach (array_reverse($path) as $key) $tree = [$key => $tree];
                $code = self::scripts($tree);
                if ($code || self::targetsCode($path)) $overrides[] = [
                    'path' => $path, 'remove' => ($change['remove'] ?? false) === true, 'code' => $code,
                ];
            }
            if ($overrides) $result['states'][] = [
                'id' => $state['id'] ?? null,
                'sceneId' => $state['sceneId'] ?? null, 'parentId' => $state['parentId'] ?? null,
                'changes' => $overrides,
            ];
        }
        return json_decode(wp_json_encode($result), true) ?: [];
    }
}
