<?php
namespace MapSVG;

/** Raster extraction/geometry only. No paths, provider calls or writes. */
final class AiRasterSvg
{
    /** Creation-time fallbacks only; every explicitly supplied color wins. */
    public static function imageMapOptions(array $options): array
    {
        $colors = $options['colors'] ?? [];
        if (!is_array($colors)) return $options;
        $options['colors'] = array_replace([
            'base' => 'rgba(200, 0, 0, 0.20)',
            // Native hover mode is inferred from a color string, not a separate key.
            'hover' => 'rgba(200, 0, 0, 0.50)',
        ], $colors);
        return $options;
    }

    public static function validLabel($label): bool
    {
        return is_string($label) && preg_match("/\\A[\\p{L}\\p{N}#№][\\p{L}\\p{M}\\p{N}#№ ._'’&()\\/+\\p{Pd}:\\p{Zs}-]{0,63}\\z/uD", $label) === 1;
    }

    public static function labelKey(string $label): string
    {
        if (class_exists('Normalizer')) $label = \Normalizer::normalize($label, \Normalizer::FORM_C) ?: $label;
        return function_exists('mb_strtolower') ? mb_strtolower($label, 'UTF-8') : strtolower($label);
    }

    public static function targetKey(string $label): string
    {
        if (preg_match('/\A(?:LOT[\s#№:]*)?([0-9]+[A-Za-z]?)\z/iD',trim($label),$m)) $label=$m[1];
        return self::labelKey($label);
    }

    public static function targets($labels): array
    {
        if (!is_array($labels) || count($labels) > 20) throw new \InvalidArgumentException('Use up to 20 explicit target labels.');
        $keys = [];
        foreach ($labels as $label) {
            if (!self::validLabel($label)) throw new \InvalidArgumentException('Target labels must be actual short names or numbers from the plan.');
            $keys[] = self::targetKey($label);
        }
        $keys = array_values(array_unique($keys)); sort($keys); return $keys;
    }

    /** Default selection remains numbered-only; names require an explicit target. */
    public static function selectCandidates(array $candidates, array $targets, string $selection = "numbered"): array
    {
        foreach ($candidates as &$candidate) {
            $label = $candidate['label'] ?? null;
            $ready = !empty($candidate['selectable']) && self::validLabel($label);
            $candidate['selected'] = $ready && ($targets ? in_array(self::targetKey($label), $targets, true) : ($selection === 'all' || (($candidate['kind'] ?? '') !== 'named' && preg_match('/\\p{N}/u', $label) === 1)));
        }
        unset($candidate); return $candidates;
    }

    public static function approximateAllowed(array $candidate, array $candidates): bool
    {
        $label=$candidate['label']??null;$confidence=$candidate['confidence']??0;
        if(!isset($candidate['points'])||!self::validLabel($label)||($candidate['geometryConfidence']??0)<.5||$confidence<(($candidate['labelSource']??'visible')==='visible'?.85:.7))return false;
        return count(array_filter($candidates,static function($c)use($label){return self::labelKey($c['label']??'')===self::labelKey($label);}))===1;
    }

    /** Derive crop references from actual saved generated paths, even after proposal expiry. */
    public static function sourceFocus(string $svg, array $targets): array
    {
        $data=self::inspect($svg); $found=[];
        foreach($data['document']->getElementsByTagName('*') as $element) {
            $key=self::targetKey($element->getAttribute('title'));
            if(!in_array($key,$targets,true))continue;
            $focus=self::elementFocus($element,$data);
            if($focus)$found[$key][]=$focus;
        }
        $focus=[];foreach($targets as $target){if(count($found[$target]??[])!==1)return [];$focus[]=$found[$target][0];}return $focus;
    }

