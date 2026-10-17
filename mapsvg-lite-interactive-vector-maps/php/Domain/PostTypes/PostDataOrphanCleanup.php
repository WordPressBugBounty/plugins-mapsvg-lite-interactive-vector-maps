<?php

namespace MapSVG;

/**
 * Removes MapSVG Database rows whose linked WordPress post no longer exists.
 *
 * Used after plugin upgrade and by tests. Pure row-selection is testable without WP.
 */
class PostDataOrphanCleanup
{
	/** Rows read per query. Tests may lower this; values below 1 use the default. */
	public static $batchSize = 200;

	/**
	 * MapSVG row IDs whose `post` is empty or no longer a WordPress post.
	 *
	 * @param array<int, object|array> $rows Rows with id + post (raw DB int or decoded object).
	 * @param callable                 $postExists fn(int $postId): bool
	 * @return array<int, int|string>
	 */
	public static function orphanRowIds(array $rows, callable $postExists): array
	{
		$ids = array();
		foreach ($rows as $row) {
			if (is_object($row)) {
				$rowId = isset($row->id) ? $row->id : null;
				$postValue = isset($row->post) ? $row->post : 0;
			} elseif (is_array($row)) {
				$rowId = array_key_exists('id', $row) ? $row['id'] : null;
				$postValue = array_key_exists('post', $row) ? $row['post'] : 0;
			} else {
				continue;
			}

			if ($rowId === null || $rowId === '') {
				continue;
			}

			$postId = self::normalizePostId($postValue);
			if ($postId <= 0 || !$postExists($postId)) {
				$ids[] = $rowId;
			}
		}

		return array_values(array_unique($ids, SORT_REGULAR));
	}

	/**
	 * Delete orphan rows in every post-type MapSVG collection.
	 *
	 * @return int Number of MapSVG object rows deleted.
	 */
	public static function cleanupAll(): int
	{
		$db = Database::get();
		$schemaTable = $db->mapsvg_prefix . 'schema';

		if (!$db->get_var("SHOW TABLES LIKE '{$schemaTable}'")) {
			return 0;
		}

		$columnRows = $db->get_results("SHOW COLUMNS FROM `{$schemaTable}`");
		if (!is_array($columnRows)) {
			return 0;
		}
		$columns = array_column($columnRows, 'Field');
		if (!in_array('type', $columns, true) || !in_array('name', $columns, true)) {
			return 0;
		}

		$schemas = $db->get_results(
			"SELECT `name` FROM `{$schemaTable}` WHERE `type` = 'post' AND `name` IS NOT NULL AND `name` != ''",
			ARRAY_A
		);
		if (!is_array($schemas) || empty($schemas)) {
			return 0;
		}

		$deleted = 0;
		foreach ($schemas as $schema) {
			if (!is_array($schema)) {
				continue;
			}
			$name = isset($schema['name']) ? (string) $schema['name'] : '';
			$deleted += self::cleanupTableByName($db, $name);
		}

		return $deleted;
	}

	/**
	 * @param Database $db
	 * @param string   $schemaName Short table name (no prefix).
	 * @return int
	 */
	public static function cleanupTableByName($db, string $schemaName): int
	{
		if ($schemaName === '' || !preg_match('/\A[A-Za-z0-9_]+\z/', $schemaName) || strlen($schemaName) > 64) {
			return 0;
		}

		$table = $db->mapsvg_prefix . $schemaName;
		if (!preg_match('/\A[A-Za-z0-9_]+\z/', $table)) {
			return 0;
		}

		if (!$db->get_var("SHOW TABLES LIKE '{$table}'")) {
			return 0;
		}

		$columnRows = $db->get_results("SHOW COLUMNS FROM `{$table}`");
		if (!is_array($columnRows)) {
			return 0;
		}
		$columns = array_column($columnRows, 'Field');
		if (!in_array('post', $columns, true) || !in_array('id', $columns, true)) {
			return 0;
		}

		$r2oTable = $db->mapsvg_prefix . 'r2o';
		$r2oExists = (bool) $db->get_var("SHOW TABLES LIKE '{$r2oTable}'");
		$batchSize = (int) self::$batchSize;
		if ($batchSize < 1) {
			$batchSize = 200;
		}

		$deleted = 0;
		$lastId = 0;
		while (true) {
			$sql = $db->prepare(
				"SELECT `id`, `post` FROM `{$table}` WHERE `id` > %d ORDER BY `id` ASC LIMIT %d",
				$lastId,
				$batchSize
			);
			$rows = $db->get_results($sql);
			if (!is_array($rows) || empty($rows)) {
				break;
			}

			$ids = self::orphanRowIds($rows, array(self::class, 'postExists'));
			foreach ($ids as $id) {
				$db->delete($table, array('id' => $id));
				if ($r2oExists) {
					$db->delete($r2oTable, array(
						'objects_table' => $schemaName,
						'object_id'     => $id,
					));
				}
				$deleted++;
			}

			$batchLastId = self::rowId(end($rows));
			if ($batchLastId === null || $batchLastId <= $lastId) {
				break;
			}
			$lastId = $batchLastId;
			if (count($rows) < $batchSize) {
				break;
			}
		}

		return $deleted;
	}

	/**
	 * Numeric id from a SELECT row, used as the next batch cursor.
	 *
	 * @param mixed $row
	 * @return int|null
	 */
	private static function rowId($row)
	{
		if (is_object($row) && isset($row->id) && is_numeric($row->id)) {
			return (int) $row->id;
		}
		if (is_array($row) && isset($row['id']) && is_numeric($row['id'])) {
			return (int) $row['id'];
		}
		return null;
	}

	/**
	 * @param mixed $postId
	 * @return bool
	 */
	public static function postExists($postId): bool
	{
		$post = get_post((int) $postId);
		return is_object($post) && !empty($post->ID);
	}

	/**
	 * @param mixed $postValue
	 * @return int
	 */
	private static function normalizePostId($postValue): int
	{
		if (is_object($postValue) && isset($postValue->id)) {
			return (int) $postValue->id;
		}
		if (is_object($postValue) && isset($postValue->ID)) {
			return (int) $postValue->ID;
		}
		if (is_array($postValue) && isset($postValue['id'])) {
			return (int) $postValue['id'];
		}
		if (is_array($postValue) && isset($postValue['ID'])) {
			return (int) $postValue['ID'];
		}

		return (int) $postValue;
	}
}
