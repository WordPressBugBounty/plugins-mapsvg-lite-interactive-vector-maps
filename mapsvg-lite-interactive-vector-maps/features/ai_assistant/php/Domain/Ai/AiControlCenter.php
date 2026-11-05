<?php

namespace MapSVG;

require_once __DIR__ . '/AiMapRegions.php';
require_once __DIR__ . '/AiImageMaps.php';

/**
 * Unified execution layer for AI administration of MapSVG resources.
 *
 * AiTools is the provider-facing facade. This class owns the actual CRUD
 * semantics so new domains can be added without growing one monolithic switch.
 */
final class AiControlCenter
{
	private const MAX_QUERY_ROWS = 100;

	/** Reject legacy placement writes that cannot change an explicit tree Layout. */
	public static function validateOptionsChange(array $current, array $next, array $writtenPaths = array()): void
	{
		if (isset($next['regionDataRules']) && (self::optionChanged($current, $next, 'regionDataRules', $writtenPaths))) {
			self::validateRegionRules($next['regionDataRules']);
		}
		if (($current['layout']['mountMode'] ?? null) !== 'tree'
			&& ($next['layout']['mountMode'] ?? null) !== 'tree') return;
		$templateWrite = false;
		foreach ($writtenPaths as $path) if ($path === 'menu.template' || strpos($path, 'menu.template.') === 0) $templateWrite = true;
		if (array_key_exists('template', $next['menu'] ?? array()) && ($templateWrite
			|| self::getByPath($current, 'menu.template') !== self::getByPath($next, 'menu.template'))) {
			throw new \InvalidArgumentException('menu.template is not the Directory row template. Edit templates.directoryItem.html using plain row paths such as {{title}}; preserve its css/js/type. No preview change was queued.');
		}
		$paths = array('containers.leftSidebar', 'containers.rightSidebar', 'containers.header', 'containers.footer',
			'menu.location', 'menu.locationMobile', 'filters.location', 'detailsView.location');
		foreach ($paths as $path) {
			$explicitWrite = false;
			foreach ($writtenPaths as $written) {
				if ($written === $path || strpos($written, $path . '.') === 0 || strpos($path, $written . '.') === 0) $explicitWrite = true;
			}
			if ($explicitWrite || self::getByPath($current, $path) !== self::getByPath($next, $path)) {
				throw new \InvalidArgumentException('This App uses the tree Layout. ' . $path
					. ' is legacy placement and cannot move/hide its components. Read layout, nodes and scenes; use layout.grids for sidebar visibility/geometry at every breakpoint, and nodes[].children plus settings.placement.parentId for Directory/Filters placement. Preserve Page dataBindings. See get_doc("scenes-layers-nodes").');
			}
		}
		if (($current['layout']['mountMode'] ?? null) === 'tree' && ($next['layout']['mountMode'] ?? null) !== 'tree') {
			throw new \InvalidArgumentException('Keep layout.mountMode="tree"; reverting to legacy placement is not supported.');
		}
		if (self::optionChanged($current, $next, 'nodes', $writtenPaths)
			|| self::optionChanged($current, $next, 'scenes', $writtenPaths)
			|| self::optionChanged($current, $next, 'layout.grids', $writtenPaths)) self::validateNodeTree($next);
	}

	private static function optionChanged(array $current, array $next, string $path, array $writtenPaths): bool
	{
		foreach ($writtenPaths as $written) {
			if ($written === $path || strpos($written, $path . '.') === 0 || strpos($path, $written . '.') === 0) return true;
		}
		return self::getByPath($current, $path) !== self::getByPath($next, $path);
	}

	/** Provider JSON is untrusted: reject malformed full-array writes before any SSE edit. */
	private static function validateNodeTree(array $options): void
	{
		$fail = static function (): void { throw new \InvalidArgumentException('Invalid tree Layout: nodes must be the complete flat JSON array with unique id/type, children as existing node IDs, one parent per child and no cycles. Preserve all existing nodes, Page roots, Body and dataBindings. Read manage_options(get) and get_doc("scenes-layers-nodes"), then retry; no preview change was queued.'); };
		$nodes = $options['nodes'] ?? null;
		if (!is_array($nodes) || !$nodes || self::isAssoc($nodes)) $fail();
		$byId = array(); $parents = array();
		foreach ($nodes as $node) {
			if (!is_array($node) || !is_string($node['id'] ?? null) || trim($node['id']) === ''
				|| !is_string($node['type'] ?? null) || $node['type'] === '' || isset($byId[$node['id']])) $fail();
			$byId[$node['id']] = $node;
		}
		foreach ($nodes as $node) {
			$children = $node['children'] ?? array();
			if (!is_array($children) || ($children !== array() && self::isAssoc($children))) $fail();
			foreach ($children as $child) {
				if (!is_string($child) || !isset($byId[$child]) || isset($parents[$child])) $fail();
				$parents[$child] = $node['id'];
			}
		}
		foreach ($byId as $id => $node) {
			$seen = array(); $cursor = $id;
			while (isset($parents[$cursor])) {
				if (isset($seen[$cursor])) $fail();
				$seen[$cursor] = true; $cursor = $parents[$cursor];
			}
			$declared = $node['settings']['placement']['parentId'] ?? null;
			if ($declared !== null && ($parents[$id] ?? null) !== $declared) $fail();
		}
		foreach ($options['scenes'] ?? array() as $scene) {
			if (!is_array($scene) || !isset($byId[$scene['rootNodeId'] ?? '']) || !isset($byId[$scene['bodyNodeId'] ?? ''])
				|| $byId[$scene['bodyNodeId']]['type'] !== 'body') $fail();
		}
		foreach ($options['layout']['grids'] ?? array() as $grid) {
			if (!is_array($grid) || ($grid !== array() && self::isAssoc($grid))) $fail();
			foreach ($grid as $cell) if (!is_array($cell) || ($byId[$cell['id'] ?? '']['type'] ?? null) !== 'slot') $fail();
		}
	}

	private static function validateRegionRules($rules): void
	{
		$fail = static function (string $detail = ''): void { throw new \InvalidArgumentException('Invalid regionDataRules. ' . $detail . ' Use the complete native version:1 object (on/source/field/mode/rows/gradient/exceptions/priority/multiple/legend); read get_doc("region-data-rules"). No preview change was queued.'); };
		if (!is_array($rules) || ($rules['version'] ?? null) !== 1 || !is_bool($rules['on'] ?? null)
			|| !in_array($rules['source'] ?? null, array('regions', 'objects'), true)
			|| !is_string($rules['field'] ?? null) || trim($rules['field']) === ''
			|| !in_array($rules['mode'] ?? null, array('values', 'ranges', 'gradient'), true)) $fail();
		if (!in_array($rules['multiple'] ?? null, array('first', 'special'), true)) $fail('multiple supports only first or special; average/sum aggregation is not implemented.');
		if (!is_array($rules['rows'] ?? null) || ($rules['rows'] !== array() && self::isAssoc($rules['rows'])) || !is_array($rules['gradient'] ?? null)) $fail();
		$gradient = $rules['gradient'];
		foreach (array('min', 'max') as $bound) {
			if (!array_key_exists($bound, $gradient) || ($gradient[$bound] !== null && !is_int($gradient[$bound]) && !is_float($gradient[$bound]))) $fail();
		}
		if (!is_string($gradient['low'] ?? null) || !is_string($gradient['high'] ?? null)
			|| ($gradient['min'] !== null && $gradient['max'] !== null && $gradient['min'] > $gradient['max'])) $fail();
		$priority = $rules['priority'] ?? null;
		if (!is_array($priority) || count($priority) !== 3 || array_diff(array('filtered', 'noObjects', 'field'), $priority)) $fail();
		foreach (array('noData', 'unmatched', 'filtered', 'noObjects', 'multiple') as $key) {
			if (!is_bool($rules['exceptions'][$key]['on'] ?? null) || !is_string($rules['exceptions'][$key]['color'] ?? null)) $fail();
		}
		if (!is_bool($rules['legend']['on'] ?? null) || !is_string($rules['legend']['title'] ?? null)) $fail();
		foreach ($rules['rows'] as $i => $row) {
			if (!is_array($row) || !is_string($row['color'] ?? null) || !is_string($row['label'] ?? null) || !array_key_exists('value', $row)) $fail();
			if ($rules['mode'] !== 'ranges') continue;
			foreach (array('from', 'to') as $bound) if (isset($row[$bound]) && !is_int($row[$bound]) && !is_float($row[$bound])) $fail();
			$from = $row['from'] ?? -INF; $to = $row['to'] ?? INF;
			if ($from >= $to) $fail('Range from must be below to.');
			foreach (array_slice($rules['rows'], 0, $i) as $other) if ($from < ($other['to'] ?? INF) && ($other['from'] ?? -INF) < $to) $fail('Ranges must not overlap.');
		}
	}

	/** Do not acknowledge a marker write when native normalization would discard its coordinates. */
	public static function validateRecordLocations(array $fields, array $record): void
	{
		foreach ($fields as $field) {
			$name = $field['name'] ?? '';
			if (($field['type'] ?? '') !== 'location' || !array_key_exists($name, $record)) continue;
			$value = $record[$name];
			if ($value === null || $value === '' || $value === array()) continue;
			try { $normal = (new \MapSVG\DataLayer\Location\LocationNormalizer())->fromPublic($value); }
			catch (\InvalidArgumentException $error) { throw new \InvalidArgumentException('Invalid Location in ' . $name . ': ' . $error->getMessage() . ' No record was written.', 0, $error); }
			$public = $normal->publicLocation();
			if ($normal->isEmpty() || (is_array($value) && ((isset($value['geoPoint']) && empty($public['geoPoint'])) || (isset($value['svgPoint']) && empty($public['svgPoint']))))) {
				throw new \InvalidArgumentException('Invalid Location in ' . $name . ': use {"geoPoint":{"lat":51.5,"lng":-0.1}} for coordinates, {"svgPoint":{"x":100,"y":200}} for SVG coordinates, or a native address object. Flat {lat,lng} is not a Location. No record was written.');
			}
		}
	}

