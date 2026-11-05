<?php
namespace MapSVG;
require_once __DIR__ . '/AiRasterSvg.php';

/** Owner-bound proposals; native browser draft operations own every persistent SVG write. */
final class AiMapRegions
{
    private const TTL = 3600;
    private const PREFIX = 'mapsvg_ai_regions_';



    private static function draft(int $mapId, int $draftId): array
    {
        if (!AppDraftController::canEdit($mapId)) throw new \RuntimeException('You cannot edit this App.', 403);
        return (new AppDraftStore())->get($mapId, $draftId);
    }

    private static function source(array $draft): array
    {
        $source = $draft['snapshot']['options']['source'] ?? '';
        [$file] = SVGFileController::readMapSource($source);
        $svg = file_get_contents($file->serverPath, false, null, 0, 8 * 1024 * 1024 + 1);
        if (!is_string($svg) || strlen($svg) > 8 * 1024 * 1024) throw new \RuntimeException('Cannot read this draft SVG.');
        return ['source' => $source, 'svg' => $svg];
    }

    private static function retain(array $analysis): void
    {
        $indexKey = self::PREFIX . 'owner_' . get_current_user_id();
        $index = get_transient($indexKey); $index = is_array($index) ? $index : [];
        $index = array_values(array_diff($index, [$analysis['id']])); $index[] = $analysis['id'];
        while (count($index) > 5) delete_transient(self::PREFIX . array_shift($index));
        set_transient($indexKey, $index, self::TTL);
        if (!set_transient(self::PREFIX . $analysis['id'], $analysis, self::TTL)) throw new \RuntimeException('Could not retain the region proposal.');
    }

    private static function read(string $id, int $mapId = 0, int $draftId = 0): array
    {
        // Save/acknowledgement runs in another HTTP request while chat is still
        // streaming. Drop this request's cached option/transient before polling.
        if (preg_match('/\A[a-f0-9]{32}\z/D', $id)) {
            wp_cache_delete(self::PREFIX . $id, 'transient');
            wp_cache_delete('_transient_' . self::PREFIX . $id, 'options');
        }
        $analysis = preg_match('/\A[a-f0-9]{32}\z/D', $id) ? get_transient(self::PREFIX . $id) : false;
        if (!is_array($analysis) || $analysis['owner'] !== get_current_user_id() || $analysis['expiresAt'] <= time()
            || ($mapId && $mapId !== $analysis['mapId']) || ($draftId && $draftId !== $analysis['draftId'])) throw new \InvalidArgumentException('Region proposal is unavailable, expired or belongs to another App/draft/user.');
        $draft = self::draft($analysis['mapId'], $analysis['draftId']);
        if ($analysis['status'] === 'applied') {
            try {
                $actual = self::compose(self::source(self::current($analysis))['svg'], $analysis);
                $sync = ($analysis['operation']??'add')==='replace' ? ['additions'=>[]] : (new AppRegionSync())->preview($draft, $analysis['pageId'], $analysis['stateId']);
                if (!$actual['alreadyApplied'] || array_intersect(array_column($sync['additions'], 'id'), $actual['regionIds'])) throw new \RuntimeException('Saved zones or Region records changed.');
            } catch (\Throwable $error) {
                $analysis['status'] = 'stale'; $analysis['message'] = 'The SVG or Regions binding/records changed after application. Inspect the current draft and detect again.';
                self::retain($analysis);
            }
        }
        return $analysis;
    }

    private static function dto(array $analysis): array
    {
        foreach($analysis['candidates'] as &$candidate) {
            if(isset($candidate['points']))$candidate['approximateSelectable']=AiRasterSvg::approximateAllowed($candidate,$analysis['candidates']);
            if(isset($analysis['candidateIds']))$candidate['selected']=in_array($candidate['id'],$analysis['candidateIds'],true);
            if(isset($analysis['labels'][$candidate['id']]))$candidate['label']=$analysis['labels'][$candidate['id']];
        }unset($candidate);
        return array_intersect_key($analysis, array_flip(['id', 'mapId', 'draftId', 'status', 'operation', 'regionId', 'excludeRegionIds', 'labelPolicyVersion', 'geometryPolicyVersion', 'instruction', 'selectionMode', 'targetLabels', 'focusRegions', 'width', 'height', 'candidates', 'warnings', 'regionIds', 'message', 'expiresAt']));
    }

