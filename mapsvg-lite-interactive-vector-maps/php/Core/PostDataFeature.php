<?php
declare(strict_types=1);
namespace MapSVG\Core;

/** Package policy, independent of WordPress record permissions. Catalog metadata is retained. */
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
        if (($schema->type ?? '') === 'post' || !empty($schema->postType)) return true;
        $fields = method_exists($schema, 'getFields') ? $schema->getFields() : ($schema->fields ?? []);
        foreach ($fields as $field) if ((((array) $field)['type'] ?? null) === 'post') return true;
        return false;
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