	/** Native r2o normalization silently discards incomplete targets; reject them before writes. */
	public static function validateRecordRegionLinks(array $fields, array $record): void
	{
		foreach ($fields as $field) {
			$name = $field['name'] ?? '';
			if (!Schema::isRelationFieldType($field['type'] ?? null) || !array_key_exists($name, $record)) continue;
			$value = $record[$name];
			if ($value === null || $value === '' || $value === array()) continue;
			$fail = static function () use ($name): void { throw new \InvalidArgumentException('Invalid Region relation in ' . $name . ': use [{"id":"actual-region-id","tableName":"actual_regions_collection"}], not plain IDs. Read the Region Collection and preserve unrelated links. No record was written.'); };
			if (!is_array($value) || array_values($value) !== $value) $fail();
			foreach ($value as $link) {
				if (!is_array($link) || !is_string($link['tableName'] ?? null) || !isset($link['id'])) $fail();
				try { new \MapSVG\DataLayer\Relation\RegionRelationLink($link['tableName'], $link['id']); }
				catch (\InvalidArgumentException $error) { $fail(); }
			}
		}
	}

	/** Empty-object writes still target their parent; indexed arrays are whole values. */
	private static function optionWritePaths(array $patch, string $prefix = ''): array
	{
		$paths = array();
		foreach ($patch as $key => $value) {
			$path = $prefix === '' ? (string) $key : $prefix . '.' . $key;
			if (is_array($value) && $value !== array() && self::isAssoc($value)) {
				$paths = array_merge($paths, self::optionWritePaths($value, $path));
			} else $paths[] = $path;
		}
		return $paths;
	}

	/** @return array<int, array<string,mixed>> */


	public static function supports(string $name): bool
	{
		return in_array($name, array(
			'inspect_image_map',
			'create_image_map',
			'detect_map_regions',
			'apply_map_regions',
			'replace_map_region_outline',
			'inspect_csv',
			'provision_map_from_csv',
			'provision_collection_from_csv',
			'manage_assets',
			'manage_map',
			'manage_options',
			'manage_draft',
			'manage_schema',
			'get_wordpress_source',
			'manage_repository',
			'manage_repository_batch',
			'manage_query',
			'manage_connection',
			'manage_global_settings',
		), true);
	}
	/**
	 * @param array<string,mixed> $args
	 * @param array<string,mixed>|null $previewOptions
	 * @return array<string,mixed>
	 */
	public static function execute(
		string $name,
		array $args,
		int $defaultMapId,
		?array $previewOptions = null,
		bool $previewAvailable = false,
		?array $draftState = null,
		?callable $progress = null
	): array {
		try {
			switch ($name) {
				case 'inspect_image_map': return AiImageMaps::inspect($args);
				case 'create_image_map': return self::createImageMap($args, $progress);
				case 'detect_map_regions': return AiMapRegions::detect($args, $defaultMapId, $draftState, $progress);
				case 'replace_map_region_outline': return AiMapRegions::replace($args, $defaultMapId, $draftState);
				case 'apply_map_regions': return AiMapRegions::apply($args, $defaultMapId, $draftState);
				case 'inspect_csv':
					return self::inspectCsv($args);
				case 'provision_map_from_csv':
					return self::provisionMapFromCsv($args, $defaultMapId);
				case 'provision_collection_from_csv':
					return self::provisionCollectionFromCsv($args);
				case 'manage_assets':
					return self::manageAssets($args);
				case 'manage_map':
					return self::manageMap($args, $defaultMapId);
				case 'manage_options':
					return self::manageOptions(
						$args,
						$defaultMapId,
						$previewOptions,
						$previewAvailable,
						$draftState
					);
				case 'manage_draft':
					return self::manageDraft($args, $defaultMapId, $previewAvailable, $draftState);
				case 'get_wordpress_source':
					return self::getWordpressSource($args);
				case 'manage_schema':
					return self::manageSchema($args);
				case 'manage_repository':
					return self::manageRepository($args);
				case 'manage_repository_batch':
					return self::manageRepositoryBatch($args);
				case 'manage_query':
					return self::manageQuery($args, $defaultMapId, $previewOptions, $previewAvailable);
				case 'manage_connection':
					return self::manageConnection($args);
				case 'manage_global_settings':
					return self::manageGlobalSettings($args);
				default:
					return self::failure('Unknown control-center tool: ' . $name);
			}
		} catch (\Throwable $error) {
			return self::failure($error->getMessage());
		}
	}

	/** @return array<string,mixed> */


	/** @param array<string,mixed> $args */
	private static function inspectCsv(array $args): array
	{
		$url = isset($args['csvUrl']) ? trim((string) $args['csvUrl']) : '';

		$sampleSize = isset($args['sampleSize'])
			? (int) $args['sampleSize']
			: CsvSchemaInferencer::DEFAULT_SAMPLE_SIZE;

		$analysis = self::withCsvArtifact($args, static function ($artifact) use ($url, $sampleSize) {
			return $artifact !== null ? (new CsvSchemaInferencer())->analyzeFile($artifact['path'], $sampleSize)
				: (new CsvSchemaInferencer())->analyzeRemoteUrl($url, $sampleSize);
		});
		if (!empty($args['attachmentId'])) $analysis['source'] = array('type' => 'attachment', 'attachmentId' => $args['attachmentId']);

		$analysis['provisioning'] = array(
			'available' => true,
			'tools' => array('provision_collection_from_csv', 'provision_map_from_csv'),
			'tool' => 'provision_map_from_csv',
			'instructions' => 'For a request for only DB/database/Collection/table, use provision_collection_from_csv with the same attachmentId or csvUrl and a title; do not create a Map or ask for an SVG. Only when the user requests a new map use provision_map_from_csv with source and all initial options. Both import all rows using native schema inference. Inspection alone does not authorize creation.',
		);
		return self::success($analysis);
	}

	/** @return array<string,mixed> */


	/** @param array<string,mixed> $args */
	private static function provisionMapFromCsv(
		array $args,
		int $defaultMapId
	): array {
		// AI fields are type/name overrides, never an implicit column allowlist.
		$args['preserveUnmappedColumns'] = true;
		if (!empty($args['mapOptions']) && is_array($args['mapOptions'])) {
			$initial = NewMapDefaults::apply($args['mapOptions'], NewMapDefaults::AI);
			self::validateOptionsChange($initial, $initial, self::optionWritePaths($args['mapOptions']));
		}
		$result = self::withCsvArtifact($args, static function ($artifact) use ($args, $defaultMapId) {
			return (new CsvMapProvisioningService())->provision($args, $defaultMapId, $artifact);
		});
		$map = (array) ($result['map'] ?? []);
		$mapId = (int) ($map['mapId'] ?? 0);
		if ($mapId <= 0) {
			return self::failure('Provisioning completed without a map id.');
		}

		$title = (string) ($map['title'] ?? ('Map #' . $mapId));
		return array(
			'ok' => true,
			'result' => $result,
			'map_mutation' => array(
				'action' => 'created',
				'map' => array(
					'mapId' => $mapId,
					'title' => $title,
				),
			),
			'open_map' => array(
				'mapId' => $mapId,
				'title' => $title,
			),
		);
	}

	/** @return array<string,mixed> */


	private static function withCsvArtifact(array $args, callable $callback): array
	{
		$id = trim((string) ($args['attachmentId'] ?? ''));
		$url = trim((string) ($args['csvUrl'] ?? ''));
		if (($id === '') === ($url === '')) throw new \InvalidArgumentException('Provide exactly one of attachmentId or csvUrl.');
		if (!AiCsvAttachments::allowed()) throw new \RuntimeException('CSV import is unavailable for this user or installation.', 403);
		return $id !== '' ? AiCsvAttachments::withArtifact($id, $callback) : $callback(null);
	}

	private static function provisionCollectionFromCsv(array $args): array
	{
		$args['preserveUnmappedColumns'] = true;
		$result = self::withCsvArtifact($args, static function ($artifact) use ($args) {
			return (new CsvMapProvisioningService())->provisionCollection($args, $artifact);
		});
		return array('ok' => true, 'result' => $result,
			'schema_mutation' => array('action' => 'created', 'schema' => self::schemaEventPayload($result['schema'])));
	}



	/** @param array<string,mixed> $args */
	private static function manageAssets(array $args): array
	{
		$action = (string) ($args['action'] ?? '');
		if ($action === 'roots') {
			return self::success(array(
				'roots' => self::assetRoots(),
				'note' => 'Use relativeUrl returned by action=list in MapSVG settings. Absolute server paths are intentionally not exposed.',
			));
		}
		if ($action !== 'list') {
			return self::failure('Unsupported assets action: ' . $action);
		}

		$kind = (string) ($args['kind'] ?? 'all');
		if (!in_array($kind, array('all', 'svg', 'marker', 'image'), true)) {
			return self::failure('kind must be all, svg, marker, or image');
		}
		$search = strtolower(trim((string) ($args['search'] ?? '')));
		$limit = isset($args['limit'])
			? max(1, min(200, (int) $args['limit']))
			: 100;

		$items = array();
		$seen = array();

		if ($kind === 'all' || $kind === 'svg') {
			self::appendAssetFiles(
				$items,
				$seen,
				(new SVGFileRepository())->find(),
				'svg',
				$search
			);
		}

		if ($kind === 'all' || $kind === 'marker') {
			self::appendAssetFiles(
				$items,
				$seen,
				(new MarkersRepository())->find(),
				'marker',
				$search
			);
		}

		if ($kind === 'all' || $kind === 'image') {
			$images = new FilesRepository(
				array(MAPSVG_UPLOADS_DIR),
				MAPSVG_UPLOADS_DIR,
				array('gif', 'png', 'jpg', 'jpeg', 'webp', 'avif')
			);
			self::appendAssetFiles(
				$items,
				$seen,
				$images->find(),
				'image',
				$search
			);
		}

		usort($items, static function (array $a, array $b): int {
			$score = ($b['_score'] ?? 0) <=> ($a['_score'] ?? 0);
			if ($score !== 0) return $score;
			return strcasecmp((string) $a['name'], (string) $b['name']);
		});

		$items = array_slice($items, 0, $limit);
		foreach ($items as &$item) unset($item['_score']);
		unset($item);

		return self::success(array(
			'kind' => $kind,
			'search' => $search,
			'roots' => self::assetRoots(),
			'items' => $items,
		));
	}

