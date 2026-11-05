<?php
namespace MapSVG;

/** Materialize v8 Gallery preset metadata in a detached authoring snapshot. */
final class LegacyGalleryMigration
{
    public static function apply(\stdClass $options): void
    {
        if (!property_exists($options, 'galleries') || $options->galleries === null) return;
        $saved = $options->galleries;
        if (!is_array($saved) && !$saved instanceof \stdClass) {
            throw new \UnexpectedValueException('Unsupported legacy Gallery presets; review their settings before migration.');
        }
        $galleries = []; $ids = [];
        foreach ($saved as $gallery) {
            if (!$gallery instanceof \stdClass || !property_exists($gallery, 'id') ||
                (!is_string($gallery->id) && !is_int($gallery->id) && !is_float($gallery->id)) || (string) $gallery->id === '') {
                throw new \UnexpectedValueException('A legacy Gallery has no stable ID; review its settings before migration.');
            }
            $id = (string) $gallery->id;
            if (isset($ids[$id])) throw new \UnexpectedValueException('Duplicate legacy Gallery ID: ' . $id);
            $ids[$id] = true;
            // v8 supplied these runtime fallbacks. New-preset defaults must not
            // silently turn on lightbox or change spacing/thumbnail width.
            if (!property_exists($gallery, 'lightbox')) $gallery->lightbox = false;
            if (!property_exists($gallery, 'thumb_margin') || $gallery->thumb_margin === '' || $gallery->thumb_margin === null) $gallery->thumb_margin = 0;
            if (!property_exists($gallery, 'thumb_width') || $gallery->thumb_width === '' || $gallery->thumb_width === null) $gallery->thumb_width = 80;
            // The old slider emitted an invalid/empty max-height when this text
            // field was absent, hence no cap. Preserve that with a native sentinel.
            if (($gallery->type ?? '') === 'slider' && (!property_exists($gallery, 'max_height') || $gallery->max_height === '' || $gallery->max_height === null)) $gallery->max_height = 'none';
            $galleries[] = $gallery;
        }
        // PHP sparse/dictionary encodings retain explicit IDs and order but the
        // resource reader requires a JSON list. Never derive IDs from array keys.
        $options->galleries = $galleries;
    }
}
