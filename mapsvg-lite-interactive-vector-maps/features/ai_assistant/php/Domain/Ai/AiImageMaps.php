<?php
namespace MapSVG;

require_once __DIR__ . '/AiRasterSvg.php';

/** Prepare a new image source before native Map creation, never edit an existing App. */
final class AiImageMaps
{


    private static function read(string $source): array
    {
        if (!current_user_can('edit_posts')) throw new \RuntimeException('You cannot create maps.',403);
        $parts = parse_url($source);
        if (is_array($parts) && (isset($parts['host']) || isset($parts['scheme']))) {
            $origin = static function(array $url): string { return strtolower(($url['scheme'] ?? '').'://'.($url['host'] ?? '')).':'.($url['port'] ?? (($url['scheme'] ?? '')==='https'?443:80)); };
            $origins = array_map(static function($url) use ($origin) { return $origin((array)parse_url($url)); },[home_url('/'),site_url('/'),MAPSVG_UPLOADS_URL,MAPSVG_MAPS_URL]);
            if (isset($parts['user']) || isset($parts['pass']) || isset($parts['query']) || isset($parts['fragment']) || !in_array($origin($parts),$origins,true)) throw new \InvalidArgumentException('Choose an existing local MapSVG attachment, not an external URL.');
            $source = $parts['path'] ?? '';
        }
        $catalog = new MapAssetCatalog();
        if (strtolower(pathinfo((string)parse_url($source, PHP_URL_PATH), PATHINFO_EXTENSION)) === 'svg') {
            $file = $catalog->readSvg($source);
            if (strlen($file['body']) > 8*1024*1024) throw new \InvalidArgumentException('Use an SVG up to 8 MB.');
            $svg = SVGFile::sanitize($file['body']);
        } else {
            $file = $catalog->readImage($source);
            if (strlen($file['body']) > 6000000 || $file['dimensions']['width']*$file['dimensions']['height'] > 16000000) throw new \InvalidArgumentException('Use an image up to 6 MB and 16 megapixels.');
            $svg = ImageFileService::wrapper($file['body'],$file['dimensions']);
        }
        return ['name'=>$file['name'],'svg'=>$svg,'source'=>$source];
    }

    public static function inspect(array $args): array
    {
        $source = (string)($args['source'] ?? '');
        $file = self::read($source);
        $image = null;
        try { $raster = AiRasterSvg::inspect($file['svg']); $image = ['width'=>$raster['width'],'height'=>$raster['height']]; }
        catch (\InvalidArgumentException $error) { /* Valid vector SVGs can be created without raster recognition. */ }
        return ['ok'=>true,'result'=>['source'=>$file['source'],'name'=>$file['name'],'raster'=>$image,
            'canRecognizeRegions'=>$image!==null,'bytes'=>strlen($file['svg']),
            'instructions'=>$image ? 'Use create_image_map with regionsInstruction to create the requested native clickable areas together with the new Map.' : 'This SVG can be created as-is; semantic recognition requires exactly one embedded supported raster image.']];
    }

    /** No file/Map writes until recognition and bounded native geometry validation pass. */
    public static function prepare(array $args, ?callable $progress = null): array
    {
        $file = self::read((string)($args['source'] ?? ''));
        $instruction = $args['regionsInstruction'] ?? '';
        if (!is_string($instruction) || strlen($instruction)>4000 || (function_exists('mb_strlen')?mb_strlen($instruction):strlen($instruction))>1000) throw new \InvalidArgumentException('Use a short description of the requested areas.');
        $instruction = trim($instruction);
        $ids = []; $omitted = []; $warnings = [];
        if ($instruction !== '') {
            $image = AiRasterSvg::inspect($file['svg']);
            $key = 'mapsvg_ai_image_' . get_current_user_id() . '_' . hash('sha256','labels-v2|'.$image['imageHash'].'|'.$instruction);
            $found = get_transient($key);
            if (!is_array($found)) {
                $reply = OpenAiCompatibleClient::fromActiveConfig()->mapRegions(['image'=>$image['imageData'],'instruction'=>$instruction,'selection'=>'all'],$progress);
                if (empty($reply['ok'])) throw new \RuntimeException($reply['error'] ?? 'Region recognition failed. No Map was created.');
                $found = $reply['data'];
                if (($found['geometryPolicyVersion'] ?? 0)!==2 || ($found['labelPolicyVersion'] ?? 0)<3 || ($found['width'] ?? null)!==$image['width'] || ($found['height'] ?? null)!==$image['height'] || !is_array($found['candidates'] ?? null) || count($found['candidates'])>100) throw new \RuntimeException('Recognition does not match the actual image. No Map was created.');
                set_transient($key,$found,3600);
            }
            $candidates = AiRasterSvg::selectCandidates($found['candidates'],[],'all');
            $selected = array_values(array_filter($candidates,static function($c){return !empty($c['selected']);}));
            if (!$selected) throw new \RuntimeException('No requested area has a reliable outline. No Map was created; clarify the areas or use a clearer source.');
            $omitted = array_values(array_filter(array_map(static function($c){return empty($c['selected'])?($c['label']??'Unnamed area'):null;},$candidates)));
            if ($omitted) throw new \RuntimeException('Recognition left '.count($omitted).' requested areas without a reliable unique name/outline. No Map was created. Do not create a bare or partial fallback; clarify the areas or use a clearer source.');
            $analysis = ['id'=>bin2hex(random_bytes(16)),'imageHash'=>$image['imageHash'],'sourceHash'=>hash('sha256',$file['svg']),
                'regionPrefix'=>(string)($args['options']['regionPrefix'] ?? ''),'candidates'=>$candidates];
            $composed = AiRasterSvg::compose($file['svg'],$analysis,array_column($selected,'id'));
            $file['svg'] = $composed['svg']; $ids = $composed['regionIds']; $warnings = $found['warnings'] ?? [];
        }
        return $file + ['regionIds'=>$ids,'omittedAreas'=>$omitted,'warnings'=>$warnings];
    }
}