	/**
	 * @param array<int,array<string,mixed>> $items
	 * @param array<string,bool> $seen
	 * @param array<int,mixed> $files
	 */
	private static function appendAssetFiles(
		array &$items,
		array &$seen,
		array $files,
		string $kind,
		string $search
	): void {
		foreach ($files as $file) {
			$relativeUrl = isset($file->relativeUrl)
				? (string) $file->relativeUrl
				: '';
			if ($relativeUrl === '') continue;

			$name = isset($file->name) ? (string) $file->name : basename($relativeUrl);
			$pathShort = isset($file->pathShort) ? (string) $file->pathShort : '';
			$origin = self::assetOrigin($file, $kind);

			// Uploaded SVG marker icons live under uploads/mapsvg/markers and
			// must never be offered as SVG map sources.
			if ($kind === 'svg' && $origin === 'uploads/mapsvg/markers') {
				continue;
			}

			$key = $relativeUrl;
			if (isset($seen[$key])) continue;
			$haystack = strtolower($name . ' ' . $relativeUrl . ' ' . $pathShort . ' ' . $origin);
			$score = 0;

			if ($search !== '') {
				if (strpos($haystack, $search) !== false) $score += 10;
				$tokens = preg_split('/\s+/', $search) ?: array();
				foreach ($tokens as $token) {
					if ($token !== '' && strpos($haystack, $token) !== false) {
						$score++;
					}
				}
				if ($score === 0) continue;
			}

			$seen[$key] = true;
			$items[] = array(
				'kind' => $kind,
				'name' => $name,
				'relativeUrl' => $relativeUrl,
				'pathShort' => $pathShort,
				'origin' => $origin,
				'_score' => $score,
			);
		}
	}

	/** @param mixed $file */
	private static function assetOrigin($file, string $kind): string
	{
		$serverPath = isset($file->serverPath) ? (string) $file->serverPath : '';
		if (
			defined('MAPSVG_MAPS_DIR')
			&& MAPSVG_MAPS_DIR
			&& strpos($serverPath, (string) MAPSVG_MAPS_DIR) === 0
		) {
			return 'plugin/maps';
		}
		if (
			defined('MAPSVG_PINS_DIR')
			&& MAPSVG_PINS_DIR
			&& strpos($serverPath, (string) MAPSVG_PINS_DIR) === 0
		) {
			return 'plugin/markers';
		}
		if (
			defined('MAPSVG_UPLOADS_DIR')
			&& strpos(
				$serverPath,
				MAPSVG_UPLOADS_DIR . DIRECTORY_SEPARATOR . 'markers'
			) === 0
		) {
			return 'uploads/mapsvg/markers';
		}
		if (
			defined('MAPSVG_UPLOADS_DIR')
			&& strpos($serverPath, MAPSVG_UPLOADS_DIR) === 0
		) {
			return 'uploads/mapsvg';
		}
		return $kind === 'marker' ? 'marker' : 'unknown';
	}

	/** @return array<int,array<string,string>> */
	private static function assetRoots(): array
	{
		return array(
			array(
				'key' => 'plugin/maps',
				'purpose' => 'Bundled read-only SVG map library shipped with MapSVG.',
				'urlPrefix' => defined('MAPSVG_MAPS_URL') ? (string) MAPSVG_MAPS_URL : '',
			),
			array(
				'key' => 'plugin/markers',
				'purpose' => 'Bundled read-only marker/pin images shipped with MapSVG.',
				'urlPrefix' => defined('MAPSVG_PINS_URL') ? (string) MAPSVG_PINS_URL : '',
			),
			array(
				'key' => 'uploads/mapsvg',
				'purpose' => 'User-owned MapSVG uploads. May contain custom SVG maps and images.',
				'urlPrefix' => defined('MAPSVG_UPLOADS_URL') ? (string) MAPSVG_UPLOADS_URL : '',
			),
			array(
				'key' => 'uploads/mapsvg/markers',
				'purpose' => 'User-uploaded custom marker images.',
				'urlPrefix' => defined('MAPSVG_UPLOADS_URL')
					? (string) MAPSVG_UPLOADS_URL . 'markers/'
					: '',
			),
		);
	}

	/** @return array<string,mixed> */


	/** @return array<string,mixed> */


	/** @return array<string,mixed> */

	/** Read native WP data before a MapSVG Collection exists; never creates bridge rows. */


	private static function getWordpressSource(array $args): array
	{
		if (!current_user_can('edit_posts')) return self::failure('You cannot inspect WordPress sources.');
		$repo = new PostTypesRepository();
		$types = array_values(array_filter($repo->find(), static function ($type) {
			$object = get_post_type_object($type);
			return $object && current_user_can($object->cap->edit_posts);
		}));
		$type = $args['postType'] ?? '';
		$describe = static function ($type) {
			$object = get_post_type_object($type);
			return array('postType' => $type, 'label' => (string) $object->label,
				'singularLabel' => (string) ($object->labels->singular_name ?? $object->label));
		};
		if ($type === '') return self::success(array('postTypes' => $types, 'sources' => array_map($describe, $types)));
		if (!is_string($type) || !in_array($type, $types, true)) return self::failure('Unknown or inaccessible WordPress post type.');
		$metadata = $repo->get($type);
		$keys = $args['metaKeys'] ?? array();
		if (!is_array($keys) || count($keys) > 20) return self::failure('metaKeys must contain at most 20 existing meta keys.');
		$known = array_column($metadata['meta'], 'name'); $values = array();
		foreach ($keys as $key) {
			if (!is_string($key) || !in_array($key, $known, true)) return self::failure('Unknown meta key; inspect the source metadata first.');
			$all = $repo->getMetaValues($key, $type);
			$values[$key] = array('items' => array_slice($all, 0, 100), 'hasMore' => count($all) > 100);
		}
		$skip = max(0, (int) ($args['skip'] ?? 0)); $take = max(1, min(100, (int) ($args['take'] ?? 25)));
		$posts = new \WP_Query(array('post_type' => $type, 'post_status' => 'publish', 'has_password' => false,
			'posts_per_page' => $take, 'offset' => $skip, 'orderby' => 'ID', 'order' => 'ASC'));
		$total = (int) $posts->found_posts;
		// WP_Query skips its count on an empty page beyond the end. Keep total stable.
		if (!$posts->posts && $skip > 0) {
			$first = new \WP_Query(array('post_type' => $type, 'post_status' => 'publish', 'has_password' => false, 'posts_per_page' => 1, 'orderby' => 'ID', 'order' => 'ASC'));
			$total = (int) $first->found_posts;
		}
		$items = array_map(static function ($post) { return array('id' => (int) $post->ID, 'post_title' => $post->post_title); }, $posts->posts);
		return self::success(array('postType' => $describe($type), 'metadata' => $metadata, 'metaValues' => (object) $values,
			'posts' => array('items' => $items, 'total' => $total, 'skip' => $skip, 'take' => $take,
				'hasMore' => $skip + count($items) < $total), 'source' => 'wordpress', 'writes' => false));
	}

	/** @return array<string,mixed> */

	/** @return array<string,mixed> */

	/** @return array<string,mixed> */


	/** @return array<string,mixed> */


	/** @return array<string,mixed> */


	/** @param array<string,mixed> $args */
	private static function manageGlobalSettings(array $args): array
	{
		$action = isset($args['action']) ? (string) $args['action'] : '';
		if ($action === 'get') {
			return self::success(self::globalSettingsSnapshot());
		}
		if ($action !== 'update') {
			return self::failure('Unsupported global-settings action: ' . $action);
		}
		$settings = isset($args['settings']) && is_array($args['settings'])
			? $args['settings']
			: null;
		if ($settings === null || $settings === array()) {
			return self::failure('settings object is required');
		}

		$allowed = array(
			'google_api_key',
			'google_geocoding_api_key',
			'google_geocoding_daily_limit',
			'allowed_shortcodes',
		);
		$unsupported = array_diff(array_keys($settings), $allowed);
		if ($unsupported) {
			return self::failure('Unsupported global setting: ' . implode(', ', $unsupported));
		}

		foreach ($settings as $key => $value) {
			if ($key === 'allowed_shortcodes') {
				if (!current_user_can('manage_options')) {
					return self::failure('Only WordPress administrators can change allowed_shortcodes');
				}
				if (is_string($value)) {
					$value = array_values(array_filter(array_map('trim', explode(',', $value)), 'strlen'));
				} elseif (!is_array($value)) {
					return self::failure('allowed_shortcodes must be an array or comma-separated string');
				}
			} elseif ($key === 'google_geocoding_daily_limit') {
				$value = max(0, (int) $value);
			} else {
				$value = trim((string) $value);
			}
			Options::set($key, $value);
		}

		$snapshot = self::globalSettingsSnapshot();
		return array(
			'ok' => true,
			'result' => $snapshot,
			'global_settings_mutation' => array('settings' => $snapshot),
		);
	}

	/** @return array<string,mixed> */
	private static function globalSettingsSnapshot(): array
	{
		return array(
			'googleApiKeyConfigured' => trim((string) Options::get('google_api_key')) !== '',
			'googleGeocodingApiKeyConfigured' => trim((string) Options::get('google_geocoding_api_key')) !== '',
			'googleGeocodingDailyLimit' => (int) (Options::get('google_geocoding_daily_limit') ?: 1300),
			'allowedShortcodes' => Options::get('allowed_shortcodes') ?? array(),
		);
	}

