<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

/** Resolves WordPress-owned filters/search to IDs before SQL composition. */
final class PostQueryExtension implements AdvancedQueryExtension
{
    public function apply(
        array &$options,
        AdvancedSqlBuilder $builder,
        AdvancedQueryContext $context
    ): void {
        if (isset($options['publicPostTable'])) {
            if ($context->schema()->type !== 'post') {
                throw new \InvalidArgumentException('Public post visibility requires a CPT Collection.');
            }
            $post = $context->schema()->getFieldByType('post');
            if (!$post || !is_string($options['publicPostTable'])) {
                throw new \InvalidArgumentException('Public post visibility metadata is invalid.');
            }
            $field = $context->fields()->resolve((string) $post->name);
            $table = AdvancedQueryContext::quoteIdentifier($options['publicPostTable']);
            $type = (string) ($post->post_type ?? $context->schema()->postType ?? 'post');
            $builder->addWhere($builder->prepare(
                'EXISTS (SELECT 1 FROM ' . $table . ' AS `mapsvg_public_post`'
                . ' WHERE `mapsvg_public_post`.`ID` = ' . $builder->column($field->storageName())
                . ' AND `mapsvg_public_post`.`post_type` = %s'
                . ' AND `mapsvg_public_post`.`post_status` = %s'
                . ' AND `mapsvg_public_post`.`post_password` = %s)',
                array($type, 'publish', '')
            ));
        }
        $postFilter = $options['postFilter'] ?? null;
        $resolvedFilterIds = $options['resolvedPostIds'] ?? null;

        if ($postFilter !== null) {
            if (!is_array($postFilter)
                || !isset($postFilter['field'], $postFilter['value'])
                || !is_string($postFilter['field'])
                || !is_array($postFilter['value'])) {
                throw new \InvalidArgumentException(
                    'Advanced post filter metadata is invalid.'
                );
            }
            $field = $context->fields()->resolve($postFilter['field']);
            if (!$field->isPost()) {
                throw new \InvalidArgumentException(
                    'Advanced post filter must target a post field.'
                );
            }

            // Planner context IDs are already present in partial simple WHERE.
            if (!is_array($resolvedFilterIds)) {
                $resolvedFilterIds = $context->postResolver()->resolveFilter(
                    $context->schema(),
                    $postFilter['value']
                );
                $resolvedFilterIds = $this->ids($resolvedFilterIds, $context);
                $builder->addWhere($builder->inCondition(
                    $field->storageName(),
                    $resolvedFilterIds
                ));
            }
        }

        $search = $options['search'] ?? null;
        if ($search !== null
            && (!is_array($search)
                || !array_key_exists('term', $search)
                || !is_string($search['term']))) {
            throw new \InvalidArgumentException(
                'Advanced search metadata is invalid.'
            );
        }
        if ($search !== null && $this->searchablePostField($context) !== null) {
            $searchIds = $options['resolvedPostSearchIds'] ?? null;
            if (!is_array($searchIds)) {
                $searchIds = $context->postResolver()->resolveSearch(
                    $context->schema(),
                    (string) $search['term']
                );
            }
            $options['postSearchIds'] = $this->ids($searchIds, $context);
        } else {
            $options['postSearchIds'] = array();
        }
    }

    private function searchablePostField(
        AdvancedQueryContext $context
    ): ?ResolvedQueryField {
        foreach ($context->schema()->getSearchableFields(
            null,
            array('withPost' => true)
        ) as $field) {
            if (($field['type'] ?? null) === 'post') {
                return $context->fields()->resolve((string) $field['name']);
            }
        }
        return null;
    }

    /** @param mixed $ids @return array<int, int|string> */
    private function ids($ids, AdvancedQueryContext $context): array
    {
        if (!is_array($ids)) {
            throw new \InvalidArgumentException('Resolved post IDs must be a list.');
        }
        if (count($ids) > $context->limits()->maxListValues()) {
            throw new \LengthException('Resolved post IDs exceed the server limit.');
        }
        $normalized = array();
        foreach ($ids as $id) {
            if ((!is_int($id) && !is_string($id)) || (string) $id === '') {
                throw new \InvalidArgumentException(
                    'Resolved post IDs must be non-empty strings or integers.'
                );
            }
            $normalized[(string) $id] = $id;
        }
        return array_values($normalized);
    }
}
