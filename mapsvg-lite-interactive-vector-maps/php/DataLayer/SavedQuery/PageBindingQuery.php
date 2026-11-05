<?php

declare(strict_types=1);
namespace MapSVG\DataLayer\SavedQuery;

use MapSVG\App\Data\Query\BatchAwareQueryResolver;
use MapSVG\App\Data\Query\QueryAccessContext;
use MapSVG\App\Data\Query\QueryBatchPolicy;
use MapSVG\App\Data\Query\QueryRejected;
use MapSVG\DataLayer\Collection\CollectionQueryExecutionService;
use MapSVG\Shared\SavedQuery\QueryRpcOptions;
use MapSVG\Shared\SavedQuery\SavedQueryInput;
use MapSVG\Shared\Collection\CollectionQueryProjection;

/** Server-owned Page invocation. No client table, predicate, projection or access policy. */
final class PageBindingQuery implements BatchAwareQueryResolver
{
    private SavedQueryStore $store;
    private CollectionQueryExecutionService $execution;
    private $loadMap;
    public function __construct(?SavedQueryStore $store = null, ?CollectionQueryExecutionService $execution = null, ?callable $loadMap = null)
    {
        $this->store = $store ?? new SavedQueryStore();
        $this->execution = $execution ?? new CollectionQueryExecutionService();
        $this->loadMap = $loadMap ?? static function (int $id) {
            $map = \MapSVG\RepositoryFactory::get('map')->findById($id);
            // Same user/App/draft-bound nonce check as the initial preview Map read.
            \MapSVG\AppDraftPreview::apply($map);
            return $map;
        };
    }
    public function authorize(object $context, \stdClass $params): void
    {
        if (!$context instanceof QueryAccessContext || $context->siteId() < 1 || $context->userId() < 0) throw new QueryRejected('forbidden');
        if (function_exists('get_current_blog_id') && (int) get_current_blog_id() !== $context->siteId()) throw new QueryRejected('forbidden');
        if ((isset($params->editorBinding) || isset($params->field)) && !$context->canEditQueries()) throw new QueryRejected('forbidden');
    }
    public function validateParams(\stdClass $params): \stdClass
    {
        if (array_diff(array_keys(get_object_vars($params)), array('mapId', 'pageId', 'role', 'page', 'runtime', 'versionId', 'editorBinding', 'field', 'withSchema', 'schemaRevision', 'schemaOnly'))
            || !is_int($params->mapId ?? null) || $params->mapId < 1
            || !is_string($params->pageId ?? null) || strlen($params->pageId) > 120
            || !in_array($params->role ?? null, array('objects', 'regions'), true)
            || (isset($params->page) && (!is_int($params->page) || $params->page < 1 || $params->page > 1000000))
            || (isset($params->versionId) && (!is_int($params->versionId) || $params->versionId < 1))
            || (isset($params->editorBinding) && !$params->editorBinding instanceof \stdClass)
            || (isset($params->runtime) && !$params->runtime instanceof \stdClass)
            || (isset($params->withSchema) && !is_bool($params->withSchema))
            || (isset($params->schemaOnly) && !is_bool($params->schemaOnly))
            || (!empty($params->schemaOnly) && isset($params->field))
            || (isset($params->schemaRevision) && (!is_string($params->schemaRevision) || !preg_match('/\A[a-f0-9]{64}\z/D', $params->schemaRevision)))
            || (isset($params->field) && (!is_string($params->field) || $params->field === ''))) throw new QueryRejected('invalid_params');
        return $params;
    }
    public function batchPolicy(\stdClass $params, object $context): QueryBatchPolicy
    {
        $this->authorize($context, $params);
        return new QueryBatchPolicy(null, 5000);
    }