	/** @param array<string,mixed> $args */
	private static function manageQuery(array $args, int $defaultMapId = 0, ?array $previewOptions = null, bool $previewAvailable = false): array
	{
		$action = isset($args['action']) ? (string) $args['action'] : '';
		$store = new \MapSVG\DataLayer\SavedQuery\SavedQueryStore();

		switch ($action) {
			case 'list':
				return self::success(self::catalogSummaryPage($store->queries(), $args, 'query'));
			case 'get':
				$id = isset($args['id']) ? (string) $args['id'] : '';
				if ($id === '') return self::failure('id is required');
				$query = $store->query($id);
				return $query ? self::success($query) : self::failure('Query not found');
			case 'create':
				$payload = isset($args['query']) && is_array($args['query']) ? $args['query'] : null;
				if ($payload === null) return self::failure('query object is required');
				$created = $store->createQuery($payload);
				return array(
					'ok' => true,
					'result' => $created,
					'query_mutation' => array('action' => 'created', 'query' => $created),
				);
			case 'update':
				$id = isset($args['id']) ? (string) $args['id'] : '';
				$payload = isset($args['query']) && is_array($args['query']) ? $args['query'] : null;
				if ($id === '' || $payload === null) return self::failure('id and query object are required');
				$updated = $store->updateQuery($id, $payload);
				if (!$updated) return self::failure('Query not found');
				return array(
					'ok' => true,
					'result' => $updated,
					'query_mutation' => array('action' => 'updated', 'query' => $updated),
				);
			case 'delete':
				if (empty($args['confirm'])) return self::failure('confirm=true is required to delete a query');
				$id = isset($args['id']) ? (string) $args['id'] : '';
				if ($id === '') return self::failure('id is required');
				if (!$store->deleteQuery($id)) return self::failure('Query not found');
				return array(
					'ok' => true,
					'result' => array('deleted' => true, 'id' => $id),
					'query_mutation' => array('action' => 'deleted', 'query' => array('id' => $id)),
				);
			case 'execute':
				return self::executeSavedQuery($args, $defaultMapId, $previewOptions, $previewAvailable);
			case 'execute_page':
				return self::executePageQuery($args, $defaultMapId, $previewOptions, $previewAvailable);
			case 'list_folders':
				return self::success(array('items' => $store->folders()));
			case 'get_folder':
				$folderId = isset($args['folderId']) ? (int) $args['folderId'] : 0;
				if ($folderId <= 0) return self::failure('folderId is required');
				$folder = $store->folder($folderId);
				return $folder ? self::success($folder) : self::failure('Folder not found');
			case 'create_folder':
				$title = isset($args['title']) ? trim((string) $args['title']) : '';
				if ($title === '') return self::failure('title is required');
				$folder = $store->createFolder($title);
				return array(
					'ok' => true,
					'result' => $folder,
					'query_mutation' => array('action' => 'folder_created', 'folder' => $folder),
				);
			case 'update_folder':
				$folderId = isset($args['folderId']) ? (int) $args['folderId'] : 0;
				$title = isset($args['title']) ? trim((string) $args['title']) : '';
				if ($folderId <= 0 || $title === '') return self::failure('folderId and title are required');
				$folder = $store->updateFolder($folderId, $title);
				if (!$folder) return self::failure('Folder not found');
				return array(
					'ok' => true,
					'result' => $folder,
					'query_mutation' => array('action' => 'folder_updated', 'folder' => $folder),
				);
			case 'delete_folder':
				if (empty($args['confirm'])) return self::failure('confirm=true is required to delete a query folder');
				$folderId = isset($args['folderId']) ? (int) $args['folderId'] : 0;
				if ($folderId <= 0) return self::failure('folderId is required');
				if (!$store->deleteFolder($folderId)) return self::failure('Folder not found');
				return array(
					'ok' => true,
					'result' => array('deleted' => true, 'folderId' => $folderId),
					'query_mutation' => array('action' => 'folder_deleted', 'folder' => array('id' => $folderId)),
				);
			default:
				return self::failure('Unsupported query action: ' . $action);
		}
	}

	/** Read exactly the canonical Page binding, not a second AI-specific query engine. */
	private static function executePageQuery(array $args, int $defaultMapId, ?array $previewOptions, bool $previewAvailable): array
	{
		$mapId = isset($args['mapId']) ? (int) $args['mapId'] : $defaultMapId;
		if ($mapId <= 0) return self::failure('A current Map or mapId is required.');
		if (isset($args['skip']) || isset($args['take'])) return self::failure('execute_page uses page and the Page binding page size, not skip/take.');
		if (isset($args['runtime']) && !is_array($args['runtime'])) return self::failure('runtime must be an object.');
		$map = self::loadMap($mapId);
		$usingPreview = $mapId === $defaultMapId && $previewAvailable && $previewOptions !== null;
		if ($usingPreview) $map->options = $previewOptions;
		$params = (object) array('mapId' => $mapId,
			'pageId' => $args['pageId'] ?? \MapSVG\DataLayer\SavedQuery\PageBindingSource::defaultPageId($map->options),
			'role' => $args['role'] ?? 'objects', 'page' => $args['page'] ?? 1,
			'runtime' => (object) ($args['runtime'] ?? array()));
		if (isset($args['id']) && ($args['id'] !== (\MapSVG\DataLayer\SavedQuery\PageBindingQuery::binding($map->options, $params->role, $params->pageId)['queryId'] ?? null))) {
			return self::failure('The supplied Query id is not this Page binding.');
		}
		$resolver = new \MapSVG\DataLayer\SavedQuery\PageBindingQuery(null, null, static function ($id) use ($map, $mapId) {
			if ($id !== $mapId) throw new \OutOfBoundsException('Map not found.');
			return $map;
		});
		$result = $resolver->execute($params, \MapSVG\App\Data\Query\WordPressQueryContext::capture());
		return self::success(array_merge(self::normalize($result), array('optionsSource' => $usingPreview ? 'preview' : 'db', 'browserVerified' => false)));
	}

	/** @param array<string,mixed> $args */
	private static function executeSavedQuery(array $args, int $defaultMapId, ?array $previewOptions, bool $previewAvailable): array
	{
		$id = isset($args['id']) ? (string) $args['id'] : '';
		if ($id === '') return self::failure('id is required');

		$pagination = array(
			'skip' => isset($args['skip']) ? max(0, (int) $args['skip']) : 0,
			'take' => isset($args['take'])
				? max(1, min(self::MAX_QUERY_ROWS, (int) $args['take']))
				: 50,
		);
		$service = new \MapSVG\DataLayer\SavedQuery\SavedQueryExecutionService();
		if (!empty($args['mapId'])) {
			$mapId = (int) $args['mapId'];
			$role = isset($args['role']) ? (string) $args['role'] : '';
			if ($mapId <= 0 || !in_array($role, array('objects', 'regions'), true)) {
				return self::failure('Valid mapId and role are required');
			}
			$runtime = isset($args['runtime']) && is_array($args['runtime']) ? $args['runtime'] : array();
			$map = self::loadMap($mapId);
			$usingPreview = $mapId === $defaultMapId && $previewAvailable && $previewOptions !== null;
			if ($usingPreview) $map->options = $previewOptions;
			$result = $service->executeBound(
				$map,
				$role,
				$id,
				$pagination,
				$runtime,
				false
			);
			$repository = $role === 'objects' ? $map->getObjects() : $map->getRegions();
			$result['rows'] = \MapSVG\DataLayer\Post\PageBindingPostHydrator::hydrate($repository->getSchema(), $result['rows']);
			return self::success(array_merge(self::normalize($result), array('optionsSource' => $usingPreview ? 'preview' : 'db', 'browserVerified' => false)));
		}
		return self::success(self::normalize($service->execute($id, $pagination)));
	}

	/** @param array<string,mixed> $args */
	private static function manageConnection(array $args): array
	{
		$action = isset($args['action']) ? (string) $args['action'] : '';
		$schemaId = isset($args['schemaId']) ? (int) $args['schemaId'] : 0;
		$mapId = isset($args['mapId']) ? (int) $args['mapId'] : 0;
		$repo = new DataToMapsRepository();

		if ($action === 'list_maps') {
			if ($schemaId <= 0) return self::failure('schemaId is required');
			return self::success(array(
				'schemaId' => $schemaId,
				'mapIds' => $repo->findMapIdsBySchemaId($schemaId),
			));
		}
		if ($action === 'connect') {
			if ($schemaId <= 0 || $mapId <= 0) {
				return self::failure('schemaId and mapId are required');
			}
			$schemaRepo = RepositoryFactory::get('schema');
			$schema = $schemaRepo->findById($schemaId);
			if (!$schema) return self::failure('Schema not found');
			self::loadMap($mapId);
			if (($schema->type ?? '') !== 'post') {
				return self::failure(
					'Data-to-map connections are for post schemas. Use manage_options for scene data bindings.'
				);
			}
			$repo->setMapSchema($mapId, $schemaId);
			$payload = array(
				'action' => 'connected',
				'schemaId' => $schemaId,
				'mapId' => $mapId,
				'linked' => true,
			);
			return array('ok' => true, 'result' => $payload, 'connection_mutation' => $payload);
		}
		if ($action === 'disconnect') {
			if (empty($args['confirm'])) {
				return self::failure('confirm=true is required to disconnect a schema from a map');
			}
			if ($mapId <= 0) return self::failure('mapId is required');
			if ($schemaId > 0) $repo->deleteBySchemaAndMap($schemaId, $mapId);
			else $repo->deleteByMapId($mapId);
			$payload = array(
				'action' => 'disconnected',
				'schemaId' => $schemaId > 0 ? $schemaId : null,
				'mapId' => $mapId,
			);
			return array('ok' => true, 'result' => $payload, 'connection_mutation' => $payload);
		}
		return self::failure('Unsupported connection action: ' . $action);
	}

