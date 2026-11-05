<?php

namespace MapSVG\Core;
require_once __DIR__ . '/ModuleRestRegistry.php';

/**
 * Lightweight registry for Pro add-on modules.
 *
 * Lite fires the `mapsvg/register` action after its own bootstrap is complete.
 * Pro add-on plugins hook in, call `ModuleRegistry::register()` with their modules,
 * and those modules are booted in priority order.
 *
 * This ensures:
 * - Pro PHP code is physically absent from the Lite package (no require/autoload of Pro files).
 * - Module boot order is deterministic and traceable.
 * - No Pro code runs if mapsvg-pro is not installed/activated.
 *
 * Usage in mapsvg-pro bootstrap:
 *
 *   add_action('mapsvg/register', function(\MapSVG\Core\ModuleRegistry $registry): void {
 *       $registry->register(new Pro\DataSourceApiModule(), 20);
 *       $registry->register(new Pro\GalleryModule(), 30);
 *   });
 *
 * A module must implement ModuleInterface.
 */
final class ModuleRegistry
{
    /** @var array<int, list<ModuleInterface>> priority-bucketed module list */
    private array $modules = [];

    /** @var bool whether boot() has been called */
    private bool $booted = false;
    private ?ModuleRestRegistry $rest = null;

    public function rest(): ModuleRestRegistry
    {
        if ($this->rest === null) $this->rest = new ModuleRestRegistry();
        return $this->rest;
    }

    /** PSR-4 module sources are absent from Lite and become visible only at boot. */
    public function autoload(string $prefix, string $directory): void
    {
        $prefix = rtrim($prefix, '\\') . '\\';
        spl_autoload_register(static function ($class) use ($prefix, $directory): void {
            if (strpos($class, $prefix) !== 0) return;
            $relative = substr($class, strlen($prefix));
            if (strpos($relative, '..') !== false) return;
            $file = rtrim($directory, '/') . '/' . str_replace('\\', '/', $relative) . '.php';
            if (is_readable($file)) require_once $file;
        });
    }

    /**
     * Register a module at the given priority (lower = earlier).
     * Registration after boot() is a programming error and throws.
     *
     * @param ModuleInterface $module
     * @param int $priority  Default 10; use lower values to boot before default modules.
     */
    public function register(ModuleInterface $module, int $priority = 10): void
    {
        if ($this->booted) {
            throw new \LogicException(
                sprintf(
                    '[MapSVG ModuleRegistry] Cannot register module "%s" after boot.',
                    get_class($module)
                )
            );
        }
        if ($this->has($module->id())) throw new \LogicException('Duplicate MapSVG module: ' . $module->id());
        $this->modules[$priority][] = $module;
    }

    /**
     * Boot all registered modules in priority order.
     * Called by PluginHooks after firing mapsvg/register action.
     */
    public function boot(): void
    {
        if ($this->booted) {
            return;
        }
        $this->booted = true;

        ksort($this->modules);
        foreach ($this->modules as $priorityGroup) {
            foreach ($priorityGroup as $module) {
                $module->boot($this);
            }
        }
        $rest = $this->rest();
        $rest->seal();
        add_action('rest_api_init', [$rest, 'publish'], 20);
    }

    /**
     * Returns true if at least one module with the given id is registered.
     */
    public function has(string $moduleId): bool
    {
        foreach ($this->modules as $priorityGroup) {
            foreach ($priorityGroup as $module) {
                if ($module->id() === $moduleId) {
                    return true;
                }
            }
        }
        return false;
    }
}