    public static function detect(array $args, int $mapId, ?array $state, ?callable $progress = null): array
    {
        if (!$state || $state['mapId'] !== $mapId || empty($state['draftId'])) throw new \InvalidArgumentException('Open a named draft with an embedded raster SVG first.');
        $targets = AiRasterSvg::targets($args['targetLabels'] ?? []);
        $instruction = $args['instruction'] ?? '';
        if (!is_string($instruction) || strlen($instruction)>4000 || (function_exists('mb_strlen')?mb_strlen($instruction):strlen($instruction))>1000) throw new \InvalidArgumentException('Use a short region description.');
        $instruction=trim($instruction); $selection=$args['selection'] ?? ($instruction!==''?'all':'numbered');
        if (!in_array($selection,['all','numbered'],true)) throw new \InvalidArgumentException('Select all described areas or numbered labels.');
        if (!empty($args['analysisId'])) {
            if (array_key_exists('targetLabels', $args) || array_key_exists('instruction',$args) || array_key_exists('selection',$args) || array_key_exists('refineAnalysisId',$args) || array_key_exists('regionId',$args) || array_key_exists('excludeRegionIds',$args)) throw new \InvalidArgumentException('To prepare a different selection, omit analysisId and provide targetLabels. Existing proposal selections are immutable.');
            $analysis = self::read($args['analysisId'], $mapId, $state['draftId']);
            // Browser Save normally finishes before the next model round. Keep a
            // bounded wait for that same action, never a second provider invocation.
            for ($n = 0; $analysis['status'] === 'queued' && $n < 15; $n++) { usleep(200000); $analysis = self::read($args['analysisId'], $mapId, $state['draftId']); }
            return ['ok' => true, 'result' => self::dto($analysis)];
        }
        $draft = self::draft($mapId, $state['draftId']); $source = self::source($draft); $image = AiRasterSvg::inspect($source['svg']);
        $excludeIds=$args['excludeRegionIds']??[];if(!is_array($excludeIds)||count($excludeIds)>12||array_filter($excludeIds,static function($id){return !is_string($id);})||count(array_unique($excludeIds))!==count($excludeIds)||($excludeIds&&!isset($args['regionId'])))throw new \InvalidArgumentException('Neighbor exclusions require a Region-ID replacement.');
        $focus=[]; $refinement=$args['refineAnalysisId'] ?? ''; $replacement=null;
        if(array_key_exists('regionId',$args)) {
            if(!is_string($args['regionId'])||$instruction===''||array_key_exists('targetLabels',$args)||array_key_exists('refineAnalysisId',$args))throw new \InvalidArgumentException('For one contour correction use regionId and instruction only, without targetLabels/refineAnalysisId.');
            $replacement=AiRasterSvg::replacementTarget($source['svg'],$args['regionId']);
            if(in_array($args['regionId'],$excludeIds,true))throw new \InvalidArgumentException('Do not exclude the target Region itself.');
            if($excludeIds)$replacement['excludeRegionIds']=$excludeIds;
            $targets=AiRasterSvg::targets([$replacement['label']]);$focus=[$replacement['focus']];$selection='all';
            $refinement='replace:'.hash('sha256',json_encode($replacement));
        }
        // A focused natural-language request can reuse the owned last proposal's
        // locations even when the agent omits the explicit refinement ID.
        $referenceKey=self::PREFIX.'last_'.get_current_user_id().'_'.$mapId.'_'.$state['draftId'];
        $referenceId=get_transient($referenceKey);$reference=null;
        if(is_string($referenceId)){try{$reference=self::read($referenceId,$mapId,$state['draftId']);}catch(\Throwable $e){}}
        if(!$replacement&&$refinement===''&&$instruction!==''&&$targets&&count($targets)<=12&&$reference&&($reference['operation']??'add')==='add'&&$reference['status']!=='queued'&&hash_equals($reference['imageHash'],$image['imageHash'])) {
            $valid=($reference['status']==='applied'||hash_equals($reference['sourceHash'],hash('sha256',$source['svg'])));
            if($valid&&($reference['geometryPolicyVersion']??0)===2&&($reference['instruction']??'')===$instruction&&($reference['targetLabels']??[])===$targets&&($reference['selectionMode']??'numbered')===$selection)
                return ['ok'=>true,'result'=>self::dto($reference),'svg_regions_preview'=>['analysisId'=>$reference['id'],'mapId'=>$mapId,'draftId'=>$state['draftId']]];
            $matches=true;
            foreach($targets as $target)if(count(array_filter($reference['candidates'],static function($c)use($target){return AiRasterSvg::targetKey($c['label']??'')===$target;}))!==1)$matches=false;
            if($matches)$refinement=$reference['id'];
        }
        if(!$replacement&&empty($args['refineAnalysisId'])&&$instruction!==''&&$targets&&count($targets)<=12) {
            $savedFocus=AiRasterSvg::sourceFocus($source['svg'],$targets);
            if($savedFocus){$focus=$savedFocus;$refinement='source:'.hash('sha256',json_encode($focus));}
        }
        if($refinement!==''&&!$focus) {
            if(!is_string($refinement)||!$targets||count($targets)>12) throw new \InvalidArgumentException('Refine an owned proposal with 1–12 actual target labels.');
            try{$prior=self::read($refinement,$mapId,$state['draftId']);}
            catch(\Throwable $error){throw new \InvalidArgumentException('The refinement proposal is unavailable/expired. To refine already saved regions in THIS draft, omit both analysisId and refineAnalysisId and use the same instruction plus targetLabels; crop references will come from its actual saved SVG, without rediscovering the whole image.');}
            if($prior['status']==='queued'||!hash_equals($prior['imageHash'],$image['imageHash'])) throw new \RuntimeException('Wait for pending application or analyze the changed image again.');
            if($instruction==='')$instruction=$prior['instruction'] ?? '';
            if($instruction==='')throw new \InvalidArgumentException('Refinement requires the semantic region description.');
            foreach($targets as $target) {
                $matches=array_values(array_filter($prior['candidates'],static function($c)use($target){return AiRasterSvg::targetKey($c['label']??'')===$target;}));
                if(count($matches)!==1)throw new \InvalidArgumentException('Each refinement label must identify one retained candidate.');
                $c=$matches[0];$focus[]=['label'=>$c['label'],'x'=>$c['x'],'y'=>$c['y'],'width'=>$c['width'],'height'=>$c['height']];
            }
        }
        $cacheKey = self::PREFIX . 'last_' . get_current_user_id() . '_' . $mapId . '_' . $state['draftId'];
        $last = get_transient($cacheKey); $found = null;
        if (is_string($last)) {
            try { $cached = self::read($last, $mapId, $state['draftId']); }
            catch (\Throwable $error) { $cached = null; }
            if ($cached && $cached['status'] === 'queued') return ['ok'=>true,'result'=>self::dto($cached),
                'message'=>'An existing SVG application is pending. Finish/poll this retained analysisId before starting another selection; reapply the same ID to recover a lost browser delivery.',
                'svg_regions_preview'=>['analysisId'=>$cached['id'],'mapId'=>$mapId,'draftId'=>$state['draftId']]];
            if ($replacement && $cached && $cached['status']==='applied' && ($cached['operation']??'add')==='replace'
                && ($cached['regionId']??'')===$replacement['regionId'] && ($cached['replacement']['excludeRegionIds']??[])===$excludeIds && ($cached['instruction']??'')===$instruction)
                return ['ok'=>true,'result'=>self::dto($cached)];
            if ($cached && ($cached['operation']??'add')===($replacement?'replace':'add') && ($cached['regionId']??'')===($replacement['regionId']??'') && ($cached['labelPolicyVersion'] ?? 1) >= 2
                && ($cached['instruction'] ?? '') === $instruction
                && ($cached['refinement'] ?? '') === $refinement
                && ($instruction==='' || ($cached['geometryPolicyVersion'] ?? 0) === 2)
                && hash_equals($cached['imageHash'], $image['imageHash'])
                && ($cached['status'] === 'applied' || hash_equals($cached['sourceHash'], hash('sha256', $source['svg'])))) {
                if (($cached['targetLabels'] ?? []) === $targets && ($cached['selectionMode'] ?? 'numbered') === $selection && in_array($cached['status'], ['detected','applied'], true)) {
                    return ['ok' => true, 'result' => self::dto($cached), 'svg_regions_preview' => ['analysisId' => $last, 'mapId' => $mapId, 'draftId' => $state['draftId']]];
                }
                $found = ['labelPolicyVersion'=>$cached['labelPolicyVersion'], 'geometryPolicyVersion'=>$cached['geometryPolicyVersion'] ?? null, 'width'=>$cached['width'], 'height'=>$cached['height'], 'candidates'=>$cached['candidates'], 'warnings'=>$cached['recognitionWarnings'] ?? []];
            }
        }
        if ($found === null) {
            $recognitionImage=$image['imageData'];$recognitionInstruction=$instruction;
            if($excludeIds){
                $protected=AiRasterSvg::recognitionExclusions($source['svg'],$excludeIds);$recognitionImage=$protected['image'];

            }
            $reply = OpenAiCompatibleClient::fromActiveConfig()->mapRegions(array_merge(array_merge(['image'=>$recognitionImage],$excludeIds?['protectedLabels'=>$protected['labels']]:[]), $instruction!==''?array_merge(['instruction'=>$recognitionInstruction,'selection'=>$selection],$focus?['focus'=>$focus]:[]):[]), $progress);
            if (empty($reply['ok'])) throw new \RuntimeException($reply['error'] ?? 'Region recognition failed.');
            $found = $reply['data'];
        }
        if (($found['labelPolicyVersion'] ?? 0) < 2 || ($instruction!=='' && ($found['geometryPolicyVersion'] ?? 0)!==2)) throw new \RuntimeException('Update the managed recognition service to support named areas and semantic outlines.');
        if (($found['width'] ?? null) !== $image['width'] || ($found['height'] ?? null) !== $image['height'] || !is_array($found['candidates'] ?? null) || count($found['candidates']) > 200) throw new \RuntimeException('Recognition geometry does not match the actual background.');
        $candidates = AiRasterSvg::selectCandidates($found['candidates'], $targets, $selection);
        $warnings = $found['warnings'] ?? [];
        foreach ($targets as $target) {
            $matched = array_filter($candidates, static function ($candidate) use ($target) { return !empty($candidate['selected']) && AiRasterSvg::targetKey($candidate['label']) === $target; });
            if (!$matched) $warnings[] = 'No unique confident candidate matched target label: ' . $target . '. Review labels; do not invent geometry.';
        }
        $analysis = ['id' => bin2hex(random_bytes(16)), 'owner' => get_current_user_id(), 'mapId' => $mapId, 'draftId' => $state['draftId'],
            'status' => 'detected', 'operation'=>$replacement?'replace':'add', 'regionId'=>$replacement['regionId']??null, 'excludeRegionIds'=>$excludeIds, 'replacement'=>$replacement, 'sourceHash' => hash('sha256', $source['svg']), 'imageHash' => $image['imageHash'], 'imageData' => $image['imageData'],
            'regionPrefix' => (string) ($draft['snapshot']['options']['regionPrefix'] ?? ''), 'width' => $image['width'], 'height' => $image['height'],
            'labelPolicyVersion'=>$found['labelPolicyVersion'], 'geometryPolicyVersion'=>$found['geometryPolicyVersion'] ?? null, 'instruction'=>$instruction, 'refinement'=>$refinement, 'focusRegions'=>$focus, 'selectionMode'=>$selection, 'targetLabels' => $targets, 'candidates' => $candidates, 'recognitionWarnings' => $found['warnings'] ?? [], 'warnings' => $warnings, 'expiresAt' => time() + self::TTL];
        self::retain($analysis); set_transient($cacheKey, $analysis['id'], self::TTL);
        return ['ok' => true, 'result' => self::dto($analysis), 'svg_regions_preview' => ['analysisId' => $analysis['id'], 'mapId' => $mapId, 'draftId' => $state['draftId']]];
    }

