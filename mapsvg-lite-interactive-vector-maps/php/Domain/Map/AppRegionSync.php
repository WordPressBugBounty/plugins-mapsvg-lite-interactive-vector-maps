<?php

namespace MapSVG;

use MapSVG\DataLayer\DataLayerFactory;
use MapSVG\DataLayer\Mapping\SchemaRecordMapper;
use MapSVG\DataLayer\SavedQuery\PageBindingQuery;
use MapSVG\DataLayer\SavedQuery\PageBindingSource;
use MapSVG\DataLayer\SavedQuery\QuerySchemaProjection;
use MapSVG\DataLayer\Validation\RecordValidationService;

/** Additive SVG sync and separate reviewed cleanup; caller owns the App/SVG lock and transaction. */
final class AppRegionSync
{
    private $source;
    private $svg;
    private $model;
    private $cleanupGuard;
    private $cleanupDelete;

    public function __construct(?callable $source = null, ?callable $svg = null, ?callable $model = null, ?callable $cleanupGuard = null, ?callable $cleanupDelete = null)
    {
        $this->source = $source ?? static function (array $options, int $mapId, string $pageId): array {
            $map = new Map(['id' => $mapId, 'options' => $options]);
            return PageBindingSource::resolve($map, 'regions', PageBindingQuery::binding($options, 'regions', $pageId));
        };
        $this->svg = $svg ?? static function (string $source): string {
            list($file) = SVGFileController::readMapSource($source);
            $body = file_get_contents($file->serverPath);
            if ($body === false) throw new \RuntimeException('Cannot read the SVG file.', 422);
            return $body;
        };
        $this->model = $model ?? static function (Schema $schema) {
            return DataLayerFactory::createV2(null, ['force' => true])->modelForSchema($schema);
        };
        $this->cleanupGuard = $cleanupGuard ?? static function (Schema $schema, int $mapId, string $pageId, array $options): void {
            (new AppRegionCleanupReferences())->assertUnshared($schema, $mapId, $pageId, $options);
        };
        $this->cleanupDelete = $cleanupDelete ?? static function (Schema $schema, array $ids): array {
            $layer = DataLayerFactory::createV2(null, ['force' => true]);
            return \MapSVG\DataLayer\Relation\RegionOrphanDeleteServiceFactory::forSchema($layer, $schema)->deleteWithinTransaction($ids);
        };
    }

    public function previewCleanup(array $draft, string $pageId, string $stateId): array
    {
        return $this->prepareCleanup($draft, $pageId, $stateId)['plan'];
    }

    /** Caller owns the App/SVG lease and transaction, including relation detachment. */
    public function applyCleanup(array $draft, string $pageId, string $stateId, string $token): array
    {
        $prepared = $this->prepareCleanup($draft, $pageId, $stateId);
        if (!hash_equals($prepared['plan']['token'], $token)) throw new \RuntimeException('The SVG, binding or Region records changed. Review cleanup again.', 409);
        $ids = array_column($prepared['plan']['removals'], 'id');
        $result = ($this->cleanupDelete)($prepared['schema'], $ids);
        if ($result['deleted'] !== count($ids)) throw new \RuntimeException('Region records changed. Review cleanup again.', 409);
        return $result;
    }

    private function prepareCleanup(array $draft, string $pageId, string $stateId): array
    {
        $prepared = $this->prepare($draft, $pageId, $stateId);
        $schema = $prepared['schema'];
        if (!$schema->getField('orphaned')) throw new \InvalidArgumentException('This Collection has no orphaned Region records.', 422);
        ($this->cleanupGuard)($schema, (int) $draft['map_id'], $pageId, $prepared['options']);
        $primary = $schema->getPrimaryKeyFieldName();
        $where = ['orphaned' => 1];
        if ($prepared['plan']['prefix'] !== '') $where[$primary] = ['startsWith' => $prepared['plan']['prefix']];
        $rows = $prepared['model']->findMany(['where' => $where, 'orderBy' => [[$primary => 'asc']], 'take' => 10001]);
        if (count($rows) > 10000) throw new \RuntimeException('Review orphan Regions in smaller prefix groups (maximum 10,000).', 413);
        $present = array_flip(array_column($prepared['candidates'], 'id'));
        $removals = [];
        foreach ($rows as $row) {
            if (!isset($present[(string) $row[$primary]])) $removals[] = ['id' => (string) $row[$primary], 'title' => (string) ($row['title'] ?? '')];
        }
        $prepared['plan'] = [
            'token' => hash('sha256', serialize(['cleanup', $prepared['plan']['token'], $rows])),
            'revision' => (int) $draft['revision'], 'collection' => $prepared['plan']['collection'],
            'removals' => $removals, 'protected' => count($rows) - count($removals),
        ];
        return $prepared;
    }

