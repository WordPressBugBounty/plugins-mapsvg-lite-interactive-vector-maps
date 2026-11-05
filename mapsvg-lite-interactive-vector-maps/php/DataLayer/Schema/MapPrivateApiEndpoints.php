<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

/** Materialize only known local endpoints owned by a Map's private collection. */
final class MapPrivateApiEndpoints
{
    private const SUFFIXES = array(
        'GET:index' => '',
        'GET:show' => '/[:id]',
        'GET:distinct' => '/distinct/[:fieldName]',
        'POST:create' => '',
        'PUT:update' => '/[:id]',
        'POST:import' => '/[:id]/import',
        'DELETE:delete' => '/[:id]',
        'DELETE:clear' => '',
        'DELETE:deleteOrphans' => '/orphans',
    );

    public static function repair(array $data, string $localBaseUrl): array
    {
        $kind = self::localKind($data, $localBaseUrl);
        if ($kind === null) return $data;
        return self::replace($data, $kind, $kind . '_%MAP_ID%', $data['name']);
    }

    public static function copy(array $data, int $sourceMapId, int $targetMapId, string $localBaseUrl): array
    {
        $kind = self::localKind($data, $localBaseUrl);
        if ($kind === null || $sourceMapId < 1 || $targetMapId < 1
            || $data['name'] !== $kind . '_' . $sourceMapId) return $data;
        foreach ($data['apiEndpoints'] as $key => $endpoint) {
            if (!is_array($endpoint) || !is_string($endpoint['url'] ?? null)) continue;
            foreach (array($kind, 'collection') as $resource) {
                foreach (array('', '/') as $leading) {
                    $prefix = $leading . $resource . '/' . $data['name'];
                    $suffix = substr($endpoint['url'], strlen($prefix));
                    if (strpos($endpoint['url'], $prefix) === 0
                        && ($suffix === '' || in_array($suffix[0], array('/', '?', '#'), true))) {
                        $data['apiEndpoints'][$key]['url'] = $leading . $resource . '/' . $kind . '_' . $targetMapId
                            . substr($endpoint['url'], strlen($prefix));
                        break 2;
                    }
                }
            }
        }
        return $data;
    }

    private static function localKind(array $data, string $localBaseUrl): ?string
    {
        if (!empty($data['remote']) || !is_array($data['apiEndpoints'] ?? null)) return null;
        $kind = ($data['type'] ?? null) === 'region' ? 'regions'
            : (($data['type'] ?? null) === 'object' ? 'objects' : null);
        if ($kind === null || !is_string($data['name'] ?? null)
            || !preg_match('/\A' . $kind . '_[1-9][0-9]*\z/', $data['name'])) return null;
        $base = $data['apiBaseUrl'] ?? '';
        if (!is_string($base) || ($base !== '' && rtrim($base, '/') !== rtrim($localBaseUrl, '/'))) return null;
        return $kind;
    }

    private static function replace(array $data, string $kind, string $source, string $target): array
    {
        foreach ($data['apiEndpoints'] as $key => $endpoint) {
            if (!is_array($endpoint)) continue;
            $contract = ($endpoint['method'] ?? '') . ':' . ($endpoint['name'] ?? '');
            if (!array_key_exists($contract, self::SUFFIXES)) continue;
            if ($contract === 'DELETE:deleteOrphans' && $kind !== 'regions') continue;
            $resource = $contract === 'DELETE:deleteOrphans' ? 'collection' : $kind;
            foreach (array('', '/') as $leading) {
                $url = $leading . $resource . '/' . $source . self::SUFFIXES[$contract];
                if (($endpoint['url'] ?? null) === $url) {
                    $data['apiEndpoints'][$key]['url'] = $leading . $resource . '/' . $target . self::SUFFIXES[$contract];
                    break;
                }
            }
        }
        return $data;
    }
}
