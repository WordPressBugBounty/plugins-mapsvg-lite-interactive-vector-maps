<?php

declare(strict_types=1);

namespace MapSVG\DataLayer;

use Plasma\Events\DatabaseEventListener;

/** Trusted-PHP composition factory for the production-default v2 data layer. */
final class DataLayerFactory
{
    private const ALLOWED_OPTIONS = array(
        'force',
        'observe',
        'listener',
        'pluginPrefix',
        'inspector',
    );

    public static function isV2Enabled(): bool
    {
        return RuntimeBackendSelector::isV2Default();
    }

    /**
     * Create an isolated v2 client. Local production composition now selects v2 by default.
     *
     * @param object|null $wpdbInstance
     * @param array<string, mixed> $options
     */
    public static function createV2($wpdbInstance = null, array $options = array()): DataLayerV2
    {
        foreach ($options as $key => $_) {
            if (!is_string($key) || !in_array($key, self::ALLOWED_OPTIONS, true)) {
                throw new \InvalidArgumentException(
                    'Unsupported data-layer factory option: ' . (string) $key
                );
            }
        }
        foreach (array('force', 'observe') as $booleanOption) {
            if (array_key_exists($booleanOption, $options)
                && !is_bool($options[$booleanOption])) {
                throw new \InvalidArgumentException(
                    $booleanOption . ' must be a boolean.'
                );
            }
        }
        if (array_key_exists('pluginPrefix', $options)
            && $options['pluginPrefix'] !== null
            && !is_string($options['pluginPrefix'])) {
            throw new \InvalidArgumentException('pluginPrefix must be a string or null.');
        }

        $forced = isset($options['force']) && $options['force'] === true;
        if (!$forced && !self::isV2Enabled()) {
            throw new \LogicException(
                'MapSVG data layer v2 is disabled by the temporary legacy rollback switch.'
            );
        }

        $listener = $options['listener'] ?? null;
        if ($listener !== null && !$listener instanceof DatabaseEventListener) {
            throw new \InvalidArgumentException(
                'listener must implement Plasma DatabaseEventListener.'
            );
        }

        $observe = array_key_exists('observe', $options)
            ? (bool) $options['observe']
            : (defined('MAPSVG_DEBUG') && MAPSVG_DEBUG === true);
        if ($listener === null && $observe) {
            $listener = new PlasmaDatabaseEventLogger();
        }
        $pluginPrefix = isset($options['pluginPrefix'])
            ? $options['pluginPrefix']
            : null;
        $provider = new PlasmaProvider($wpdbInstance, $pluginPrefix, $listener);

        $inspector = $options['inspector'] ?? $provider->tableInspector();
        if (!$inspector instanceof StorageTableInspector) {
            throw new \InvalidArgumentException(
                'inspector must implement StorageTableInspector.'
            );
        }

        $resolver = new StorageSchemaResolver($inspector);
        $registry = new StorageModelRegistry($provider, $resolver);
        return new DataLayerV2($provider, $resolver, $registry);
    }
}