    private static function current(array $analysis): array
    {
        $draft = self::draft($analysis['mapId'], $analysis['draftId']);
        if ((string) ($draft['snapshot']['options']['regionPrefix'] ?? '') !== $analysis['regionPrefix']) throw new \RuntimeException('The Region ID prefix changed. Detect regions again.');
        return $draft;
    }

    private static function compose(string $svg, array $analysis): array
    {
        return ($analysis['operation']??'add')==='replace'
            ? AiRasterSvg::replaceOutline($svg,$analysis,$analysis['candidateIds'][0])
            : AiRasterSvg::compose($svg,$analysis,$analysis['candidateIds'],$analysis['labels'],!empty($analysis['allowApproximate']));
    }

    public static function replace(array $args, int $mapId, ?array $state): array
    {
        if(!is_string($args['regionId']??null))throw new \InvalidArgumentException('Use the exact existing Region ID.');
        $analysis=self::read((string)($args['analysisId']??''),$mapId,$state['draftId']??0);
        if(($analysis['operation']??'add')!=='replace'||$args['regionId']!==$analysis['regionId'])throw new \InvalidArgumentException('Prepare a replacement proposal for this exact Region ID first.');
        if(isset($args['candidateId']))$args['candidateIds']=[$args['candidateId']];
        return self::apply($args,$mapId,$state,true);
    }

