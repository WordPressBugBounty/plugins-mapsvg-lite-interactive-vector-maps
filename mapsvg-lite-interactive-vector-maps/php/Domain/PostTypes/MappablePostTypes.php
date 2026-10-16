<?php

namespace MapSVG;

/**
 * Post types that have a MapSVG post-type data source.
 *
 * Gutenberg loads and saves `mapsvg_location` only through the WP REST API,
 * so those types must be known at `register_post_meta()` time. The
 * `mappable_post_types` option is a cache written on schema create/delete and
 * can drift from live schemas; this class treats schemas as source of truth.
 */
class MappablePostTypes
{
	public const OPTION_KEY = 'mappable_post_types';

	/** @var string[]|null */
	private static $cache = null;

	/**
	 * Unique, non-empty post type slugs from the option and from post-type schemas.
	 *
	 * @return string[]
	 */
	public static function all(): array
	{
		if (self::$cache !== null) {
			return self::$cache;
		}

		self::$cache = self::normalize(array_merge(self::fromOption(), self::fromSchemas()));
		return self::$cache;
	}

	/**
	 * Rewrite the option from live post-type schemas.
	 *
	 * @return void
	 */
	public static function syncOption(): void
	{
		$types = self::fromSchemas();
		Options::set(self::OPTION_KEY, $types);
		self::$cache = null;
	}

	/**
	 * @return void
	 */
	public static function clearCache(): void
	{
		self::$cache = null;
	}

	/**
	 * Trim, drop empties, de-duplicate. Preserves first-seen order.
	 *
	 * @param mixed $types
	 * @return string[]
	 */
	public static function normalize($types): array
	{
		if (!is_array($types)) {
			return array();
		}

		$normalized = array();
		foreach ($types as $type) {
			if (!is_string($type) && !is_numeric($type)) {
				continue;
			}
			$slug = trim((string) $type);
			if ($slug === '' || in_array($slug, $normalized, true)) {
				continue;
			}
			$normalized[] = $slug;
		}

		return $normalized;
	}

	/**
	 * @return string[]
	 */
	public static function fromOption(): array
	{
		return self::normalize(Options::get(self::OPTION_KEY));
	}

	/**
	 * Post types attached to schemas with type=post.
	 *
	 * @return string[]
	 */
	public static function fromSchemas(): array
	{
		$db = Database::get();
		$table = $db->mapsvg_prefix . 'schema';

		if (!$db->get_var("SHOW TABLES LIKE '{$table}'")) {
			return array();
		}

		$columns = array_column($db->get_results("SHOW COLUMNS FROM `{$table}`"), 'Field');
		if (!in_array('postType', $columns, true)) {
			return array();
		}

		$sql = "SELECT `postType` FROM `{$table}` WHERE `postType` IS NOT NULL AND `postType` != ''";
		if (in_array('type', $columns, true)) {
			$sql .= " AND `type` = 'post'";
		}

		$types = $db->get_col($sql, 0);
		return self::normalize(is_array($types) ? $types : array());
	}
}
