<?php

namespace MapSVG;

/**
 * MapSVG AI tools: map lifecycle plus read/patch options (server-side agent loop).
 */
class AiTools
{


	/**
	 * OpenAI-compatible tools array.
	 *
	 * @return array<int, array<string, mixed>>
	 */


	/**
	 * @param array<string, mixed> $args
	 * @return array{ok: bool, result: mixed, options_patch?: array, map_mutation?: array, error?: string}
	 */
	public static function execute(
		string $name,
		array $args,
		int $defaultMapId,
		?array $previewOptions = null,
		bool $previewAvailable = false,
		?array $draftState = null,
		?callable $progress = null
	): array
	{
		if (AiControlCenter::supports($name)) {
			return AiControlCenter::execute(
				$name,
				$args,
				$defaultMapId,
				$previewOptions,
				$previewAvailable,
				$draftState,
				$progress
			);
		}

		$lifecycleAliases = array(
			'create_map' => 'create',
			'duplicate_map' => 'duplicate',
			'delete_map' => 'delete',
		);
		if (isset($lifecycleAliases[$name])) {
			return AiControlCenter::execute(
				'manage_map',
				array_merge($args, array('action' => $lifecycleAliases[$name])),
				$defaultMapId,
				$previewOptions,
				$previewAvailable
			);
		}

		$mapId = isset($args['mapId']) ? (int) $args['mapId'] : $defaultMapId;
		if ($mapId !== $defaultMapId) {
			$previewOptions = null;
		}
		if ($mapId <= 0) {
			return array(
				'ok' => false,
				'result' => null,
				'error' => 'mapId is required. Ask the user to select a map, or pass mapId.',
			);
		}
		if ($name === 'apply_map_options_patch' && $mapId !== $defaultMapId) {
			return array(
				'ok' => false,
				'result' => null,
				'error' => 'Only the currently selected map can be changed in the live preview.',
			);
		}

		try {
			switch ($name) {
				case 'get_map_summary':
					return array('ok' => true, 'result' => self::getMapSummary($mapId, $previewOptions));
				case 'get_map_options':
					$path = isset($args['path']) && is_string($args['path']) ? $args['path'] : '';
					$source = isset($args['source']) && is_string($args['source']) ? $args['source'] : 'current';
					return array('ok' => true, 'result' => self::getMapOptions($mapId, $path, $source, $previewOptions));
				case 'apply_map_options_patch':
					$patch = isset($args['patch']) && is_array($args['patch']) ? $args['patch'] : null;
					if ($patch === null) {
						return array('ok' => false, 'result' => null, 'error' => 'patch object is required');
					}
					return self::applyMapOptionsPatch($mapId, $patch, $previewOptions, $draftState);
				default:
					return array('ok' => false, 'result' => null, 'error' => 'Unknown tool: ' . $name);
			}
		} catch (\Throwable $e) {
			return array(
				'ok' => false,
				'result' => null,
				'error' => $e->getMessage(),
			);
		}
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function getMapSummary(int $mapId, ?array $previewOptions): array
	{
		$map = self::loadMap($mapId);
		$options = $previewOptions ?? (is_array($map->options) ? $map->options : array());
		$database = isset($options['database']) && is_array($options['database']) ? $options['database'] : array();
		$schemas = isset($database['schemas']) && is_array($database['schemas']) ? $database['schemas'] : array();
		$filters = isset($options['filters']) && is_array($options['filters']) ? $options['filters'] : array();
		$pageId = \MapSVG\DataLayer\SavedQuery\PageBindingSource::defaultPageId($options);
		$page = array();
		foreach ($options['scenes'] ?? array() as $candidate) {
			if (($candidate['id'] ?? '') === $pageId) $page = $candidate;
		}
		// Runtime schema IDs can be ephemeral/stale. Resolve persisted Collection identities by name.
		$dataSources = array();
		$schemaRepo = RepositoryFactory::get('schema');
		foreach (array('objects', 'regions') as $role) {
			$binding = isset($schemas[$role]) && is_array($schemas[$role]) ? $schemas[$role] : array();
			$name = trim((string) ($binding['name'] ?? ''));
			if ($name === '') $name = trim((string) ($database[$role . 'TableName'] ?? ''));
			$schema = $name !== '' ? $schemaRepo->findByName($name) : null;
			$queryId = $page['dataBindings'][$role]['queryId'] ?? null;
			$sourceError = null;
			if ($queryId && !in_array($queryId, array('getObjects', 'getRegions'), true)) {
				// The Query owns its Collection. Never substitute a stale v8 App source.
				$schema = null;
				$name = '';
				try {
					$source = \MapSVG\DataLayer\SavedQuery\PageBindingSource::resolve($map, $role, $page['dataBindings'][$role]);
					$schema = $source['schema'];
					$name = $schema->name;
				} catch (\Throwable $e) {
					$sourceError = $e->getMessage();
				}
			}
			$fields = array();
			if ($schema) {
				foreach ($schema->fields as $field) {
					$field = (array) $field;
					$fields[] = array_intersect_key($field, array_flip(array('name', 'type', 'label', 'searchable')));
				}
			}
			$dataSources[$role] = array(
				'queryId' => $queryId,
				'error' => $sourceError,
				'name' => $name !== '' ? $name : null,
				'schemaId' => $schema ? (int) $schema->id : null,
				'fields' => $fields,
			);
		}

		return array(
			'mapId' => $mapId,
			'optionsSource' => $previewOptions !== null ? 'preview' : 'db',
			'title' => is_string($map->title) ? $map->title : (isset($options['title']) ? $options['title'] : ''),
			'source' => isset($options['source']) ? $options['source'] : null,
			'filtersOn' => !empty($filters['on']),
			'filtersSource' => $filters['source'] ?? 'database',
			'directoryBinding' => $options['menu']['binding'] ?? (($options['menu']['source'] ?? '') === 'regions' ? 'regions' : 'objects'),
			'filtersBinding' => $filters['binding'] ?? (($filters['source'] ?? '') === 'regions' ? 'regions' : 'objects'),
			'layoutMode' => ($options['layout']['mountMode'] ?? null) === 'tree' ? 'tree' : 'legacy',
			'layout' => $options['layout'] ?? null,
			'nodes' => $options['nodes'] ?? array(),
			'pages' => $options['scenes'] ?? array(),
			'defaultPageId' => $pageId,
			'dataSources' => $dataSources,
			'filterControlsPath' => 'filtersSchema',
			'filterControls' => isset($options['filtersSchema']) && is_array($options['filtersSchema'])
				? $options['filtersSchema'] : array(),
			'regionsSchema' => $dataSources['regions']['name'],
			'objectsSchema' => $dataSources['objects']['name'],
		);
	}

	/**
	 * @return array{mapId: int, source: string, path: string, value: mixed}
	 */
	private static function getMapOptions(int $mapId, string $path, string $source, ?array $previewOptions)
	{
		$map = self::loadMap($mapId);
		return self::optionsResult(
			$mapId,
			is_array($map->options) ? $map->options : array(),
			$previewOptions,
			$path,
			$source
		);
	}

	/**
	 * Resolve the requested source and path without touching WordPress storage.
	 * @param array<string, mixed> $savedOptions
	 * @param array<string, mixed>|null $previewOptions
	 * @return array{mapId: int, source: string, path: string, value: mixed}
	 */
	public static function optionsResult(int $mapId, array $savedOptions, ?array $previewOptions, string $path = '', string $source = 'current'): array
	{
		if (!in_array($source, array('current', 'preview', 'db'), true)) {
			throw new \InvalidArgumentException('source must be current, preview, or db');
		}
		if ($source === 'preview' && $previewOptions === null) {
			throw new \InvalidArgumentException('Live preview snapshot is unavailable for this map');
		}
		$usePreview = $source !== 'db' && $previewOptions !== null;
		$options = $usePreview ? $previewOptions : $savedOptions;
		$path = trim($path);
		return array(
			'mapId' => $mapId,
			'source' => $usePreview ? 'preview' : 'db',
			'path' => $path,
			'value' => $path === '' ? $options : self::getByPath($options, $path),
		);
	}

	/**
	 * @param array<string, mixed> $patch
	 * @return array{ok: bool, result: mixed, options_patch?: array, error?: string}
	 */
	private static function applyMapOptionsPatch(int $mapId, array $patch, ?array $previewOptions, ?array $draftState = null): array
	{
		if (count($patch) === 0) {
			return array('ok' => false, 'result' => null, 'error' => 'patch is empty');
		}

		// Keep the compatibility alias on the same validation/projection path.
		$result = AiControlCenter::execute('manage_options', array('action' => 'merge', 'patch' => $patch), $mapId, $previewOptions, $previewOptions !== null, $draftState);
		if (!empty($result['ok'])) $result['result']['queuedKeys'] = array_keys($patch);
		return $result;
	}

	/**
	 * @return Map
	 */
	private static function loadMap(int $mapId)
	{
		$repo = RepositoryFactory::get('map');
		$map = $repo->findById($mapId);
		if (!$map) {
			throw new \Exception('Map not found: ' . $mapId);
		}
		if (!empty($map->optionsBroken)) {
			throw new \Exception('Map options are broken in the database.');
		}
		return $map;
	}

	/**
	 * @param array<string, mixed> $data
	 * @return mixed
	 */
	private static function getByPath(array $data, string $path)
	{
		$parts = explode('.', $path);
		$cur = $data;
		foreach ($parts as $part) {
			if ($part === '') {
				continue;
			}
			if (!is_array($cur) || !array_key_exists($part, $cur)) {
				return null;
			}
			$cur = $cur[$part];
		}
		return $cur;
	}

	/**
	 * Assoc-aware deep merge (patch wins). Indexed arrays are replaced, not concatenated.
	 *
	 * @param array<string, mixed> $base
	 * @param array<string, mixed> $patch
	 * @return array<string, mixed>
	 */
	public static function deepMerge(array $base, array $patch): array
	{
		foreach ($patch as $key => $value) {
			if (
				is_array($value)
				&& self::isAssoc($value)
				&& isset($base[$key])
				&& is_array($base[$key])
				&& self::isAssoc($base[$key])
			) {
				$base[$key] = self::deepMerge($base[$key], $value);
			} else {
				$base[$key] = $value;
			}
		}
		return $base;
	}

	/**
	 * @param array<mixed> $arr
	 */
	private static function isAssoc(array $arr): bool
	{
		if ($arr === array()) {
			return true;
		}
		return array_keys($arr) !== range(0, count($arr) - 1);
	}
}