    private static function elementOutline(\DOMElement $element, array $data): ?array
    {
        $image=$data['image']; $parent=$element->parentNode; [$sx,$sy,$tx,$ty]=$data['matrix'];
        if($element->getAttribute('data-mapsvg-image')!==$data['imageHash']||!($parent instanceof \DOMElement)||$parent->localName!=='g'||$parent->parentNode!==$image->parentNode||$element->hasAttribute('transform'))return null;
        foreach(['transform','clip-path','mask'] as $attr)if($parent->getAttribute($attr)!==$image->getAttribute($attr))return null;
        $points=[];
        if($element->localName==='path'&&preg_match('/\AM[-+0-9.eE ]+(?: L[-+0-9.eE ]+)+ Z\z/D',$element->getAttribute('d'))){
            preg_match_all('/[ML]([-+0-9.eE]+) ([-+0-9.eE]+)/',$element->getAttribute('d'),$matches,PREG_SET_ORDER);
            foreach($matches as $m)$points[]=['x'=>((float)$m[1]-$tx)/$sx,'y'=>((float)$m[2]-$ty)/$sy];
        }elseif($element->localName==='rect'){
            $x=((float)$element->getAttribute('x')-$tx)/$sx;$y=((float)$element->getAttribute('y')-$ty)/$sy;$w=(float)$element->getAttribute('width')/$sx;$h=(float)$element->getAttribute('height')/$sy;
            $points=[['x'=>$x,'y'=>$y],['x'=>$x+$w,'y'=>$y],['x'=>$x+$w,'y'=>$y+$h],['x'=>$x,'y'=>$y+$h]];
        }
        if(!$points)return null;
        try{$points=self::outline(['points'=>$points]);}catch(\Throwable $error){return null;}
        foreach($points as $p)if($p['x']<0||$p['y']<0||$p['x']>$data['width']+.001||$p['y']>$data['height']+.001)return null;
        return $points;
    }

    private static function elementFocus(\DOMElement $element, array $data): ?array
    {
        $points=self::elementOutline($element,$data);if(!$points)return null;
        $xs=array_column($points,'x');$ys=array_column($points,'y');$x=min($xs);$y=min($ys);$w=max($xs)-$x;$h=max($ys)-$y;
        if($x<0||$y<0||$x+$w>$data['width']+.001||$y+$h>$data['height']+.001)return null;
        return ['label'=>$element->getAttribute('title'),'x'=>$x,'y'=>$y,'width'=>$w,'height'=>$h];
    }

    private const GEOMETRY_ATTRIBUTES = ['d','x','y','width','height','rx','ry','points','cx','cy','r'];

    private static function elementById(\DOMDocument $document, string $id): \DOMElement
    {
        if($id===''||strlen($id)>190||preg_match('/[\x00-\x1f]/',$id))throw new \InvalidArgumentException('Use an actual Region ID.');
        $found=[];foreach($document->getElementsByTagName('*') as $element)if($element->getAttribute('id')===$id)$found[]=$element;
        if(count($found)!==1)throw new \InvalidArgumentException('The Region ID must identify exactly one existing SVG element.');
        return $found[0];
    }

    private static function replacementInvariant(\DOMElement $element): string
    {
        $attributes=[];foreach($element->attributes as $attr)if(!in_array($attr->name,self::GEOMETRY_ATTRIBUTES,true))$attributes[($attr->namespaceURI??'').'|'.$attr->name]=$attr->value;
        ksort($attributes);$children=[];foreach($element->childNodes as $child)$children[]=$element->ownerDocument->saveXML($child);
        return hash('sha256',json_encode([$attributes,$children]));
    }

    private static function outsideHash(\DOMDocument $document, string $regionId): string
    {
        $clone=clone $document; $target=self::elementById($clone,$regionId);$target->parentNode->removeChild($target);
        return hash('sha256',$clone->C14N());
    }

    /** Bind a one-region replacement to the actual source, ID, appearance and surrounding XML. */
    public static function replacementTarget(string $svg, string $regionId): array
    {
        $data=self::inspect($svg);$element=self::elementById($data['document'],$regionId);$focus=self::elementFocus($element,$data);
        if(!$focus||!self::validLabel($focus['label'])||preg_match('/(?:^|;)\s*(?:d|x|y|width|height|rx|ry)\s*:/i',$element->getAttribute('style')))throw new \InvalidArgumentException('Replacement currently supports saved generated raster-region paths/rectangles with native geometry and the same image transforms.');
        $offset=0;for($sibling=$element->previousSibling;$sibling;$sibling=$sibling->previousSibling)$offset++;
        return ['regionId'=>$regionId,'label'=>$focus['label'],'focus'=>$focus,'locationHash'=>hash('sha256',$element->parentNode->getNodePath().'|'.$offset),'nodeHash'=>hash('sha256',$element->C14N()),
            'invariantHash'=>self::replacementInvariant($element),'outsideHash'=>self::outsideHash($data['document'],$regionId)];
    }

