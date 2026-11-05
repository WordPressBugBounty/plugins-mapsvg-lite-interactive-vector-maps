<?php

namespace MapSVG\Core;

/**
 * Contract for Pro add-on modules registered via MapSVG\Core\ModuleRegistry.
 *
 * Each module is responsible for a single bounded feature set (data source, node type, etc.)
 * and must be self-contained: no implicit dependencies on other modules' internal state.
 */
interface ModuleInterface
{
    /**
     * Unique module identifier, e.g. "mapsvg-pro/data-source-api".
     * Used for `has()` checks and debug logging.
     */
    public function id(): string;

    /**
     * Boot the module: register REST routes, WP hooks, filters, etc.
     * Receives the registry so the module can read peer-module state if needed.
     */
    public function boot(ModuleRegistry $registry): void;
}
