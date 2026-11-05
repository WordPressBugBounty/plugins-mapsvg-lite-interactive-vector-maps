<?php

namespace MapSVG;

/**
 * Owned REST chat/project metadata and transcript CRUD.
 */
class AiChatsController extends Controller
{
	/**
	 * GET /mapsvg/v1/ai/chats?mapId=
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function index($request)
	{
		$mapId = null;
		if ($request->has_param('mapId')) {
			$rawMapId = $request->get_param('mapId');
			if ($rawMapId !== null && $rawMapId !== '') {
				$mapId = (int) $rawMapId;
				if ($mapId <= 0) {
					return self::render(array('error' => 'mapId must be a positive integer'), 400);
				}
			}
		}
		$userId = get_current_user_id();
		if ($userId <= 0) {
			return self::render(array('error' => 'Unauthorized'), 401);
		}

		if ($mapId !== null && !AppDraftController::canEdit($mapId)) return self::render(['error'=>'App not found'],404);
        $items = $request->get_param('scope') === 'projects' ? AiChatsRepository::listProjects($userId,100,max(0,(int)$request->get_param('beforeId'))) : AiChatsRepository::listForMap($mapId, $userId);
		return self::render(array('items' => $items));
	}

	/**
	 * GET /mapsvg/v1/ai/chats/{id}?limit=&beforeId=
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function get($request)
	{
		$id = (int) $request['id'];
		$limit = $request->get_param('limit');
		$beforeId = $request->get_param('beforeId');
		$limitInt = $limit !== null && $limit !== '' ? (int) $limit : null;
		$beforeInt = $beforeId !== null && $beforeId !== '' ? (int) $beforeId : null;

		$chat = AiChatsRepository::findOwned($id, get_current_user_id(), $limitInt, $beforeInt);
		if (!$chat) {
			return self::render(array('error' => 'Chat not found'), 404);
		}
		return self::render(array('chat' => $chat));
	}

	/**
	 * POST /mapsvg/v1/ai/chats
	 * Body: { mapId, title?, messages? }
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function create($request)
	{
		$params = $request->get_json_params();
		if (!is_array($params)) {
			$params = $request->get_params();
		}

		$mapId = isset($params['mapId']) && $params['mapId'] !== null
			? (int) $params['mapId']
			: null;
		if ($mapId !== null && $mapId <= 0) {
			return self::render(array('error' => 'mapId must be a positive integer'), 400);
		}
		$userId = get_current_user_id();
		if ($userId <= 0) {
			return self::render(array('error' => 'Unauthorized'), 401);
		}

		$title = isset($params['title']) && is_string($params['title'])
			? $params['title']
			: 'New project';
		$messages = isset($params['messages']) && is_array($params['messages'])
			? self::sanitizeMessages($params['messages'])
			: array();

		if ($mapId !== null && !AppDraftController::canEdit($mapId)) return self::render(['error'=>'App not found'],404);
		$chat = AiChatsRepository::create($mapId, $userId, $title, $messages, ($params['fresh'] ?? false) === true);
		return self::render(array('chat' => $chat), 201);
	}

	/**
	 * PUT /mapsvg/v1/ai/chats/{id}
	 * Body: { mapId?, title?, appendMessages? }
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function update($request)
	{
		$params = $request->get_json_params();
		if (!is_array($params)) {
			$params = $request->get_params();
		}

		$id = (int) $request['id'];
        if (!AiChatsRepository::findOwned($id,get_current_user_id(),1)) return self::render(['error'=>'Chat not found'],404);
		$data = array();
		if (array_key_exists('mapId', $params)) {
			$nextMapId = $params['mapId'];
			$existing = AiChatsRepository::findOwned($id,get_current_user_id(),1);
            if ($nextMapId === null || (int)$nextMapId <= 0 || !AppDraftController::canEdit((int)$nextMapId) || ((int)($existing['mapId']??0)>0 && (int)$existing['mapId'] !== (int)$nextMapId)) return self::render(['error'=>'Invalid App attachment'],409);
            $data['mapId'] = (int)$nextMapId;
		}
		if (isset($params['title']) && is_string($params['title'])) {
			$data['title'] = $params['title'];
		}
		if (isset($params['appendMessages']) && is_array($params['appendMessages'])) {
			$data['appendMessages'] = self::sanitizeMessages($params['appendMessages']);
		}

		$chat = AiChatsRepository::update($id, $data);
		if (!$chat) {
			return self::render(array('error' => 'Chat not found'), 404);
		}
		return self::render(array('chat' => $chat));
	}

	/**
	 * DELETE /mapsvg/v1/ai/chats/{id}
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function delete($request)
	{
		$id = (int) $request['id'];
		if (!AiChatsRepository::findOwned($id,get_current_user_id(),1)) return self::render(['error'=>'Chat not found'],404);
		$ok = AiChatsRepository::delete($id);
		if (!$ok) {
			return self::render(array('error' => 'Chat not found'), 404);
		}
		return self::render(array('ok' => true));
	}

	/**
	 * @param array<int, mixed> $messages
	 * @return array<int, array{id: string, role: string, content: string}>
	 */
	private static function sanitizeMessages(array $messages): array
	{
		$out = array();
		foreach ($messages as $msg) {
			if (!is_array($msg)) {
				continue;
			}
			$role = isset($msg['role']) ? (string) $msg['role'] : '';
			if (!in_array($role, array('user', 'assistant', 'tool'), true)) {
				continue;
			}
			$content = isset($msg['content']) ? (string) $msg['content'] : '';
			$id = isset($msg['id']) ? (string) $msg['id'] : ('msg-' . count($out));
			$out[] = array(
				'id' => $id,
				'role' => $role,
				'content' => $content,
			);
		}
		return $out;
	}
}
