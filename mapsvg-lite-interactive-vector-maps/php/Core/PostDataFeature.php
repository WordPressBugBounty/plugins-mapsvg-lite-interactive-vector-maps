<?php
declare(strict_types=1);
namespace MapSVG\Core;

/** Native WP/CPT source policy. Linked post fields in local Collections are core-owned. */
final class PostDataFeature
{
    public static function isEnabled(): bool
    {
        if (!defined('MAPSVG_PLAN') || !in_array(MAPSVG_PLAN, ['lite', 'mapsvg-lite'], true)) return true;
        return function_exists('apply_filters') && (bool) apply_filters('mapsvg_post_data_enabled', false);
    }
    public static function usesPosts($schema): bool
    {
        $schema = is_array($schema) ? (object) $schema : $schema;
        if (!$schema) return false;
        return ($schema->type ?? '') === 'post' || !empty($schema->postType);
    }
    public static function assertEnabled(): void
    {
        if (!self::isEnabled()) throw new \DomainException('WordPress post data sources require a paid MapSVG add-on.', 403);
    }
    public static function assertSchema($schema): void
    {
        if (self::usesPosts($schema)) self::assertEnabled();
    }
}
