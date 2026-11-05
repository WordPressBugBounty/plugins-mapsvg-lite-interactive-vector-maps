<?php

declare(strict_types=1);

namespace MapSVG\DataLayer;

use Plasma\Adapter\DatabaseAdapter;
use Plasma\Adapter\EventDatabaseAdapter;
use Plasma\Events\DatabaseEventDispatcher;
use Plasma\Events\DatabaseEventListener;
use Plasma\Plasma;
use Plasma\WordPress\WpdbAdapter;

/** Creates isolated Plasma clients on the current WordPress connection. */
final class PlasmaProvider
{
    /** @var object */
    private $wpdb;

    private string $pluginPrefix;
    private ?DatabaseEventListener $listener;

    /**
     * @param object|null $wpdbInstance WordPress wpdb-compatible object
     */
    public function __construct(
        $wpdbInstance = null,
        ?string $pluginPrefix = null,
        ?DatabaseEventListener $listener = null
    ) {
        if ($wpdbInstance === null) {
            global $wpdb;
            $wpdbInstance = $wpdb;
        }
        if (!is_object($wpdbInstance) || !isset($wpdbInstance->prefix)) {
            throw new \RuntimeException('WordPress $wpdb is not available.');
        }

        $pluginPrefix = $pluginPrefix ?? (defined('MAPSVG_PREFIX') ? MAPSVG_PREFIX : null);
        if (!is_string($pluginPrefix) || !preg_match('/^[A-Za-z0-9_]+$/D', $pluginPrefix)) {
            throw new \InvalidArgumentException('MapSVG table prefix is invalid.');
        }

        $this->wpdb = $wpdbInstance;
        $this->pluginPrefix = $pluginPrefix;
        $this->listener = $listener;
    }

    public function createClient(): Plasma
    {
        return new Plasma($this->createAdapter());
    }

    public function createAdapter(): DatabaseAdapter
    {
        $adapter = new WpdbAdapter($this->pluginPrefix, $this->wpdb);
        if ($this->listener === null) {
            return $adapter;
        }

        $dispatcher = new DatabaseEventDispatcher();
        $dispatcher->addListener($this->listener);
        return new EventDatabaseAdapter($adapter, $dispatcher);
    }

    public function tableInspector(): WpdbTableInspector
    {
        return new WpdbTableInspector($this->wpdb, $this->pluginPrefix);
    }

    public function physicalPrefix(): string
    {
        return (string) $this->wpdb->prefix . $this->pluginPrefix;
    }

    /** @return object */
    public function wpdb()
    {
        return $this->wpdb;
    }
}