    /** No record writes. The token identifies this exact reviewed input/result. */
    public function preview(array $draft, string $pageId, string $stateId): array
    {
        return $this->prepare($draft, $pageId, $stateId)['plan'];
    }

    public function apply(array $draft, string $pageId, string $stateId, string $token): array
    {
        $prepared = $this->prepare($draft, $pageId, $stateId);
        $plan = $prepared['plan'];
        if (!hash_equals($plan['token'], $token)) throw new \RuntimeException('The SVG, binding or Region records changed. Review the changes again.', 409);
        $mapper = new SchemaRecordMapper($prepared['schema']);
        $validation = new RecordValidationService();
        $rows = [];
        foreach ($plan['additions'] as $row) {
            $validation->validate($prepared['schema'], $row, 'create');
            $rows[] = $mapper->toStorage($row);
        }
        $inserted = 0;
        // Plain insert, never upsert/replace: a racing duplicate aborts the caller's
        // transaction and cannot overwrite custom data or touch relation tables.
        foreach (array_chunk($rows, 250) as $chunk) {
            $written = $prepared['model']->createMany(['data' => $chunk]);
            if ($written !== count($chunk)) throw new \RuntimeException('Region records changed. Review the changes again.', 409);
            $inserted += $written;
        }
        return ['inserted' => $inserted, 'collection' => $plan['collection']];
    }

    private function prepare(array $draft, string $pageId, string $stateId): array
    {
        $options = json_decode(wp_json_encode($draft['snapshot']['options']), true);
        if (!is_array($options) || AppEngine::version($options) !== 9) throw new \InvalidArgumentException('Open a v9 draft before synchronizing Regions.', 400);
        $options = self::sceneOptions($options, $pageId, $stateId);
        $binding = PageBindingQuery::binding($options, 'regions', $pageId);
        $source = ($this->source)($options, (int) $draft['map_id'], $pageId);
        $schema = $source['schema'];
        if (!$schema->isLocal() || !$schema->hasSvgBinding() || in_array($schema->type, ['api', 'post'], true)) {
            throw new \InvalidArgumentException('Choose a local SVG Regions Collection in the Page Regions binding.', 422);
        }
        $primary = $schema->getPrimaryKeyFieldName();
        if (!preg_match('/\A(?:var)?char\((\d+)\)/i', $schema->getField($primary)->db_type ?? '', $length)) {
            throw new \InvalidArgumentException('SVG synchronization requires a text Region ID field.', 422);
        }
        $prefix = $options['regionPrefix'] ?? '';
        if (!is_string($prefix) || strlen($prefix) > 1024) throw new \InvalidArgumentException('Invalid Region ID prefix.', 400);
        $xml = ($this->svg)((string) ($options['source'] ?? ''));
        $candidates = self::regions($xml, $prefix, (int) $length[1]);
        $model = ($this->model)($schema);
        $existing = [];
        $orphaned = 0;
        $select = [$primary];
        if ($schema->getField('orphaned')) $select[] = 'orphaned';
        foreach (array_chunk(array_column($candidates, 'id'), 250) as $ids) {
            foreach ($model->findMany(['where' => [$primary => ['in' => $ids]], 'select' => $select, 'take' => 250]) as $row) {
                $id = (string) $row[$primary];
                if (!in_array($id, $ids, true)) throw new \RuntimeException('An existing Region ID differs from its SVG ID. Match the IDs exactly before synchronizing.', 409);
                $existing[$id] = true;
                if (!empty($row['orphaned'])) $orphaned++;
            }
        }
        $additions = array_values(array_filter($candidates, static function ($row) use ($existing) { return !isset($existing[$row['id']]); }));
        $existingIds = array_keys($existing);
        sort($existingIds, SORT_STRING);
        $token = hash('sha256', serialize([(int) $draft['map_id'], (int) $draft['id'], (int) $draft['revision'], $pageId, $stateId,
            $binding, $source['query'], QuerySchemaProjection::revision($schema), $schema->zodSettings ?? null,
            $options['source'], $prefix, hash('sha256', $xml), $existingIds, $additions]));
        return ['schema' => $schema, 'model' => $model, 'options' => $options, 'candidates' => $candidates, 'plan' => [
            'token' => $token, 'revision' => (int) $draft['revision'], 'pageId' => $pageId, 'stateId' => $stateId, 'prefix' => $prefix,
            'collection' => ['id' => (int) $schema->id, 'name' => $schema->name, 'title' => $schema->title ?: $schema->name],
            'matched' => count($candidates), 'existing' => count($existing), 'orphaned' => $orphaned, 'additions' => $additions,
        ]];
    }

