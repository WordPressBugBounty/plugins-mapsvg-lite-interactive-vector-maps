<?php

declare(strict_types=1);
namespace MapSVG\DataLayer\Post;

use MapSVG\Schema;

/** Page presentation enriches projected logical rows; Collection/RPC storage reads stay scalar. */
final class PageBindingPostHydrator
{
    public static function hydrate(Schema $schema, array $rows, ?PostEnricher $posts = null): array
    {
        $field = $schema->getFieldByType('post');
        if (!$field || !\MapSVG\Core\PostDataFeature::isEnabled()) return $rows;
        $name = (string) $field->name;
        $ids = [];
        foreach ($rows as $row) {
            // Respect projection: do not fetch a post omitted by the Query.
            if (array_key_exists($name, $row) && is_scalar($row[$name]) && (int) $row[$name] > 0) $ids[(int) $row[$name]] = (int) $row[$name];
        }
        $values = [];
        // Enrichment has a bounded request cache; wide unpaged reads use bounded batches.
        foreach (array_chunk(array_values($ids), 200) as $batch) {
            $enriched = ($posts ?? new WordPressPostEnricher())->enrichMany($batch);
            // WP_Post / WP_Term are domain objects; named RPC admits plain JSON only.
            foreach ($batch as $index => $id) {
                $post = json_decode(json_encode($enriched[$index], JSON_THROW_ON_ERROR), true, 512, JSON_THROW_ON_ERROR);
                // WordPress stores term names with entities. Decode detached presentation
                // text once; templates must still escape it. Never rewrite slugs/meta/storage.
                if (is_array($post)) foreach ($post['taxonomy'] ?? [] as $taxonomy => $terms) {
                    if (!is_array($terms)) continue;
                    foreach ($terms as $key => $term) if (is_array($term) && is_string($term['name'] ?? null)) {
                        $post['taxonomy'][$taxonomy][$key]['name'] = html_entity_decode($term['name'], ENT_QUOTES | ENT_HTML5, 'UTF-8');
                    }
                }
                $values[$id] = $post;
            }
        }
        foreach ($rows as &$row) {
            if (!array_key_exists($name, $row)) continue;
            $value = $row[$name];
            if ($value === null || $value === '' || is_scalar($value)) $row[$name] = $values[(int) $value] ?? null;
        }
        unset($row);
        return $rows;
    }
}
