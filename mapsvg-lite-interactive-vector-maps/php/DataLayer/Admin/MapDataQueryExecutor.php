<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Admin;

use MapSVG\DataLayer\DataLayerFactory;
use MapSVG\DataLayer\Query\QueryLimits;
use MapSVG\DataLayer\Query\SimpleQueryServiceFactory;
use MapSVG\Schema;

/**
 * Executes one admin Prisma query against a source resolved from a Map object.
 *
 * Browser input selects only the logical map role (objects/regions). The
 * physical table is resolved through the map's persisted repository metadata.
 */
final class MapDataQueryExecutor
{
    /** @var callable fn(Schema,array<string,mixed>):array{rows:array,count:int} */
    private $runner;

    public function __construct(?callable $runner = null)
    {
        $this->runner = $runner ?? static function (Schema $schema, array $query): array {
            $dataLayer = DataLayerFactory::createV2(
                null,
                array('force' => true)
            );
            $service = SimpleQueryServiceFactory::forSchema(
                $dataLayer,
                $schema,
                new QueryLimits(250, 5000, 500, 24, 500)
            );
            return $service->findPrisma($query);
        };
    }

    /**
     * @param object $map Map-like object exposing getObjects()/getRegions().
     * @param array<string, mixed> $query
     * @return array{rows:array,count:int}
     */
    public function execute($map, string $sourceRole, array $query): array
    {
        $repository = $this->resolveRepository($map, $sourceRole);
        if (!method_exists($repository, 'getSchema')) {
            throw new \UnexpectedValueException(
                'The selected map source does not expose schema metadata.'
            );
        }

        $schema = $repository->getSchema();
        if (!$schema instanceof Schema) {
            throw new \UnexpectedValueException(
                'The selected map source has invalid schema metadata.'
            );
        }
        if (method_exists($schema, 'isLocal') && !$schema->isLocal()) {
            throw new \InvalidArgumentException(
                'React Admin Plasma queries support local MapSVG sources only.'
            );
        }

        $result = call_user_func($this->runner, $schema, $query);
        if (!is_array($result)
            || !isset($result['rows'])
            || !is_array($result['rows'])
            || !array_key_exists('count', $result)
            || !is_int($result['count'])) {
            throw new \UnexpectedValueException(
                'The data-layer query executor returned an invalid result.'
            );
        }

        return array(
            'rows' => array_values($result['rows']),
            'count' => $result['count'],
        );
    }

    /** @return object */
    private function resolveRepository($map, string $sourceRole)
    {
        if (!is_object($map)) {
            throw new \InvalidArgumentException('A valid MapSVG map is required.');
        }

        if ($sourceRole === 'objects') {
            $method = 'getObjects';
        } elseif ($sourceRole === 'regions') {
            $method = 'getRegions';
        } else {
            throw new \InvalidArgumentException(
                'sourceRole must be either objects or regions.'
            );
        }

        if (!method_exists($map, $method)) {
            throw new \UnexpectedValueException(
                'The selected map cannot resolve the requested data source.'
            );
        }

        $repository = $map->{$method}();
        if (!is_object($repository)) {
            throw new \UnexpectedValueException(
                'The selected map has no connected ' . $sourceRole . ' source.'
            );
        }

        return $repository;
    }
}