	/** @param array<string,mixed> $args */
	private static function manageMap(array $args, int $defaultMapId): array
	{
		$action = isset($args['action']) ? (string) $args['action'] : '';
		$mapId = isset($args['mapId']) ? (int) $args['mapId'] : $defaultMapId;

		switch ($action) {
			case 'defaults':
				return self::success(NewMapDefaults::apply(array(), NewMapDefaults::AI));
			case 'list':
				/** @var MapsRepository $repo */
				$repo = RepositoryFactory::get('map');
				$result = $repo->find(new Query(array(
					'perpage' => self::MAX_QUERY_ROWS,
					'fields' => array('id', 'title', 'status', 'version'),
				)));
				return self::success(self::normalize($result));
			case 'list_sources':
				$files = (new SVGFileRepository())->find();
				$search = strtolower(trim((string) ($args['search'] ?? '')));
				$tokens = $search !== ''
					? preg_split('/\s+/', $search) ?: array()
					: array();
				$items = array();

				foreach ($files as $file) {
					$origin = self::assetOrigin($file, 'svg');
					if ($origin === 'uploads/mapsvg/markers') {
						continue;
					}

					$item = array(
						'name' => isset($file->name) ? (string) $file->name : '',
						'relativeUrl' => isset($file->relativeUrl) ? (string) $file->relativeUrl : '',
						'pathShort' => isset($file->pathShort) ? (string) $file->pathShort : '',
						'origin' => $origin,
					);

					$score = 0;
					if ($search !== '') {
						$haystack = strtolower(
							$item['name'] . ' '
							. $item['relativeUrl'] . ' '
							. $item['pathShort'] . ' '
							. $item['origin']
						);
						if (strpos($haystack, $search) !== false) {
							$score += 10;
						}
						foreach ($tokens as $token) {
							if ($token !== '' && strpos($haystack, $token) !== false) {
								$score++;
							}
						}
						if ($score === 0) continue;
						if (strtolower(pathinfo($item['name'], PATHINFO_FILENAME)) === $search) $score += 100;
						if (strpos($item['pathShort'], 'geo-calibrated/') === 0) $score += 5;
					}
					$item['_score'] = $score;
					$items[] = $item;
				}

				usort($items, static function (array $a, array $b): int {
					$score = ($b['_score'] ?? 0) <=> ($a['_score'] ?? 0);
					if ($score !== 0) return $score;
					return strcasecmp((string) $a['name'], (string) $b['name']);
				});

				$items = array_slice($items, 0, 200);
				$catalog = new MapAssetCatalog();
				foreach ($items as $index => &$item) {
					unset($item['_score']);
					// Inspect only a focused, bounded search, not the whole catalog.
					if ($search === '' || $index >= 25) continue;
					try {
						$svg = $catalog->readSvg($item['relativeUrl']);
						$regions = AppRegionSync::regions($svg['body'], '');
						$item['geoCalibrated'] = $svg['metadata']['geoCalibrated'];
						$item['regionCount'] = count($regions);
						$item['regionIds'] = array_slice(array_column($regions, 'id'), 0, 200);
						$item['regionIdsTruncated'] = count($regions) > 200;
					} catch (\InvalidArgumentException $error) {
						$item['metadataError'] = $error->getMessage();
					}
				}
				unset($item);

				return self::success(array(
					'search' => $search,
					'items' => $items,
				));
			case 'get':
				if ($mapId <= 0) return self::failure('mapId is required');
				return self::success(self::mapSummary(self::loadMap($mapId)));
			case 'create':
				return self::createMap($args, $defaultMapId);
			case 'duplicate':
				if ($mapId <= 0) return self::failure('mapId is required');
				return self::duplicateMap($mapId, $args);
			case 'rename':
				if ($mapId <= 0) return self::failure('mapId is required');
				return self::renameMap($mapId, $args);
			case 'delete':
				if ($mapId <= 0) return self::failure('mapId is required');
				return self::deleteMap($mapId, $args);
			default:
				return self::failure('Unsupported map action: ' . $action);
		}
	}
	/**
	 * @param array<string,mixed> $args
	 * @param array<string,mixed>|null $previewOptions
	 */
	private static function manageOptions(
		array $args,
		int $defaultMapId,
		?array $previewOptions,
		bool $previewAvailable,
		?array $draftState = null
	): array {
		$action = isset($args['action']) ? (string) $args['action'] : '';
		$mapId = isset($args['mapId']) ? (int) $args['mapId'] : $defaultMapId;
		if ($mapId <= 0) return self::failure('mapId is required');
		$path = isset($args['path']) ? trim((string) $args['path']) : '';
		$patch = $args['patch'] ?? array();
		if ($path === 'filters.fields' || strpos($path, 'filters.fields.') === 0
			|| (is_array($patch) && isset($patch['filters']) && is_array($patch['filters'])
				&& array_key_exists('fields', $patch['filters']))) {
			return self::failure('Filter controls live in options.filtersSchema, an array. Read manage_options(action="get", path="filtersSchema"), then set that array preserving unrelated controls. filters.fields is not a supported option path.');
		}

		$map = self::loadMap($mapId);
		$saved = is_array($map->options) ? $map->options : array();
		$isCurrent = $mapId === $defaultMapId;
		$current = $isCurrent && $previewOptions !== null ? $previewOptions : $saved;

		if ($action === 'get') {
			$source = isset($args['source']) ? (string) $args['source'] : 'current';
			$path = isset($args['path']) ? trim((string) $args['path']) : '';
			if (!in_array($source, array('current', 'preview', 'db'), true)) {
				return self::failure('source must be current, preview, or db');
			}
			if ($source === 'preview' && (!$isCurrent || $previewOptions === null)) {
				return self::failure('Live preview snapshot is unavailable for this map');
			}
			$usePreview = $source !== 'db' && $isCurrent && $previewOptions !== null;
			$options = $usePreview ? $previewOptions : $saved;
			return self::success(array(
				'mapId' => $mapId,
				'source' => $usePreview ? 'preview' : 'db',
				'path' => $path,
				'value' => $path === '' ? $options : self::getByPath($options, $path),
			));
		}

		if (!$isCurrent) {
			return self::failure('Only the currently selected map options can be edited.');
		}

		if ($action === 'merge') {
			$patch = isset($args['patch']) && is_array($args['patch']) ? $args['patch'] : null;
			if ($patch === null || count($patch) === 0) {
				return self::failure('patch object is required');
			}
			$next = self::deepMerge($current, $patch);
			self::validateOptionsChange($current, $next, self::optionWritePaths($patch));
			self::authorizePreviewWrite($mapId, $current, $next, $patch, false, $draftState);
			return array(
				'ok' => true,
				'result' => array(
					'mapId' => $mapId,
					'changedKeys' => array_keys($patch),
					'persisted' => false,
					'queuedForPreview' => true,
					'browserVerified' => false,
				),
				'options_patch' => $patch,
				'preview_options' => $next,
			);
		}

		if ($action === 'set') {
			$path = isset($args['path']) ? trim((string) $args['path']) : '';
			if ($path === '' || !array_key_exists('value', $args)) {
				return self::failure('path and value are required');
			}
			$next = self::setByPath($current, $path, $args['value']);
			self::validateOptionsChange($current, $next, array($path));
			$root = explode('.', $path)[0];
			$patch = array($root => $next[$root]);
			self::authorizePreviewWrite($mapId, $current, $next, $patch, false, $draftState);
			return array(
				'ok' => true,
				'result' => array('mapId' => $mapId, 'path' => $path, 'persisted' => false, 'queuedForPreview' => true, 'browserVerified' => false),
				'options_patch' => $patch,
				'preview_options' => $next,
			);
		}
		if ($action === 'delete') {
			$path = isset($args['path']) ? trim((string) $args['path']) : '';
			if ($path === '') return self::failure('path is required');
			$next = $current;
			$removed = self::deleteByPath($next, $path);
			if (!$removed) return self::failure('Option path not found: ' . $path);
			self::validateOptionsChange($current, $next, array($path));
			self::authorizePreviewWrite($mapId, $current, $next, $next, true, $draftState);
			return array(
				'ok' => true,
				'result' => array('mapId' => $mapId, 'path' => $path, 'persisted' => false, 'queuedForPreview' => true, 'browserVerified' => false),
				'options_replace' => $next,
				'preview_options' => $next,
			);
		}

		if ($action === 'replace') {
			$next = isset($args['options']) && is_array($args['options']) ? $args['options'] : null;
			if ($next === null) return self::failure('options object is required');
			self::validateOptionsChange($current, $next);
			self::authorizePreviewWrite($mapId, $current, $next, $next, true, $draftState);
			return array(
				'ok' => true,
				'result' => array('mapId' => $mapId, 'replaced' => true, 'persisted' => false, 'queuedForPreview' => true, 'browserVerified' => false),
				'options_replace' => $next,
				'preview_options' => $next,
			);
		}
		if ($action === 'publish') {
			if (empty($args['confirm'])) {
				return self::failure('confirm=true is required to publish map options');
			}
			if (!$previewAvailable || $previewOptions === null) {
				return self::failure('A live preview snapshot from the start of this turn is required to publish map options');
			}
			if (!AppDraftController::canEdit($mapId)) return self::failure('You cannot publish this App.');
			return array(
				'ok' => true,
				'result' => array('mapId' => $mapId, 'published' => false, 'queuedForBrowser' => true, 'awaitingConfirmation' => false,
					'message' => 'Publication queued in the browser for the selected named draft without a confirmation dialog: the user already requested publication in chat. This tool has not published it. Browser completion or failure will be reported separately; do not claim success or ask for another confirmation.'),
				'publish_request' => array('mapId' => $mapId),
			);
		}

		return self::failure('Unsupported options action: ' . $action);
	}

	/** Authorize before any patch/replacement can reach the browser runtime. */
	private static function authorizePreviewWrite(int $mapId, array $current, array $next, array $outgoing, bool $replace, ?array $draftState): void
	{
		if (!AppDraftController::canEdit($mapId)) throw new \RuntimeException('You cannot edit this App.', 403);
		AppCodePolicy::assertUnchanged($next, $current);
		if (AppCodePolicy::scripts($next) != AppCodePolicy::scripts($current)
			&& empty(AiRuntimeContext::snapshot($mapId)['mapsvg']['features']['javascript'])) {
			throw new \RuntimeException('JavaScript authoring is unavailable in this MapSVG installation (javascript module required).', 403);
		}
		if (current_user_can('unfiltered_html')) return;
		// A browser-provided preview cannot acknowledge its own forged code baseline.
		$map = self::loadMap($mapId);
		$canonical = is_array($map->options) ? $map->options : [];
		if (($draftState['mapId'] ?? null) === $mapId && (int) ($draftState['draftId'] ?? 0) > 0) {
			$draft = (new AppDraftStore())->get($mapId, (int) $draftState['draftId']);
			$canonical = json_decode(wp_json_encode($draft['snapshot']['options']), true);
		}
		AppCodePolicy::assertUnchanged($replace ? $outgoing : self::deepMerge($canonical, $outgoing), $canonical);
	}

	/** Browser draft metadata is context only; App access is always checked independently. */
	private static function manageDraft(array $args, int $defaultMapId, bool $previewAvailable, ?array $draftState): array
	{
		$mapId = isset($args['mapId']) ? (int) $args['mapId'] : $defaultMapId;
		if ($mapId <= 0 || $mapId !== $defaultMapId) return self::failure('Only the selected App draft can be used.');
		self::loadMap($mapId);
		if (!AppDraftController::canEdit($mapId)) return self::failure('You cannot edit this App draft.');
		if (!$previewAvailable || !$draftState || ($draftState['mapId'] ?? null) !== $mapId
			|| !is_int($draftState['draftId'] ?? null) || $draftState['draftId'] < 1) return self::failure('Selected browser draft state is unavailable. Keep its editor open and retry; do not guess a draft ID.');
		$action = $args['action'] ?? '';
		if ($action === 'status') return self::success(array('source' => 'browser_snapshot', 'lastKnown' => true, 'draft' => $draftState));
		if (!in_array($action, array('pull_changes', 'branch'), true)) return self::failure('Unsupported draft action.');
		if ($action === 'pull_changes' && empty($args['confirm'])) return self::failure('Pull replaces local edits. An explicit user request and confirm=true are required; the editor will also show the existing confirmation dialog. Offer Branch to retain the local copy.');
		if (empty($draftState['ready']) || !empty($draftState['offline']) || !empty($draftState['transitioning'])) return self::failure('The draft is offline, loading or switching. Local edits are retained; retry when the server/editor is available.');
		return array('ok' => true,
			'result' => array('mapId' => $mapId, 'draftId' => $draftState['draftId'], 'action' => $action, 'queuedForBrowser' => true, 'completed' => false,
				'awaitingConfirmation' => $action === 'pull_changes', 'message' => $action === 'pull_changes'
					? 'Pull confirmation requested; no local changes have been discarded. The user must confirm in the editor.'
					: 'Branch requested from the current local canonical copy. Completion is confirmed in the browser, not by this tool.'),
			'draft_action_request' => array('mapId' => $mapId, 'draftId' => $draftState['draftId'], 'action' => $action));
	}