    public static function apply(array $args, int $mapId, ?array $state, bool $replacement = false): array
    {
        if (!$state || $state['mapId'] !== $mapId || empty($state['ready']) || !empty($state['conflicted']) || !empty($state['offline']) || !empty($state['busy']) || !empty($state['transitioning'])) throw new \RuntimeException('Keep the same ready online draft open and resolve its conflict before applying SVG zones.');
        if (!is_string($args['analysisId'] ?? null)) throw new \InvalidArgumentException('Use the retained analysis ID.');
        $analysis = self::read($args['analysisId'], $mapId, $state['draftId']);
        if((($analysis['operation']??'add')==='replace')!==$replacement)throw new \InvalidArgumentException('Use replace_map_region_outline for a correction and apply_map_regions only for adding regions.');
        if (in_array($analysis['status'], ['failed', 'stale'], true)) throw new \RuntimeException('Inspect the current draft and detect again before retrying an incomplete application.');
        $ids = $args['candidateIds'] ?? ($analysis['candidateIds'] ?? array_column(array_filter($analysis['candidates'], static function ($c) { return !empty($c['selected']); }), 'id'));
        $labels = $args['labels'] ?? ($analysis['labels'] ?? []);
        $allowApproximate=$args['allowApproximate'] ?? ($analysis['allowApproximate'] ?? false);
        if(!is_bool($allowApproximate))throw new \InvalidArgumentException('allowApproximate must be boolean.');
        if (!is_array($ids) || !is_array($labels) || count($labels) > 200 || array_filter($ids, static function ($id) { return !is_string($id); }) || array_filter($labels, static function ($label) { return !is_string($label); }) || array_diff(array_keys($labels), $ids)) throw new \InvalidArgumentException('Corrections must refer to selected candidates.');
        $source = self::source(self::current($analysis));
        if($replacement&&(count($ids)!==1||$labels||$allowApproximate))throw new \InvalidArgumentException('Replace exactly one recognized outline without changing labels.');
        $prepared=$analysis;$prepared['candidateIds']=$ids;$prepared['labels']=$labels;$prepared['allowApproximate']=$allowApproximate;
        $composed = self::compose($source['svg'], $prepared);
        $selection = hash('sha256', json_encode($replacement?['replace',$analysis['regionId'],$ids]:($allowApproximate?[$ids,$labels,true]:[$ids,$labels])));
        if (isset($analysis['selection']) && !hash_equals($analysis['selection'], $selection)) throw new \InvalidArgumentException('This proposal already has a different applied/queued selection. Call detect_map_regions without analysisId and with targetLabels to prepare a separate selection.');
        if ($analysis['status'] === 'applied') return ['ok' => true, 'result' => ['analysisId' => $analysis['id'], 'status' => 'applied', 'regionIds' => $analysis['regionIds']]];
        if ($analysis['status'] === 'queued') return ['ok' => true, 'result' => ['analysisId' => $analysis['id'], 'status' => 'queued', 'completed' => false, 'regionIds' => $analysis['regionIds']],
            'svg_regions_apply_request' => ['analysisId'=>$analysis['id'],'mapId'=>$mapId,'draftId'=>$analysis['draftId']]];
        $analysis['allowApproximate']=$allowApproximate; $analysis['selection'] = $selection; $analysis['candidateIds'] = $ids; $analysis['labels'] = $labels; $analysis['regionIds'] = $composed['regionIds']; $analysis['status'] = 'queued'; self::retain($analysis);
        return ['ok' => true, 'result' => ['analysisId' => $analysis['id'], 'status' => 'queued', 'completed' => false, 'regionIds' => $analysis['regionIds']],
            'svg_regions_apply_request' => ['analysisId' => $analysis['id'], 'mapId' => $mapId, 'draftId' => $analysis['draftId']]];
    }

