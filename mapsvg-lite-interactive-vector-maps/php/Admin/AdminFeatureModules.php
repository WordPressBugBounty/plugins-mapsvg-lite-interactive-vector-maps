<?php

namespace MapSVG;

/** Server-owned module selection for the source-only Vite admin entry. */
final class AdminFeatureModules
{
    public static function current(): array
    {
        $addon = class_exists('MapSVG\\Core\\PaidAddonRegistry')
            ? \MapSVG\Core\PaidAddonRegistry::instance()->selected() : null;
        return self::forInstallation(
            defined('MAPSVG_PLUGIN_DIR') ? MAPSVG_PLUGIN_DIR : '',
            defined('MAPSVG_PLAN') ? MAPSVG_PLAN : '',
            $addon,
            defined('WP_PLUGIN_DIR') ? WP_PLUGIN_DIR : '',
            class_exists(AiChatController::class, false)
        );
    }

    public static function forInstallation(
        string $baseDirectory,
        string $basePlan,
        ?array $selectedAddon,
        string $pluginsDirectory,
        bool $sourceAiLoaded = false
    ): array {
        $modules = self::manifestModules($baseDirectory, $basePlan);
        if ($modules === null) {
            $modules = [];
            if (in_array($basePlan, ['lite', 'mapsvg-lite'], true)) {
                // A Lite source checkout can boot its AI module without a built manifest.
                if ($sourceAiLoaded) $modules[] = 'ai_assistant';
            } elseif ($basePlan !== '' && $baseDirectory !== '') {
                // The full source checkout has no installed artifact. Only real admin
                // entry files contribute, never a commercial tier or license status.
                foreach (glob(rtrim($baseDirectory, '/\\') . '/paid/features/*/admin/entry.tsx') ?: [] as $entry) {
                    $modules[] = basename(dirname($entry, 2));
                }
            }
        }
        if ($selectedAddon !== null && is_string($selectedAddon['plugin_file'] ?? null)
            && is_string($selectedAddon['slug'] ?? null) && $pluginsDirectory !== '') {
            $pluginFile = str_replace('\\', '/', $selectedAddon['plugin_file']);
            // WordPress plugin basenames are relative to the active installation.
            if (!preg_match('~(?:^/|^[A-Za-z]:|(?:^|/)\.\.(?:/|$))~', $pluginFile)) {
                $directory = dirname(rtrim($pluginsDirectory, '/\\') . '/' . $pluginFile);
                $modules = array_merge($modules, self::manifestModules($directory, $selectedAddon['slug']) ?? []);
            }
        }
        $modules = array_values(array_unique($modules));
        sort($modules, SORT_STRING);
        return $modules;
    }

    /** Null means a source checkout; an invalid installed manifest fails closed. */
    private static function manifestModules(string $directory, string $slug): ?array
    {
        if ($directory === '') return null;
        $file = rtrim($directory, '/\\') . '/artifact-manifest.json';
        if (!file_exists($file)) return null;
        if (!is_readable($file)) return [];
        $manifest = json_decode((string) file_get_contents($file), true);
        if (!is_array($manifest) || ($manifest['slug'] ?? null) !== $slug
            || !is_array($manifest['ownedFeatureIds'] ?? null)) return [];
        return array_values(array_filter($manifest['ownedFeatureIds'], static function ($id) {
            return is_string($id) && $id !== '';
        }));
    }
}
