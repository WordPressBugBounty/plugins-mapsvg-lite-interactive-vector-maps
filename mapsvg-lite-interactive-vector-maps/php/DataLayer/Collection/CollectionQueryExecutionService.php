<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Collection;

use MapSVG\DataLayer\DataLayerFactory;
use MapSVG\DataLayer\Query\QueryLimits;
use MapSVG\DataLayer\Query\SimpleQueryServiceFactory;
use MapSVG\Schema;

/**
 * Canonical Collection read executor.
 *
 * Direct Collection operations and Saved Query presets both compile through this
 * service so validation/planning/Plasma execution cannot drift into two engines.
 */
final class CollectionQueryExecutionService
{
    private $runner;
    private $pageRunner;

    public function __construct(?callable $runner = null, ?callable $pageRunner = null)
    {
        $this->pageRunner = $pageRunner;
        $this->runner = $runner ?? static function (Schema $schema, array $input): array {
            $dataLayer = DataLayerFactory::createV2(null, array('force' => true));
            return SimpleQueryServiceFactory::forSchema(
                $dataLayer,
                $schema,
                new QueryLimits(5000, 5000, 500, 24, 500)
            )->findPrisma($input);
        };
    }

    /** @return array{rows:array,count:int} */
    public function execute(Schema $schema, array $input): array
    {
        \MapSVG\Core\PostDataFeature::assertSchema($schema);
        $result = call_user_func($this->runner, $schema, $input);
        if (!is_array($result)
            || !isset($result['rows'])
            || !is_array($result['rows'])
            || !isset($result['count'])
            || !is_int($result['count'])
            || $result['count'] < 0) {
            throw new \UnexpectedValueException(
                'Collection query returned an invalid result.'
            );
        }

        return array(
            'rows' => array_values($result['rows']),
            'count' => $result['count'],
        );
    }

    public function executePageBinding(Schema $schema, array $input, array $runtime, array $context = array()): array
    {
        \MapSVG\Core\PostDataFeature::assertSchema($schema);
        if ($this->pageRunner !== null) return ($this->pageRunner)($schema, $input, $runtime, $context);
        // A Page presents public CPT records even in an editor preview. Apply
        // current WP visibility in SQL, before count/paging, including stale bridges.
        if ($schema->type === 'post') {
            global $wpdb;
            if (!is_object($wpdb) || !is_string($wpdb->posts ?? null)) {
                throw new \RuntimeException('WordPress post storage is unavailable.');
            }
            $context['publicPostTable'] = $wpdb->posts;
        }
        $service = SimpleQueryServiceFactory::forSchema(
            DataLayerFactory::createV2(null, array('force' => true)), $schema,
            new QueryLimits(5000, 5000, 500, 24, 500)
        );
        return $service->findPageBinding($input, new \MapSVG\Query(array_merge(
            $runtime, array('perpage' => 1, 'page' => 1, 'withCount' => true)
        )), $context);
    }
}
