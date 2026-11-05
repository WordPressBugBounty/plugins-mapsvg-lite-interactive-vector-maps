<?php
namespace MapSVG;

/** Owned browser conversation bridge. Dashboard owns model context, planning and orchestration. */
class AiChatController extends Controller
{
    public static function chat($request)
    {
        $params=$request->get_json_params();if(!is_array($params))$params=$request->get_params();
        $stream=!isset($params['stream'])||(bool)$params['stream'];$text='';$failed=false;$errorMessage='';$status=200;$leaseKey=null;$owner=wp_generate_uuid4();
        if($stream)self::beginSse();
        $emit=static function(array $event)use($stream,&$text,&$failed):void {
            if(($event['type']??'')==='text_delta')$text.=(string)($event['text']??'');
            if(($event['type']??'')==='error')$failed=true;
            if($stream)self::sseEmit($event);
        };
        try {
            if(!is_user_logged_in()||!current_user_can('edit_posts'))throw new \RuntimeException('You cannot use AI chat.',403);
            $messages=self::normalizeMessages($params['messages']??null);
            if(!$messages)throw new \InvalidArgumentException('messages are required',400);
            $chatId=(int)($params['chatId']??0);$userId=get_current_user_id();
            $chat=$chatId>0?AiChatsRepository::findOwned($chatId,$userId,1):null;
            if(!$chat)throw new \RuntimeException('AI chat was not found or is not owned by the current user.',404);
            $mapId=(int)($params['mapId']??0);$bound=(int)($chat['mapId']??0);$recovered=$mapId<=0&&$bound>0;
            if($mapId>0&&$bound>0&&$mapId!==$bound)throw new \RuntimeException('AI chat belongs to a different map.',409);
            if($mapId<=0)$mapId=$bound;
            if($mapId>0&&!AppDraftController::canEdit($mapId))throw new \RuntimeException('You cannot edit this App.',403);
            $config=AiProviderConfig::activeClientConfig();if($config['apiKey']==='')throw new \RuntimeException('Activate your MapSVG license to use AI chat.',400);
            $leaseKey='mapsvg_ai_transport_'.$userId.'_'.$chatId;
            AiExecutionStore::cleanup();
            if(!AiExecutionStore::claim($leaseKey,$owner,300))throw new \RuntimeException('This chat already has a running request.',409);
            $heartbeat=static function()use($leaseKey,$owner,$emit):void {
                if(!AiExecutionStore::put($leaseKey,$owner,$owner,300))throw new \RuntimeException('The chat request ownership changed.');
                $emit(['type'=>'keepalive']);
            };
            $preview=self::previewOptionsForMap($params['previewState']??null,$mapId);$draft=self::draftStateForMap($params['previewState']??null,$mapId);
            $lastPlan=is_array($chat['taskPlan']??null)?$chat['taskPlan']:null;$turnId=wp_generate_uuid4();
            $manifest=array_merge(AiAgentClient::clientManifest(),['userId'=>$userId,'chatId'=>$chatId,'turnId'=>$turnId]);
            $body=array_merge($manifest,['action'=>'start','mapId'=>$mapId,'messages'=>$messages,'runtime'=>AiRuntimeContext::snapshot($mapId),'draft'=>$draft,'legacyTask'=>$lastPlan,'recoveredMap'=>$recovered,'delivery'=>$stream?'stream':'buffered']);
            if($mapId<=0 && !empty($chat['titleRefine']) && in_array($chat['titleSource']??'legacy',['auto','legacy'],true)) $body['chatTitle']=['current'=>(string)$chat['title'],'needsRefinement'=>true];
            $client=new AiAgentClient($config);
            if($recovered&&($open=self::openMapPayload($mapId)))$emit(array_merge(['type'=>'open_map'],$open));
            // Transport continuation only: no prompts, tool policy, model choices or plan transitions here.
            for($transport=0;$transport<256;$transport++){
                $heartbeat();
                $response=$client->step($body,static function(array $event)use(&$lastPlan,$chatId,$userId,$emit,$chat):void {
                    if(($event['type']??'')==='chat_title'){
                        $saved=AiChatsRepository::saveAutomaticTitle($chatId,$userId,(string)$chat['title'],(string)($event['title']??''),($event['needsRefinement']??false)===true);
                        if($saved)$emit(['type'=>'chat_title','chatId'=>$chatId,'title'=>$saved['title'],'mapId'=>$saved['mapId']]);
                        return;
                    }
                    if(($event['type']??'')==='task_plan'){
                        $plan=$event['plan']??null;
                        if(!is_array($plan))throw new \RuntimeException('Invalid task display state.');
                        // Native transcript identity is display metadata, not model/planner authority.
                        unset($plan['userMessageId']);
                        foreach(array_reverse($chat['messages']??[]) as $message){
                            if(($message['role']??'')==='user' && is_string($message['id']??null) && $message['id']!==''){
                                $plan['userMessageId']=$message['id'];break;
                            }
                        }
                        $event['plan']=$plan;
                        if(!AiChatsRepository::saveTaskPlanForUser($chatId,$userId,$lastPlan,$plan))throw new \RuntimeException('Task display state ownership changed. Execution stopped.');
                        $lastPlan=$plan;
                    }
                    $emit($event);
                },$heartbeat);
                if($response['complete']||$failed)break;
                $next=$response['next'];
                if(($next['turnId']??null)!==$turnId||!is_int($next['sequence']??null)||$next['sequence']<1)throw new \RuntimeException('Invalid agent checkpoint.');
                $outcome=null;
                if(isset($next['command'])){
                    $command=$next['command'];$result=AiExecutor::execute($command,$turnId,$chatId,$mapId,$preview,$draft,!$stream,$heartbeat);
                    self::executionEffects($command['name'],$result,$chatId,$userId,$mapId,$preview,$draft,$emit);
                    $outcome=['commandId'=>$command['id'],'result'=>$result];
                }
                $body=array_merge($manifest,['action'=>'continue','sequence'=>$next['sequence'],'mapId'=>$mapId,'runtime'=>AiRuntimeContext::snapshot($mapId),'draft'=>$draft]);
                if($outcome!==null)$body['outcome']=$outcome;
                if($transport===255)throw new \RuntimeException('AI transport continuation limit reached. Saved changes are retained.');
            }
        } catch(\Throwable $error){$errorMessage=$error->getMessage();$status=in_array($error->getCode(),[400,403,404,409,426],true)?$error->getCode():502;$emit(['type'=>'error','error'=>$errorMessage]);}
        finally {if($leaseKey)AiExecutionStore::release($leaseKey,$owner);}
        if($stream){self::sseEmit(['type'=>'done','provider'=>'mapsvg','model'=>'MapSVG-1.0']);exit;}
        return self::render($failed?['error'=>$errorMessage!==''?$errorMessage:'The managed AI request could not finish.']:['message'=>['role'=>'assistant','content'=>$text],'provider'=>'mapsvg','model'=>'MapSVG-1.0'],$failed?$status:200);
    }

