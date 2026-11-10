<?php
namespace MapSVG;
require_once __DIR__ . '/../../Core/CodeEditorFeature.php';

/** Custom CSS/HTML is a product feature, independent of unfiltered_html. */
final class AppPresentationPolicy
{
    private static function fields($value): array
    {
        return is_array($value) || $value instanceof \stdClass ? (array) $value : [];
    }

    private static function catalog(): array
    {
        static $catalog;
        if ($catalog === null) $catalog = json_decode(file_get_contents(__DIR__ . '/builtin-code.json'), true, 512, JSON_THROW_ON_ERROR);
        return $catalog;
    }

    /** Normalize legacy string templates and JSON dictionary transports. */
    private static function slots(array $options): array
    {
        $slots = [];
        $add = static function (array $path, $value) use (&$slots): void {
            if ($value !== '' && $value !== null) $slots[json_encode($path)] = $value;
        };
        $add(['css'], $options['css'] ?? null);
        foreach (self::fields($options['templates'] ?? []) as $name => $template) {
            $entry = is_string($template) ? ['html' => $template] : self::fields($template);
            foreach (['html', 'css'] as $part) $add(['templates', $name, $part], $entry[$part] ?? null);
        }
        // Keep duplicate IDs distinct so an earlier code-bearing node cannot be hidden.
        $seen = [];
        foreach (self::fields($options['nodes'] ?? []) as $index => $node) {
            $node = self::fields($node);
            $id = (string) ($node['id'] ?? $index);
            $occurrence = $seen[$id] ?? 0; $seen[$id] = $occurrence + 1;
            $add(['nodes', $id, $occurrence, 'css'], $node['css'] ?? null);
            $entry = is_string($node['template'] ?? null) ? ['html' => $node['template']] : self::fields($node['template'] ?? []);
            foreach (['html', 'css'] as $part) $add(['nodes', $id, $occurrence, 'template', $part], $entry[$part] ?? null);
        }
        return $slots;
    }

    /** Runtime setCss() substitutes %id% with the numeric map ID before Publish. */
    private static function canonicalizeCss(string $value): string
    {
        return preg_replace('/#mapsvg-map-\d+/', '#mapsvg-map-%id%', $value) ?? $value;
    }

    private static function builtin(array $path, $value): bool
    {
        if (!is_string($value)) return false;
        $catalog = self::catalog();
        $css = $path === ['css'] || end($path) === 'css';
        $compare = $css ? self::canonicalizeCss($value) : $value;
        if ($path === ['css']) return $compare === $catalog['css'];
        if ($path[0] === 'templates') {
            $default = $catalog['templates'][$path[1]][$path[2]] ?? null;
            if ($compare === $default) return true;
        }
        return end($path) === 'html' && in_array($value, $catalog['presets'], true);
    }

    private static function assertSlots(array $next, array $old): void
    {
        foreach (array_unique(array_merge(array_keys($next), array_keys($old))) as $key) {
            $value = $next[$key] ?? null;
            if ($value === ($old[$key] ?? null) || self::builtin(json_decode($key, true), $value)) continue;
            throw new \RuntimeException('Custom CSS/HTML templates require the MapSVG code_editor module.', 403);
        }
    }

    /** Sparse overrides include direct code fields and complete ancestor replacements. */
    private static function overrides(array $options): array
    {
        $result = [];
        foreach (self::fields(self::fields($options['stateGraph'] ?? [])['states'] ?? []) as $state) {
            $state = self::fields($state); $changes = [];
            foreach (self::fields($state['changes'] ?? []) as $change) {
                $change = self::fields($change); $path = $change['path'] ?? [];
                if (!is_array($path) || !$path) continue;
                $tree = $change['value'] ?? null;
                foreach (array_reverse($path) as $key) $tree = [$key => $tree];
                $slots = self::slots($tree);
                $direct = $path[0] === 'css'
                    || ($path[0] === 'templates' && (count($path) <= 2 || in_array($path[2], ['html', 'css'], true)))
                    || ($path[0] === 'nodes' && (count($path) <= 2 || in_array($path[2], ['css', 'template'], true)));
                if ($slots || $direct) $changes[] = ['path' => $path, 'remove' => ($change['remove'] ?? false) === true, 'slots' => $slots];
            }
            if ($changes) $result[] = ['id' => $state['id'] ?? null, 'sceneId' => $state['sceneId'] ?? null, 'parentId' => $state['parentId'] ?? null, 'changes' => $changes];
        }
        return $result;
    }

    public static function assertUnchanged(array $options, array $previous): void
    {
        if (\MapSVG\Core\CodeEditorFeature::isEnabled()) return;
        self::assertSlots(self::slots($options), self::slots($previous));
        $next = self::overrides($options); $old = self::overrides($previous);
        if ($next != $old) {
            // Conservatively retain sparse code overrides exactly. Base presets remain writable.
            throw new \RuntimeException('Changing Scene CSS/HTML templates requires the MapSVG code_editor module.', 403);
        }
    }
}