	/** @param array<string,mixed> $args */
	private static function manageSchema(array $args): array
	{
		$action = isset($args['action']) ? (string) $args['action'] : '';
		if (in_array($action, array('get', 'update', 'delete'), true)
			&& empty($args['schemaId']) && empty($args['name'])
			&& empty($args['schema']['id']) && empty($args['schema']['name'])) {
			return self::failure('A database schemaId or exact schema name is required (not id). Use manage_schema(action="list") to discover Collections. Filter form controls belong to App options.filtersSchema; use manage_options to edit them, not manage_schema.');
		}
		/** @var SchemaRepository $repo */
		$repo = RepositoryFactory::get('schema');

		if ($action === 'list') {
			$result = $repo->find(new Query(array(
				'perpage' => 0,
			)));
			$catalog = self::normalize($result);
			return self::success(self::catalogSummaryPage($catalog['items'] ?? array(), $args, 'schema'));
		}

		$schema = self::resolveSchema($repo, $args);
		if ($action === 'get') {
			if (!$schema) return self::failure('Database schema not found. Discover actual Collections with manage_schema(action="list"); do not guess IDs. Filter form controls are not Collection schemas: read options.filtersSchema with manage_options.');
			return self::success(self::normalize($schema));
		}
		if ($action === 'create') {
			$payload = isset($args['schema']) && is_array($args['schema']) ? $args['schema'] : null;
			if ($payload === null) return self::failure('schema object is required');

			$request = new \WP_REST_Request('POST', '/mapsvg/v1/schemas');
			$request->set_param('schema', $payload);
			$data = self::responseData(SchemaController::create($request));
			$created = isset($data['schema']) ? $data['schema'] : null;
			if (!$created) return self::failure('Schema creation returned no schema');

			$normalized = self::normalize($created);
			return array(
				'ok' => true,
				'result' => $normalized,
				'schema_mutation' => array(
					'action' => 'created',
					'schema' => self::schemaEventPayload($normalized),
				),
			);
		}

		if ($action === 'update') {
			$payload = isset($args['schema']) && is_array($args['schema']) ? $args['schema'] : null;
			if ($payload === null) return self::failure('schema object is required');
			$id = $schema ? (int) $schema->id : 0;
			if ($id <= 0) return self::failure('schemaId is required');
			$existing = $repo->findById($id);
			if (!$existing) return self::failure('Schema not found');
			if (
				self::schemaUpdateNeedsConfirmation($existing, $payload)
				&& empty($args['confirm'])
			) {
				return self::failure(
					'confirm=true is required when removing schema fields or changing field types'
				);
			}
			$payload['id'] = $id;
			$request = new \WP_REST_Request('PUT', '/mapsvg/v1/schemas/' . $id);
			$request->set_param('id', $id);
			$request->set_param('schema', $payload);
			self::responseData(SchemaController::update($request));

			$updated = $repo->findById($id);
			if (!$updated) return self::failure('Updated schema could not be reloaded');
			$normalized = self::normalize($updated);
			return array(
				'ok' => true,
				'result' => $normalized,
				'schema_mutation' => array(
					'action' => 'updated',
					'schema' => self::schemaEventPayload($normalized),
				),
			);
		}

		if ($action === 'delete') {
			if (empty($args['confirm'])) {
				return self::failure('confirm=true is required to delete a schema');
			}
			if (!$schema || empty($schema->id)) return self::failure('Schema not found');
			$normalized = self::normalize($schema);
			$request = new \WP_REST_Request('DELETE', '/mapsvg/v1/schemas/' . $schema->id);
			$request->set_param('id', (int) $schema->id);
			self::responseData(SchemaController::delete($request));
			return array(
				'ok' => true,
				'result' => array(
					'deleted' => true,
					'schema' => self::schemaEventPayload($normalized),
				),
				'schema_mutation' => array(
					'action' => 'deleted',
					'schema' => self::schemaEventPayload($normalized),
				),
			);
		}

		return self::failure('Unsupported schema action: ' . $action);
	}

	/** Bounded sequential writes through the ordinary validated Collection controller. */
	private static function manageRepositoryBatch(array $args): array
	{
		if (!current_user_can('edit_posts')) return self::failure('Collection editing access is required.');
		$action = $args['action'] ?? '';
		if (!in_array($action, array('create', 'update'), true)) return self::failure('Batch action must be create or update.');
		$name = is_string($args['schema'] ?? null) ? trim($args['schema']) : '';
		if ($name === '') return self::failure('schema is required');
		$records = $args['records'] ?? null;
		if (!is_array($records) || array_values($records) !== $records || count($records) < 1 || count($records) > 50) {
			return self::failure('records must contain 1 to 50 record objects.');
		}
		$encoded = wp_json_encode($records);
		if (!is_string($encoded) || strlen($encoded) > 262144) return self::failure('Batch records exceed 256 KB.');
		$schema = RepositoryFactory::loadSchema($name);
		if (!$schema) return self::failure('Schema not found: ' . $name);
		$metadata = self::normalize($schema);
		$ids = array();
		// Reject malformed entries before the first write. Native field/source checks
		// still run per record; a later failure is explicit partial work, not atomic success.
		foreach ($records as $index => $record) {
			if (!is_array($record) || !$record || !self::isAssoc($record)) return self::failure('Each batch record must be an object.');
			if ($action === 'update') {
				$id = $record['id'] ?? null;
				if ((!is_int($id) && !is_string($id)) || (string) $id === '') return self::failure('Every update record requires its id.');
				if (isset($ids[(string) $id])) return self::failure('Duplicate update id in batch: ' . (string) $id);
				$ids[(string) $id] = true;
			}
			self::validateRecordLocations($metadata['fields'] ?? array(), $record);
			self::validateRecordRegionLinks($metadata['fields'] ?? array(), $record);
		}
		$completed = array();
		foreach ($records as $index => $record) {
			try {
				$outcome = self::manageRepository(array('action' => $action, 'schema' => $name, 'record' => $record));
			} catch (\Throwable $error) {
				$outcome = self::failure($error->getMessage());
			}
			if (empty($outcome['ok'])) {
				return self::repositoryBatchResult($name, $action, count($records), $completed, $index, $outcome['error'] ?? 'Record write failed.');
			}
			$completed[] = array('index' => $index, 'recordId' => $outcome['repository_mutation']['recordId'] ?? null);
		}
		return self::repositoryBatchResult($name, $action, count($records), $completed);
	}

	private static function repositoryBatchResult(string $name, string $action, int $requested, array $completed, ?int $failedIndex = null, ?string $error = null): array
	{
		$result = array('ok' => $failedIndex === null, 'result' => array(
			'schema' => $name, 'action' => $action, 'requestedCount' => $requested,
			'completedCount' => count($completed), 'completed' => $completed,
			'partial' => $failedIndex !== null && count($completed) > 0,
		));
		if ($failedIndex !== null) {
			$result['result']['failedIndex'] = $failedIndex;
			$result['error'] = $error . ' Batch stopped; inspect completed records before submitting only the remaining work.';
		}
		if ($completed) $result['repository_mutation'] = array('schema' => $name,
			'action' => $action === 'create' ? 'created' : 'updated', 'recordIds' => array_column($completed, 'recordId'));
		return $result;
	}

