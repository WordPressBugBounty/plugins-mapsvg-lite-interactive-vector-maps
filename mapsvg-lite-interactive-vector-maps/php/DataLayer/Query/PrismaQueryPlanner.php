<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

use MapSVG\DataLayer\Mapping\RecordMapper;
use MapSVG\DataLayer\StorageSchemaResolution;
use MapSVG\Schema;

/** Plans one trusted, server-scoped Prisma-style query for a MapSVG schema. */
final class PrismaQueryPlanner
{
    private QueryFieldResolver $fields;
    private QueryLimits $limits;
    private PrismaWhereTranslator $whereTranslator;

    public function __construct(
        Schema $schema,
        RecordMapper $mapper,
        ?StorageSchemaResolution $resolution = null,
        ?QueryLimits $limits = null
    ) {
        $this->limits = $limits ?? new QueryLimits();
        $this->fields = new QueryFieldResolver($schema, $mapper, $resolution);
        $this->whereTranslator = new PrismaWhereTranslator(
            $this->fields,
            $this->limits
        );
    }

    /** @param array<string, mixed> $query */
    public function plan(array $query): QueryPlan
    {
        $this->assertOptions($query);
        $whereInput = $query['where'] ?? array();
        // JSON objects survive operation validation. Only the planner's
        // predicate seam uses arrays, leaving membership operands untouched.
        $whereInput = self::predicateArrays($whereInput);
        if (!is_array($whereInput)) {
            throw new \InvalidArgumentException('Prisma where must be an object.');
        }

        $translation = $this->whereTranslator->translate($whereInput);
        list($select, $publicSelect) = $this->select($query['select'] ?? array());
        list($orderBy, $orderReasons) = $this->orderBy($query['orderBy'] ?? array());
        list($take, $skip, $hardLimit, $perpage) = $this->pagination($query);

        $advanced = array_values(array_unique(array_merge(
            $translation->advancedReasons(),
            $orderReasons
        )));
        if ($advanced !== array()) {
            return QueryPlan::advanced(
                QueryPlan::PRISMA_RESPONSE,
                $advanced,
                1,
                $perpage,
                array(
                    'source' => 'prisma',
                    'query' => $query,
                    'where' => $translation->where(),
                    'select' => $select,
                    'orderBy' => $orderBy,
                    'skip' => $skip,
                    'take' => $take,
                ),
                false,
                $hardLimit,
                true,
                $publicSelect
            );
        }
        $options = array(
            'orderBy' => $orderBy,
            'take' => $take,
        );
        if ($translation->where() !== array()) {
            $options['where'] = $translation->where();
        }
        if ($select !== array()) {
            $options['select'] = $select;
        }
        if ($skip > 0) {
            $options['skip'] = $skip;
        }

        $countOptions = $translation->where() === array()
            ? array()
            : array('where' => $translation->where());

        return QueryPlan::plasma(
            QueryPlan::PRISMA_RESPONSE,
            $options,
            $countOptions,
            1,
            $perpage,
            false,
            $hardLimit,
            true,
            $publicSelect
        );
    }

    private static function predicateArrays($value, int $depth = 0)
    {
        if ($depth > 24) throw new \LengthException('Prisma filter exceeds query complexity limits.');
        if ($value instanceof \stdClass) $value = get_object_vars($value);
        if (!is_array($value)) return $value;
        foreach (array('AND', 'OR', 'NOT') as $operator) {
            if (!array_key_exists($operator, $value)) continue;
            $group = $value[$operator];
            if (is_array($group) && ($group === array() || array_values($group) === $group)) {
                foreach ($group as $index => $child) $group[$index] = self::predicateArrays($child, $depth + 1);
                $value[$operator] = $group;
            } else {
                $value[$operator] = self::predicateArrays($group, $depth + 1);
            }
        }
        return $value;
    }

    /** @param array<string, mixed> $query */
    private function assertOptions(array $query): void
    {
        $allowed = array_fill_keys(
            array('where', 'select', 'orderBy', 'take', 'skip'),
            true
        );
        foreach ($query as $name => $_) {
            if (!is_string($name) || !isset($allowed[$name])) {
                throw new \InvalidArgumentException(
                    'Unsupported Prisma query option: ' . (string) $name
                );
            }
        }
    }

