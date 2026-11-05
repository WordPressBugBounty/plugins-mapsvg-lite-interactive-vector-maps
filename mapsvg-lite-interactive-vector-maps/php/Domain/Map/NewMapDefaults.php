<?php

namespace MapSVG;

/**
 * Canonical structural defaults persisted when a map is first created.
 *
 * Runtime DefaultOptions remain backwards-compatible fallbacks for existing
 * maps. Apply these only during provisioning, never when opening saved Apps.
 * Manual creation includes a Region Directory; AI starts without list UI.
 */
final class NewMapDefaults
{
    public const MANUAL = 'manual';
    public const AI = 'ai';

    /** Same empty calibrated source and camera defaults used by manual Google creation. */
    public static function googleMap(array $options, string $mapsUrl): array
    {
        $options['source'] = (string) parse_url(rtrim($mapsUrl, '/') . '/geo-calibrated/empty.svg', PHP_URL_PATH);
        if (!isset($options['viewBox'])) $options['viewBox'] = [-1766.3868973306835, 146.6496453220534, 23928.888888888887, 13460];
        $options['googleMaps'] = array_replace([
            'on' => true, 'zoom' => 1,
            'center' => ['lat' => 41.99585227532726, 'lng' => 10.688006500000029],
        ], $options['googleMaps'] ?? []);
        return $options;
    }

    public static function apply(array $options, string $context = self::MANUAL): array
    {
        if (!in_array($context, [self::MANUAL, self::AI], true)) {
            throw new \InvalidArgumentException('Unknown map creation context.');
        }
        $ai = $context === self::AI;
        $options['menu'] = array_replace($ai ? ['on' => false] : self::directoryDefaults(), is_array($options['menu'] ?? null) ? $options['menu'] : []);
        if ($ai) {
            $options['filters'] = array_replace(['on' => false], is_array($options['filters'] ?? null) ? $options['filters'] : []);
            if (!array_key_exists('filtersSchema', $options)) $options['filtersSchema'] = [];
        }
        $existingLayout = isset($options['layout']) && is_array($options['layout'])
            ? $options['layout']
            : [];

        $options['layout'] = self::mergeLayout($existingLayout, $ai);

        if (!isset($options['nodes']) || !is_array($options['nodes']) || count($options['nodes']) === 0) {
            $options['nodes'] = $ai ? self::aiNodes() : self::nodes(false, $options['menu']);
        }

        if (!isset($options['scenes']) || !is_array($options['scenes']) || count($options['scenes']) === 0) {
            $options['scenes'] = self::scenes();
        }

        if (!isset($options['mobileView']) || !is_array($options['mobileView'])) {
            $options['mobileView'] = [
                'labelMap' => 'Map',
                'labelList' => 'List',
                'labelClose' => 'Close',
            ];
        }

        return $options;
    }