    private static function executionEffects(string $name,array $exec,int $chatId,int $userId,int &$mapId,?array &$preview,?array &$draft,callable $emit): void
    {
        $isCreate=in_array($name,['create_map','create_image_map','duplicate_map','provision_map_from_csv'],true)
            ||($name==='manage_map'&&in_array($exec['map_mutation']['action']??'', ['created','duplicated'],true));
        if($isCreate&&!empty($exec['ok'])){
            $created=$exec['open_map']??($exec['map_mutation']['map']??($exec['result']['map']??$exec['result']??null));
            if(is_array($created)&&($created['mapId']??0)>0){
                $mapId=(int)$created['mapId'];if(!AiChatsRepository::attachMapForUser($chatId,$userId,$mapId))throw new \RuntimeException('Could not attach the created App to this chat. Inspect saved Apps before retrying.');
                if(empty($exec['open_map']))$exec['open_map']=['mapId'=>$mapId,'title'=>(string)($created['title']??'Map #'.$mapId)];
            }
        }
        if(isset($exec['preview_options'])&&is_array($exec['preview_options']))$preview=$exec['preview_options'];
        if(isset($exec['options_patch'])&&is_array($exec['options_patch'])){
            if(!isset($exec['preview_options'])&&$preview!==null)$preview=AiTools::deepMerge($preview,$exec['options_patch']);
            $emit(['type'=>'options_patch','mapId'=>$exec['result']['mapId']??$mapId,'patch'=>$exec['options_patch']]);
        }
        if(isset($exec['options_replace'])&&is_array($exec['options_replace']))$emit(['type'=>'options_replace','mapId'=>$exec['result']['mapId']??$mapId,'options'=>$exec['options_replace']]);
        foreach(['svg_regions_preview','svg_regions_apply_request','publish_request','draft_action_request','map_mutation','schema_mutation','repository_mutation','query_mutation','connection_mutation','global_settings_mutation','open_map'] as $type)
            if(!empty($exec[$type])&&is_array($exec[$type]))$emit(array_merge(['type'=>$type],$exec[$type]));
        if($isCreate&&!empty($exec['ok'])){$preview=null;$draft=null;}
    }

