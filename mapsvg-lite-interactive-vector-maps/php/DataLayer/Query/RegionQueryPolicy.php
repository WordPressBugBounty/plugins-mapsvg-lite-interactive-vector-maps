<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

use MapSVG\Query;
use MapSVG\Schema;

/** Pure legacy RegionsRepository find defaults, reusable by v2 adapters. */
final class RegionQueryPolicy
{
    private Schema $schema;

    public function __construct(Schema $schema)
    {
        $this->schema = $schema;
    }

    public function apply(Query $query, string $prefix = ''): Query
    {
        $effective = clone $query;
        $effective->filters = is_array($query->filters)
            ? $query->filters
            : array();
        $effective->filterout = is_array($query->filterout)
            ? $query->filterout
            : array();
        $effective->sort = is_array($query->sort)
            ? $query->sort
            : array();

        if ($prefix !== '') {
            $effective->filters['prefix'] = $prefix;
        }
        if ($effective->sort === array()) {
            $effective->sort = array(
                array('field' => 'id', 'order' => 'asc'),
            );
        }

        $includeOrphans = !empty($effective->filters['includeOrphans']);
        unset($effective->filters['includeOrphans']);
        if (!$includeOrphans
            && $this->schema->getField('orphaned')
            && !array_key_exists('orphaned', $effective->filterout)) {
            $effective->filterout['orphaned'] = 1;
        }

        return $effective;
    }
}
