<?php

namespace MapSVG\Core;

/**
 * Lite-owned registry for paid add-on declarations and compatibility.
 *
 * Paid plugin files declare themselves during plugins_loaded priority 5.
 * Lite resolves the complete declaration set at priority 10, so the result is
 * independent of WordPress plugin load order. A selected add-on may boot at
 * priority 12, before Lite fires mapsvg/register at priority 15.
 */
final class PaidAddonRegistry
{
    /** @var self|null */
    private static $instance;

    /** @var array<string,array<string,mixed>> */
    private $candidates = array();

    /** @var array<string,mixed>|null */
    private $selected;

    /** @var array{code:string,message:string}|null */
    private $error;

    /** @var bool */
    private $resolved = false;

    /** @var array{plan:?string,version:?string,api_version:?int} */
    private $runtime;

    public function __construct(array $runtime = array())
    {
        $this->runtime = array(
            'plan' => array_key_exists('plan', $runtime)
                ? $runtime['plan']
                : (defined('MAPSVG_PLAN') ? MAPSVG_PLAN : null),
            'version' => array_key_exists('version', $runtime)
                ? $runtime['version']
                : (defined('MAPSVG_VERSION') ? MAPSVG_VERSION : null),
            'api_version' => array_key_exists('api_version', $runtime)
                ? $runtime['api_version']
                : (defined('MAPSVG_ADDON_API_VERSION') ? MAPSVG_ADDON_API_VERSION : null),
        );
    }

    public static function instance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * @param array<string,mixed> $metadata
     */
    public function declare(array $metadata): void
    {
        if ($this->resolved) {
            throw new \LogicException('[MapSVG PaidAddonRegistry] Cannot declare after resolve().');
        }

        $normalized = $this->normalizeMetadata($metadata);
        $slug = $normalized['slug'];

        if (isset($this->candidates[$slug])) {
            if ($this->candidates[$slug] === $normalized) {
                return;
            }
            throw new \LogicException(
                sprintf('[MapSVG PaidAddonRegistry] Conflicting declaration for "%s".', $slug)
            );
        }

        $this->candidates[$slug] = $normalized;
    }

    public function resolve(): void
    {
        if ($this->resolved) {
            return;
        }
        $this->resolved = true;

        if (count($this->candidates) === 0) {
            return;
        }

        if ($this->runtime['plan'] !== 'mapsvg-lite') {
            $this->setError(
                'lite_required',
                'MapSVG paid add-ons require MapSVG Lite as the active base plugin.'
            );
            return;
        }

        if (count($this->candidates) > 1) {
            $slugs = array_keys($this->candidates);
            sort($slugs, SORT_STRING);
            $this->setError(
                'multiple_paid_addons',
                'Only one MapSVG paid add-on can be active at a time. Active add-ons: ' .
                    implode(', ', $slugs) . '.'
            );
            return;
        }

        $candidate = reset($this->candidates);
        if (!is_array($candidate)) {
            return;
        }

        $runtimeApi = $this->runtime['api_version'];
        if (!is_int($runtimeApi) || $runtimeApi !== $candidate['requires_addon_api']) {
            $this->setError(
                'incompatible_addon_api',
                sprintf(
                    '%s requires MapSVG add-on API %d; the active Lite plugin exposes %s.',
                    $candidate['title'],
                    $candidate['requires_addon_api'],
                    is_int($runtimeApi) ? (string) $runtimeApi : 'none'
                )
            );
            return;
        }

        $runtimeVersion = $this->runtime['version'];
        if (
            !is_string($runtimeVersion) ||
            version_compare($runtimeVersion, $candidate['requires_lite_version'], '<')
        ) {
            $this->setError(
                'lite_too_old',
                sprintf(
                    '%s requires MapSVG Lite %s or newer; active version is %s.',
                    $candidate['title'],
                    $candidate['requires_lite_version'],
                    is_string($runtimeVersion) ? $runtimeVersion : 'unknown'
                )
            );
            return;
        }

        $this->selected = $candidate;
    }

    public function isResolved(): bool
    {
        return $this->resolved;
    }

    public function isSelected(string $slug): bool
    {
        return is_array($this->selected) && $this->selected['slug'] === $slug;
    }

    /** @return array<string,mixed>|null */
    public function selected(): ?array
    {
        return $this->selected;
    }

    /** @return array{code:string,message:string}|null */
    public function error(): ?array
    {
        return $this->error;
    }

    /** @return array<string,array<string,mixed>> */
    public function candidates(): array
    {
        return $this->candidates;
    }

    /**
     * @param array<string,mixed> $metadata
     * @return array<string,mixed>
     */
    private function normalizeMetadata(array $metadata): array
    {
        $requiredStrings = array(
            'slug',
            'sku',
            'title',
            'version',
            'plugin_file',
            'requires_lite_version',
        );

        $normalized = array();
        foreach ($requiredStrings as $key) {
            $value = isset($metadata[$key]) ? trim((string) $metadata[$key]) : '';
            if ($value === '') {
                throw new \InvalidArgumentException(
                    sprintf('[MapSVG PaidAddonRegistry] "%s" must be a non-empty string.', $key)
                );
            }
            $normalized[$key] = $value;
        }

        $requiredApi = isset($metadata['requires_addon_api'])
            ? (int) $metadata['requires_addon_api']
            : 0;
        if ($requiredApi < 1) {
            throw new \InvalidArgumentException(
                '[MapSVG PaidAddonRegistry] "requires_addon_api" must be a positive integer.'
            );
        }
        $normalized['requires_addon_api'] = $requiredApi;

        if (!preg_match('/^mapsvg-[a-z0-9-]+$/', $normalized['slug'])) {
            throw new \InvalidArgumentException(
                '[MapSVG PaidAddonRegistry] Add-on slug must use the mapsvg-* namespace.'
            );
        }

        return $normalized;
    }

    private function setError(string $code, string $message): void
    {
        $this->selected = null;
        $this->error = array(
            'code' => $code,
            'message' => $message,
        );
    }
}
