<?php

namespace MapSVG;

/**
 * Persist one canonical AI chat per user/App and distinct unbound welcome conversations.
 * Messages live in mapsvg_ai_messages and are loaded in pages.
 */
class AiChatsRepository
{
	public const DEFAULT_PAGE_SIZE = 50;
	public const MAX_PAGE_SIZE = 100;

	private static bool $ensured = false;

	public static function tableName(): string
	{
		$db = Database::get();
		return $db->mapsvg_prefix . 'ai_chats';
	}

	public static function messagesTableName(): string
	{
		$db = Database::get();
		return $db->mapsvg_prefix . 'ai_messages';
	}

	public static function ensureTable(): void
	{
		if (self::$ensured) {
			return;
		}
		self::$ensured = true;

		$db = Database::get();
		$chatsTable = self::tableName();
		$messagesTable = self::messagesTableName();
		$charset = $db->db->get_charset_collate();

		if (!$db->get_var("SHOW TABLES LIKE '{$chatsTable}'")) {
			$db->query(
				"CREATE TABLE `{$chatsTable}` (
					`id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
					`mapId` INT(11) NULL DEFAULT NULL,
					`userId` BIGINT(20) UNSIGNED NOT NULL,
					`title` VARCHAR(255) NOT NULL DEFAULT 'New chat',
					`messages` LONGTEXT NOT NULL,
					`createdAt` DATETIME NOT NULL,
					`updatedAt` DATETIME NOT NULL,
					PRIMARY KEY (`id`),
					UNIQUE KEY `idxMapId` (`mapId`),
					KEY `idxUserMap` (`userId`, `mapId`)
				) {$charset}"
			);
		}

		// Tables created before unbound chats were supported still require mapId.
		// CREATE TABLE above only handles fresh installs, so repair the old column.
		$mapIdColumn = $db->get_row("SHOW COLUMNS FROM `{$chatsTable}` LIKE 'mapId'");
		if ($mapIdColumn && strtoupper((string) $mapIdColumn->Null) !== 'YES') {
			$db->query("ALTER TABLE `{$chatsTable}` MODIFY COLUMN `mapId` INT(11) NULL DEFAULT NULL");
		}
		// Server-owned planner state. Never accepted by the chat update endpoint.
		if (!$db->get_row("SHOW COLUMNS FROM `{$chatsTable}` LIKE 'taskPlan'")) {
			$db->query("ALTER TABLE `{$chatsTable}` ADD COLUMN `taskPlan` LONGTEXT NULL");
		}

		if (!$db->get_var("SHOW TABLES LIKE '{$messagesTable}'")) {
			$db->query(
				"CREATE TABLE `{$messagesTable}` (
					`id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
					`chatId` BIGINT(20) UNSIGNED NOT NULL,
					`clientId` VARCHAR(64) NOT NULL DEFAULT '',
					`role` VARCHAR(20) NOT NULL,
					`content` LONGTEXT NOT NULL,
					`createdAt` DATETIME NOT NULL,
					PRIMARY KEY (`id`),
					KEY `idxChatId` (`chatId`),
					KEY `idxChatIdId` (`chatId`, `id`)
				) {$charset}"
			);
		}

