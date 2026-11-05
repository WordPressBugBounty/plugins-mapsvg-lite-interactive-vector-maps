<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

use MapSVG\Schema;

/** Resolves post/meta/taxonomy predicates through WordPress, not raw joins. */
final class WordPressPostIdResolver implements PostIdResolver
{
    private QueryLimits $limits;

    public function __construct(?QueryLimits $limits = null)
    {
        $this->limits = $limits ?? new QueryLimits();
    }

    public function resolveFilter(Schema $schema, array $filter): array
    {
        \MapSVG\Core\PostDataFeature::assertEnabled();
        $allowed = array(
            'name',
            'post',
            'meta',
            'taxonomy',
            'post_status',
            'post_title',
        );
        foreach ($filter as $name => $_) {
            if (!is_string($name) || !in_array($name, $allowed, true)) {
                throw new \InvalidArgumentException(
                    'Unsupported WordPress post filter: ' . (string) $name
                );
            }
        }

        $args = $this->baseArgs($schema);
        $slug = $filter['name'] ?? ($filter['post'] ?? null);
        if ($slug !== null && $slug !== '') {
            $args['name'] = (string) $this->scalarOptionValue($slug, 'Post slug');
        }
        if (array_key_exists('post_status', $filter)
            && $filter['post_status'] !== '') {
            $status = $filter['post_status'];
            $args['post_status'] = is_array($status) && self::isList($status)
                ? $this->optionList($status, 'Post status')
                : $this->scalarOptionValue($status, 'Post status');
        }
        if (array_key_exists('post_title', $filter)
            && $filter['post_title'] !== '') {
            $args['s'] = (string) $this->scalarOptionValue(
                $filter['post_title'],
                'Post title'
            );
        }
        if (isset($filter['meta'])) {
            $args['meta_query'] = $this->metaQuery($filter['meta']);
        }
        if (isset($filter['taxonomy'])) {
            $args['tax_query'] = $this->taxonomyQuery($filter['taxonomy']);
        }

        return $this->run($args);
    }

    public function resolveSearch(Schema $schema, string $term): array
    {
        \MapSVG\Core\PostDataFeature::assertEnabled();
        $args = $this->baseArgs($schema);
        $args['s'] = $term;
        return $this->run($args);
    }

    /** @return array<string, mixed> */
    private function baseArgs(Schema $schema): array
    {
        $field = $schema->getFieldByType('post');
        if (!$field) {
            return array('post__in' => array(0));
        }
        $postType = isset($field->post_type) && (string) $field->post_type !== ''
            ? (string) $field->post_type
            : 'post';
        return array(
            'post_type' => $postType,
            'posts_per_page' => $this->limits->maxListValues() + 1,
            'fields' => 'ids',
            'no_found_rows' => true,
            'suppress_filters' => false,
        );
    }

    /** @return array<int|string, mixed> */
    private function metaQuery($meta): array
    {
        if (!is_array($meta)) {
            throw new \InvalidArgumentException('Post meta filter must be an object.');
        }
        if (count($meta) > $this->limits->maxConditions()) {
            throw new \LengthException('Post meta filters exceed the server limit.');
        }

        $query = array('relation' => 'AND');
        foreach ($meta as $key => $value) {
            if (!is_string($key) || $key === '') {
                throw new \InvalidArgumentException('Post meta key is invalid.');
            }
            $acfField = function_exists('acf_get_field') ? acf_get_field($key) : null;
            $multiple = is_array($acfField) && !empty($acfField['multiple']);

            if ($multiple) {
                $values = is_array($value) ? $value : array($value);
                $values = $this->optionList($values, 'Post meta value');
                $or = array('relation' => 'OR');
                foreach ($values as $item) {
                    $or[] = array(
                        'key' => $key,
                        'value' => '"' . (string) $item . '"',
                        'compare' => 'LIKE',
                    );
                }
                $query[] = $or;
                continue;
            }

            if (is_array($value) && self::isList($value)) {
                $query[] = array(
                    'key' => $key,
                    'value' => $this->optionList($value, 'Post meta value'),
                    'compare' => 'IN',
                );
            } else {
                $query[] = array(
                    'key' => $key,
                    'value' => $this->scalarOptionValue($value, 'Post meta value'),
                    'compare' => '=',
                );
            }
        }
        return $query;
    }

    /** @return array<int|string, mixed> */
    private function taxonomyQuery($taxonomy): array
    {
        if (!is_array($taxonomy)) {
            throw new \InvalidArgumentException(
                'Post taxonomy filter must be an object.'
            );
        }
        if (count($taxonomy) > $this->limits->maxConditions()) {
            throw new \LengthException('Taxonomy filters exceed the server limit.');
        }

        $query = array('relation' => 'AND');
        foreach ($taxonomy as $name => $terms) {
            if (!is_string($name) || $name === '') {
                throw new \InvalidArgumentException('Taxonomy name is invalid.');
            }
            if (!is_array($terms) || !self::isList($terms)) {
                $terms = array($terms);
            }
            $query[] = array(
                'taxonomy' => $name,
                'field' => 'slug',
                'terms' => $this->optionList($terms, 'Taxonomy terms'),
                'operator' => 'IN',
            );
        }
        return $query;
    }

    /** @return array<int, scalar> */
    private function optionList(array $values, string $label): array
    {
        if (!self::isList($values)) {
            throw new \InvalidArgumentException($label . ' must be a list.');
        }
        if ($values === array()) {
            throw new \InvalidArgumentException($label . ' must not be empty.');
        }
        if (count($values) > $this->limits->maxListValues()) {
            throw new \LengthException($label . ' exceed the server list limit.');
        }
        $normalized = array();
        foreach ($values as $value) {
            $normalized[] = $this->scalarOptionValue($value, $label);
        }
        return $normalized;
    }

    /** @return scalar */
    private function scalarOptionValue($value, string $label)
    {
        if (is_array($value) && array_key_exists('value', $value)) {
            $value = $value['value'];
        } elseif (is_object($value) && isset($value->value)) {
            $value = $value->value;
        }
        if (!is_scalar($value)
            || is_bool($value)
            || (is_float($value) && !is_finite($value))) {
            throw new \InvalidArgumentException(
                $label . ' must contain strings or numbers.'
            );
        }
        return $value;
    }

    /** @param array<string, mixed> $args @return array<int, int|string> */
    private function run(array $args): array
    {
        if (!class_exists('WP_Query')) {
            throw new \RuntimeException(
                'WordPress post resolution requires WP_Query.'
            );
        }
        $query = new \WP_Query($args);
        $ids = is_array($query->posts) ? array_values($query->posts) : array();
        if (count($ids) > $this->limits->maxListValues()) {
            throw new \LengthException(
                'Resolved post IDs exceed the server list limit.'
            );
        }
        return $ids;
    }

    private static function isList(array $value): bool
    {
        return $value === array()
            || array_keys($value) === range(0, count($value) - 1);
    }
}
