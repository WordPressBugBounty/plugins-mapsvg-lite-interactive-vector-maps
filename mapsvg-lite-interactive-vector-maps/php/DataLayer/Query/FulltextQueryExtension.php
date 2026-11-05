<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

/** Adds legacy full-text or fallback search as one atomic SQL predicate. */
final class FulltextQueryExtension implements AdvancedQueryExtension
{
    public function apply(
        array &$options,
        AdvancedSqlBuilder $builder,
        AdvancedQueryContext $context
    ): void {
        $search = $options['search'] ?? null;
        if ($search === null) {
            return;
        }
        if (!is_array($search) || !isset($search['term'])) {
            throw new \InvalidArgumentException('Search options are invalid.');
        }
        $term = (string) $search['term'];
        $fallback = ($search['fallback'] ?? false) === true;
        $fields = $context->schema()->getSearchableFields(
            null,
            array('withPost' => true)
        );

        $clauses = array();
        $matchFields = array();
        foreach ($fields as $field) {
            if (!is_array($field) || !isset($field['name'], $field['type'])) {
                throw new \UnexpectedValueException(
                    'Searchable field metadata is invalid.'
                );
            }
            $name = (string) $field['name'];
            $type = strtolower((string) $field['type']);
            if ($type === 'post') {
                $postIds = $options['postSearchIds'] ?? array();
                if ($postIds !== array()) {
                    $clauses[] = $builder->inCondition($name, $postIds);
                }
                continue;
            }
            if (!$context->hasPhysicalField($name)) {
                throw new \UnexpectedValueException(
                    'Searchable field is missing from the physical table: ' . $name
                );
            }

            $isMultiselect = isset($field['multiselect'])
                && filter_var($field['multiselect'], FILTER_VALIDATE_BOOLEAN);
            $column = $builder->column($name);
            if ($fallback) {
                if (in_array($type, array('region', 'relation'), true)
                    || $isMultiselect) {
                    $clauses[] = $builder->prepare(
                        $column . ' LIKE %s',
                        array('%' . $context->adapter()->escapeLike($term) . '%')
                    );
                } else {
                    $clauses[] = $builder->prepare(
                        $column . ' REGEXP %s',
                        array('(^|[[:space:]])' . preg_quote($term, '/'))
                    );
                }
                continue;
            }

            $searchType = strtolower((string) ($field['searchType'] ?? 'fulltext'));
            if ($type === 'text' && $searchType === 'like') {
                $clauses[] = $builder->prepare(
                    $column . ' LIKE %s',
                    array($context->adapter()->escapeLike($term) . '%')
                );
            } elseif ($type === 'text' && $searchType === 'exact') {
                $clauses[] = $builder->prepare(
                    $column . ' = %s',
                    array($term)
                );
            } else {
                $matchFields[] = $column;
            }
        }

        if (!$fallback && $matchFields !== array()) {
            $clauses[] = $builder->prepare(
                'MATCH (' . implode(', ', $matchFields)
                . ') AGAINST (%s IN BOOLEAN MODE)',
                array($term . '*')
            );
        }
        $builder->addWhere(
            $clauses === array()
                ? '0 = 1'
                : '(' . implode(' OR ', $clauses) . ')'
        );
    }
}
