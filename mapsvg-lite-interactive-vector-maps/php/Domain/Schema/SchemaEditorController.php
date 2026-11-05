<?php
namespace MapSVG;

final class SchemaEditorController extends Controller
{
    public static function preferences($request)
    {
        try {
            $service = new SchemaEditorDefaults();
            $id = (int) $request['id'];
            if ($request->get_method() === 'GET') return self::render(['defaults' => $service->get($id)]);
            $patch = $request->get_json_params();
            if (!is_array($patch) || ($patch !== [] && array_keys($patch) === range(0, count($patch) - 1))) throw new \InvalidArgumentException('Editor preferences must be an object.', 400);
            if (isset($patch['mapId']) && is_int($patch['mapId']) && $patch['mapId'] > 0 && !AppDraftController::canEdit($patch['mapId'])) {
                return self::render(['error' => 'You cannot access this Map.'], 403);
            }
            return self::render(['defaults' => $service->update($id, $patch)]);
        } catch (\Throwable $error) {
            $status = in_array($error->getCode(), [400, 403, 404, 409], true) ? $error->getCode() : 500;
            return self::render(['error' => $status === 500 ? 'Could not load or save editor preferences.' : $error->getMessage()], $status);
        }
    }

    /** Only map metadata/appearance, never saved records, App code or components. */
    public static function pickerMap($request)
    {
        $id = (int) $request['id'];
        if ($id > 0 && !AppDraftController::canEdit($id)) return self::render(['error' => 'You cannot access this Map.'], 403);
        $db = Database::get();
        if ($id === 0) {
            $options = NewMapDefaults::googleMap([], MAPSVG_MAPS_URL);
            $revision = 1;
            $title = 'Google Map';
        } else {
            $row = $db->get_row($db->prepare("SELECT options,svgFileLastChanged FROM `{$db->mapsvg_prefix}maps` WHERE id=%d", $id), ARRAY_A);
            if (!$row) return self::render(['error' => 'Map not found.'], 404);
            $options = json_decode($row['options'], true);
            if (!is_array($options) || !is_string($options['source'] ?? null)) return self::render(['error' => 'Map source is unavailable.'], 409);
            $revision = (int) $row['svgFileLastChanged'];
            $title = (string) ($options['title'] ?? ('Map ' . $id));
        }
        return self::render(['map' => ['id' => $id, 'title' => $title, 'svgFileLastChanged' => $revision, 'options' => self::surfaceOptions($options)]]);
    }

    public static function surfaceOptions(array $options): array
    {
        $result = array_intersect_key($options, array_flip(['source', 'width', 'height', 'viewBox', 'colors']));
        $google = is_array($options['googleMaps'] ?? null) ? $options['googleMaps'] : [];
        $result['googleMaps'] = array_intersect_key($google, array_flip(['on', 'center', 'zoom', 'type']));
        return $result;
    }

    public static function pickerMaps($request)
    {
        $db = Database::get();
        $rows = $db->get_results("SELECT id,title FROM `{$db->mapsvg_prefix}maps` ORDER BY id DESC", ARRAY_A);
        $items = [];
        foreach ($rows ?: [] as $row) {
            $id = (int) $row['id'];
            if (AppDraftController::canEdit($id)) $items[] = ['id' => $id, 'title' => (string) $row['title'] ?: ('Map ' . $id)];
        }
        return self::render(['items' => $items]);
    }
}
