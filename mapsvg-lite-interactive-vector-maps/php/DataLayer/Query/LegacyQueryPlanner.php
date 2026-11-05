<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

use MapSVG\DataLayer\Mapping\RecordMapper;
use MapSVG\DataLayer\StorageSchemaResolution;
use MapSVG\Query;
use MapSVG\Schema;

/** Translates the complete legacy Query or classifies it as advanced. */
final class LegacyQueryPlanner
{
    private Schema $schema;
    private QueryFieldResolver $fields;
    private QueryLimits $limits;

    public function __construct(
        Schema $schema,
        RecordMapper $mapper,
        ?StorageSchemaResolution $resolution = null,
        ?QueryLimits $limits = null
    ) {
        $this->schema = $schema;
        $this->fields = new QueryFieldResolver($schema, $mapper, $resolution);
        $this->limits = $limits ?? new QueryLimits();
    }

    /**
     * Supported context: resolvedPostIds => bounded scalar ID list.
     *
     * @param array<string, mixed> $context
     */
    public function plan(Query $query, array $context = array()): QueryPlan
    {
        $this->assertContext($context);
        list($page, $perpage, $skip, $take, $hardLimit, $extraRow) =
            $this->pagination($query);
        $this->validateFilterInputs($query, $context);

        $advanced = $this->advancedReasons($query, $context);
        $select = $this->select($query);
        $where = $this->where($query, $context);
        if ($advanced !== array()) {
            $distance = $this->distance($query);
            return QueryPlan::advanced(
                QueryPlan::LEGACY_RESPONSE,
                $advanced,
                $page,
                $perpage,
                array(
                    'source' => 'legacy',
                    'where' => $where,
                    'select' => $select,
                    'orderBy' => $this->advancedOrderBy($query, $distance),
                    'skip' => $skip,
                    'take' => $take,
                    'relations' => $this->relations($query, $context),
                    'distance' => $distance,
                    'search' => $this->search($query),
                    'postFilter' => $this->postFilter($query),
                    'resolvedPostIds' => $context['resolvedPostIds'] ?? null,
                    'resolvedPostSearchIds' => $context['resolvedPostSearchIds'] ?? null,
                    'allowedRegionTables' => $context['allowedRegionTables'] ?? array(),
                    'publicPostTable' => $context['publicPostTable'] ?? null,
                ),
                $extraRow,
                $hardLimit,
                (bool) $query->withCount
            );
        }

        $orderBy = $this->orderBy($query);
        $options = array(
            'orderBy' => $orderBy,
            'take' => $take,
        );
        if ($where !== array()) {
            $options['where'] = $where;
        }
        if ($select !== array()) {
            $options['select'] = $select;
        }
        if ($skip > 0) {
            $options['skip'] = $skip;
        }

        $countOptions = $where === array() ? array() : array('where' => $where);
        return QueryPlan::plasma(
            QueryPlan::LEGACY_RESPONSE,
            $options,
            $countOptions,
            $page,
            $perpage,
            $extraRow,
            $hardLimit,
            (bool) $query->withCount
        );
    }
    /** @param array<string, mixed> $context */
    private function assertContext(array $context): void
    {
        $allowed = array_fill_keys(array(
            'resolvedPostIds',
            'resolvedPostSearchIds',
            'allowedRegionTables',
            'publicPostTable',
        ), true);
        foreach ($context as $name => $_) {
            if (!is_string($name) || !isset($allowed[$name])) {
                throw new \InvalidArgumentException(
                    'Unsupported legacy query-planner context: ' . (string) $name
                );
            }
        }
        foreach (array('resolvedPostIds', 'resolvedPostSearchIds') as $name) {
            if (array_key_exists($name, $context)) {
                $this->boundedList($context[$name], $name, true);
            }
        }
        if (isset($context['publicPostTable']) && (!is_string($context['publicPostTable'])
            || !preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $context['publicPostTable']))) {
            throw new \InvalidArgumentException('Public post table must be a safe server identifier.');
        }
        if (array_key_exists('allowedRegionTables', $context)) {
            $tables = $this->boundedList(
                $context['allowedRegionTables'],
                'allowedRegionTables',
                true
            );
            foreach ($tables as $table) {
                if (!is_string($table)
                    || !preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $table)) {
                    throw new \InvalidArgumentException(
                        'Allowed region table names must be safe identifiers.'
                    );
                }
            }
        }
    }

    /** @return array{0:int,1:int,2:int,3:int,4:?int,5:bool} */
    private function pagination(Query $query): array
    {
        $page = (int) $query->page;
        $perpage = (int) $query->perpage;
        if ($page < 1) {
            throw new \InvalidArgumentException('Legacy query page must be at least 1.');
        }
        if ($perpage < 0) {
            throw new \InvalidArgumentException('Legacy query perpage must not be negative.');
        }
        if ($perpage > $this->limits->maxPageSize()) {
            throw new \LengthException('Legacy query perpage exceeds the server limit.');
        }

        if ($perpage === 0) {
            return array(
                $page,
                0,
                0,
                $this->limits->maxUnboundedRows() + 1,
                $this->limits->maxUnboundedRows(),
                false,
            );
        }

        $pageIndex = $page - 1;
        if ($pageIndex > intdiv(PHP_INT_MAX, $perpage)) {
            throw new \OverflowException('Legacy query pagination offset is too large.');
        }
        $skip = $pageIndex * $perpage;
        return array($page, $perpage, $skip, $perpage + 1, null, true);
    }

    /** @param array<string, mixed> $context */
    private function validateFilterInputs(Query $query, array $context): void
    {
        foreach ((array) $query->filters as $name => $value) {
            if (!is_string($name)) {
                throw new \InvalidArgumentException('Legacy filter fields must have names.');
            }
            if ($this->isLegacyEmpty($value)) {
                continue;
            }
            if ($name === 'prefix') {
                if (is_array($value) || is_object($value)) {
                    throw new \InvalidArgumentException('Prefix filter must be scalar.');
                }
                continue;
            }
            if ($name === 'distance') {
                continue;
            }

            $field = $this->fields->resolve($name);
            if ($field->isRelation() || $field->isLocation()) {
                continue;
            }
            if ($field->isPost()
                && !array_key_exists('resolvedPostIds', $context)) {
                continue;
            }
            if ($field->isPost()) {
                continue;
            }
            if ($field->isMultiselect()) {
                $this->multiselectPredicate($field, $value);
                continue;
            }
            $this->ordinaryPredicate($field, $value);
        }

        foreach ((array) $query->filterout as $name => $value) {
            if (!is_string($name) || $name === '') {
                continue;
            }
            if (is_array($value) || is_object($value)) {
                throw new \InvalidArgumentException(
                    'filterout values must be scalar or null.'
                );
            }
            $field = $this->fields->resolve($name);
            if ($field->isLocation()) {
                throw new \InvalidArgumentException(
                    'Location filterout requires an advanced query.'
                );
            }
            $this->legacyEquality(
                $field,
                $this->legacyPreparedScalar($value)
            );
        }
    }

    /** @param array<string, mixed> $context @return string[] */
    private function advancedReasons(Query $query, array $context): array
    {
        $reasons = array();
        if (isset($context['publicPostTable']) && $this->schema->type === 'post') {
            $reasons[] = 'public_post_visibility';
        }
        if ($query->search !== null && (string) $query->search !== '') {
            $reasons[] = 'search';
        }

        foreach ((array) $query->filters as $name => $value) {
            if (!is_string($name)) {
                throw new \InvalidArgumentException('Legacy filter fields must have names.');
            }
            if ($this->isLegacyEmpty($value) || $name === 'prefix') {
                continue;
            }
            if ($name === 'distance') {
                $reasons[] = 'distance';
                continue;
            }

            $field = $this->fields->resolve($name);
            if ($field->isRelation()) {
                $reasons[] = 'relation:' . $name;
            } elseif ($field->isLocation()) {
                $reasons[] = 'location:' . $name;
            } elseif ($field->isPost()
                && !array_key_exists('resolvedPostIds', $context)) {
                $reasons[] = 'post_filter:' . $name;
            }
        }

        foreach ($this->sortGroups($query) as $group) {
            $name = (string) ($group['field'] ?? '');
            if ($name === 'distance') {
                $reasons[] = 'distance_sort';
                continue;
            }
            $field = $this->fields->resolve($name);
            if ($field->isLocation()) {
                throw new \InvalidArgumentException(
                    'Location fields cannot be sorted without an advanced query extension.'
                );
            }
        }

        return array_values(array_unique($reasons));
    }

    /** @param array<string, mixed> $context @return array<string, mixed> */
    private function where(Query $query, array $context): array
    {
        $predicates = array();
        foreach ((array) $query->filters as $name => $value) {
            if ($this->isLegacyEmpty($value)) {
                continue;
            }
            if ($name === 'prefix') {
                if (is_array($value) || is_object($value)) {
                    throw new \InvalidArgumentException('Prefix filter must be scalar.');
                }
                $predicates[] = array(
                    $this->fields->primaryKey() => array(
                        'startsWith' => (string) $value,
                    ),
                );
                continue;
            }
            if ($name === 'distance') {
                continue;
            }

            $field = $this->fields->resolve((string) $name);
            if ($field->isRelation() || $field->isLocation()) {
                continue;
            }
            if ($field->isPost()) {
                continue;
            }
            if ($field->isMultiselect()) {
                $predicates[] = $this->multiselectPredicate($field, $value);
                continue;
            }
            $predicates[] = $this->ordinaryPredicate($field, $value);
        }

        foreach ((array) $query->filterout as $name => $value) {
            if (!is_string($name) || $name === '') {
                continue;
            }
            if (is_array($value) || is_object($value)) {
                throw new \InvalidArgumentException('filterout values must be scalar or null.');
            }
            $field = $this->fields->resolve($name);
            if ($field->isLocation()) {
                throw new \InvalidArgumentException('Location filterout requires an advanced query.');
            }
            $normalized = $this->legacyEquality(
                $field,
                $this->legacyPreparedScalar($value)
            );
            $predicates[] = array(
                $field->storageName() => array('not' => $normalized),
            );
        }

        if (array_key_exists('resolvedPostIds', $context)) {
            $predicates[] = $this->resolvedPostPredicate($context['resolvedPostIds']);
        }

        return $this->andPredicates($predicates);
    }

    /** @param array<string, mixed> $context @return array<int, array<string, mixed>> */
    private function relations(Query $query, array $context): array
    {
        $relations = array();
        $allowedTables = $context['allowedRegionTables'] ?? array();
        foreach ((array) $query->filters as $name => $value) {
            if (!is_string($name) || $this->isLegacyEmpty($value)) {
                continue;
            }
            if ($name === 'prefix' || $name === 'distance') {
                continue;
            }
            $field = $this->fields->resolve($name);
            if (!$field->isRelation()) {
                continue;
            }
            if (!is_array($value)
                || !isset($value['table_name'])
                || !is_string($value['table_name'])
                || $value['table_name'] === '') {
                throw new \InvalidArgumentException(
                    'Region filters require a trusted table_name.'
                );
            }
            $table = $value['table_name'];
            if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $table)) {
                throw new \InvalidArgumentException('Region table name is invalid.');
            }
            if ($allowedTables !== array() && !in_array($table, $allowedTables, true)) {
                throw new \InvalidArgumentException(
                    'Region filter table is not allowed for this map.'
                );
            }
            $ids = $this->boundedList(
                $value['region_ids'] ?? null,
                'region_ids',
                true
            );
            foreach ($ids as $id) {
                if (!is_scalar($id) || is_bool($id)) {
                    throw new \InvalidArgumentException(
                        'Region IDs must be strings or numbers.'
                    );
                }
            }
            $relations[] = array(
                'field' => $field->storageName(),
                'regionTable' => $table,
                'regionIds' => array_values($ids),
            );
        }
        return $relations;
    }

    /** @return array<string, mixed>|null */
    private function distance(Query $query): ?array
    {
        $filters = (array) $query->filters;
        if (!array_key_exists('distance', $filters)
            || $this->isLegacyEmpty($filters['distance'])) {
            return null;
        }
        $value = $filters['distance'];
        if (!is_array($value) || !isset($value['geoPoint'])
            || !is_array($value['geoPoint'])) {
            throw new \InvalidArgumentException(
                'Distance filter requires a geoPoint object.'
            );
        }
        $lat = $value['geoPoint']['lat'] ?? null;
        $lng = $value['geoPoint']['lng'] ?? null;
        $radius = $value['length'] ?? null;
        foreach (array('latitude' => $lat, 'longitude' => $lng, 'radius' => $radius) as $label => $number) {
            if (!is_numeric($number) || !is_finite((float) $number)) {
                throw new \InvalidArgumentException(
                    'Distance ' . $label . ' must be a finite number.'
                );
            }
        }
        $lat = (float) $lat;
        $lng = (float) $lng;
        $radius = (float) $radius;
        if ($lat < -90 || $lat > 90) {
            throw new \InvalidArgumentException('Distance latitude is out of range.');
        }
        if ($lng < -180 || $lng > 180) {
            throw new \InvalidArgumentException('Distance longitude is out of range.');
        }
        if ($radius < 0) {
            throw new \InvalidArgumentException('Distance radius must not be negative.');
        }
        $units = strtolower((string) ($value['units'] ?? 'km'));
        if (!in_array($units, array('km', 'mi'), true)) {
            throw new \InvalidArgumentException('Distance units must be km or mi.');
        }
        return array(
            'lat' => $lat,
            'lng' => $lng,
            'radius' => $radius,
            'units' => $units,
        );
    }

    /** @return array<string, mixed>|null */
    private function search(Query $query): ?array
    {
        if ($query->search === null || (string) $query->search === '') {
            return null;
        }
        if (is_array($query->search) || is_object($query->search)) {
            throw new \InvalidArgumentException('Search text must be scalar.');
        }
        $term = (string) $query->search;
        if (strlen($term) > 1000) {
            throw new \LengthException('Search text exceeds the server limit.');
        }
        return array(
            'term' => $term,
            'fallback' => isset($query->searchFallback)
                && $query->searchFallback === true,
        );
    }

    /** @return array<string, mixed>|null */
    private function postFilter(Query $query): ?array
    {
        foreach ((array) $query->filters as $name => $value) {
            if (!is_string($name) || $this->isLegacyEmpty($value)) {
                continue;
            }
            if ($name === 'prefix' || $name === 'distance') {
                continue;
            }
            $field = $this->fields->resolve($name);
            if (!$field->isPost()) {
                continue;
            }
            if (!is_array($value)) {
                throw new \InvalidArgumentException(
                    'Post filters must be an object.'
                );
            }
            return array(
                'field' => $field->storageName(),
                'value' => $value,
            );
        }
        return null;
    }

    /**
     * @param array<string, mixed>|null $distance
     * @return array<int, array<string, string>>
     */
    private function advancedOrderBy(Query $query, ?array $distance): array
    {
        $groups = $this->sortGroups($query);
        $order = array();
        $hasDistance = false;
        foreach ($groups as $group) {
            $name = (string) $group['field'];
            $direction = strtolower((string) $group['order']);
            if ($name === 'distance') {
                if ($distance === null) {
                    throw new \InvalidArgumentException(
                        'Distance sorting requires a distance filter.'
                    );
                }
                $hasDistance = true;
                $order[] = array(
                    'kind' => 'distance',
                    'direction' => $direction,
                );
                continue;
            }
            $field = $this->fields->resolve($name);
            if ($field->isLocation() || $field->isRelation()) {
                throw new \InvalidArgumentException(
                    'Location and relation fields cannot be sorted directly.'
                );
            }
            $order[] = array(
                'kind' => 'field',
                'field' => $field->storageName(),
                'direction' => $direction,
            );
        }

        if ($groups === array()) {
            $sortName = isset($query->sortBy) && (string) $query->sortBy !== ''
                ? (string) $query->sortBy
                : $this->fields->primaryKey();
            $sortDirection = isset($query->sortDir) && (string) $query->sortDir !== ''
                ? strtolower((string) $query->sortDir)
                : 'desc';
            if (!in_array($sortDirection, array('asc', 'desc'), true)) {
                throw new \InvalidArgumentException('Sort direction must be asc or desc.');
            }
            if ($distance !== null) {
                $hasDistance = true;
                $order[] = array('kind' => 'distance', 'direction' => 'asc');
            }
            $field = $this->fields->resolve($sortName);
            if ($field->isLocation() || $field->isRelation()) {
                throw new \InvalidArgumentException(
                    'Location and relation fields cannot be sorted directly.'
                );
            }
            $order[] = array(
                'kind' => 'field',
                'field' => $field->storageName(),
                'direction' => $sortDirection,
            );
        } elseif ($distance !== null && !$hasDistance) {
            array_unshift($order, array(
                'kind' => 'distance',
                'direction' => 'asc',
            ));
        }

        return $order;
    }

    /** @return array<string, mixed> */
    private function ordinaryPredicate(ResolvedQueryField $field, $value): array
    {
        $comparison = NumericFilterPredicate::read($field->schemaField(), $value);
        if ($comparison !== null) return [$field->storageName() => $comparison];
        if (!is_array($value)) {
            return array(
                $field->storageName() => $this->legacyEquality($field, $value),
            );
        }

        $values = $this->boundedList($value, $field->publicName(), false);
        $normalized = array();
        foreach ($values as $item) {
            $item = $this->extractChoiceValue($item);
            if (is_array($item) || is_object($item)) {
                throw new \InvalidArgumentException('IN filter values must be scalar or null.');
            }
            $normalized[] = $this->legacyEquality(
                $field,
                $this->legacyPreparedScalar($item)
            );
        }

        return array(
            $field->storageName() => array('in' => $normalized),
        );
    }

    /** @return array<string, mixed> */
    private function multiselectPredicate(ResolvedQueryField $field, $value): array
    {
        $operator = 'and';
        if (is_array($value)
            && !self::isList($value)
            && array_key_exists('operator', $value)
            && array_key_exists('value', $value)) {
            $operator = strtolower((string) $value['operator']);
            $value = $value['value'];
        }
        if (!in_array($operator, array('and', 'or', 'in'), true)) {
            throw new \InvalidArgumentException(
                'Multiselect operator must be and, or, or in.'
            );
        }

        $values = is_array($value)
            ? $this->boundedList($value, $field->publicName(), false)
            : array($value);
        $parts = array();
        foreach ($values as $item) {
            $item = $this->extractChoiceValue($item);
            if (!is_scalar($item) || is_bool($item)) {
                throw new \InvalidArgumentException(
                    'Multiselect values must be strings or numbers.'
                );
            }
            $parts[] = array(
                $field->storageName() => array(
                    'contains' => '"' . (string) $item . '"',
                ),
            );
        }

        if (count($parts) === 1) {
            return $parts[0];
        }
        return array(
            in_array($operator, array('or', 'in'), true) ? 'OR' : 'AND' => $parts,
        );
    }

    /** @return array<string, mixed> */
    private function resolvedPostPredicate($ids): array
    {
        $field = $this->schema->getFieldByType('post');
        if (!$field || empty($field->name)) {
            throw new \InvalidArgumentException(
                'Resolved post IDs require a post field in the schema.'
            );
        }

        $resolved = $this->fields->resolve((string) $field->name);
        $values = $this->boundedList($ids, 'resolvedPostIds', true);
        $normalized = array();
        foreach ($values as $value) {
            if (!is_scalar($value) || is_bool($value)) {
                throw new \InvalidArgumentException(
                    'Resolved post IDs must be strings or integers.'
                );
            }
            $normalized[] = $this->fields->normalizeEquality($resolved, $value);
        }

        return array(
            $resolved->storageName() => array('in' => $normalized),
        );
    }

    /** @return array<int, array<string, string>> */
    private function orderBy(Query $query): array
    {
        $groups = $this->sortGroups($query);
        if ($groups === array()) {
            $sortName = isset($query->sortBy) && (string) $query->sortBy !== ''
                ? (string) $query->sortBy
                : $this->fields->primaryKey();
            $sortDirection = isset($query->sortDir) && (string) $query->sortDir !== ''
                ? strtolower((string) $query->sortDir)
                : 'desc';
            if (!in_array($sortDirection, array('asc', 'desc'), true)) {
                throw new \InvalidArgumentException('Sort direction must be asc or desc.');
            }
            $field = $this->fields->resolve($sortName);
            if ($field->isLocation()) {
                throw new \InvalidArgumentException('Location fields require advanced sorting.');
            }
            return array(array($field->storageName() => $sortDirection));
        }

        $orderBy = array();
        foreach ($groups as $group) {
            $field = $this->fields->resolve((string) $group['field']);
            if ($field->isLocation()) {
                throw new \InvalidArgumentException('Location fields require advanced sorting.');
            }
            $orderBy[] = array(
                $field->storageName() => strtolower((string) $group['order']),
            );
        }
        return $orderBy;
    }

    /** @return string[] */
    private function select(Query $query): array
    {
        $selected = $query->fields;
        if ($selected === null || $selected === array()) {
            return array();
        }
        if (!is_array($selected) || !self::isList($selected)) {
            throw new \InvalidArgumentException('Selected fields must be a list.');
        }

        $storageFields = array();
        foreach ($selected as $name) {
            if (!is_string($name)) {
                throw new \InvalidArgumentException('Selected field names must be strings.');
            }
            $field = $this->fields->resolve($name);
            if ($field->isLocation()) {
                throw new \InvalidArgumentException(
                    'The virtual location field cannot be selected directly.'
                );
            }
            if (in_array($field->storageName(), $storageFields, true)) {
                throw new \InvalidArgumentException('Selected fields must not contain duplicates.');
            }
            $storageFields[] = $field->storageName();
        }
        return $storageFields;
    }

    /** @return array<int, array{field:string,order:string}> */
    private function sortGroups(Query $query): array
    {
        $sort = $query->sort;
        if ($sort === null || $sort === array()) {
            return array();
        }
        if (!is_array($sort)) {
            throw new \InvalidArgumentException('Sort must be an object or list.');
        }
        if (!self::isList($sort)
            && array_key_exists('field', $sort)
            && array_key_exists('order', $sort)) {
            $sort = array($sort);
        }
        if (!self::isList($sort)) {
            throw new \InvalidArgumentException('Sort must be a list of field/order objects.');
        }

        $groups = array();
        foreach ($sort as $group) {
            if (!is_array($group)
                || !isset($group['field'], $group['order'])
                || !is_string($group['field'])
                || !is_string($group['order'])
                || $group['field'] === '') {
                throw new \InvalidArgumentException(
                    'Each sort group requires non-empty field and asc/desc order.'
                );
            }
            $direction = strtolower($group['order']);
            if (!in_array($direction, array('asc', 'desc'), true)) {
                throw new \InvalidArgumentException('Sort direction must be asc or desc.');
            }
            $groups[] = array('field' => $group['field'], 'order' => $direction);
        }
        return $groups;
    }

    /** @return array<int, mixed> */
    private function boundedList($value, string $label, bool $allowEmpty): array
    {
        if (!is_array($value) || !self::isList($value)) {
            throw new \InvalidArgumentException($label . ' must be a list.');
        }
        if (!$allowEmpty && $value === array()) {
            throw new \InvalidArgumentException($label . ' must not be empty.');
        }
        if (count($value) > $this->limits->maxListValues()) {
            throw new \LengthException($label . ' exceeds the server list limit.');
        }
        return array_values($value);
    }

    private function extractChoiceValue($value)
    {
        if (is_array($value) && array_key_exists('value', $value)) {
            return $value['value'];
        }
        if (is_object($value) && isset($value->value)) {
            return $value->value;
        }
        return $value;
    }

    private function legacyEquality(ResolvedQueryField $field, $value)
    {
        if ($value !== null
            && (!is_scalar($value)
                || (is_float($value) && !is_finite($value)))) {
            throw new \InvalidArgumentException(
                'Legacy filters require finite scalar values or null.'
            );
        }

        // DbDataSource passed filter values directly to wpdb preparation. The
        // field binding is validated above, but the scalar itself stays raw.
        return $value;
    }

    private function legacyPreparedScalar($value)
    {
        return $value === null || $value === false ? '' : $value;
    }

    private function isLegacyEmpty($value): bool
    {
        return $value == '';
    }

    /** @param array<int, array<string, mixed>> $predicates */
    private function andPredicates(array $predicates): array
    {
        if ($predicates === array()) {
            return array();
        }
        if (count($predicates) === 1) {
            return $predicates[0];
        }
        return array('AND' => $predicates);
    }

    private static function isList(array $value): bool
    {
        return $value === array()
            || array_keys($value) === range(0, count($value) - 1);
    }
}
