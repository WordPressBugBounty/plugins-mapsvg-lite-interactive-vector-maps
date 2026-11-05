<?php
namespace MapSVG;

/** Detached v8 authoring conversion. The published document and shared records are never mutated. */
final class LegacyLayoutMigration
{
    private const SLOTS = ['header' => 'Header', 'leftSidebar' => 'LeftSidebar', 'map' => 'Main', 'rightSidebar' => 'RightSidebar', 'footer' => 'Footer'];

    private static function merge(\stdClass $defaults, \stdClass $saved): \stdClass
    {
        foreach ($saved as $key => $value) {
            if ($value instanceof \stdClass && ($defaults->{$key} ?? null) instanceof \stdClass) $defaults->{$key} = self::merge($defaults->{$key}, $value);
            else $defaults->{$key} = $value;
        }
        return $defaults;
    }

    private static function enabled($value): bool
    {
        if (is_bool($value)) return $value;
        if ($value === null || $value === '') return false;
        if (!is_scalar($value)) throw new \UnexpectedValueException('Invalid legacy component enable flag.');
        $value = strtolower((string) $value);
        if (in_array($value, ['1','true','on','yes','y'], true)) return true;
        if (in_array($value, ['0','false','off','no','n'], true)) return false;
        throw new \UnexpectedValueException('Invalid legacy component enable flag.');
    }

    /** Materialize the v8 defaults that the old client supplied to partial saved options. */
    public static function defaults(\stdClass $options): \stdClass
    {
        $frozen = json_decode(file_get_contents(__DIR__ . '/../../Core/legacy-v8-defaults.json'));
        if (!($frozen->options ?? null) instanceof \stdClass) throw new \RuntimeException('Missing frozen v8 authoring defaults.');
        return self::merge($frozen->options, $options);
    }

    private static function size($value): array
    {
        if ($value === null || $value === '' || $value === 'auto') return ['mode' => 'auto'];
        if (preg_match('/\A(\d+(?:\.\d+)?)(?:px)?\z/', (string) $value, $m)) return ['mode' => 'fixed', 'value' => (float) $m[1]];
        if (preg_match('/\A\d+(?:\.\d+)?%\z/', (string) $value)) return ['mode' => 'fill'];
        throw new \UnexpectedValueException('Unsupported legacy container size: ' . (string) $value);
    }

    private static function target(string $location): string
    {
        if (in_array($location, ['fullscreen', 'custom'], true)) return 'body';
        if (!isset(self::SLOTS[$location])) throw new \UnexpectedValueException('Unsupported legacy component location: ' . $location);
        return self::SLOTS[$location];
    }

    private static function legendSize($value, string $axis): array
    {
        if ($value === null || $value === '' || $value === 'auto') return [$axis => ['mode'=>'auto']];
        if (preg_match('/\A(\d+(?:\.\d+)?)(?:px)?\z/', (string) $value, $match)) return [$axis => ['mode'=>'fixed', 'value'=>(float) $match[1]]];
        if (preg_match('/\A(\d+(?:\.\d+)?)%\z/', (string) $value, $match) && (float) $match[1] <= 100) return [$axis => ['mode'=>'auto'], $axis . 'Percent' => (float) $match[1]];
        throw new \UnexpectedValueException('Unsupported legacy Legend ' . $axis . '; review its size before migration.');
    }