    /** Replace geometry only, retaining ID, title, appearance, children, order and every other node. */
    public static function replaceOutline(string $svg, array $analysis, string $candidateId): array
    {
        $target=$analysis['replacement']??null;
        if(!is_array($target)||!is_string($target['regionId']??null))throw new \InvalidArgumentException('Use an immutable replacement proposal for one Region ID.');
        $data=self::inspect($svg);$current=self::replacementTarget($svg,$target['regionId']);
        if(!hash_equals($analysis['imageHash'],$data['imageHash'])||!hash_equals($target['outsideHash'],$current['outsideHash'])||!hash_equals($target['invariantHash'],$current['invariantHash'])||(isset($target['locationHash'])&&!hash_equals($target['locationHash'],$current['locationHash'])))throw new \RuntimeException('The background, other SVG content or Region attributes changed. Prepare a new replacement.');
        $candidate=null;foreach($analysis['candidates'] as $item)if($item['id']===$candidateId)$candidate=$item;
        if(!$candidate||self::targetKey((string)($candidate['label']??''))!==self::targetKey($target['label'])||empty($candidate['selected']))throw new \InvalidArgumentException('Choose the recognized candidate for this exact Region identity.');
        // Reuse all native confidence, bounds and simple-ring validation; this is in-memory only.
        $validation=$analysis;$validation['sourceHash']=hash('sha256',$svg);self::compose($svg,$validation,[$candidateId]);
        [$tag,$geometry]=self::geometry($candidate,$data);$element=self::elementById($data['document'],$target['regionId']);
        $same=$element->localName===$tag;
        foreach($geometry as $name=>$value)if($name==='d'?$element->getAttribute($name)!==$value:(!is_numeric($element->getAttribute($name))||abs((float)$element->getAttribute($name)-$value)>.000001))$same=false;
        if($same)return ['svg'=>$svg,'createdIds'=>[],'replacedIds'=>[],'regionIds'=>[$target['regionId']],'alreadyApplied'=>true,'syncRegions'=>false];
        if(!hash_equals($analysis['sourceHash'],hash('sha256',$svg))||!hash_equals($target['nodeHash'],$current['nodeHash']))throw new \RuntimeException('The source or Region outline changed after recognition. Prepare a new replacement.');
        if($element->localName!==$tag){
            $next=$data['document']->createElementNS('http://www.w3.org/2000/svg',$tag);
            foreach($element->attributes as $attr)if(!in_array($attr->name,self::GEOMETRY_ATTRIBUTES,true)){
                if($attr->namespaceURI)$next->setAttributeNS($attr->namespaceURI,$attr->name,$attr->value);else $next->setAttribute($attr->name,$attr->value);
            }
            foreach($element->childNodes as $child)$next->appendChild($child->cloneNode(true));
            $element->parentNode->replaceChild($next,$element);$element=$next;
        }else foreach(self::GEOMETRY_ATTRIBUTES as $name)$element->removeAttribute($name);
        foreach($geometry as $name=>$value)$element->setAttribute($name,(string)$value);
        $saved=$data['document']->saveXML();$after=self::replacementTarget($saved,$target['regionId']);
        if($after['outsideHash']!==$target['outsideHash']||$after['invariantHash']!==$target['invariantHash']||(isset($target['locationHash'])&&$after['locationHash']!==$target['locationHash']))throw new \RuntimeException('Replacement would change content outside this Region geometry.');
        return ['svg'=>$saved,'createdIds'=>[],'replacedIds'=>[$target['regionId']],'regionIds'=>[$target['regionId']],'alreadyApplied'=>false,'syncRegions'=>false];
    }

