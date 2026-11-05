<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

use MapSVG\DataLayer\Mapping\RecordMapper;

/** Executes one fully validated legacy advanced query without PHP post-filtering. */
final class AdvancedQueryExecutor
{
    private AdvancedQueryContext $context;
    private RecordMapper $mapper;
    /** @var AdvancedQueryExtension[] */
    private array $extensions;

    /** @param AdvancedQueryExtension[]|null $extensions */
    public function __construct(
        AdvancedQueryContext $context,
        RecordMapper $mapper,
        ?array $extensions = null
    ) {
        $this->context = $context;
        $this->mapper = $mapper;
        $this->extensions = $extensions ?? array(
            new PostQueryExtension(),
            new RegionQueryExtension(),
            new DistanceQueryExtension(),
            new FulltextQueryExtension(),
        );
        foreach ($this->extensions as $extension) {
            if (!$extension instanceof AdvancedQueryExtension) {
                throw new \InvalidArgumentException(
                    'Advanced query extensions must implement the contract.'
                );
            }
        }
    }

    public function execute(QueryPlan $plan): QueryExecution
    {
        if (!$plan->isAdvanced()) {
            throw new \InvalidArgumentException(
                'Advanced executor requires an advanced query plan.'
            );
        }
        $options = $plan->advancedOptions();
        if (($options['source'] ?? null) !== 'legacy') {
            throw new AdvancedQueryRequired(array_merge(
                $plan->advancedReasons(),
                array('prisma_advanced_contract')
            ));
        }

        $builder = new AdvancedSqlBuilder($this->context);
        $where = $options['where'] ?? array();
        $select = $options['select'] ?? array();
        if (!is_array($where) || !is_array($select)) {
            throw new \InvalidArgumentException(
                'Advanced query plan payload is invalid.'
            );
        }
        $builder->applySimpleWhere($where);
        $builder->setSelectFields($select);

        foreach ($this->extensions as $extension) {
            $extension->apply($options, $builder, $this->context);
        }
        $this->applyOrder($options['orderBy'] ?? array(), $builder);
        $builder->setPagination(
            (int) ($options['take'] ?? 0),
            (int) ($options['skip'] ?? 0)
        );

        $storageRows = $this->context->adapter()->query($builder->querySql());
        $hardLimit = $plan->hardRowLimit();
        if ($hardLimit !== null && count($storageRows) > $hardLimit) {
            throw new \LengthException(
                'Query exceeds the guarded All rows limit of '
                . $hardLimit . '.'
            );
        }

        $hasMore = $plan->fetchesExtraRow()
            && count($storageRows) > $plan->perpage();
        $publicRows = $this->mapRows($storageRows, $plan->publicSelect());
        if ($hasMore) {
            array_pop($publicRows);
        }
        $total = $plan->needsCount()
            ? (int) $this->context->adapter()->getVar($builder->countSql())
            : null;

        return new QueryExecution(
            $publicRows,
            $hasMore,
            $total,
            $plan->page(),
            $plan->perpage()
        );
    }

    /** @param mixed $order */
    private function applyOrder($order, AdvancedSqlBuilder $builder): void
    {
        if (!is_array($order)) {
            throw new \InvalidArgumentException('Advanced order must be a list.');
        }
        foreach ($order as $item) {
            if (!is_array($item) || !isset($item['kind'], $item['direction'])) {
                throw new \InvalidArgumentException(
                    'Advanced order item is invalid.'
                );
            }
            if ($item['kind'] === 'distance') {
                $builder->addAliasOrder(
                    DistanceQueryExtension::ALIAS,
                    (string) $item['direction']
                );
            } elseif ($item['kind'] === 'field' && isset($item['field'])) {
                $builder->addFieldOrder(
                    (string) $item['field'],
                    (string) $item['direction']
                );
            } else {
                throw new \InvalidArgumentException(
                    'Unsupported advanced order kind.'
                );
            }
        }
    }

    /**
     * @param array<int, array<string, mixed>> $rows
     * @param string[]|null $projection
     * @return array<int, array<string, mixed>>
     */
    private function mapRows(array $rows, ?array $projection): array
    {
        $publicRows = array();
        foreach ($rows as $row) {
            if (!is_array($row)) {
                throw new \UnexpectedValueException(
                    'Advanced query rows must be arrays.'
                );
            }
            $public = $this->mapper->fromStorage($row);
            if ($public === null) {
                throw new \UnexpectedValueException(
                    'Advanced query mapper returned no public row.'
                );
            }
            if ($projection !== null) {
                $projected = array();
                foreach ($projection as $name) {
                    if ($name === 'id'
                        && (!array_key_exists('id', $public)
                            || $public['id'] === null)) {
                        throw new \UnexpectedValueException(
                            'Prisma query rows require a public id.'
                        );
                    }
                    if (array_key_exists($name, $public)) {
                        $projected[$name] = $public[$name];
                    }
                }
                $public = $projected;
            }
            $publicRows[] = $public;
        }
        return $publicRows;
    }
}