    public static function apply(\stdClass $options): void
    {
        if (($options->layout->mountMode ?? null) === 'tree') return;
        // A pre-existing authored tree cannot be guessed from its legacy location fields.
        if (!empty($options->nodes)) throw new \UnexpectedValueException('Legacy App has an existing node registry; review its Layout before migration.');
        $nodes = NewMapDefaults::nodes(true);
        $byId = [];
        foreach ($nodes as $i => $node) { $nodes[$i]['children'] = []; $byId[$node['id']] = $i; }
        $attach = static function (string $parent, string $child) use (&$nodes, &$byId): void {
            $nodes[$byId[$parent]]['children'][] = $child;
            $nodes[$byId[$child]]['settings']['placement'] = ['parentId' => $parent];
        };
        $attach('Main', 'map-layers');
        $attach('Main', 'map-legend');
        $attach('Main', 'map');
        foreach (['region','marker','tooltip','popover','controls'] as $type) $attach('map', 'map-' . $type);
        // Map chrome keeps its legacy visibility and options; click actions remain App-owned.
        foreach (['tooltip'=>'tooltips','popover'=>'popovers','layers'=>'layersControl','controls'=>'controls'] as $type=>$key) {
            $flags = $type === 'controls' ? ['zoom','zoomReset','userLocation','previousMap'] : ($type === 'layers' ? ['on','expanded'] : ['on']);
            foreach ($flags as $flag) if (property_exists($options->{$key}, $flag)) $options->{$key}->{$flag} = self::enabled($options->{$key}->{$flag});
            $nodes[$byId['map-' . $type]]['settings'] = (array) $options->{$key};
        }
        $nodes[$byId['map-layers']]['settings'] = array_replace(
            $nodes[$byId['map-layers']]['settings'],
            NewMapDefaults::presentationOverlaySettings((string) ($options->layersControl->position ?? 'top-left'))
        );
        foreach (['on', 'expanded'] as $key) {
            if (array_key_exists($key, $nodes[$byId['map-layers']]['settings'])) {
                $nodes[$byId['map-layers']]['settings'][$key] = self::enabled($nodes[$byId['map-layers']]['settings'][$key]);
            }
        }
        if (isset($options->regionDataRules->legacyStatus)) {
            $legend = $options->choropleth->coloring->legend ?? new \stdClass();
            $corner = (string) ($legend->container ?? 'bottom-left');
            // v8 always appended Legend to Map. Named container values offered
            // by its UI had no CSS positioning rule and used the bottom-right base.
            if (!in_array($corner, ['top-left','top-right','bottom-left','bottom-right'], true)) $corner = 'bottom-right';
            $nodes[$byId['map-legend']]['settings'] = NewMapDefaults::presentationOverlaySettings($corner);
            foreach (['desktop','tablet','mobile'] as $bp) {
                $nodes[$byId['map-legend']]['settings']['responsiveLayout'][$bp] = array_replace(
                    $nodes[$byId['map-legend']]['settings']['responsiveLayout'][$bp],
                    self::legendSize($legend->width ?? '20%', 'width'),
                    self::legendSize($legend->height ?? '20%', 'height'),
                    ['minWidthPercent'=>10, 'maxWidthPercent'=>50]
                );
            }
            $nodes[$byId['map-legend']]['styles'] = [
                $corner === 'top-right' || $corner === 'bottom-right' ? 'marginRight' : 'marginLeft' => $corner === 'top-right' ? 50 : 10,
                $corner === 'top-left' || $corner === 'top-right' ? 'marginTop' : 'marginBottom' => $corner === 'bottom-right' ? 50 : 10,
            ];
        }
        // Layout owns the slotted surface's constraints; retaining only the old
        // view setting would lose its fixed-height limit in tree mode.
        $layersMaxHeight = $options->layersControl->maxHeight ?? null;
        if ($layersMaxHeight !== null && preg_match('/\A(\d+(?:\.\d+)?)(?:px)?\z/', (string) $layersMaxHeight, $match)) {
            foreach (['desktop','tablet','mobile'] as $bp) $nodes[$byId['map-layers']]['settings']['responsiveLayout'][$bp]['maxHeight'] = (float) $match[1];
        } elseif ($layersMaxHeight !== null && preg_match('/\A(\d+(?:\.\d+)?)%\z/', (string) $layersMaxHeight, $match)) {
            if ((float) $match[1] > 100) throw new \UnexpectedValueException('Unsupported legacy Layers percentage height limit.');
            foreach (['desktop','tablet','mobile'] as $bp) $nodes[$byId['map-layers']]['settings']['responsiveLayout'][$bp]['maxHeightPercent'] = (float) $match[1];
        } elseif ($layersMaxHeight !== null && !in_array($layersMaxHeight, ['', 'none'], true)) {
            throw new \UnexpectedValueException('Unsupported legacy Layers height limit.');
        }
        foreach (['directory'=>'menu','filters'=>'filters','details-modal'=>'detailsView'] as $id=>$key) {
            $settings = $options->{$key};
            if (isset($settings->on)) $settings->on = self::enabled($settings->on);
            if ($key !== 'detailsView') $settings->binding = ($settings->source ?? '') === 'regions' ? 'regions' : 'objects';
            $nodes[$byId[$id]]['settings'] = (array) $settings;
            $target = self::target($settings->location ?? ($key === 'menu' ? 'leftSidebar' : ($key === 'filters' ? 'header' : 'map')));
            $attach($target, $id);
            // External mounts keep the existing custom-container adapter, not a page-slot placement.
            if (($settings->location ?? '') === 'custom') unset($nodes[$byId[$id]]['settings']['placement']);
        }
        // Filters precede Directory when they share a slot, matching the v8 sidebar search area.
        foreach ($nodes as &$node) {
            if (in_array('directory', $node['children'], true) && in_array('filters', $node['children'], true)) {
                $node['children'] = array_values(array_unique(array_merge(['filters'], $node['children'])));
                if (in_array($node['id'], ['LeftSidebar', 'RightSidebar'], true)) {
                    foreach (['desktop','tablet','mobile'] as $bp) {
                        foreach (['filters'=>'auto', 'directory'=>'fill'] as $id=>$mode) {
                            $nodes[$byId[$id]]['settings']['responsiveLayout'][$bp] = ['height'=>['mode'=>$mode], 'position'=>'relative'];
                        }
                    }
                }
            }
        }
        unset($node);
        $layout = NewMapDefaults::layout(true);
        $menu = $options->menu;
        $mobileToggle = self::enabled($menu->on) && self::enabled($menu->hideOnMobile) && ($menu->location ?? '') !== 'custom';
        if ($mobileToggle && self::target($menu->location) === 'Main') throw new \UnexpectedValueException('Legacy Directory shares the Map container; separate the mobile targets before migration.');
        foreach (self::SLOTS as $legacy => $id) {
            if ($id === 'Main') continue;
            $container = $options->containers->{$legacy};
            foreach (['desktop','tablet','mobile'] as $bp) {
                $hidden = !self::enabled($container->on);
                if ($bp === 'mobile' && $mobileToggle && $id === self::target($menu->location)) $hidden = true;
                $settings = ['hidden'=>$hidden, 'width'=>$bp === 'mobile' ? ['mode'=>'fill'] : self::size($container->width ?? '100%')];
                if (isset($container->height)) $settings['height'] = self::size($container->height);
                if (in_array($id, ['LeftSidebar', 'RightSidebar'], true) &&
                    in_array('filters', $nodes[$byId[$id]]['children'], true) && in_array('directory', $nodes[$byId[$id]]['children'], true) &&
                    (!isset($container->height) || $container->height === 'auto')) $settings['height'] = ['mode'=>'fill'];
                $nodes[$byId[$id]]['settings']['responsiveLayout'][$bp] = $settings;
            }
        }
        foreach (['desktop','tablet','mobile'] as $bp) {
            $nodes[$byId['Main']]['settings']['responsiveLayout'][$bp] = ['width'=>['mode'=>'fill'], 'height'=>['mode'=>'auto']];
            $nodes[$byId['MobileFooter']]['settings']['responsiveLayout'][$bp] = ['hidden'=>!($bp === 'mobile' && $mobileToggle)];
        }
        // Preserve percentage sidebar widths at the Layout grid's 12-column resolution.
        foreach (['desktop','tablet'] as $bp) {
            $left = self::enabled($options->containers->leftSidebar->on) ? self::span($options->containers->leftSidebar->width ?? '250px') : 3;
            $right = self::enabled($options->containers->rightSidebar->on) ? self::span($options->containers->rightSidebar->width ?? '250px') : 3;
            // Keep room for restoring hidden slots; Fill claims their tracks while hidden.
            if ($left + $right >= 12 && !self::enabled($options->containers->rightSidebar->on)) $right = max(0, 11 - $left);
            if ($left + $right >= 12 && !self::enabled($options->containers->leftSidebar->on)) $left = max(0, 11 - $right);
            if ($left + $right >= 12) throw new \UnexpectedValueException('Legacy sidebar widths leave no space for the Map.');
            if ($left < 1 || $right < 1) throw new \UnexpectedValueException('Legacy sidebar widths leave no space for restoring hidden containers.');
            foreach ($layout['grids'][$bp] as &$widget) {
                if ($widget['id'] === 'LeftSidebar') $widget['w'] = max(1, $left);
                if ($widget['id'] === 'Main') { $widget['x'] = $left; $widget['w'] = 12 - $left - $right; }
                if ($widget['id'] === 'RightSidebar') { $widget['x'] = 12 - $right; $widget['w'] = max(1, $right); $widget['y'] = 1; $widget['h'] = $bp === 'desktop' ? 6 : 5; }
            }
            unset($widget);
        }
        $nodes[$byId['mobile-toolbar']]['settings'] = ['on'=>$mobileToggle,'placement'=>['parentId'=>'MobileFooter']];
        $attach('MobileFooter', 'mobile-toolbar');
        $options->mobileView->showFirst = ($menu->showFirst ?? 'map') === 'list' ? 'list' : 'map';
        $options->mobileView->showMapOnClick = self::enabled($menu->showMapOnClick ?? true);
        $options->mobileView->mapContainerId = 'Main';
        $options->mobileView->listContainerId = $mobileToggle ? self::target($menu->location) : '';
        $options->layout = json_decode(wp_json_encode($layout));
        $options->nodes = json_decode(wp_json_encode($nodes));
        if (empty($options->scenes)) $options->scenes = json_decode(wp_json_encode(NewMapDefaults::scenes()));
        if (!is_array($options->scenes)) throw new \UnexpectedValueException('Invalid legacy Pages.');
        foreach ($options->scenes as $page) {
            $page->rootNodeId = $page->rootNodeId ?? 'Main';
            $page->bodyNodeId = $page->bodyNodeId ?? 'body';
            $page->mount = $page->mount ?? (object) ['type'=>'dynamic'];
        }
    }

    private static function span($width): int
    {
        if (preg_match('/\A(\d+(?:\.\d+)?)%\z/', (string) $width, $m)) return max(1, min(11, (int) round((float) $m[1] * 12 / 100)));
        return 3;
    }
}