    /** Recognition-only masks for exact existing neighbors; saved SVG/background never change. */
    public static function recognitionExclusions(string $svg, array $ids): array
    {
        if(count($ids)>12||array_filter($ids,static function($id){return !is_string($id);})||count(array_unique($ids))!==count($ids))throw new \InvalidArgumentException('Use up to 12 distinct existing neighbor Region IDs.');
        $data=self::inspect($svg);$labels=[];$polygons=[];
        foreach($ids as $id){$element=self::elementById($data['document'],$id);$points=self::elementOutline($element,$data);if(!$points||!self::validLabel($element->getAttribute('title')))throw new \InvalidArgumentException('Protected neighbors must be saved generated raster-region outlines.');$polygons[]=$points;$labels[]=$element->getAttribute('title');}
        if(!$polygons)return ['image'=>$data['imageData'],'labels'=>[]];
        if(!function_exists('imagecreatefromstring'))throw new \RuntimeException('Image decoding is required for neighbor contour references.');
        $frame=imagecreatefromstring(base64_decode(explode(',',$data['imageData'],2)[1]));if(!$frame)throw new \RuntimeException('Cannot decode neighbor reference image.');
        try {
            if(!imageistruecolor($frame))imagepalettetotruecolor($frame);
            $blue=imagecolorallocate($frame,0,80,255);
            foreach($polygons as $points){$flat=[];foreach($points as $p){$flat[]=(int)round($p['x']);$flat[]=(int)round($p['y']);}imagefilledpolygon($frame,$flat,$blue);}
            ob_start();try{imagepng($frame);$bytes=ob_get_contents();}finally{ob_end_clean();}
        }finally{imagedestroy($frame);}
        if(strlen($bytes)>6000000)throw new \RuntimeException('The neighbor reference exceeds the recognition image limit.');
        return ['image'=>'data:image/png;base64,'.base64_encode($bytes),'labels'=>$labels];
    }

    public static function inspect(string $svg): array
    {
        if ($svg === '' || strlen($svg) > 8 * 1024 * 1024 || preg_match('/<!\s*(DOCTYPE|ENTITY)\b/i', $svg)) throw new \InvalidArgumentException('Use an SVG up to 8 MiB without DTD/entities.');
        $doc = new \DOMDocument(); $before = libxml_use_internal_errors(true);
        try { $ok = $doc->loadXML($svg, LIBXML_NONET); } finally { libxml_clear_errors(); libxml_use_internal_errors($before); }
        if (!$ok || !$doc->documentElement || $doc->documentElement->localName !== 'svg') throw new \InvalidArgumentException('Invalid SVG document.');
        $images = (new \DOMXPath($doc))->query('//*[local-name()="image" and not(ancestor::*[local-name()="defs"])]');
        if ($images->length !== 1) throw new \InvalidArgumentException('Recognition needs exactly one embedded PNG/JPEG/WebP/GIF image in the SVG.');
        $image = $images->item(0);
        $href = $image->getAttribute('href') ?: $image->getAttributeNS('http://www.w3.org/1999/xlink', 'href');
        if (!preg_match('~\Adata:image/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/=\s]+)\z~D', $href, $parts)) throw new \InvalidArgumentException('Embed a PNG/JPEG/WebP/GIF in the SVG; external image URLs are not supported.');
        $bytes = base64_decode(preg_replace('/\s+/', '', $parts[2]), true);
        $size = is_string($bytes) ? @getimagesizefromstring($bytes) : false;
        $mimes = [IMAGETYPE_PNG=>'png',IMAGETYPE_JPEG=>'jpeg',IMAGETYPE_WEBP=>'webp',IMAGETYPE_GIF=>'gif'];
        if (!$size || !isset($mimes[$size[2]]) || $parts[1] !== $mimes[$size[2]] || $size[0] * $size[1] > 16000000 || strlen($bytes) > 6000000) throw new \InvalidArgumentException('Use a matching PNG/JPEG/WebP/GIF up to 6 MB and 16 megapixels.');
        $recognitionBytes = $bytes; $recognitionMime = $mimes[$size[2]];
        if (in_array($size[2],[IMAGETYPE_GIF,IMAGETYPE_WEBP],true)) {
            // Decode a recognition frame only; the native SVG keeps original bytes.
            if (!function_exists('imagecreatefromstring')) throw new \RuntimeException('Image decoding is unavailable for WebP/GIF recognition.');
            $frame = @imagecreatefromstring($bytes);
            if (!$frame) throw new \InvalidArgumentException('Cannot decode this image for recognition.');
            ob_start();
            try { if (!imagepng($frame)) throw new \RuntimeException('Cannot prepare image recognition frame.'); $recognitionBytes = ob_get_contents(); }
            finally { ob_end_clean(); imagedestroy($frame); }
            if (strlen($recognitionBytes)>6000000) throw new \InvalidArgumentException('The decoded recognition frame exceeds 6 MB.');
            $recognitionMime = 'png';
        }
        if (preg_match('/(?:^|;)\s*transform\s*:/i', $image->getAttribute('style'))) throw new \InvalidArgumentException('Use SVG transform attributes rather than a CSS transform on the embedded image.');
        $number = static function (string $name, float $fallback) use ($image): float {
            $value = trim($image->getAttribute($name));
            if ($value === '') return $fallback;
            if (!preg_match('/\A([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(?:px)?\z/iD', $value, $m) || !is_finite((float) $m[1])) throw new \InvalidArgumentException('Image geometry must use finite SVG user units, not percentages.');
            return (float) $m[1];
        };
        $x = $number('x', 0); $y = $number('y', 0); $w = $number('width', $size[0]); $h = $number('height', $size[1]);
        if ($w <= 0 || $h <= 0) throw new \InvalidArgumentException('The embedded image needs positive dimensions.');
        $aspect = trim($image->getAttribute('preserveAspectRatio')) ?: 'xMidYMid meet';
        $sx = $w / $size[0]; $sy = $h / $size[1];
        if ($aspect !== 'none') {
            if (!preg_match('/\A(xMin|xMid|xMax)(YMin|YMid|YMax)(?:\s+meet)?\z/D', $aspect, $m)) throw new \InvalidArgumentException('This version supports preserveAspectRatio none or meet; slice needs a cropped plan.');
            $s = min($sx, $sy); $x += ($w - $size[0] * $s) * (strpos($m[1], 'Mid') !== false ? .5 : (strpos($m[1], 'Max') !== false ? 1 : 0));
            $y += ($h - $size[1] * $s) * (strpos($m[2], 'Mid') !== false ? .5 : (strpos($m[2], 'Max') !== false ? 1 : 0)); $sx = $sy = $s;
        }
        return ['document' => $doc, 'image' => $image, 'width' => $size[0], 'height' => $size[1],
            'imageData' => 'data:image/' . $recognitionMime . ';base64,' . base64_encode($recognitionBytes),
            'imageHash' => hash('sha256', $bytes), 'matrix' => [$sx, $sy, $x, $y]];
    }