        foreach (['titleSource' => "VARCHAR(16) NOT NULL DEFAULT 'legacy'", 'titleRefine' => 'TINYINT(1) NOT NULL DEFAULT 0'] as $column => $definition) {
            if (!$db->get_row("SHOW COLUMNS FROM `{$chatsTable}` LIKE '{$column}'")) $db->query("ALTER TABLE `{$chatsTable}` ADD COLUMN `{$column}` {$definition}");
        }
        // Canonical per user/App; a shared App never exposes another user's conversation.
        if ($db->get_row("SHOW INDEX FROM `{$chatsTable}` WHERE Key_name = 'idxMapId'")) $db->query("ALTER TABLE `{$chatsTable}` DROP INDEX `idxMapId`");
        if (!$db->get_row("SHOW INDEX FROM `{$chatsTable}` WHERE Key_name = 'idxUserMapUnique'")) $db->query("ALTER TABLE `{$chatsTable}` ADD UNIQUE KEY `idxUserMapUnique` (`userId`,`mapId`)");
		self::migrateLegacyMessages();
	}

	/**
	 * One-time: move LONGTEXT JSON blobs into ai_messages rows.
	 */
	private static function migrateLegacyMessages(): void
	{
		$db = Database::get();
		$chatsTable = self::tableName();
		$messagesTable = self::messagesTableName();

		if (!$db->get_var("SHOW TABLES LIKE '{$chatsTable}'") || !$db->get_var("SHOW TABLES LIKE '{$messagesTable}'")) {
			return;
		}

		$rows = $db->get_results(
			"SELECT `id`, `messages` FROM `{$chatsTable}`
			 WHERE `messages` IS NOT NULL AND `messages` != '' AND `messages` != '[]'"
		);
		if (!is_array($rows) || count($rows) === 0) {
			return;
		}

		foreach ($rows as $row) {
			$chatId = (int) $row->id;
			$existing = (int) $db->get_var(
				$db->prepare(
					"SELECT COUNT(*) FROM `{$messagesTable}` WHERE `chatId` = %d",
					$chatId
				)
			);
			if ($existing > 0) {
				$db->update($chatsTable, array('messages' => '[]'), array('id' => $chatId));
				continue;
			}

			$decoded = json_decode((string) $row->messages, true);
			if (!is_array($decoded) || count($decoded) === 0) {
				$db->update($chatsTable, array('messages' => '[]'), array('id' => $chatId));
				continue;
			}

			$now = current_time('mysql');
			foreach ($decoded as $msg) {
				if (!is_array($msg)) {
					continue;
				}
				$role = isset($msg['role']) ? (string) $msg['role'] : '';
				if (!in_array($role, array('user', 'assistant', 'tool'), true)) {
					continue;
				}
				$db->insert(
					$messagesTable,
					array(
						'chatId' => $chatId,
						'clientId' => isset($msg['id']) ? substr((string) $msg['id'], 0, 64) : '',
						'role' => $role,
						'content' => isset($msg['content']) ? (string) $msg['content'] : '',
						'createdAt' => $now,
					)
				);
			}
			$db->update($chatsTable, array('messages' => '[]'), array('id' => $chatId));
		}
	}

    /** Metadata only; no transcript or global Collection ownership. */
    public static function listProjects(int $userId, int $limit = 100, int $beforeId = 0): array
    {
        self::ensureTable(); $db = Database::get(); $table = self::tableName();
        $rows = $db->get_results($db->prepare("SELECT `id`,`mapId`,`title`,`titleSource`,`titleRefine`,`createdAt`,`updatedAt` FROM `{$table}` WHERE `userId`=%d AND (`mapId` IS NOT NULL OR EXISTS (SELECT 1 FROM `".self::messagesTableName()."` m WHERE m.`chatId`=`{$table}`.`id` AND m.`role`='user')) AND (%d=0 OR `id`<%d) ORDER BY `id` DESC LIMIT %d", $userId, $beforeId, $beforeId, min(100,max(1,$limit))));
        return array_map([self::class,'rowToListItem'], is_array($rows) ? $rows : []);
    }
    private static function mapTitle(int $mapId): string
    {
        try { $map = RepositoryFactory::get('map')->findById($mapId); return $map && trim((string)$map->title) !== '' ? (string)$map->title : 'Map #'.$mapId; }
        catch (\Throwable $error) { return 'Map #'.$mapId; }
    }
    private static function displayTitle($row): string
    {
        return (int)($row->mapId ?? 0) > 0 ? self::mapTitle((int)$row->mapId) : (string)$row->title;
    }
    /** AI title is metadata, applied only to the unchanged eligible unbound chat. */
    public static function saveAutomaticTitle(int $id, int $userId, string $expected, string $title, bool $refine): ?array
    {
        self::ensureTable();
        if ($title === '' || preg_match('/[<>\r\n]/u',$title) || preg_match_all('/./us',$title)>48 || count(preg_split('/\s+/u',trim($title)))>7) return null;
        $db = Database::get(); $table = self::tableName();
        $db->query($db->prepare("UPDATE `{$table}` SET `title`=%s,`titleSource`='auto',`titleRefine`=%d,`updatedAt`=%s WHERE `id`=%d AND `userId`=%d AND `mapId` IS NULL AND `titleRefine`=1 AND `titleSource` IN ('auto','legacy') AND BINARY `title`=%s",$title,$refine?1:0,current_time('mysql'),$id,$userId,$expected));
        return self::findOwned($id,$userId,1);
    }

	/**
	 * @return array<int, array{id: int, mapId: int|null, title: string, updatedAt: string, createdAt: string}>
	 */
	public static function listForMap(?int $mapId, int $userId): array
	{
		self::ensureTable();
		$db = Database::get();
		$table = self::tableName();
		if ($mapId !== null && $mapId > 0) {
			$rows = $db->get_results(
				$db->prepare(
					"SELECT `id`, `mapId`, `title`, `createdAt`, `updatedAt`
					 FROM `{$table}`
					 WHERE `mapId` = %d AND `userId` = %d
					 LIMIT 1",
					$mapId, $userId
				)
			);
		} else {
			$rows = $db->get_results(
				$db->prepare(
					"SELECT c.`id`, c.`mapId`, c.`title`, c.`createdAt`, c.`updatedAt`
					 FROM `{$table}` c
					 WHERE c.`mapId` IS NULL AND c.`userId` = %d
					 ORDER BY c.`updatedAt` DESC, c.`id` DESC
					 LIMIT 1",
					$userId
				)
			);
		}

		$out = array();
		if (!is_array($rows)) {
			return $out;
		}
		foreach ($rows as $row) {
			$out[] = self::rowToListItem($row);
		}
		return $out;
	}

	/**
	 * @return array{
	 *   id: int,
	 *   mapId: int,
	 *   title: string,
	 *   messages: array,
	 *   hasMore: bool,
	 *   messageCount: int,
	 *   updatedAt: string,
	 *   createdAt: string
	 * }|null
	 */
	public static function find(int $id, ?int $limit = null, ?int $beforeId = null): ?array
	{
		self::ensureTable();
		$db = Database::get();
		$table = self::tableName();
		$row = $db->get_row(
			$db->prepare(
				"SELECT * FROM `{$table}` WHERE `id` = %d",
				$id
			)
		);
		if (!$row) {
			return null;
		}

		$page = self::listMessages($id, $limit, $beforeId);
		return array(
			'id' => (int) $row->id,
			'mapId' => $row->mapId === null ? null : (int) $row->mapId,
			'title' => self::displayTitle($row),
            'titleSource' => (int)($row->mapId ?? 0) > 0 ? 'map' : (string)($row->titleSource ?? 'legacy'),
            'titleRefine' => (int)($row->mapId ?? 0) <= 0 && (bool)($row->titleRefine ?? true),
			'messages' => $page['messages'],
			'taskPlan' => isset($row->taskPlan) ? json_decode((string) $row->taskPlan, true) : null,
			'hasMore' => $page['hasMore'],
			'messageCount' => $page['messageCount'],
			'createdAt' => (string) $row->createdAt,
			'updatedAt' => (string) $row->updatedAt,
		);
	}

	/**
	 * Load a chat only when it belongs to the current user.
	 *
	 * @return array|null
	 */
	public static function findOwned(
		int $id,
		int $userId,
		?int $limit = null,
		?int $beforeId = null
	): ?array {
		if ($id <= 0 || $userId <= 0) {
			return null;
		}

		self::ensureTable();
		$db = Database::get();
		$table = self::tableName();
		$owned = $db->get_var(
			$db->prepare(
				"SELECT `id` FROM `{$table}` WHERE `id` = %d AND `userId` = %d",
				$id,
				$userId
			)
		);
		if (!$owned) {
			return null;
		}

		return self::find($id, $limit, $beforeId);
	}

	/** Compare-and-swap prevents two streams from advancing the same chat plan. */
	public static function saveTaskPlanForUser(int $id, int $userId, ?array $expected, array $next): bool
	{
		if ($id <= 0 || $userId <= 0) return false;
		self::ensureTable();
		$db = Database::get();
		$table = self::tableName();
		$where = $expected === null ? '(`taskPlan` IS NULL OR `taskPlan` = \'\')' : 'BINARY `taskPlan` = %s';
		$args = array(wp_json_encode($next), current_time('mysql'), $id, $userId);
		if ($expected !== null) $args[] = wp_json_encode($expected);
		$sql = "UPDATE `{$table}` SET `taskPlan` = %s, `updatedAt` = %s WHERE `id` = %d AND `userId` = %d AND {$where}";
		return $db->query($db->prepare($sql, ...$args)) === 1;
	}

	/**
	 * Persist the map attachment server-side so a dropped SSE connection cannot
	 * leave a successful create-map operation looking like an unbound start chat.
	 */
	public static function attachMapForUser(
		int $id,
		int $userId,
		int $mapId
	): bool {
		if ($id <= 0 || $userId <= 0 || $mapId <= 0) {
			return false;
		}

		self::ensureTable();
		$db = Database::get();
		$table = self::tableName();
		$result = $db->update(
			$table,
			array(
				'mapId' => $mapId,
                'title' => self::mapTitle($mapId), 'titleSource' => 'map', 'titleRefine' => 0,
				'updatedAt' => current_time('mysql'),
			),
			array(
				'id' => $id,
				'userId' => $userId,
			)
		);

		if ($result === false) {
			return false;
		}

		$chat = self::findOwned($id, $userId, 1);
		return $chat !== null && (int) ($chat['mapId'] ?? 0) === $mapId;
	}

	/**
	 * @return array{messages: array<int, array{id: string, role: string, content: string}>, hasMore: bool, messageCount: int}
	 */
	public static function listMessages(int $chatId, ?int $limit = null, ?int $beforeId = null): array
	{
		self::ensureTable();
		$db = Database::get();
		$table = self::messagesTableName();

		$limit = $limit === null ? self::DEFAULT_PAGE_SIZE : max(1, min(self::MAX_PAGE_SIZE, $limit));
		$messageCount = (int) $db->get_var(
			$db->prepare("SELECT COUNT(*) FROM `{$table}` WHERE `chatId` = %d", $chatId)
		);

		if ($beforeId !== null && $beforeId > 0) {
			$rows = $db->get_results(
				$db->prepare(
					"SELECT `id`, `clientId`, `role`, `content`
					 FROM `{$table}`
					 WHERE `chatId` = %d AND `id` < %d
					 ORDER BY `id` DESC
					 LIMIT %d",
					$chatId,
					$beforeId,
					$limit + 1
				)
			);
		} else {
			$rows = $db->get_results(
				$db->prepare(
					"SELECT `id`, `clientId`, `role`, `content`
					 FROM `{$table}`
					 WHERE `chatId` = %d
					 ORDER BY `id` DESC
					 LIMIT %d",
					$chatId,
					$limit + 1
				)
			);
		}

		if (!is_array($rows)) {
			$rows = array();
		}

		$hasMore = count($rows) > $limit;
		if ($hasMore) {
			$rows = array_slice($rows, 0, $limit);
		}
		$rows = array_reverse($rows);

		$messages = array();
		foreach ($rows as $row) {
			$clientId = (string) $row->clientId;
			$messages[] = array(
				'id' => $clientId !== '' ? $clientId : ('db-' . (int) $row->id),
				'dbId' => (int) $row->id,
				'role' => (string) $row->role,
				'content' => (string) $row->content,
			);
		}

		return array(
			'messages' => $messages,
			'hasMore' => $hasMore,
			'messageCount' => $messageCount,
		);
	}

	/**
	 * @param array<int, array<string, mixed>> $messages
	 * @return array{id: int, mapId: int, title: string, messages: array, hasMore: bool, messageCount: int, updatedAt: string, createdAt: string}
	 */
	public static function create(?int $mapId, int $userId, string $title, array $messages = array(), bool $fresh = false): array
	{
		self::ensureTable();

		// Map chats remain canonical. A new welcome lifetime must not inherit
		// another unbound conversation's messages or server task plan.
		$existing = $fresh && $mapId === null ? array() : self::listForMap($mapId, $userId);
		if (!empty($existing[0]['id'])) {
			$existingId = (int) $existing[0]['id'];
			if (count($messages) > 0) {
				$chat = self::update(
					$existingId,
					array(
						'appendMessages' => $messages,
					)
				);
			} else {
				$chat = self::find($existingId);
			}
			if ($chat) {
				return $chat;
			}
		}

		$db = Database::get();
		$table = self::tableName();
		$now = current_time('mysql');
		$title = self::sanitizeTitle($title);

		$inserted = $db->insert(
			$table,
			array(
				'mapId' => $mapId !== null && $mapId > 0 ? $mapId : null,
				'userId' => $userId,
				'title' => $mapId ? self::mapTitle($mapId) : $title,
                'titleSource' => $mapId ? 'map' : ($title === 'New project' || $title === 'New chat' ? 'auto' : 'manual'),
                'titleRefine' => $mapId ? 0 : 1,
				'messages' => '[]',
				'createdAt' => $now,
				'updatedAt' => $now,
			)
		);

		if ($inserted === false) {
			throw new \RuntimeException('Failed to create AI chat');
		}

		$id = (int) $db->insert_id;
		if ($id <= 0) {
			throw new \RuntimeException('AI chat insert returned no id');
		}
		if (count($messages) > 0) {
			self::insertMessageRows($id, $messages);
		}

		$found = self::find($id);
		if ($found) {
			return $found;
		}

		return array(
			'id' => $id,
			'mapId' => $mapId,
			'title' => $title,
			'messages' => array(),
			'hasMore' => false,
			'messageCount' => 0,
			'createdAt' => $now,
			'updatedAt' => $now,
		);
	}

	/**
	 * @param array{mapId?: int|null, title?: string, appendMessages?: array} $data
	 * @return array{id: int, mapId: int, title: string, messages: array, hasMore: bool, messageCount: int, updatedAt: string, createdAt: string}|null
	 */
	public static function update(int $id, array $data): ?array
	{
		self::ensureTable();
		$existing = self::find($id, self::DEFAULT_PAGE_SIZE);
		if (!$existing) {
			return null;
		}

		$db = Database::get();
		$table = self::tableName();
		$fields = array('updatedAt' => current_time('mysql'));

		if (array_key_exists('mapId', $data)) {
			$nextMapId = $data['mapId'];
			$fields['mapId'] = is_numeric($nextMapId) && (int) $nextMapId > 0
				? (int) $nextMapId
				: null;
		}

		if (isset($data['title']) && is_string($data['title'])) {
			$fields['title'] = self::sanitizeTitle($data['title']);
            $fields['titleSource'] = 'manual'; $fields['titleRefine'] = 0;
		}

        $effectiveMap = (int)($fields['mapId'] ?? $existing['mapId'] ?? 0);
        if ($effectiveMap > 0) { $fields['title'] = self::mapTitle($effectiveMap); $fields['titleSource'] = 'map'; $fields['titleRefine'] = 0; }
		$db->update($table, $fields, array('id' => $id));

		if (isset($data['appendMessages']) && is_array($data['appendMessages'])) {
			self::insertMessageRows($id, $data['appendMessages']);
		}

		return self::find($id, self::DEFAULT_PAGE_SIZE);
	}

	public static function delete(int $id): bool
	{
		self::ensureTable();
		$db = Database::get();
		$table = self::tableName();
		$messagesTable = self::messagesTableName();
		$owned = $db->get_var(
			$db->prepare(
				"SELECT `id` FROM `{$table}` WHERE `id` = %d",
				$id
			)
		);
		if (!$owned) {
			return false;
		}
		$db->query(
			$db->prepare("DELETE FROM `{$messagesTable}` WHERE `chatId` = %d", $id)
		);
		$result = $db->delete($table, array('id' => $id));
		return $result !== false && (int) $result > 0;
	}

	/**
	 * @param array<int, array<string, mixed>> $messages
	 */
	private static function insertMessageRows(int $chatId, array $messages): void
	{
		$db = Database::get();
		$table = self::messagesTableName();
		$now = current_time('mysql');

		foreach ($messages as $msg) {
			if (!is_array($msg)) {
				continue;
			}
			$role = isset($msg['role']) ? (string) $msg['role'] : '';
			if (!in_array($role, array('user', 'assistant', 'tool'), true)) {
				continue;
			}
			$db->insert(
				$table,
				array(
					'chatId' => $chatId,
					'clientId' => isset($msg['id']) ? substr((string) $msg['id'], 0, 64) : '',
					'role' => $role,
					'content' => isset($msg['content']) ? (string) $msg['content'] : '',
					'createdAt' => $now,
				)
			);
		}
	}

	private static function sanitizeTitle(string $title): string
	{
		$title = trim(wp_strip_all_tags($title));
		if ($title === '') {
			$title = 'New chat';
		}
		if (function_exists('mb_substr')) {
			return mb_substr($title, 0, 255);
		}
		return substr($title, 0, 255);
	}

	/**
	 * @param object $row
	 * @return array{id: int, mapId: int, title: string, updatedAt: string, createdAt: string}
	 */
	private static function rowToListItem($row): array
	{
		return array(
			'id' => (int) $row->id,
			'mapId' => $row->mapId === null ? null : (int) $row->mapId,
			'title' => self::displayTitle($row),
            'titleSource' => (int)($row->mapId ?? 0) > 0 ? 'map' : (string)($row->titleSource ?? 'legacy'),
            'titleRefine' => (int)($row->mapId ?? 0) <= 0 && (bool)($row->titleRefine ?? true),
			'createdAt' => (string) $row->createdAt,
			'updatedAt' => (string) $row->updatedAt,
		);
	}
}