	/** @param array<string,mixed> $args */
	private static function manageRepository(array $args): array
	{
		$action = isset($args['action']) ? (string) $args['action'] : '';
		$name = isset($args['schema']) ? trim((string) $args['schema']) : '';
		if ($name === '') return self::failure('schema is required');

		$schema = RepositoryFactory::loadSchema($name);
		if (!$schema) return self::failure('Schema not found: ' . $name);
		if ($action === 'search_posts') {
			if (!current_user_can('edit_posts')) return self::failure('You cannot search WordPress posts.');
			if (($schema->type ?? '') !== 'post' || empty($schema->postType)) return self::failure('search_posts requires a native WordPress Post Type Collection. Discover it using manage_schema list with postType.');
			$search = trim((string) ($args['query']['search'] ?? ''));
			if ($search === '' || strlen($search) > 200) return self::failure('query.search must be a non-empty title prefix of at most 200 bytes.');
			$posts = (new PostsRepository())->find(new Query(array('search' => $search, 'filters' => array('post_type' => $schema->postType))));
			$items = array_map(static function ($post) { return array_intersect_key($post, array_flip(array('id', 'post_title', 'url'))); }, $posts);
			return self::success(array('items' => $items, 'postType' => $schema->postType, 'source' => 'wordpress_picker', 'limit' => 20,
				'message' => 'Published, non-password-protected native posts. These IDs are WordPress post IDs, not MapSVG row IDs. No bridge records or post data were written.'));
		}
		$repo = RepositoryFactory::get($name);
		if (!$repo) return self::failure('Repository not found: ' . $name);
		$singular = (string) $schema->objectNameSingular;
		if ($action === 'query') {
			$query = isset($args['query']) && is_array($args['query']) ? $args['query'] : array();
			$query['perpage'] = isset($query['perpage'])
				? max(1, min(self::MAX_QUERY_ROWS, (int) $query['perpage']))
				: 25;
			$query['page'] = isset($query['page']) ? max(1, (int) $query['page']) : 1;

			$request = new \WP_REST_Request('GET', '/mapsvg/v1/repository/' . $name);
			$request->set_param('_collection_name', $name);
			foreach ($query as $key => $value) {
				$request->set_param((string) $key, $value);
			}
			return self::success(self::responseData(CollectionController::index($request)));
		}

		if ($action === 'get') {
			if (!array_key_exists('id', $args)) return self::failure('id is required');
			$request = new \WP_REST_Request('GET', '/mapsvg/v1/repository/' . $name);
			$request->set_param('_collection_name', $name);
			$request->set_param('id', $args['id']);
			return self::success(self::responseData(CollectionController::get($request)));
		}

		if ($action === 'clear') {
			if (empty($args['confirm'])) {
				return self::failure('confirm=true is required to clear a repository');
			}
			$request = new \WP_REST_Request('DELETE', '/mapsvg/v1/repository/' . $name);
			$request->set_param('_collection_name', $name);
			self::responseData(CollectionController::clear($request));
			return array(
				'ok' => true,
				'result' => array('cleared' => true, 'schema' => $name),
				'repository_mutation' => array(
					'action' => 'cleared',
					'schema' => $name,
				),
			);
		}

		$record = isset($args['record']) && is_array($args['record']) ? $args['record'] : null;
		if ($record !== null && in_array($action, array('create', 'update', 'upsert'), true)) {
			$metadata = self::normalize($schema);
			self::validateRecordLocations($metadata['fields'] ?? array(), $record);
			self::validateRecordRegionLinks($metadata['fields'] ?? array(), $record);
		}

		if ($action === 'upsert') {
			if ($record === null) return self::failure('record object is required');
			$id = array_key_exists('id', $args)
				? $args['id']
				: ($record[$schema->getPrimaryKeyFieldName()] ?? ($record['id'] ?? null));
			$action = $id !== null && $repo->findById($id) ? 'update' : 'create';
			if ($id !== null && !array_key_exists('id', $record)) {
				$record['id'] = $id;
			}
		}

		if ($action === 'create') {
			if ($record === null) return self::failure('record object is required');
			$request = self::collectionWriteRequest('POST', $name, $singular, $record);
			$data = self::responseData(CollectionController::create($request));
			$created = isset($data[$singular]) ? self::normalize($data[$singular]) : $data;
			return array(
				'ok' => true,
				'result' => $created,
				'repository_mutation' => array(
					'action' => 'created',
					'schema' => $name,
					'recordId' => self::recordId($created, $schema),
				),
			);
		}

		if ($action === 'update') {
			if ($record === null) return self::failure('record object is required');
			$id = array_key_exists('id', $args)
				? $args['id']
				: ($record['id'] ?? null);
			if ($id === null) return self::failure('id is required');
			$record['id'] = $id;

			$request = self::collectionWriteRequest('PUT', $name, $singular, $record);
			$request->set_param('id', $id);
			self::responseData(CollectionController::update($request));
			$updated = $repo->findById($id);
			$normalized = self::normalize($updated);
			return array(
				'ok' => true,
				'result' => $normalized,
				'repository_mutation' => array(
					'action' => 'updated',
					'schema' => $name,
					'recordId' => $id,
				),
			);
		}
		if ($action === 'delete') {
			if (empty($args['confirm'])) {
				return self::failure('confirm=true is required to delete a record');
			}
			if (!array_key_exists('id', $args)) return self::failure('id is required');
			$id = $args['id'];
			$request = new \WP_REST_Request('DELETE', '/mapsvg/v1/repository/' . $name);
			$request->set_param('_collection_name', $name);
			$request->set_param('id', $id);
			self::responseData(CollectionController::delete($request));
			return array(
				'ok' => true,
				'result' => array('deleted' => true, 'schema' => $name, 'id' => $id),
				'repository_mutation' => array(
					'action' => 'deleted',
					'schema' => $name,
					'recordId' => $id,
				),
			);
		}

		return self::failure('Unsupported repository action: ' . $action);
	}

	private static function collectionWriteRequest(
		string $method,
		string $schema,
		string $singular,
		array $record
	): \WP_REST_Request {
		$request = new \WP_REST_Request($method, '/mapsvg/v1/repository/' . $schema);
		$request->set_param('_collection_name', $schema);
		$request->set_param($singular, $record);
		return $request;
	}

	/** @param array<string,mixed> $args */
	private static function createImageMap(array $args, ?callable $progress): array
	{
		if (trim((string)($args['title'] ?? '')) === '') throw new \InvalidArgumentException('title is required');
		$options = $args['options'] ?? array();
		if (!is_array($options)) throw new \InvalidArgumentException('options must be an object');
		if (!empty($options['googleMaps']['on'])) throw new \InvalidArgumentException('An image map does not enable Google Maps.');
		unset($options['source'], $options['title'], $options['database']);
		$options = AiRasterSvg::imageMapOptions($options);
		// New user-facing maps should not inherit the legacy instructional demo card.
		if (!empty($options['actions']['region']['click']['showDetails'])
			&& !array_key_exists('detailsViewRegion', $options['templates'] ?? array())) {
			$options['templates']['detailsViewRegion'] = array('html'=>'<h3>{{#if title}}{{title}}{{else}}{{id}}{{/if}}</h3>','css'=>'','js'=>'','type'=>'custom');
		}
		$initial = NewMapDefaults::apply($options, NewMapDefaults::AI);
		self::validateOptionsChange($initial, $initial, array('nodes', 'scenes', 'regionDataRules'));
		$prepared = AiImageMaps::prepare(array_replace($args, array('options'=>$options)), $progress);
		$file = new SVGFile(array('name'=>pathinfo($prepared['name'], PATHINFO_FILENAME).'.svg'));
		$file->setBody($prepared['svg']);
		$file = (new SVGFileRepository())->createUnique($file);
		$result = self::createMap(array('title'=>$args['title'],'source'=>$file->relativeUrl,'options'=>$options),0);
		if (!empty($result['ok'])) {
			$result['result']['imageRegions'] = array('count'=>count($prepared['regionIds']),'regionIds'=>$prepared['regionIds'],
				'omittedAreas'=>$prepared['omittedAreas'],'warnings'=>$prepared['warnings']);
		}
		return $result;
	}

	private static function createMap(array $args, int $defaultMapId): array
	{
		$rawTitle = isset($args['title']) ? trim((string) $args['title']) : '';
		if ($rawTitle === '') return self::failure('title is required');
		$title = self::sanitizeTitle($rawTitle);
		if ($title === '') return self::failure('title is required');
		$options = isset($args['options']) && is_array($args['options']) ? $args['options'] : array();
		$google = filter_var($options['googleMaps']['on'] ?? false, FILTER_VALIDATE_BOOLEAN);
		if ($google && trim((string) Options::get('google_api_key')) === '') return self::failure('A Google Maps API key must be configured before creating a Google map.');

		$source = isset($args['source']) && is_string($args['source'])
			? trim($args['source'])
			: '';
		if ($source === '' && $google) {
			$options = NewMapDefaults::googleMap($options, MAPSVG_MAPS_URL);
			$source = $options['source'];
		}
		if ($source === '' && $defaultMapId > 0) {
			$current = self::loadMap($defaultMapId);
			$source = isset($current->options['source']) ? (string) $current->options['source'] : '';
		}
		if ($source === '') {
			return self::failure('source is required when there is no current map SVG source to reuse');
		}

		// Image-backed floor plans need a visible native hover state. Inspect the
		// actual source, and add fallbacks before runtime hydrates legacy colors.
		// Existing user-supplied values (including transparency/brightness) win.
		if (!$google) {
			try {
				[$file] = SVGFileController::readMapSource($source);
				$svg = file_get_contents($file->serverPath, false, null, 0, 8 * 1024 * 1024 + 1);
				if (is_string($svg)) {
					$raster = AiRasterSvg::inspect($svg);
					$calibration = $raster['document']->documentElement->getAttributeNS('http://mapsvg.com', 'geoViewBox');
					if ($calibration === '' && $raster['image']->getAttribute('id') !== 'mapsvg-google-map-background') {
						$options = AiRasterSvg::imageMapOptions($options);
					}
				}
			} catch (\Throwable $error) {
				// Native Image wrappers can have geometries outside the
				// bounded recognition contract.
				try {
					if (isset($svg) && is_string($svg) && !MapAssetCatalog::svgBodyMetadata($svg)['geoCalibrated']) {
						(new MapAssetCatalog())->imageMetadata($source);
						$options = AiRasterSvg::imageMapOptions($options);
					}
				} catch (\Throwable $ignored) { /* Ordinary vector/Google sources retain their defaults. */ }
			}
		}

		unset($options['database']);
		$options['source'] = $source;
		$options['title'] = $title;
		// Do not seed the old sample Category/Distance controls into AI-created Apps.
		if (!isset($options['filtersSchema'])) $options['filtersSchema'] = array();
		$options = NewMapDefaults::apply($options, NewMapDefaults::AI);
		self::validateOptionsChange($options, $options, array('nodes', 'scenes', 'regionDataRules'));

		$request = new \WP_REST_Request('POST', '/mapsvg/v1/maps');
		$request->set_param('draftOnly', true);
		$request->set_param('map', array('options' => wp_json_encode($options)));
		$data = self::responseData(MapController::create($request, NewMapDefaults::AI));
		$created = isset($data['map']) ? $data['map'] : null;
		$createdId = self::entityId($created);
		if ($createdId <= 0) return self::failure('Map creation did not return a map id');

		$summary = self::mapEventPayload(self::loadMap($createdId));
		return array(
			'ok' => true,
			'result' => array_merge(array('created' => true), $summary),
			'map_mutation' => array('action' => 'created', 'map' => $summary),
		);
	}

	/** @param array<string,mixed> $args */
	private static function duplicateMap(int $mapId, array $args): array
	{
		$source = self::loadMap($mapId);
		$sourceTitle = isset($source->title) && is_string($source->title) && trim($source->title) !== ''
			? trim($source->title)
			: (isset($source->options['title']) ? trim((string) $source->options['title']) : 'Map');
		$title = isset($args['title']) && trim((string) $args['title']) !== ''
			? self::sanitizeTitle((string) $args['title'])
			: self::sanitizeTitle($sourceTitle . ' Copy');

		/** @var MapsRepository $repo */
		$repo = RepositoryFactory::get('map');
		$copy = $repo->copy($mapId, array('title' => $title));
		if (!$copy || empty($copy->id)) return self::failure('Map duplication failed');
		$summary = self::mapEventPayload($copy);
		return array(
			'ok' => true,
			'result' => array_merge(array('duplicated' => true, 'sourceMapId' => $mapId), $summary),
			'map_mutation' => array('action' => 'duplicated', 'map' => $summary),
		);
	}

	/** @param array<string,mixed> $args */
	private static function renameMap(int $mapId, array $args): array
	{
		$title = isset($args['title']) ? self::sanitizeTitle((string) $args['title']) : '';
		if ($title === '') return self::failure('title is required');

		$map = self::loadMap($mapId);
		$map->setTitle($title);
		if (!is_array($map->options)) $map->options = array();
		$map->options['title'] = $title;

		/** @var MapsRepository $repo */
		$repo = RepositoryFactory::get('map');
		$repo->update($map);

		$summary = self::mapEventPayload($map);
		return array(
			'ok' => true,
			'result' => array_merge(array('renamed' => true), $summary),
			'map_mutation' => array('action' => 'renamed', 'map' => $summary),
		);
	}