    /** Return native shapes and preserve the image and all pre-existing XML. */
    public static function compose(string $svg, array $analysis, array $ids, array $labels = [], bool $allowApproximate = false): array
    {
        $data = self::inspect($svg); $doc = $data['document']; $image = $data['image'];
        if (!hash_equals($analysis['imageHash'], $data['imageHash'])) throw new \RuntimeException('The background image changed. Detect regions again.');
        if (!$ids || count($ids) > 200 || array_filter($ids, static function ($id) { return !is_string($id); }) || count(array_unique($ids)) !== count($ids)) throw new \InvalidArgumentException('Select distinct detected candidate IDs.');
        $existing = []; $applied = []; $zones = [];
        foreach ($doc->getElementsByTagName('*') as $el) {
            if ($el->hasAttribute('id')) $existing[$el->getAttribute('id')] = true;
            if ($el->getAttribute('data-mapsvg-image') === $analysis['imageHash'] && $el->hasAttribute('data-mapsvg-raster-key')) $zones[$el->getAttribute('data-mapsvg-raster-key')][] = $el;
        }
        foreach ($analysis['candidates'] as $candidate) {
            $label = $labels[$candidate['id']] ?? $candidate['label'];
            $key = self::zoneKey($candidate, (string) $label);
            foreach ($zones[$key] ?? [] as $zone) if (self::matchesZone($zone, $candidate, (string) $label, $data)) {
                $applied[$candidate['id']] = $zone->getAttribute('id'); break;
            }
        }
        $allApplied = !array_diff($ids, array_keys($applied));
        if (!$allApplied && !hash_equals($analysis['sourceHash'], hash('sha256', $svg))) throw new \RuntimeException('The SVG changed after detection. Detect regions again before applying new zones.');
        $group = $doc->createElementNS('http://www.w3.org/2000/svg', 'g');
        // Sibling placement inherits the exact same ancestor transforms. The image's
        // own transform is copied, while its viewport offsets are in matrix below.
        foreach (['transform', 'clip-path', 'mask'] as $key) if ($image->hasAttribute($key)) $group->setAttribute($key, $image->getAttribute($key));
        $created = []; $resolved = []; [$sx, $sy, $tx, $ty] = $data['matrix'];
        foreach ($ids as $id) {
            $candidate = null; foreach ($analysis['candidates'] as $item) if ($item['id'] === $id) $candidate = $item;
            if (!$candidate) throw new \InvalidArgumentException('Unknown candidate ID.');
            $label = $labels[$id] ?? $candidate['label'];
            $approximate=$allowApproximate&&self::approximateAllowed($candidate,$analysis['candidates']);
            if (!self::validLabel($label)) throw new \InvalidArgumentException('Each selected zone needs an actual short name or number.');
            if (empty($candidate['selected']) && empty($candidate['selectable']) && !$approximate && !isset($labels[$id])) throw new \InvalidArgumentException('An uncertain/repeated label needs an explicit correction before applying.');
            if (isset($candidate['geometryConfidence']) && ($candidate['geometryConfidence'] < .5 || ($candidate['geometryConfidence'] < .7 && !$approximate))) throw new \InvalidArgumentException('The outline is uncertain; a label correction cannot approve its geometry.');
            if (isset($applied[$id])) { $resolved[] = $applied[$id]; continue; }
            foreach (['x', 'y', 'width', 'height'] as $key) if (!is_numeric($candidate[$key]) || !is_finite((float) $candidate[$key])) throw new \InvalidArgumentException('Invalid candidate geometry.');
            if ($candidate['x'] < 0 || $candidate['y'] < 0 || $candidate['width'] <= 0 || $candidate['height'] <= 0 || $candidate['x'] + $candidate['width'] > $data['width'] + 1 || $candidate['y'] + $candidate['height'] > $data['height'] + 1) throw new \InvalidArgumentException('Candidate lies outside the background image.');
            $slug = trim(preg_replace('/[^A-Za-z0-9_-]/', '-', $label), '-');
            if ($slug === '') $slug = substr(hash('sha256', self::labelKey($label)), 0, 12);
            $base = (string) $analysis['regionPrefix'] . (($candidate['kind'] ?? '') !== 'named' && preg_match('/\p{N}/u', $label) ? 'booth-' : 'area-') . $slug; $regionId = $base; $suffix = 2;
            while (isset($existing[$regionId])) $regionId = $base . '-' . $suffix++;
            if (strlen($regionId) > 190) throw new \InvalidArgumentException('Region prefix is too long.');
            $existing[$regionId] = true;
            [$tag, $geometry] = self::geometry($candidate, $data);
            $rect = $doc->createElementNS('http://www.w3.org/2000/svg', $tag);
            foreach (array_merge($geometry, ['id' => $regionId, 'title' => $label, 'fill' => 'rgba(255,255,255,0)',
                'pointer-events' => 'all', 'data-mapsvg-analysis' => $analysis['id'], 'data-mapsvg-candidate' => $id,
                'data-mapsvg-image' => $analysis['imageHash'], 'data-mapsvg-raster-key' => self::zoneKey($candidate, $label)]) as $key => $value) $rect->setAttribute($key, (string) $value);
            $group->appendChild($rect); $created[] = $regionId; $resolved[] = $regionId;
        }
        if ($created) $image->parentNode->insertBefore($group, $image->nextSibling);
        return ['svg' => $created ? $doc->saveXML() : $svg, 'createdIds' => $created, 'regionIds' => $resolved, 'alreadyApplied' => !$created];
    }