    public static function allowed($request): bool { return AppDraftController::canEdit((int) $request['mapId']); }

    /** Private browser bridge: retrieve preview, prepare exact XML, acknowledge actual saved state. */
    public static function endpoint($request)
    {
        try {
            $analysis = self::read((string) $request['analysisId'], (int) $request['mapId']);
            $params = $request->get_json_params() ?: []; $action = $params['action'] ?? 'get';
            if ($action === 'get') return new \WP_REST_Response(array_merge(self::dto($analysis), ['imageData' => $analysis['imageData']]), 200);
            if (!in_array($action, ['prepare', 'complete', 'failed'], true) || $analysis['status'] !== 'queued') throw new \InvalidArgumentException('No matching queued SVG operation.');
            if ($action === 'failed') {
                $analysis['status'] = 'failed'; $analysis['message'] = 'The browser could not finish SVG application. Inspect the retained draft before retrying.';
                self::retain($analysis); return new \WP_REST_Response(self::dto($analysis), 200);
            }
            $source = self::source(self::current($analysis));
            $result = self::compose($source['svg'], $analysis);
            if ($action === 'prepare') return new \WP_REST_Response(array_merge($result, ['source' => $source['source'], 'draftId' => $analysis['draftId']]), 200);
            if ($action === 'complete') {
                if (!$result['alreadyApplied']) throw new \RuntimeException('The SVG zones have not been saved.');
                $draft = self::draft($analysis['mapId'], $analysis['draftId']);
                $sync = ($analysis['operation']??'add')==='replace' ? ['additions'=>[]] : (new AppRegionSync())->preview($draft, (string) ($params['pageId'] ?? ''), (string) ($params['stateId'] ?? ''));
                if (array_intersect(array_column($sync['additions'], 'id'), $result['regionIds'])) throw new \RuntimeException('SVG saved, but its Region records have not been synchronized.');
                $analysis['pageId'] = (string) $params['pageId']; $analysis['stateId'] = (string) $params['stateId'];
                $analysis['status'] = 'applied'; $analysis['message'] = ($analysis['operation']??'add')==='replace' ? 'Region outline saved in the selected draft; ID, attributes and records preserved; not published.' : 'SVG and Region records saved in the selected draft; not published.';
            } else { $analysis['status'] = 'failed'; $analysis['message'] = 'The browser could not finish SVG application. Inspect the retained draft before retrying.'; }
            self::retain($analysis); return new \WP_REST_Response(self::dto($analysis), 200);
        } catch (\Throwable $error) { return new \WP_Error('mapsvg_ai_regions', $error->getMessage(), ['status' => $error->getCode() === 403 ? 403 : 409]); }
    }
}