    /** Compatible defaults are read-only; explicit Page settings always win. */
    public static function binding(array $options, string $role, string $pageId): array
    {
        $page = null;
        foreach ($options['scenes'] ?? array() as $candidate) if (($candidate['id'] ?? '') === $pageId) $page = $candidate;
        if ($page === null && !($pageId === 'scene-1' && empty($options['scenes']))) throw new \OutOfBoundsException('Page not found.');
        $saved = $page['dataBindings'][$role] ?? array();
        if (!is_array($saved)) throw new \InvalidArgumentException('Invalid Page binding.');
        $builtin = $role === 'objects' ? 'getObjects' : 'getRegions';
        $saved['queryId'] = $saved['queryId'] ?? $builtin;
        $ownsMenu = (($options['menu']['source'] ?? 'database') === 'regions' ? 'regions' : 'objects') === $role;
        if (!array_key_exists('orderBy', $saved) && $saved['queryId'] === $builtin && $ownsMenu && !empty($options['menu']['sortBy'])) {
            $saved['orderBy'] = array(array($options['menu']['sortBy'] => ($options['menu']['sortDirection'] ?? 'desc')));
        }
        if (!array_key_exists('filterout', $saved) && $ownsMenu && !empty($options['menu']['filterout']['field'])) {
            $saved['filterout'] = array($options['menu']['filterout']['field'] => $options['menu']['filterout']['val']);
        }
        $saved['pagination'] = array_merge(array('on' => false, 'perpage' => 30, 'showIn' => 'both', 'next' => 'Next', 'prev' => 'Prev.'),
            $role === 'objects' ? ($options['database']['pagination'] ?? array()) : array(), $saved['pagination'] ?? array());
        $saved['disableOn'] = self::loadingPolicy($saved, array(
            'initialLoad' => $role === 'objects' && ($options['database']['loadOnStart'] ?? true) === false,
            'emptyFilters' => $role === 'objects' && ($options['database']['noFiltersNoLoad'] ?? false) === true,
        ));
        return $saved;
    }