    private static function matchesZone(\DOMElement $zone, array $candidate, string $label, array $data): bool
    {
        $parent = $zone->parentNode; $image = $data['image'];
        if (!$zone->getAttribute('id') || self::labelKey($zone->getAttribute('title')) !== self::labelKey($label)
            || !($parent instanceof \DOMElement) || $parent->localName !== 'g' || $parent->parentNode !== $image->parentNode) return false;
        foreach (['transform', 'clip-path', 'mask'] as $attribute) if ($parent->getAttribute($attribute) !== $image->getAttribute($attribute)) return false;
        [$tag, $expected] = self::geometry($candidate, $data);
        if ($zone->localName !== $tag) return false;
        foreach ($expected as $attribute=>$value) {
            if ($attribute === 'd') { if ($zone->getAttribute('d') !== $value) return false; }
            elseif (!is_numeric($zone->getAttribute($attribute)) || abs((float)$zone->getAttribute($attribute)-$value)>0.00001) return false;
        }
        return true;
    }

    /** Canonical bounded simple ring. The model never supplies path commands or XML. */
    private static function outline(array $candidate): array
    {
        $points = $candidate['points'];
        if (!is_array($points) || count($points)<3 || count($points)>128) throw new \InvalidArgumentException('Use a bounded outline with 3–128 vertices.');
        $cross = static function($a,$b,$c) { return ($b['x']-$a['x'])*($c['y']-$a['y'])-($b['y']-$a['y'])*($c['x']-$a['x']); };
        $on = static function($a,$b,$p) use($cross) { return abs($cross($a,$b,$p))<.0000001 && $p['x']>=min($a['x'],$b['x'])-.0000001 && $p['x']<=max($a['x'],$b['x'])+.0000001 && $p['y']>=min($a['y'],$b['y'])-.0000001 && $p['y']<=max($a['y'],$b['y'])+.0000001; };
        foreach ($points as &$point) {
            if (!is_array($point) || count($point)!==2) throw new \InvalidArgumentException('Invalid outline vertex.');
            foreach (['x','y'] as $k) {
                if ((!is_int($point[$k]??null)&&!is_float($point[$k]??null)) || !is_finite((float)$point[$k])) throw new \InvalidArgumentException('Outline vertices must be finite numbers.');
                $point[$k] = round((float)$point[$k], 3);
            }
        } unset($point);
        $area=0; $n=count($points);
        for($i=0;$i<$n;$i++) {
            $a=$points[$i]; $b=$points[($i+1)%$n];
            if(hypot($a['x']-$b['x'],$a['y']-$b['y'])<.001) throw new \InvalidArgumentException('Repeated outline vertex.');
            $area+=$a['x']*$b['y']-$b['x']*$a['y'];
            for($j=$i+1;$j<$n;$j++) if($j!==$i+1&&!($i===0&&$j===$n-1)) {
                $c=$points[$j]; $d=$points[($j+1)%$n];
                if(($cross($a,$b,$c)*$cross($a,$b,$d)<0&&$cross($c,$d,$a)*$cross($c,$d,$b)<0)||$on($a,$b,$c)||$on($a,$b,$d)||$on($c,$d,$a)||$on($c,$d,$b)) throw new \InvalidArgumentException('Self-intersecting outline.');
            }
        }
        if(abs($area)<.01) throw new \InvalidArgumentException('Empty outline.');
        if($area<0)$points=array_reverse($points);
        $start=0; foreach($points as $i=>$p) if($p['x']<$points[$start]['x']||($p['x']===$points[$start]['x']&&$p['y']<$points[$start]['y']))$start=$i;
        return array_merge(array_slice($points,$start),array_slice($points,0,$start));
    }