	/** @param array<string,mixed> $args */
	private static function deleteMap(int $mapId, array $args): array
	{
		if (empty($args['confirm'])) {
			return self::failure('confirm=true is required to delete a map');
		}
		$map = self::loadMap($mapId);
		$summary = self::mapEventPayload($map);
		/** @var MapsRepository $repo */
		$repo = RepositoryFactory::get('map');
		$map->setStatus(0);
		$repo->update($map);
		(new DataToMapsRepository())->deleteByMapId($mapId);
		return array(
			'ok' => true,
			'result' => array_merge(array('deleted' => true), $summary),
			'map_mutation' => array('action' => 'deleted', 'map' => $summary),
		);
	}

	/** @param Schema $schema @param array<string,mixed> $payload */
	private static function schemaUpdateNeedsConfirmation(
		Schema $schema,
		array $payload
	): bool {
		if (!isset($payload['fields']) || !is_array($payload['fields'])) {
			return false;
		}

		$before = array();
		foreach ($schema->getFields() ?: array() as $field) {
			$field = (array) $field;
			$name = isset($field['name']) ? (string) $field['name'] : '';
			if ($name !== '') {
				$before[$name] = isset($field['type']) ? (string) $field['type'] : '';
			}
		}

		$after = array();
		foreach ($payload['fields'] as $field) {
			$field = (array) $field;
			$name = isset($field['name']) ? (string) $field['name'] : '';
			if ($name !== '') {
				$after[$name] = isset($field['type']) ? (string) $field['type'] : '';
			}
		}

		foreach ($before as $name => $type) {
			if (!array_key_exists($name, $after) || $after[$name] !== $type) {
				return true;
			}
		}
		return false;
	}

	/** Catalog discovery must not put every Collection field or Query builder in model context.
	 * @internal Public for contract tests; full definitions remain available through get.
	 */
	public static function catalogSummaryPage(array $items, array $args, string $kind): array
	{
		$keys = $kind === 'schema'
			? array('id', 'name', 'title', 'type', 'postType', 'objectNameSingular', 'objectNamePlural', 'primaryKeyField', 'regionSupport', 'markerSupport', 'remote')
			: array('id', 'name', 'schemaId', 'folderId');
		$filters = $kind === 'schema' ? array('type', 'postType') : array('schemaId');
		$search = trim((string) ($args['search'] ?? ''));
		$matching = array();
		foreach ($items as $item) {
			if (!is_array($item)) continue;
			foreach ($filters as $filter) {
				if (isset($args[$filter]) && (string) $args[$filter] !== '' && (string) ($item[$filter] ?? '') !== (string) $args[$filter]) continue 2;
			}
			if ($search !== '' && stripos(implode(' ', array_map(static function ($key) use ($item) { return (string) ($item[$key] ?? ''); }, array('name', 'title', 'postType'))), $search) === false) continue;
			$summary = array_intersect_key($item, array_flip($keys));
			if ($kind === 'schema') $summary['fieldCount'] = count($item['fields'] ?? array());
			$matching[] = $summary;
		}
		$skip = max(0, (int) ($args['skip'] ?? 0));
		$take = max(1, min(self::MAX_QUERY_ROWS, (int) ($args['take'] ?? 25)));
		return array('items' => array_slice($matching, $skip, $take), 'total' => count($matching), 'skip' => $skip, 'take' => $take, 'hasMore' => $skip + $take < count($matching));
	}

	/** @param SchemaRepository $repo @param array<string,mixed> $args */
	private static function resolveSchema($repo, array $args)
	{
		if (isset($args['schemaId']) && (int) $args['schemaId'] > 0) {
			return $repo->findById((int) $args['schemaId']);
		}
		if (isset($args['name']) && trim((string) $args['name']) !== '') {
			return $repo->findByName(trim((string) $args['name']));
		}
		if (isset($args['schema']['id'])) {
			return $repo->findById((int) $args['schema']['id']);
		}
		if (isset($args['schema']['name'])) {
			return $repo->findByName((string) $args['schema']['name']);
		}
		return null;
	}

	/** @param mixed $response @return array<string,mixed> */
	private static function responseData($response): array
	{
		if (!($response instanceof \WP_REST_Response)) {
			throw new \RuntimeException('Controller returned an invalid response.');
		}
		$data = self::normalize($response->get_data());
		if ($response->get_status() >= 400) {
			throw new \RuntimeException(self::responseError($data));
		}
		return is_array($data) ? $data : array('value' => $data);
	}

	/** @param mixed $data */
	private static function responseError($data): string
	{
		if (is_array($data)) {
			if (isset($data['error']) && is_scalar($data['error'])) {
				return (string) $data['error'];
			}
			if (isset($data['message']) && is_scalar($data['message'])) {
				return (string) $data['message'];
			}
			if (isset($data['data']['error']) && is_scalar($data['data']['error'])) {
				return (string) $data['data']['error'];
			}
		}
		return 'MapSVG operation failed.';
	}

	/** @param mixed $value @return mixed */
	private static function normalize($value)
	{
		if ($value === null || is_scalar($value)) return $value;
		$encoded = wp_json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
		if (!is_string($encoded)) return $value;
		return json_decode($encoded, true);
	}

	/** @param mixed $map @return array<string,mixed> */
	private static function mapSummary($map): array
	{
		$options = isset($map->options) && is_array($map->options) ? $map->options : array();
		return array(
			'mapId' => (int) $map->id,
			'title' => isset($map->title) && is_string($map->title)
				? $map->title
				: (isset($options['title']) ? (string) $options['title'] : ''),
			'source' => $options['source'] ?? null,
			'status' => isset($map->status) ? (int) $map->status : null,
			'version' => isset($map->version) ? (string) $map->version : null,
		);
	}

	/** @param mixed $map @return array{mapId:int,title:string} */
	private static function mapEventPayload($map): array
	{
		$summary = self::mapSummary($map);
		return array(
			'mapId' => (int) $summary['mapId'],
			'title' => (string) $summary['title'],
		);
	}

	/** @param mixed $schema @return array<string,mixed> */
	private static function schemaEventPayload($schema): array
	{
		$data = is_array($schema) ? $schema : self::normalize($schema);
		return array(
			'id' => isset($data['id']) ? (int) $data['id'] : 0,
			'name' => isset($data['name']) ? (string) $data['name'] : '',
			'title' => isset($data['title']) ? (string) $data['title'] : '',
			'type' => isset($data['type']) ? (string) $data['type'] : '',
		);
	}

	/** @param mixed $entity */
	private static function entityId($entity): int
	{
		if (is_object($entity) && isset($entity->id)) return (int) $entity->id;
		if (is_array($entity) && isset($entity['id'])) return (int) $entity['id'];
		return 0;
	}

	/** @param mixed $record @param Schema $schema @return mixed */
	private static function recordId($record, Schema $schema)
	{
		$data = is_array($record) ? $record : self::normalize($record);
		$key = (string) $schema->getPrimaryKeyFieldName();
		if (is_array($data) && array_key_exists($key, $data)) return $data[$key];
		return is_array($data) && array_key_exists('id', $data) ? $data['id'] : null;
	}

	/** @param array<string,mixed> $data @return mixed */
	private static function getByPath(array $data, string $path)
	{
		$current = $data;
		foreach (self::pathParts($path) as $part) {
			if (!is_array($current) || !array_key_exists($part, $current)) return null;
			$current = $current[$part];
		}
		return $current;
	}

	/** @param array<string,mixed> $data @param mixed $value @return array<string,mixed> */
	private static function setByPath(array $data, string $path, $value): array
	{
		$parts = self::pathParts($path);
		if (!$parts) return $data;
		$cursor =& $data;
		$last = array_pop($parts);
		foreach ($parts as $part) {
			if (!isset($cursor[$part]) || !is_array($cursor[$part])) $cursor[$part] = array();
			$cursor =& $cursor[$part];
		}
		$cursor[$last] = $value;
		return $data;
	}

	/** @param array<string,mixed> $data */
	private static function deleteByPath(array &$data, string $path): bool
	{
		$parts = self::pathParts($path);
		if (!$parts) return false;
		$cursor =& $data;
		$last = array_pop($parts);
		foreach ($parts as $part) {
			if (!isset($cursor[$part]) || !is_array($cursor[$part])) return false;
			$cursor =& $cursor[$part];
		}
		if (!array_key_exists($last, $cursor)) return false;
		unset($cursor[$last]);
		return true;
	}

	/** @return array<int,string> */
	private static function pathParts(string $path): array
	{
		return array_values(array_filter(array_map('trim', explode('.', $path)), 'strlen'));
	}

	/** @param array<string,mixed> $base @param array<string,mixed> $patch @return array<string,mixed> */
	public static function deepMerge(array $base, array $patch): array
	{
		foreach ($patch as $key => $value) {
			if (is_array($value) && self::isAssoc($value)
				&& isset($base[$key]) && is_array($base[$key]) && self::isAssoc($base[$key])) {
				$base[$key] = self::deepMerge($base[$key], $value);
			} else {
				$base[$key] = $value;
			}
		}
		return $base;
	}

	/** @param array<mixed> $value */
	private static function isAssoc(array $value): bool
	{
		if ($value === array()) return true;
		return array_keys($value) !== range(0, count($value) - 1);
	}

	/** @return Map */
	private static function loadMap(int $mapId)
	{
		/** @var MapsRepository $repo */
		$repo = RepositoryFactory::get('map');
		$map = $repo->findById($mapId);
		if (!$map) throw new \RuntimeException('Map not found: ' . $mapId);
		if (!empty($map->optionsBroken)) {
			throw new \RuntimeException('Map options are broken in the database.');
		}
		return $map;
	}

	private static function sanitizeTitle(string $title): string
	{
		return trim(wp_strip_all_tags(wp_unslash($title)));
	}

	/** @param mixed $result @return array{ok:bool,result:mixed} */
	private static function success($result): array
	{
		return array('ok' => true, 'result' => $result);
	}

	/** @return array{ok:bool,result:null,error:string} */
	private static function failure(string $message): array
	{
		return array('ok' => false, 'result' => null, 'error' => $message);
	}
}
