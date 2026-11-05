<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

/** Applies shared global r2o many-to-many filters with table-pair isolation. */
final class RegionQueryExtension implements AdvancedQueryExtension
{
    public function apply(
        array &$options,
        AdvancedSqlBuilder $builder,
        AdvancedQueryContext $context
    ): void {
        $relations = $options['relations'] ?? array();
        if (!is_array($relations) || $relations === array()) {
            return;
        }
        $allowed = $options['allowedRegionTables'] ?? array();
        if (!is_array($allowed) || $allowed === array()) {
            throw new \InvalidArgumentException(
                'Advanced region queries require a server-owned table allowlist.'
            );
        }

        foreach (array_values($relations) as $index => $relation) {
            if (!is_array($relation)) {
                throw new \InvalidArgumentException(
                    'Advanced region filter must be an object.'
                );
            }
            $regionTable = $relation['regionTable'] ?? null;
            $regionIds = $relation['regionIds'] ?? null;
            if (!is_string($regionTable)
                || !in_array($regionTable, $allowed, true)) {
                throw new \InvalidArgumentException(
                    'Region filter table is not allowed for this map.'
                );
            }
            if (!is_array($regionIds)) {
                throw new \InvalidArgumentException('Region IDs must be a list.');
            }
            if ($regionIds === array()) {
                $builder->addWhere('0 = 1');
                continue;
            }
            if (count($regionIds) > $context->limits()->maxListValues()) {
                throw new \LengthException(
                    'Region IDs exceed the server list limit.'
                );
            }

            $alias = 'mapsvg_r2o_' . $index;
            $quotedAlias = AdvancedSqlBuilder::quoteIdentifier($alias);
            $placeholders = array_fill(0, count($regionIds), '%s');
            $params = array(
                $context->resolution()->logicalTable(),
                $regionTable,
            );
            foreach ($regionIds as $id) {
                if (!is_scalar($id) || is_bool($id)) {
                    throw new \InvalidArgumentException(
                        'Region IDs must be strings or numbers.'
                    );
                }
                $params[] = $id;
            }

            $builder->addWhere($builder->prepare(
                'EXISTS (SELECT 1 FROM '
                . AdvancedSqlBuilder::quoteIdentifier($context->relationTable())
                . ' AS ' . $quotedAlias
                . ' WHERE ' . $quotedAlias . '.`objects_table` = %s'
                . ' AND ' . $quotedAlias . '.`regions_table` = %s'
                . ' AND ' . $quotedAlias . '.`object_id` = '
                . $builder->column($context->resolution()->primaryKey())
                . ' AND ' . $quotedAlias . '.`region_id` IN ('
                . implode(', ', $placeholders) . '))',
                $params
            ));
        }
    }
}
