<?php

namespace MapSVG;

/** Image creation owns the original raster and independent writable SVG wrappers. */
final class ImageFileService
{
    private $catalog;
    private $images;
    private $svgs;

    public function __construct(?MapAssetCatalog $catalog = null, ?FilesRepository $images = null, ?SVGFileRepository $svgs = null)
    {
        $this->catalog = $catalog ?? new MapAssetCatalog();
        $this->images = $images ?? new FilesRepository(array(MAPSVG_MAPS_DIR, MAPSVG_UPLOADS_DIR), MAPSVG_UPLOADS_DIR, array('png', 'jpg', 'jpeg', 'gif', 'webp'));
        $this->svgs = $svgs ?? new SVGFileRepository();
    }

    public function upload(array $upload): array
    {
        $name = $upload['name'] ?? '';
        $temporary = $upload['tmp_name'] ?? '';
        if (!is_string($name) || $name === '' || basename($name) !== $name || strpos($name, '\\') !== false || strpos($name, "\0") !== false
            || !is_string($temporary) || !is_file($temporary) || !is_readable($temporary)
            || ($upload['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
            throw new \InvalidArgumentException('Choose an image file that uploaded successfully.', 400);
        }
        $name = sanitize_file_name($name);
        MapAssetCatalog::imageDimensions($temporary, $name);
        $body = file_get_contents($temporary);
        if ($body === false) throw new \InvalidArgumentException('The uploaded image could not be read.', 400);
        $file = new File(array('name' => $name));
        $file->setBody($body);
        $file = $this->images->createUnique($file);
        return $this->catalog->imageMetadata($file->relativeUrl);
    }

    public function createSvg(string $source): array
    {
        $image = $this->catalog->readImage($source);
        $file = new SVGFile(array('name' => pathinfo($image['name'], PATHINFO_FILENAME) . '.svg'));
        $file->setBody($image['sourceKind'] === 'svg' ? SVGFile::sanitize($image['body']) : self::wrapper($image['body'], $image['dimensions']));
        $file = $this->svgs->createUnique($file);
        return $this->catalog->svgMetadata($file->relativeUrl);
    }

    public static function wrapper(string $body, array $dimensions): string
    {
        $width = $dimensions['width'];
        $height = $dimensions['height'];
        $dataUrl = 'data:' . $dimensions['mimeType'] . ';base64,' . base64_encode($body);
        return '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' . "\n" .
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:mapsvg="http://mapsvg.com" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="' . $width . '" height="' . $height . '">' .
            '<image id="mapsvg-image-background" class="mapsvg-image-background" xlink:href="' . $dataUrl . '" x="0" y="0" width="' . $width . '" height="' . $height . '"></image></svg>';
    }
}