    /** The compatibility scaffold is explicit so fresh-map defaults cannot remove v8 sidebars. */
    public static function layout(bool $withRightSidebar = false): array
    {
        return [
            'mountMode' => 'tree',
            'column' => 12,
            'gap' => 0,
            'cellHeight' => 64,
            'grids' => [
                'desktop' => [
                    ['id' => 'Header', 'x' => 0, 'y' => 0, 'w' => 12, 'h' => 1],
                    ['id' => 'LeftSidebar', 'x' => 0, 'y' => 1, 'w' => 3, 'h' => 6],
                    ['id' => 'Main', 'x' => 3, 'y' => 1, 'w' => $withRightSidebar ? 6 : 9, 'h' => 6],
                    ...($withRightSidebar ? [['id' => 'RightSidebar', 'x' => 9, 'y' => 1, 'w' => 3, 'h' => 6]] : []),
                    ['id' => 'Footer', 'x' => 0, 'y' => 7, 'w' => 12, 'h' => 1],
                    ['id' => 'MobileFooter', 'x' => 0, 'y' => 8, 'w' => 12, 'h' => 1],
                ],
                'tablet' => [
                    ['id' => 'Header', 'x' => 0, 'y' => 0, 'w' => 12, 'h' => 1],
                    ['id' => 'LeftSidebar', 'x' => 0, 'y' => 1, 'w' => 4, 'h' => 5],
                    ['id' => 'Main', 'x' => 4, 'y' => 1, 'w' => 8, 'h' => 5],
                    ...($withRightSidebar ? [['id' => 'RightSidebar', 'x' => 0, 'y' => 6, 'w' => 12, 'h' => 2]] : []),
                    ['id' => 'Footer', 'x' => 0, 'y' => $withRightSidebar ? 8 : 6, 'w' => 12, 'h' => 1],
                    ['id' => 'MobileFooter', 'x' => 0, 'y' => $withRightSidebar ? 9 : 7, 'w' => 12, 'h' => 1],
                ],
                'mobile' => [
                    ['id' => 'Header', 'x' => 0, 'y' => 0, 'w' => 12, 'h' => 1],
                    ['id' => 'Main', 'x' => 0, 'y' => 1, 'w' => 12, 'h' => 4],
                    ['id' => 'LeftSidebar', 'x' => 0, 'y' => 5, 'w' => 12, 'h' => 2],
                    ...($withRightSidebar ? [['id' => 'RightSidebar', 'x' => 0, 'y' => 7, 'w' => 12, 'h' => 2]] : []),
                    ['id' => 'Footer', 'x' => 0, 'y' => $withRightSidebar ? 9 : 7, 'w' => 12, 'h' => 1],
                    ['id' => 'MobileFooter', 'x' => 0, 'y' => $withRightSidebar ? 10 : 8, 'w' => 12, 'h' => 1],
                ],
            ],
        ];
    }

    private static function aiLayout(): array
    {
        $layout = self::layout();
        foreach ($layout['grids'] as &$grid) {
            $grid = array_values(array_filter($grid, static function ($cell) {
                return $cell['id'] !== 'LeftSidebar';
            }));
            $bottom = 0;
            foreach ($grid as &$cell) {
                if ($cell['id'] === 'Main') {
                    $cell['x'] = 0;
                    $cell['w'] = 12;
                    $bottom = $cell['y'] + $cell['h'];
                }
                if (in_array($cell['id'], ['Footer', 'MobileFooter'], true)) {
                    $cell['y'] = $bottom;
                    $bottom += $cell['h'];
                }
            }
            unset($cell);
        }
        unset($grid);
        return $layout;
    }

    private static function aiNodes(): array
    {
        $omitted = ['LeftSidebar', 'RightSidebar', 'directory', 'filters'];
        $nodes = array_values(array_filter(self::nodes(), static function ($node) use ($omitted) {
            return !in_array($node['id'], $omitted, true);
        }));
        foreach ($nodes as &$node) {
            $node['children'] = array_values(array_diff($node['children'], $omitted));
            // A Map/List toggle is an authored choice, not an empty default list.
            if ($node['type'] === 'mobileToolbar') $node['settings']['on'] = false;
        }
        unset($node);
        return $nodes;
    }

    private static function mergeLayout(array $existing, bool $ai = false): array
    {
        $layout = $ai ? self::aiLayout() : self::layout();

        foreach (['column', 'cellHeight'] as $key) {
            if (array_key_exists($key, $existing)) {
                $layout[$key] = $existing[$key];
            }
        }

        if (isset($existing['grids']) && is_array($existing['grids'])) {
            foreach (['desktop', 'tablet', 'mobile'] as $breakpoint) {
                if (!empty($existing['grids'][$breakpoint]) && is_array($existing['grids'][$breakpoint])) {
                    $layout['grids'][$breakpoint] = $existing['grids'][$breakpoint];
                }
            }
        }

        // A newly-created map always uses explicit tree component placement.
        $layout['mountMode'] = 'tree';

        return $layout;
    }
    private static function directoryDefaults(): array
    {
        return ['on' => true, 'source' => 'regions', 'location' => 'leftSidebar', 'sortBy' => 'title', 'sortDirection' => 'asc'];
    }

