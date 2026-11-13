<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Post;

/** Core linked-post enrichment with request-scoped caching; callers gate native WP/CPT sources. */
final class WordPressPostEnricher implements PostEnricher
{
    private int $maxUniquePosts;

    /** @var array<int,mixed> */
    private array $cache = array();

    public function __construct(int $maxUniquePosts = 200)
    {
        if ($maxUniquePosts < 1 || $maxUniquePosts > 1000) {
            throw new \InvalidArgumentException(
                'Post enrichment limit must be between 1 and 1000.'
            );
        }
        $this->maxUniquePosts = $maxUniquePosts;
    }

    /** @param mixed $postId @return mixed */
    public function enrich($postId)
    {
        $id = $this->postId($postId);
        if ($id === null) {
            return null;
        }

        if (array_key_exists($id, $this->cache)) {
            return self::copyValue($this->cache[$id]);
        }
        if (count($this->cache) >= $this->maxUniquePosts) {
            throw new \LengthException(
                'Post enrichment request exceeds the unique-post limit.'
            );
        }

        $enriched = $this->loadAndEnrich($id);
        $this->cache[$id] = self::copyValue($enriched);
        return self::copyValue($this->cache[$id]);
    }

    public function enrichMany(array $postIds): array
    {
        $unique = array();
        foreach ($postIds as $postId) {
            $id = $this->postId($postId);
            if ($id !== null) {
                $unique[$id] = true;
            }
        }
        $uncached = array();
        foreach (array_keys($unique) as $id) {
            if (!array_key_exists($id, $this->cache)) {
                $uncached[] = $id;
            }
        }
        if (count($this->cache) + count($uncached) > $this->maxUniquePosts) {
            throw new \LengthException(
                'Post enrichment request exceeds the unique-post limit.'
            );
        }

        if ($uncached !== array() && function_exists('_prime_post_caches')) {
            _prime_post_caches($uncached, true, true);
        }
        foreach ($uncached as $id) {
            $this->cache[$id] = self::copyValue(
                $this->loadAndEnrich($id)
            );
        }

        $results = array();
        foreach ($postIds as $postId) {
            $id = $this->postId($postId);
            $results[] = $id === null
                ? null
                : self::copyValue($this->cache[$id]);
        }
        return $results;
    }

    public function cachedCount(): int
    {
        return count($this->cache);
    }

    private function loadAndEnrich(int $id)
    {
        self::requireFunction('get_post');
        $post = get_post($id);
        if (!$post) {
            return null;
        }
        if (!is_object($post)) {
            throw new \UnexpectedValueException(
                'WordPress get_post() must return an object or null.'
            );
        }
        // Never hydrate private/password-protected content into public Map data,
        // even if an old/manual bridge survives a lifecycle hook.
        if (($post->post_status ?? '') !== 'publish' || (string) ($post->post_password ?? '') !== '') {
            return null;
        }
        $post = clone $post;
        unset($post->post_password);
        $post->id = $post->ID;

        $post->post_content = preg_replace(
            '/\[mapsvg.*?\]/',
            '',
            (string) $post->post_content
        );

        self::requireFunction('has_blocks');
        if (has_blocks($post->post_content)) {
            self::requireFunction('parse_blocks');
            self::requireFunction('render_block');
            self::requireFunction('do_blocks');
            self::requireFunction('wpautop');

            $content = '';
            foreach (parse_blocks($post->post_content) as $block) {
                $content .= render_block($block);
            }
            global $wp_embed;
            if (!is_object($wp_embed)
                || !method_exists($wp_embed, 'autoembed')) {
                throw new \RuntimeException(
                    'WordPress embed handler is unavailable.'
                );
            }
            $post->post_content = wpautop(
                $wp_embed->autoembed(do_blocks($content))
            );
        }

        self::requireFunction('get_permalink');
        self::requireFunction('get_the_post_thumbnail_url');
        $post->url = get_permalink($post);
        $post->image = get_the_post_thumbnail_url($post->ID, 'full');

        $post->images = array(
            'thumbnail' => get_the_post_thumbnail_url(
                $post->ID,
                'thumbnail'
            ),
            'medium' => get_the_post_thumbnail_url($post->ID, 'medium'),
            'large' => get_the_post_thumbnail_url($post->ID, 'large'),
            'full' => get_the_post_thumbnail_url($post->ID, 'full'),
        );

        if (function_exists('get_fields')) {
            $post->acf = get_fields($id);
        }

        if (function_exists('rwmb_meta')) {
            self::requireFunction('rwmb_get_object_fields');
            self::requireFunction('rwmb_get_value');
            $post->metabox = array();
            foreach (rwmb_get_object_fields($post->ID) as $fieldId => $_field) {
                $post->metabox[$fieldId] = rwmb_get_value(
                    $fieldId,
                    array(),
                    $post->ID
                );
            }
        }

        self::requireFunction('get_post_meta');
        $post->meta = get_post_meta($post->ID);

        self::requireFunction('get_object_taxonomies');
        self::requireFunction('get_the_terms');
        self::requireFunction('is_wp_error');
        $post->taxonomy = array();
        foreach (get_object_taxonomies($post->post_type) as $taxonomy) {
            $terms = get_the_terms($post->ID, $taxonomy);
            $post->taxonomy[$taxonomy] =
                !is_wp_error($terms) && !empty($terms)
                    ? $terms
                    : array();
        }

        self::requireFunction('apply_filters');
        return apply_filters('mapsvg_format_post_data', $post);
    }

    /** @param mixed $value */
    private function postId($value): ?int
    {
        if ($value === null || $value === '' || $value === false) {
            return null;
        }
        if (is_array($value) || is_object($value)) {
            throw new \InvalidArgumentException(
                'Post ID must be a scalar value.'
            );
        }
        $id = (int) $value;
        return $id > 0 ? $id : null;
    }

    private static function requireFunction(string $name): void
    {
        if (!function_exists($name)) {
            throw new \RuntimeException(
                'WordPress post enrichment requires ' . $name . '().'
            );
        }
    }

    /** @param mixed $value @return mixed */
    private static function copyValue($value)
    {
        if (is_object($value)) {
            $copy = clone $value;
            foreach (get_object_vars($value) as $name => $item) {
                $copy->{$name} = self::copyValue($item);
            }
            return $copy;
        }
        if (!is_array($value)) {
            return $value;
        }

        $copy = array();
        foreach ($value as $key => $item) {
            $copy[$key] = self::copyValue($item);
        }
        return $copy;
    }
}