    private static function geometry(array $candidate, array $data): array
    {
        [$sx,$sy,$tx,$ty]=$data['matrix'];
        if(array_key_exists('points',$candidate)) {
            $points=self::outline($candidate); $segments=[];
            foreach($points as $i=>$p) {
                if($p['x']<0||$p['y']<0||$p['x']>$data['width']||$p['y']>$data['height']) throw new \InvalidArgumentException('Outline lies outside the background.');
                $segments[]=($i===0?'M':'L').round($p['x']*$sx+$tx,6).' '.round($p['y']*$sy+$ty,6);
            }
            return ['path',['d'=>implode(' ',$segments).' Z']];
        }
        return ['rect',['x'=>$candidate['x']*$sx+$tx,'y'=>$candidate['y']*$sy+$ty,'width'=>$candidate['width']*$sx,'height'=>$candidate['height']*$sy]];
    }

    private static function zoneKey(array $candidate, string $label): string
    {
        if (($candidate['kind'] ?? '') === 'named' || !preg_match('/\p{N}/u', $label)) $label = self::labelKey($label);
        $geometry=array_key_exists('points',$candidate) ? self::outline($candidate) : [round((float)$candidate['x'],3),round((float)$candidate['y'],3),round((float)$candidate['width'],3),round((float)$candidate['height'],3)];
        return hash('sha256', json_encode(array_merge([$label],$geometry)));
    }
}