    public function execute(\stdClass $params, object $context)
    {
        $this->authorize($context, $params);
        $this->validateParams($params);
        try {
            $map = ($this->loadMap)($params->mapId);
            if (!$map || (int) $map->id !== $params->mapId || (isset($map->status) && (int) $map->status === 0)) throw new QueryRejected('app_not_found');
            if ($context->canEditQueries() && function_exists('apply_filters') && !apply_filters('mapsvg_can_edit_app', true, $params->mapId, $context->userId())) throw new QueryRejected('forbidden');
            if (isset($params->versionId)) \MapSVG\AppPublishedVersion::apply($map, $params->versionId);
            elseif (!$context->canEditQueries() && !(new \MapSVG\AppDraftStore())->hasPublishedVersion($params->mapId)) throw new QueryRejected('app_not_found');
            $binding = isset($params->editorBinding) ? self::normalizeEditorBinding($params->editorBinding)
                : self::binding($map->options, $params->role, $params->pageId);
            $source = PageBindingSource::resolve($map, $params->role, $binding, $this->store);
            $schema = $source['schema'];
            $saved = $source['query'];
            $queryId = $binding['queryId'];
            $sourceRevision = QuerySchemaProjection::revision($schema);
            $input = $saved ? SavedQueryInput::members($saved['input']) : array();
            if ($saved && isset($saved['rpc'])) {
                $rpc = QueryRpcOptions::fromArray($saved['rpc']);
                $access = $rpc->access();
                if ($access !== 'public' && !($access === 'authenticated' && $context->userId() > 0)
                    && !($access === 'editor' && $context->canEditQueries())) throw new QueryRejected('forbidden');
                $rpc->assertFields(QuerySchemaProjection::fields($schema), $input);
                $input = $rpc->bind($input, (object) ($binding['params'] ?? array()), $context->userId());
            } elseif (!empty($binding['params'])) throw new QueryRejected('invalid_params');
            if (array_key_exists('orderBy', $binding) && $binding['orderBy'] !== null && $binding['orderBy'] !== array()) $input['orderBy'] = $binding['orderBy'];
            $pagination = $binding['pagination'] ?? array();
            $overrideSize = array_key_exists('perPage', $binding);
            if ($overrideSize && $binding['perPage'] !== null && (!is_int($binding['perPage']) || $binding['perPage'] < 1 || $binding['perPage'] > 5000)) throw new QueryRejected('invalid_params');
            // Missing take on a Regions Query means all regions, not the Objects
            // default page size. Keep each RPC bounded; the runtime joins chunks.
            $unpaged = $schema->hasSvgBinding() && !array_key_exists('take', $input)
                && (!isset($binding['perPage'])) && ($overrideSize || empty($pagination['on']));
            $take = $unpaged ? 5000 : ($overrideSize ? ($binding['perPage'] ?? $input['take'] ?? 50)
                : (!empty($pagination['on']) ? ($pagination['perpage'] ?? 30) : ($input['take'] ?? 5000)));
            if (!is_int($take) || $take < 0 || $take > 5000) throw new QueryRejected('invalid_params');
            if ($saved && isset($saved['rpc'])) $take = min($take, $input['take'] ?? 50);
            $page = $unpaged || $overrideSize || array_key_exists('take', $input) || !empty($pagination['on']) ? ($params->page ?? 1) : 1;
            $input['take'] = $take;
            $input['skip'] = ($page - 1) * $take;
            if ($input['skip'] > 1000000) throw new QueryRejected('invalid_params');
            $runtime = isset($params->runtime) ? json_decode(json_encode($params->runtime), true) : array();
            if (array_diff(array_keys($runtime), array('filters', 'search', 'searchField', 'searchFallback'))) throw new QueryRejected('invalid_params');
            if (isset($runtime['filters']) && !is_array($runtime['filters'])) throw new QueryRejected('invalid_params');
            if (isset($runtime['search']) && !is_string($runtime['search'])) throw new QueryRejected('invalid_params');
            $rowsDisabled = !isset($params->field) && (!empty($params->schemaOnly)
                || ($binding['disableOn']['emptyFilters'] && !self::hasRuntimeFilters($runtime)));
            $runtime['filterout'] = $binding['filterout'] ?? array();
            if ($params->role === 'regions' && in_array('orphaned', $schema->getFieldNames(), true)) $runtime['filterout']['orphaned'] = 1;
            if (isset($params->field)) {
                if (!preg_match('/\A[A-Za-z_][A-Za-z0-9_.-]{0,240}\z/D', $params->field) || !in_array(explode('.', $params->field)[0], $schema->getFieldNames(), true)) throw new QueryRejected('invalid_params');
                $input['select'] = array(explode('.', $params->field)[0]);
                $input['skip'] = 0; $input['take'] = 5000;
            }
            if ($saved && serialize($saved) !== serialize($this->store->query($saved['id']))) throw new QueryRejected('query_changed');
            $regionNames = array();
            if ($params->role === 'regions') $regionNames[] = $schema->name;
            else {
                try {
                    $regions = PageBindingSource::resolve($map, 'regions', self::binding($map->options, 'regions', $params->pageId), $this->store);
                    $regionNames[] = $regions['schema']->name;
                } catch (QueryRejected $error) {
                    // A Page without a valid Regions binding can still render Objects;
                    // relation filters against that missing source remain invalid.
                }
            }
            // Describe the Query projection without scanning/counting records.
            // Filters need schema/options even before the first enabled data read.
            $result = $rowsDisabled ? array('rows' => array(), 'count' => 0)
                : $this->execution->executePageBinding($schema, $input, $runtime, array('allowedRegionTables' => $regionNames));
            $currentSchema = $saved ? $this->store->resolveSchema((int) $saved['schemaId']) : $schema;
            if ($saved && (!$currentSchema || serialize($saved) !== serialize($this->store->query($saved['id']))
                || !hash_equals($sourceRevision, QuerySchemaProjection::revision($currentSchema)))) throw new QueryRejected('query_changed');
            $rows = CollectionQueryProjection::apply($result['rows'], $input);
            $rows = \MapSVG\DataLayer\Post\PageBindingPostHydrator::hydrate($schema, $rows);
            if (isset($params->field)) {
                if ($result['count'] > 5000) throw new QueryRejected('result_too_large');
                $values = array();
                $labels = array();
                foreach ($schema->getField(explode('.', $params->field)[0])->options ?? array() as $option) {
                    $option = (array) $option;
                    if (isset($option['value'])) $labels[(string) $option['value']] = (string) ($option['label'] ?? $option['value']);
                }
                foreach ($rows as $row) {
                    foreach (self::fieldValues($row, explode('.', $params->field)) as $entry) {
                        $label = is_array($entry) ? ($entry['label'] ?? $entry['name'] ?? $entry['title'] ?? null) : null;
                        // WP_Tax_Query matches slugs. Keep the display name only
                        // as a label so custom/translated term names round-trip.
                        if (is_array($entry)) $entry = $entry['value'] ?? (strpos($params->field, 'post.taxonomy.') === 0 ? ($entry['slug'] ?? null) : ($entry['id'] ?? null));
                        if (!is_scalar($entry) || $entry === '') continue;
                        $entry = is_bool($entry) ? ($entry ? '1' : '0') : (string) $entry;
                        $values[$entry] = array('value' => $entry, 'label' => $labels[$entry] ?? (string) ($label ?? $entry));
                    }
                }
                return array('options' => array_values($values));
            }
            $description = PageBindingSource::resultSchema($schema, $input);
            $revision = hash('sha256', json_encode(array($saved['id'] ?? $queryId, $description), JSON_THROW_ON_ERROR));
            $response = array('rows' => $rows, 'count' => $result['count'], 'page' => array('skip' => $input['skip'], 'take' => $take, 'hasMore' => $take > 0 && $input['skip'] + count($rows) < $result['count'], 'paginated' => !$unpaged), 'queryName' => $saved['name'] ?? $queryId, 'schemaRevision' => $revision,
                'bindingRevision' => hash('sha256', serialize(array($saved, $binding, $sourceRevision))));
            if (!empty($params->withSchema) || ($params->schemaRevision ?? null) !== $revision) $response['schema'] = $description;
            return $response;
        } catch (QueryRejected $error) { throw $error; }
        catch (\InvalidArgumentException | \LengthException $error) { throw new QueryRejected('invalid_params'); }
        catch (\OutOfBoundsException $error) { throw new QueryRejected('resource_not_found'); }
    }
    private static function normalizeEditorBinding(\stdClass $binding): array
    {
        $value = json_decode(json_encode($binding), true);
        if (array_diff(array_keys($value), array('queryId', 'params', 'orderBy', 'perPage', 'pagination', 'refetch', 'filterout', 'disableOn')) || !is_string($value['queryId'] ?? null)) throw new QueryRejected('invalid_params');
        $value['disableOn'] = self::loadingPolicy($value);
        return $value;
    }

