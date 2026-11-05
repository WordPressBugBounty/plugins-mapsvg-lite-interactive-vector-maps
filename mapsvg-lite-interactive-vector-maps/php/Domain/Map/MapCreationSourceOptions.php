<?php

namespace MapSVG;

/** Creation-only Google overlay source ownership; ordinary calibrated SVGs remain ordinary SVGs. */
final class MapCreationSourceOptions
{
    /** @return array{options: array, createdFile: ?SVGFile} */
    public static function prepare(array $options, ?MapAssetCatalog $catalog = null, ?SVGFileRepository $files = null): array
    {
        $unchanged = array('options' => $options, 'createdFile' => null);
        if (isset($options['googleMaps']) && is_array($options['googleMaps'])
            && array_key_exists('on', $options['googleMaps']) && !filter_var($options['googleMaps']['on'], FILTER_VALIDATE_BOOLEAN)) return $unchanged;
        $source = $options['source'] ?? null;
        if (!is_string($source) || $source === '') return $unchanged;
        $catalog = $catalog ?? new MapAssetCatalog();
        // Preserve the retained create endpoint's non-catalog/remote source contract.
        try { $metadata = $catalog->svgMetadata($source); }
        catch (\InvalidArgumentException $error) { return $unchanged; }
        if (!$metadata['googleOverlay']) return $unchanged;
        $original = $catalog->readSvg($source);
        $svg = MapAssetCatalog::svgDocument($original['body']);
        foreach ($svg->xpath('//*[local-name()="image" and @id="mapsvg-google-map-background"]') as $background) {
            $node = dom_import_simplexml($background);
            $node->parentNode->removeChild($node);
        }
        $file = new SVGFile(array('name' => pathinfo($original['name'], PATHINFO_FILENAME) . '-google.svg'));
        $file->setBody((string) $svg->asXML());
        $file->maybeSanitize(current_user_can('unfiltered_html'));
        $file = ($files ?? new SVGFileRepository())->createUnique($file);
        $options['source'] = $file->relativeUrl;
        $settings = isset($options['googleMaps']) && is_array($options['googleMaps']) ? $options['googleMaps'] : array();
        $options['googleMaps'] = array_merge($settings, array('on' => true));
        return array('options' => $options, 'createdFile' => $file);
    }

    /** Only the unique file object returned by this request is eligible for compensation. */
    public static function discard(?SVGFile $createdFile): void
    {
        if ($createdFile) @unlink($createdFile->serverPath);
    }
}
