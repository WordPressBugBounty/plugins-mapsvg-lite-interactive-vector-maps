<?php
namespace MapSVG;
require_once __DIR__.'/AiMapCreationRequirements.php';

/** Local allowlisted capabilities, permissions and one-command receipts. No agent policy. */
final class AiExecutor
{
    public static function capabilities(): array
    {
        return ['get_map_summary', 'get_map_options', 'apply_map_options_patch', 'create_map', 'duplicate_map', 'delete_map', 'inspect_csv', 'provision_map_from_csv', 'provision_collection_from_csv', 'inspect_image_map', 'create_image_map', 'replace_map_region_outline', 'detect_map_regions', 'apply_map_regions', 'manage_assets', 'manage_map', 'manage_options', 'manage_draft', 'manage_schema', 'get_wordpress_source', 'manage_repository', 'manage_repository_batch', 'manage_query', 'manage_connection', 'manage_global_settings'];
    }
    public static function readOnly(string $name,array $args): bool
    {
        if(in_array($name,['get_map_summary','get_map_options','inspect_image_map','inspect_csv','get_wordpress_source','detect_map_regions'],true))return true;
        $actions=['manage_map'=>['get','list','list_sources','defaults'],'manage_options'=>['get'],'manage_schema'=>['get','list'],'manage_repository'=>['get','query','search_posts'],'manage_query'=>['get','list','execute','execute_page','list_folders','get_folder'],'manage_assets'=>['list','roots'],'manage_connection'=>['list_maps'],'manage_global_settings'=>['get'],'manage_draft'=>['status']];
        return in_array($args['action']??'', $actions[$name]??[],true);
    }
    public static function execute(array $command,string $turnId,int $chatId,int $mapId,?array $preview,?array $draft,bool $readOnly=false,?callable $progress=null): array
    {
        if(!is_user_logged_in()||!current_user_can('edit_posts'))throw new \RuntimeException('You cannot use this executor.',403);
        $chat=AiChatsRepository::findOwned($chatId,get_current_user_id(),1);
        if(!$chat||((int)($chat['mapId']??0)>0&&(int)$chat['mapId']!==$mapId))throw new \RuntimeException('The chat or App ownership changed.',409);
        if(($command['mapId']??null)!==$mapId||!is_string($command['id']??null)||!preg_match('/\A[a-f0-9-]{36}\z/D',$command['id'])||!in_array($command['name']??'',self::capabilities(),true)||!is_string($command['argumentsJson']??null))throw new \RuntimeException('Invalid or unsupported executor command.',409);
        if($mapId>0&&!AppDraftController::canEdit($mapId))throw new \RuntimeException('You cannot edit this App.',403);
        $name=$command['name'];$args=AiChatController::decodeToolArguments($command['argumentsJson']);
        if(!(json_decode($command['argumentsJson']) instanceof \stdClass))throw new \RuntimeException('Tool arguments must be an object.');
        if($readOnly&&!self::readOnly($name,$args))return ['ok'=>false,'error'=>'This request is read-only.'];
        if(in_array($name,['create_map','create_image_map'],true)||($name==='manage_map'&&($args['action']??'')==='create')){
            $requirements=AiMapCreationRequirements::normalize($command['requirements']??[]);
            $missing=AiMapCreationRequirements::missing($requirements,is_array($args['options']??null)?$args['options']:[]);
            if($missing)return ['ok'=>false,'error'=>'Initial Map configuration is incomplete: '.implode('; ',$missing)];
        }
        $key='mapsvg_ai_cmd_'.hash('sha256',get_current_user_id().'|'.$chatId.'|'.$turnId.'|'.$command['id']);
        $hash=hash('sha256',wp_json_encode([$mapId,$name,$command['argumentsJson'],$command['requirements']??null]));
        $prior=AiExecutionStore::read($key);
        if(is_array($prior)){
            if(!hash_equals($prior['hash'],$hash))throw new \RuntimeException('Conflicting executor command replay.');
            if(($prior['status']??'')!=='complete')throw new \RuntimeException('This command has an uncertain outcome. Inspect saved data before starting a new operation.');
            return $prior['result'];
        }
        // WordPress option uniqueness is the atomic claim; set_transient alone is not a lock.
        if(!AiExecutionStore::claim($key,['hash'=>$hash,'status'=>'running'],86400))throw new \RuntimeException('This command is already running.');
        try{$result=AiTools::execute($name,$args,$mapId,$preview,$preview!==null,$draft,$progress);}
        catch(\Throwable $error){$result=['ok'=>false,'error'=>$error->getMessage()];}
        if(!AiExecutionStore::put($key,['hash'=>$hash,'status'=>'running'],['hash'=>$hash,'status'=>'complete','result'=>$result],86400))throw new \RuntimeException('The command result could not be retained. Do not repeat the operation without inspecting saved data.');
        return $result;
    }
}