    public static function nodes(bool $withRightSidebar = false, array $menu = []): array
    {
        return [
            self::node('Header', 'slot', 'Header', ['width' => '100%', 'height' => 'auto'], ['filters']),
            self::node('LeftSidebar', 'slot', 'LeftSidebar', ['width' => '250px', 'height' => 'auto'], ['directory']),
            self::node('Main', 'slot', 'Main', ['width' => '100%', 'height' => 'auto'], ['map-layers', 'map-legend', 'map', 'details-modal']),
            ...($withRightSidebar ? [self::node('RightSidebar', 'slot', 'RightSidebar', ['width' => '250px', 'height' => 'auto'])] : []),
            self::node('Footer', 'slot', 'Footer', ['width' => '100%', 'height' => 'auto']),
            self::node('MobileFooter', 'slot', 'MobileFooter', [
                'width' => '100%',
                'height' => 'auto',
                'responsiveLayout' => [
                    'desktop' => ['hidden' => true],
                    'tablet' => ['hidden' => true],
                    'mobile' => ['hidden' => false],
                ],
            ], ['mobile-toolbar']),
            self::node('body', 'body', 'Body'),
            self::node('map', 'map', 'Map', [
                'placement' => ['parentId' => 'Main'],
                'chromeGrid' => self::mapChromeGrid(),
            ], [
                'map-region',
                'map-marker',
                'map-tooltip',
                'map-popover',
                'map-controls',
            ]),
            self::node('map-region', 'region', 'Region'),
            self::node('map-marker', 'marker', 'Marker'),
            self::node('map-tooltip', 'tooltip', 'Tooltip'),
            self::node('map-popover', 'popover', 'Popover'),
            self::node('map-layers', 'layers', 'Layers', self::presentationOverlaySettings()),
            self::node('map-legend', 'legend', 'Legend', self::presentationOverlaySettings('bottom-left')),
            self::node('map-controls', 'controls', 'Controls'),
            self::node('details-modal', 'modal', 'Details', [
                'placement' => ['parentId' => 'Main'],
            ]),
            self::node('filters', 'filters', 'Filters', [
                'on' => true,
                'placement' => ['parentId' => 'Header'],
            ]),
            self::node('directory', 'directory', 'Directory', array_replace(self::directoryDefaults(), $menu, [
                'placement' => ['parentId' => 'LeftSidebar'],
            ])),
            self::node('mobile-toolbar', 'mobileToolbar', 'Mobile Toolbar', [
                'on' => true,
                'placement' => ['parentId' => 'MobileFooter'],
            ]),
        ];
    }

    public static function scenes(): array
    {
        return [[
            'id' => 'scene-1',
            'title' => 'Scene 1',
            'rootNodeId' => 'Main',
            'bodyNodeId' => 'body',
            'mount' => ['type' => 'dynamic'],
        ]];
    }

    public static function presentationOverlaySettings(string $position = 'top-left'): array
    {
        $anchor = in_array($position, ['top-left', 'top-right', 'bottom-left', 'bottom-right'], true) ? $position : 'top-left';
        $profile = ['position' => 'absolute', 'anchor' => $anchor, 'width' => ['mode' => 'auto'], 'height' => ['mode' => 'auto']];
        return ['placement' => ['parentId' => 'Main'], 'responsiveLayout' => [
            'desktop' => $profile, 'tablet' => $profile, 'mobile' => $profile,
        ]];
    }

    private static function node(
        string $id,
        string $type,
        string $title,
        array $settings = [],
        array $children = []
    ): array {
        return [
            'id' => $id,
            'type' => $type,
            'title' => $title,
            'settings' => $settings,
            'children' => $children,
        ];
    }

    private static function mapChromeGrid(): array
    {
        return [
            'column' => 12,
            'gap' => 8,
            'cellHeight' => 48,
            'grids' => [
                'desktop' => [
                    ['id' => 'controls', 'x' => 10, 'y' => 0, 'w' => 2, 'h' => 3],
                ],
                'tablet' => [
                    ['id' => 'controls', 'x' => 9, 'y' => 0, 'w' => 3, 'h' => 3],
                ],
                'mobile' => [
                    ['id' => 'controls', 'x' => 8, 'y' => 0, 'w' => 4, 'h' => 2],
                ],
            ],
        ];
    }
}
