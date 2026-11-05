<?php

namespace MapSVG;

/** Public immutable authoring snapshots; shared Collection/Query data remains live. */
final class AppPublishedVersion
{
    public static function id($value): int
    {
        if ((!is_int($value) && !is_string($value)) || !preg_match('/\A[1-9][0-9]*\z/D', (string) $value)
            || filter_var($value, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]) === false) {
            throw new \InvalidArgumentException('Invalid published version ID.', 400);
        }
        return (int) $value;
    }

    public static function apply($map, $versionId): void
    {
        $versionId = self::id($versionId);
        if (!$map) throw new \OutOfBoundsException('Published version not found in this App.', 404);
        $version = (new AppDraftStore())->publishedVersion((int) $map->id, $versionId);
        $snapshot = $version['snapshot'];
        // PHP runtime projections use arrays; stored snapshot JSON remains unchanged.
        $map->setOptions(json_decode(wp_json_encode($snapshot['options']), true));
        $map->setTitle($snapshot['title'] ?? $map->options['title'] ?? '');
        if (isset($snapshot['version'])) $map->setVersion($snapshot['version']);
        if (isset($snapshot['svgFileLastChanged'])) $map->setSvgFileLastChanged($snapshot['svgFileLastChanged']);
    }

    public static function applyRequested($map, $request): bool
    {
        $params = $request->get_params();
        if (!array_key_exists('mapsvg_version', $params)) {
            if ($map && !AppDraftController::canEdit((int) $map->id)
                && !(new AppDraftStore())->hasPublishedVersion((int) $map->id)
                && !AppDraftPreview::requestedDraft((int) $map->id, $request)) {
                throw new \OutOfBoundsException('No version is currently published for this App.', 404);
            }
            return false;
        }
        self::apply($map, $params['mapsvg_version']);
        return true;
    }
}