	public static function previewOptionsForMap($state, int $mapId): ?array
	{
		if ($mapId <= 0 || !is_array($state) || !isset($state['mapId']) ||
			!is_int($state['mapId']) || $state['mapId'] !== $mapId ||
			!isset($state['options']) || !is_array($state['options']) ||
			($state['options'] !== array() && array_keys($state['options']) === range(0, count($state['options']) - 1))) {
			return null;
		}
		return $state['options'];
	}

	/** Whitelisted metadata, never option content or write authority. */
	public static function draftStateForMap($state, int $mapId): ?array
	{
		if (self::previewOptionsForMap($state, $mapId) === null) return null;
		$draft = $state['draft'] ?? null;
		if (!is_array($draft) || ($draft['mapId'] ?? null) !== $mapId
			|| !is_int($draft['draftId'] ?? null) || $draft['draftId'] < 1
			|| !is_int($draft['revision'] ?? null) || $draft['revision'] < 1) return null;
		$result = array('mapId' => $mapId, 'draftId' => $draft['draftId'], 'revision' => $draft['revision']);
		foreach (array('dirty', 'localSaved', 'conflicted', 'offline', 'ready', 'busy', 'transitioning') as $key) {
			if (!is_bool($draft[$key] ?? null)) return null;
			$result[$key] = $draft[$key];
		}
		return $result;
	}


	public static function decodeToolArguments(string $json): array
	{
		$native = json_decode($json);
		$args = json_decode($json, true);
		if (!$native instanceof \stdClass || !is_array($args)) return array();
		if (isset($native->query) && $native->query instanceof \stdClass && property_exists($native->query, 'input')) {
			$args['query']['input'] = \MapSVG\Shared\SavedQuery\SavedQueryInput::copy($native->query->input);
		}
		return $args;
	}


	private static function openMapPayload(int $mapId): ?array
	{
		if ($mapId <= 0) {
			return null;
		}

		try {
			/** @var MapsRepository $maps */
			$maps = RepositoryFactory::get('map');
			$map = $maps->findById($mapId);
			if (!$map) {
				return null;
			}
			$title = isset($map->title) && is_string($map->title) && trim($map->title) !== ''
				? trim($map->title)
				: ('Map #' . $mapId);
			return array('mapId' => $mapId, 'title' => $title);
		} catch (\Throwable $error) {
			return null;
		}
	}


	private static function normalizeMessages($messages): array
	{
		if (!is_array($messages)) {
			return array();
		}

		$normalized = array();
		foreach ($messages as $msg) {
			if (!is_array($msg)) {
				continue;
			}
			// Browser history is conversation only. Privileged messages and tool
			// receipts are constructed exclusively by this server, never by REST callers.
			$role = $msg['role'] ?? null;
			$content = $msg['content'] ?? null;
			if (!is_string($role) || !in_array($role, array('user', 'assistant'), true)) {
				continue;
			}
			if (!is_string($content) || $content === '') {
				continue;
			}
			$normalized[] = array(
				'role' => $role,
				'content' => $content,
			);
		}
		return $normalized;
	}


	private static function beginSse(): void
	{
		while (ob_get_level() > 0) {
			ob_end_flush();
		}
		// phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		@ini_set('zlib.output_compression', '0');
		if (function_exists('apache_setenv')) {
			// phpcs:ignore
			@apache_setenv('no-gzip', '1');
		}
		ignore_user_abort(true);
		if (function_exists('set_time_limit')) {
			set_time_limit(0);
		}

		if (!headers_sent()) {
			status_header(200);
			header('Content-Type: text/event-stream; charset=utf-8');
			header('Cache-Control: no-cache, no-transform');
			header('Connection: keep-alive');
			header('X-Accel-Buffering: no');
		}

		echo ':' . str_repeat(' ', 2048) . "\n\n";
		flush();
	}

	/**
	 * @param array<string, mixed> $payload
	 */
	private static function sseEmit(array $payload): void
	{
		echo 'data: ' . wp_json_encode($payload) . "\n\n";
		flush();
	}

}
