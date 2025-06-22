<?php

namespace MapSVG;

class PostTypesRepository
{
  /**
   * Returns the list of WP post types.
   *
   * @return array
   */
  public function find(): array
  {
    $args = array(
      '_builtin' => false
    );

    $_post_types = get_post_types($args, 'names');
    if (!$_post_types)
      $_post_types = array();

    $post_types = array();
    foreach ($_post_types as $pt) {
      if ($pt != 'mapsvg')
        $post_types[] = $pt;
    }
    $post_types[] = 'post';
    $post_types[] = 'page';


    return $post_types;
  }

  /**
   * Returns taxonomies and meta for a given post type.
   *
   * @param string $post_type
   * @return array
   */
  public function get(string $post_type): array
  {
    // Get taxonomies for the post type
    $taxonomies = [];
    $tax_objs = get_object_taxonomies($post_type, 'objects');
    foreach ($tax_objs as $tax) {
      $terms = get_terms(['taxonomy' => $tax->name, 'hide_empty' => false]);
      $taxonomies[] = [
        'name'  => $tax->name,
        'label' => $tax->label,
        'items' => array_map(function ($term) {
          return [
            'id'   => $term->term_id,
            'name' => $term->name,
            'slug' => $term->slug,
          ];
        }, is_array($terms) ? $terms : [])
      ];
    }

    // Get meta fields for the post type (using registered meta)
    $meta = [];
    global $wp_meta_keys;
    if (!empty($wp_meta_keys['post'][$post_type])) {
      foreach ($wp_meta_keys['post'][$post_type] as $meta_key => $meta_args) {
        $meta[] = [
          'name'  => $meta_key,
          'type'  => isset($meta_args['type']) ? $meta_args['type'] : 'string',
          'label' => isset($meta_args['description']) && !empty($meta_args['description']) ? ucfirst($meta_args['description']) : ucfirst($meta_key),
        ];
      }
    }

    return [
      'postType'  => $post_type,
      'taxonomy' => $taxonomies,
      'meta'       => $meta,
    ];
  }

  /**
   * Retrieves distinct values for a given field name from published posts.
   * 
   * @param string $fieldName The name of the field to retrieve distinct values for.
   * @return array An array of distinct values for the specified field.
   */
  public function getFieldValues($fieldName)
  {
    $db = Database::get();
    $results = $db->get_col("SELECT DISTINCT " . esc_sql($fieldName) . " FROM " . $db->posts() . " WHERE post_status='publish'", 0);
    return $results;
  }

  /**
   * Retrieves unique taxonomy term names for a given taxonomy from published posts.
   *
   * @param string $name The taxonomy name (e.g., 'category', 'post_tag').
   * @return array An array of unique term names.
   */
  public function getTaxonomyValues($name)
  {
    $db = Database::get();
    $taxonomy = esc_sql($name);
    $sql = "SELECT DISTINCT t.name FROM {$db->prefix}terms t
                INNER JOIN {$db->prefix}term_taxonomy tt ON t.term_id = tt.term_id
                INNER JOIN {$db->prefix}term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
                INNER JOIN {$db->posts()} p ON tr.object_id = p.ID
                WHERE tt.taxonomy = '$taxonomy' AND p.post_status = 'publish'";
    $results = $db->get_col($sql, 0);
    return $results ? $results : [];
  }

  /**
   * Retrieves unique meta values for a given meta key from published posts.
   *
   * @param string $name The meta key.
   * @return array An array of unique meta values.
   */
  public function getMetaValues($name)
  {
    $db = Database::get();
    $meta_key = esc_sql($name);
    $sql = "SELECT DISTINCT pm.meta_value FROM {$db->postmeta} pm
                INNER JOIN {$db->posts()} p ON pm.post_id = p.ID
                WHERE pm.meta_key = '$meta_key' AND p.post_status = 'publish' AND pm.meta_value IS NOT NULL AND pm.meta_value != ''";
    $results = $db->get_col($sql, 0);
    return $results ? $results : [];
  }
}