    /** @return array{0:string[],1:?array} */
    private function select($select): array
    {
        if ($select instanceof \stdClass && get_object_vars($select) === array()) $select = array();
        if ($select === null || $select === array()) {
            return array(array(), null);
        }
        if (!is_array($select)) {
            throw new \InvalidArgumentException('Prisma select must be an object or list.');
        }

        $names = array();
        if (self::isList($select)) {
            $names = $select;
        } else {
            foreach ($select as $name => $enabled) {
                if (!is_string($name) || !is_bool($enabled)) {
                    throw new \InvalidArgumentException(
                        'Prisma select maps require field => boolean values.'
                    );
                }
                $this->fields->resolve($name);
                if ($enabled) {
                    $names[] = $name;
                }
            }
            if ($names === array()) {
                throw new \InvalidArgumentException(
                    'Prisma select must enable at least one field.'
                );
            }
        }

        $seenPublic = array();
        foreach ($names as $name) {
            if (!is_string($name)) {
                throw new \InvalidArgumentException('Prisma selected fields must be strings.');
            }
            if (isset($seenPublic[$name])) {
                throw new \InvalidArgumentException(
                    'Prisma selected fields must not contain duplicates.'
                );
            }
            $seenPublic[$name] = true;
        }

        // React Admin requires a stable public `id` on every returned row.
        if (!isset($seenPublic['id'])) {
            array_unshift($names, 'id');
        }

        $storage = array();
        foreach ($names as $name) {
            $field = $this->fields->resolve($name);
            if ($field->isLocation()) {
                throw new \InvalidArgumentException(
                    'The virtual location field cannot be selected directly.'
                );
            }
            if (!in_array($field->storageName(), $storage, true)) {
                $storage[] = $field->storageName();
            }
        }
        return array($storage, array_values($names));
    }

    /** @return array{0:array<int,array<string,string>>,1:string[]} */
    private function orderBy($orderBy): array
    {
        if ($orderBy instanceof \stdClass && get_object_vars($orderBy) === array()) $orderBy = array();
        if ($orderBy === null || $orderBy === array()) {
            $primary = $this->fields->resolve('id');
            return array(
                array(array($primary->storageName() => 'desc')),
                array()
            );
        }
        if (!is_array($orderBy)) {
            throw new \InvalidArgumentException('Prisma orderBy must be an object or list.');
        }

        $groups = self::isList($orderBy) ? $orderBy : array($orderBy);
        $translated = array();
        $advanced = array();
        foreach ($groups as $group) {
            if (!is_array($group) || self::isList($group) || $group === array()) {
                throw new \InvalidArgumentException(
                    'Prisma orderBy groups must be non-empty field/direction objects.'
                );
            }
            $translatedGroup = array();
            foreach ($group as $name => $direction) {
                if (!is_string($name)
                    || !is_string($direction)
                    || !in_array(strtolower($direction), array('asc', 'desc'), true)) {
                    throw new \InvalidArgumentException(
                        'Prisma orderBy requires field names and asc/desc directions.'
                    );
                }
                if ($name === 'distance') {
                    $advanced[] = 'distance_sort';
                    continue;
                }
                $field = $this->fields->resolve($name);
                if ($field->isLocation()) {
                    $advanced[] = 'location_sort:' . $name;
                    continue;
                }
                if ($field->isRelation()) {
                    $advanced[] = 'relation_sort:' . $name;
                    continue;
                }
                if ($field->isMultiselect()) {
                    throw new \InvalidArgumentException(
                        'Legacy multiselect JSON fields cannot be sorted by the simple Prisma path.'
                    );
                }
                $translatedGroup[$field->storageName()] = strtolower($direction);
            }
            if ($translatedGroup !== array()) {
                $translated[] = $translatedGroup;
            }
        }

        // Make offset pagination deterministic without changing legacy ordering.
        $primaryKey = $this->fields->primaryKey();
        $hasPrimaryKey = false;
        foreach ($translated as $group) {
            if (array_key_exists($primaryKey, $group)) {
                $hasPrimaryKey = true;
                break;
            }
        }
        if (!$hasPrimaryKey) {
            $translated[] = array($primaryKey => 'asc');
        }

        return array($translated, array_values(array_unique($advanced)));
    }

    /** @param array<string, mixed> $query @return array{0:int,1:int,2:?int,3:int} */
    private function pagination(array $query): array
    {
        $skip = $query['skip'] ?? 0;
        if (!is_int($skip) || $skip < 0) {
            throw new \InvalidArgumentException(
                'Prisma skip must be a non-negative integer.'
            );
        }

        if (!array_key_exists('take', $query)) {
            return array(
                $this->limits->maxUnboundedRows() + 1,
                $skip,
                $this->limits->maxUnboundedRows(),
                0,
            );
        }

        $take = $query['take'];
        if (!is_int($take) || $take < 0) {
            throw new \InvalidArgumentException(
                'Prisma take must be a non-negative integer.'
            );
        }
        if ($take > $this->limits->maxPageSize()) {
            throw new \LengthException('Prisma take exceeds the server page-size limit.');
        }
        return array($take, $skip, null, $take);
    }

    private static function isList(array $value): bool
    {
        return $value === array()
            || array_keys($value) === range(0, count($value) - 1);
    }
}
