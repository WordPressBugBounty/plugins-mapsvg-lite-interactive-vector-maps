<?php
namespace MapSVG;

/** Versioned Dashboard transport only. No prompts, provider messages or model loop. */
final class AiAgentClient
{
    public const PROTOCOL = ['major'=>1,'minor'=>2,'executor'=>1];
    /** Generated TS settings contract advertised independently of plugin releases. */
    public const OPTIONS_SCHEMA_VERSION = 2;
    /** Server-owned client facts; reused unchanged for the entire turn. */
    public static function clientManifest(): array
    {
        return ['protocol'=>self::PROTOCOL, 'client'=>[
            'pluginVersion'=>(string)MAPSVG_VERSION,
            'optionsSchemaVersion'=>self::OPTIONS_SCHEMA_VERSION,
            'tools'=>AiExecutor::capabilities(), 'features'=>['chat-titles'],
        ]];
    }
    private array $config;
    public function __construct(array $config) {$this->config=$config;}
    public function requestHeaders(): array
    {
        $transport=AiProviderConfig::requestTransport($this->config['baseUrl'].'/agent',$this->config['apiKey']);
        return $transport['headers']+['Content-Type'=>'application/json','Accept'=>'text/event-stream'];
    }
    /** Fully framed events only; partial JSON is never an executable command. */
    public function step(array $body, callable $onPublic, ?callable $heartbeat=null): array
    {
        if(!function_exists('curl_init'))throw new \RuntimeException('cURL is required for AI chat.');
        $buffer='';$error=null;$next=null;$complete=false;$negotiated=false;$last=microtime(true);$errorBody='';$status=0;
        $event=static function(string $json)use(&$next,&$complete,&$negotiated,$onPublic):void {
            $value=json_decode($json,true,512,JSON_THROW_ON_ERROR);
            if(!is_array($value)||!is_string($value['type']??null))throw new \RuntimeException('Invalid agent event.');
            if($value['type']==='keepalive')return;
            if($value['type']==='protocol'){
                if(($value['protocol']??null)!==self::PROTOCOL)throw new \RuntimeException('Unsupported AI protocol. Update MapSVG before continuing.');
                $negotiated=true;return;
            }
            if(!$negotiated)throw new \RuntimeException('The AI service did not negotiate a compatible protocol.');
            if($value['type']==='checkpoint'){$next=$value;return;}
            if($value['type']==='complete'){$complete=true;return;}
            if(!in_array($value['type'],['status','assessment','text_delta','task_plan','tool_call','tool_result','error','chat_title'],true))throw new \RuntimeException('Unknown agent protocol event.');
            $onPublic($value);
        };
        $url=$this->config['baseUrl'].'/agent';
        $encodedBody=wp_json_encode($body);
        $transport=AiProviderConfig::requestTransport($url,$this->config['apiKey'],$encodedBody);
        $headers=$transport['headers']+['Content-Type'=>'application/json','Accept'=>'text/event-stream'];
        $ch=curl_init($url);
        curl_setopt_array($ch,array_replace([CURLOPT_POST=>true,CURLOPT_FOLLOWLOCATION=>false,CURLOPT_TIMEOUT=>190,CURLOPT_CONNECTTIMEOUT=>30,
            CURLOPT_HTTPHEADER=>array_map(static function($key,$value){return $key.': '.$value;},array_keys($headers),array_values($headers)),
            CURLOPT_POSTFIELDS=>$encodedBody,CURLOPT_NOPROGRESS=>false,
            CURLOPT_XFERINFOFUNCTION=>static function()use($heartbeat,&$last){if($heartbeat&&microtime(true)-$last>=10){$last=microtime(true);$heartbeat();}return 0;},
            CURLOPT_HEADERFUNCTION=>static function($ch,$line)use(&$status){if(preg_match('#^HTTP/\S+\s+(\d+)#',$line,$m))$status=(int)$m[1];return strlen($line);},
            CURLOPT_WRITEFUNCTION=>static function($ch,$chunk)use(&$buffer,&$error,&$errorBody,&$status,$event){
                try{
                    if($status>=400){$errorBody.=$chunk;if(strlen($errorBody)>32000)return 0;return strlen($chunk);}
                    $buffer=str_replace("\r\n","\n",$buffer.$chunk);if(strlen($buffer)>8000000)throw new \RuntimeException('Agent event is too large.');
                    while(($boundary=strpos($buffer,"\n\n"))!==false){$frame=substr($buffer,0,$boundary);$buffer=substr($buffer,$boundary+2);$lines=[];foreach(explode("\n",$frame) as $line)if(strpos($line,'data:')===0)$lines[]=ltrim(substr($line,5));if($lines)$event(implode("\n",$lines));}
                    return strlen($chunk);
                }catch(\Throwable $e){$error=$e;return 0;}
            }],$transport['curlOptions']));
        $ok=curl_exec($ch);$status=(int)curl_getinfo($ch,CURLINFO_HTTP_CODE);curl_close($ch);
        if($error)throw $error;
        if($ok===false||$status<200||$status>=300){$data=json_decode($errorBody,true);throw new \RuntimeException(is_string($data['error']??null)?$data['error']:'AI connection failed. Saved changes are retained; no automatic retry was made.');}
        if(!$negotiated||($next===null&&!$complete)||trim($buffer)!=='')throw new \RuntimeException('AI stream interrupted before its checkpoint. Saved changes are retained.');
        return ['complete'=>$complete,'next'=>$next];
    }
}