    /** Same membership as svgRegion.ts: shape + ID + prefix, outside defs, not excluded. */
    public static function regions(string $xml, string $prefix, int $idLength = 255): array
    {
        if ($xml === '' || strlen($xml) > 8 * 1024 * 1024 || preg_match('/<!\s*(?:DOCTYPE|ENTITY)\b/i', $xml)) throw new \InvalidArgumentException('Unsupported SVG document.', 422);
        $before = libxml_use_internal_errors(true);
        try { $document = new \DOMDocument(); $valid = $document->loadXML($xml, LIBXML_NONET); }
        finally { libxml_clear_errors(); libxml_use_internal_errors($before); }
        if (!$valid || $document->documentElement->localName !== 'svg' || $document->documentElement->namespaceURI !== 'http://www.w3.org/2000/svg') throw new \InvalidArgumentException('Invalid SVG document.', 422);
        $xpath = new \DOMXPath($document);
        $seen = []; $regions = [];
        foreach ($xpath->query('//*[@id]') as $element) {
            $id = $element->getAttribute('id');
            if ($id === '') continue;
            if (isset($seen[$id])) throw new \InvalidArgumentException('Duplicate SVG ID: ' . $id, 422);
            $seen[$id] = true;
            if (!in_array($element->localName, ['path', 'polygon', 'circle', 'ellipse', 'rect'], true)
                || ($prefix !== '' && strpos($id, $prefix) !== 0)
                || in_array(strtolower(trim($element->getAttribute('data-mapsvg-region-exclude'))), ['true', '1'], true)) continue;
            foreach ($xpath->query('ancestor::*', $element) as $parent) if ($parent->localName === 'defs') continue 2;
            if (preg_match_all('/./us', $id) > $idLength) throw new \InvalidArgumentException('SVG Region ID is too long: ' . $id, 422);
            $title = $element->getAttribute('title');
            if ($title === '') foreach ($element->childNodes as $child) if ($child instanceof \DOMElement && $child->localName === 'title') { $title = $child->textContent; break; }
            preg_match('/\A.{0,255}/us', trim($title), $shortTitle);
            $regions[] = ['id' => $id, 'title' => $shortTitle[0] ?? ''];
            if (count($regions) > 10000) throw new \InvalidArgumentException('The SVG contains more than 10,000 Regions.', 413);
        }
        usort($regions, static function ($a, $b) { return strcmp($a['id'], $b['id']); });
        return $regions;
    }

    /** Resolve only the selected Page's stored binding overrides, never client table data. */
    private static function sceneOptions(array $options, string $pageId, string $stateId): array
    {
        if ($stateId === 'root' || $stateId === 'scene:' . $pageId) return $options;
        $states = array_column($options['stateGraph']['states'] ?? [], null, 'id');
        if (!isset($states[$stateId]) || ($states[$stateId]['sceneId'] ?? null) !== $pageId) throw new \InvalidArgumentException('Scene not found in this Page.', 400);
        $chain = []; $seen = []; $id = $stateId;
        while ($id) {
            if (isset($seen[$id]) || !isset($states[$id])) throw new \InvalidArgumentException('Invalid Scene inheritance.', 400);
            $seen[$id] = true; array_unshift($chain, $states[$id]);
            $id = ($options['stateGraph']['version'] ?? 2) === 1 ? ($states[$id]['parentId'] ?? null) : null;
        }
        foreach ($chain as $state) foreach ($state['changes'] ?? [] as $change) {
            $path = $change['path'] ?? [];
            if (($path[0] ?? null) === 'scenes') self::applyChange($options, $path, $change['value'] ?? null, !empty($change['remove']));
        }
        return $options;
    }

    private static function applyChange(array &$target, array $path, $value, bool $remove): void
    {
        $key = array_shift($path);
        if (!is_string($key) || in_array($key, ['__proto__', 'prototype', 'constructor'], true)) throw new \InvalidArgumentException('Invalid Scene path.', 400);
        if (substr($key, 0, 1) === '@') {
            foreach ($target as $index => &$entry) {
                if (!is_array($entry) || ($entry['id'] ?? '') !== substr($key, 1)) continue;
                if ($path !== []) self::applyChange($entry, $path, $value, $remove);
                elseif ($remove) unset($target[$index]);
                else $entry = $value;
                break;
            }
        } elseif ($path === []) {
            if ($remove) unset($target[$key]); else $target[$key] = $value;
        } else {
            if (!isset($target[$key]) || !is_array($target[$key])) $target[$key] = [];
            self::applyChange($target[$key], $path, $value, $remove);
        }
    }
}