    private static function loadingPolicy(array $binding, array $defaults = array('initialLoad' => false, 'emptyFilters' => false)): array
    {
        $policy = $binding['disableOn'] ?? array();
        if (!is_array($policy) || array_diff(array_keys($policy), array('initialLoad', 'emptyFilters'))) throw new QueryRejected('invalid_params');
        foreach ($policy as $value) if (!is_bool($value)) throw new QueryRejected('invalid_params');
        return array_merge($defaults, $policy);
    }

    /** Saved predicates/params and internal orphan flags are not user filters. */
    private static function hasRuntimeFilters(array $runtime): bool
    {
        if (trim($runtime['search'] ?? '') !== '') return true;
        foreach ($runtime['filters'] ?? array() as $key => $value) {
            if ($key !== 'includeOrphans' && self::hasFilterValue($value)) return true;
        }
        return false;
    }

    private static function hasFilterValue($value): bool
    {
        if ($value === null) return false;
        if (is_string($value)) return trim($value) !== '';
        if (is_array($value)) {
            foreach ($value as $entry) if (self::hasFilterValue($entry)) return true;
            return false;
        }
        return true;
    }

    /** Traverse post/meta/taxonomy and multiselect arrays without losing labels. */
    private static function fieldValues($value, array $path): array
    {
        if ($path === array()) {
            return is_array($value) && array_values($value) === $value ? $value : array($value);
        }
        if (!is_array($value)) return array();
        if ($value !== array() && array_values($value) === $value) {
            $values = array();
            foreach ($value as $entry) $values = array_merge($values, self::fieldValues($entry, $path));
            return $values;
        }
        $part = array_shift($path);
        return self::fieldValues($value[$part] ?? null, $path);
    }
}
