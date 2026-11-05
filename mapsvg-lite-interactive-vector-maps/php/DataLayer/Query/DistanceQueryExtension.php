<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

/** Adds Haversine distance projection, radius HAVING, and distance ordering. */
final class DistanceQueryExtension implements AdvancedQueryExtension
{
    public const ALIAS = 'distance';

    public function apply(
        array &$options,
        AdvancedSqlBuilder $builder,
        AdvancedQueryContext $context
    ): void {
        $distance = $options['distance'] ?? null;
        if ($distance === null) {
            return;
        }
        if (!is_array($distance)) {
            throw new \InvalidArgumentException('Distance options must be an object.');
        }
        foreach (array('location_lat', 'location_lng') as $field) {
            if (!$context->hasPhysicalField($field)) {
                throw new \UnexpectedValueException(
                    'Distance query requires physical field: ' . $field
                );
            }
        }

        $coefficient = ($distance['units'] ?? 'km') === 'mi' ? 3959 : 6371;
        $lat = (float) $distance['lat'];
        $lng = (float) $distance['lng'];
        $radius = (float) $distance['radius'];
        $latColumn = $builder->column('location_lat');
        $lngColumn = $builder->column('location_lng');

        $expression = $builder->prepare(
            '(%d * ACOS(LEAST(1, GREATEST(-1, '
            . 'COS(RADIANS(%f)) * COS(RADIANS(' . $latColumn . ')) '
            . '* COS(RADIANS(' . $lngColumn . ') - RADIANS(%f)) '
            . '+ SIN(RADIANS(%f)) * SIN(RADIANS(' . $latColumn . '))'
            . '))))',
            array($coefficient, $lat, $lng, $lat)
        );
        $builder->addComputedSelect(self::ALIAS, $expression);
        $builder->addPreparedHaving(
            AdvancedSqlBuilder::quoteIdentifier(self::ALIAS) . ' < %f',
            array($radius)
        );
    }
}
