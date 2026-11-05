<?php

namespace MapSVG;

/** Authoritative creation assets: local bundled maps and MapSVG uploads only. */
final class MapAssetCatalog
{
    private $roots;
    private $managed;

    public function __construct(?array $roots = null)
    {
        $this->managed = $roots === null;
        $this->roots = $roots ?? array(
            array('directory' => MAPSVG_MAPS_DIR, 'url' => MAPSVG_MAPS_URL, 'origin' => 'library'),
            array('directory' => MAPSVG_UPLOADS_DIR, 'url' => MAPSVG_UPLOADS_URL, 'origin' => 'uploads'),
        );
    }

    public function svgFiles(): array
    {
        $files = $this->files('svg');
        if ($this->managed) {
            $registry = new SvgAssetRegistry();
            if ($registry->available()) $files = $registry->mergeCatalog($files);
        }
        usort($files, static function ($a, $b) { return strnatcasecmp($a['pathShort'], $b['pathShort']); });
        return $files;
    }
    /** Image maps use only files directly inside MapSVG uploads, never marker/nested libraries. */
    public function imageFiles(): array
    {
        $result = array();
        foreach ($this->roots as $root) {
            if ($root['origin'] !== 'uploads' || !is_dir($root['directory'])) continue;
            try {
                foreach (new \DirectoryIterator($root['directory']) as $entry) {
                    if (!$entry->isFile() || !in_array(strtolower($entry->getExtension()), array('png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'), true)) continue;
                    $source = rtrim((string) parse_url($root['url'], PHP_URL_PATH), '/') . '/' . $entry->getFilename();
                    try { $result[] = $this->imageMetadata($source); }
                    catch (\InvalidArgumentException $error) { /* Unsupported or out-of-root files are not image choices. */ }
                }
            } catch (\UnexpectedValueException $error) { /* An unavailable uploads directory is empty. */ }
        }
        usort($result, static function (array $a, array $b): int { return strnatcasecmp($a['pathShort'], $b['pathShort']); });
        return $result;
    }

    private function files(string $kind): array
    {
        $result = array();
        foreach ($this->roots as $root) {
            if (!is_dir($root['directory'])) continue;
            try {
                $iterator = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator(
                    $root['directory'], \FilesystemIterator::SKIP_DOTS
                ));
                foreach ($iterator as $entry) {
                    if (!$entry->isFile()) continue;
                    if (strpos(str_replace(DIRECTORY_SEPARATOR, '/', $entry->getPathname()), '/svg-registry/') !== false) continue;
                    $extension = strtolower($entry->getExtension());
                    if ($kind === 'svg' ? $extension !== 'svg' : !in_array($extension, array('png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'), true)) continue;
                    $relative = substr($entry->getPathname(), strlen(rtrim($root['directory'], DIRECTORY_SEPARATOR)) + 1);
                    $source = rtrim((string) parse_url($root['url'], PHP_URL_PATH), '/') . '/' . str_replace(DIRECTORY_SEPARATOR, '/', $relative);
                    try { $result[] = $kind === 'svg' ? $this->svgMetadata($source) : $this->imageMetadata($source); }
                    catch (\InvalidArgumentException $error) { /* Broken or out-of-root files are not creation choices. */ }
                }
            } catch (\UnexpectedValueException $error) { /* An unavailable optional library is empty. */ }
        }
        usort($result, static function (array $a, array $b): int { return strnatcasecmp($a['pathShort'], $b['pathShort']); });
        return $result;
    }

    /** Resolve root-relative URLs using real paths, never network fetching or File's permissive conversion. */
    private function resolve(string $source): array
    {
        if ($source === '' || substr($source, 0, 1) !== '/' || parse_url($source, PHP_URL_PATH) !== $source
            || strpos($source, "\0") !== false || strpos($source, '\\') !== false
            || preg_match('~(?:^|/)\.\.(?:/|$)~', $source)) {
            throw new \InvalidArgumentException('Choose an existing local MapSVG file.', 400);
        }
        foreach ($this->roots as $root) {
            $urlPath = rtrim((string) parse_url($root['url'], PHP_URL_PATH), '/') . '/';
            if (strpos($source, $urlPath) !== 0) continue;
            $directory = realpath($root['directory']);
            $relative = substr($source, strlen($urlPath));
            $path = realpath(rtrim($root['directory'], DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $relative);
            if ($directory === false || $path === false || strpos($path, $directory . DIRECTORY_SEPARATOR) !== 0
                || !is_file($path) || !is_readable($path)) break;
            return array('path' => $path, 'name' => basename($path), 'relativeUrl' => $source,
                'pathShort' => ($root['origin'] === 'uploads' ? 'uploads/' : '') . $relative, 'origin' => $root['origin']);
        }
        throw new \InvalidArgumentException('The file does not exist in the MapSVG catalog.', 400);
    }

    /** A lexical root file and its resolved target must both be direct uploads children. */
    private function resolveImage(string $source): array
    {
        $resolved = $this->resolve($source);
        if ($resolved['origin'] === 'uploads') {
            foreach ($this->roots as $root) {
                if ($root['origin'] !== 'uploads') continue;
                $urlPath = rtrim((string) parse_url($root['url'], PHP_URL_PATH), '/') . '/';
                if (strpos($source, $urlPath) !== 0) continue;
                $relative = substr($source, strlen($urlPath));
                if ($relative !== '' && strpos($relative, '/') === false
                    && dirname($resolved['path']) === realpath($root['directory'])) return $resolved;
            }
        }
        throw new \InvalidArgumentException('Choose an image directly from the MapSVG uploads folder.', 400);
    }

    public function imageMetadata(string $source): array
    {
        $resolved = $this->resolveImage($source);
        if (strtolower(pathinfo($resolved['name'], PATHINFO_EXTENSION)) === 'svg') {
            $svg = self::svgDocument((string) file_get_contents($resolved['path']));
            if (!count($svg->xpath('//*[local-name()="image" and @id="mapsvg-image-background"]'))) {
                throw new \InvalidArgumentException('The SVG is not an image Map.', 400);
            }
            $size = self::svgDimensions($svg);
            $size['mimeType'] = 'image/svg+xml';
            $size['sourceKind'] = 'svg';
        } else {
            $size = self::imageDimensions($resolved['path'], $resolved['name']);
            $size['sourceKind'] = 'raster';
        }
        unset($resolved['path']);
        return array_merge($resolved, $size);
    }

    public function readImage(string $source): array
    {
        $metadata = $this->imageMetadata($source);
        $resolved = $this->resolveImage($source);
        $body = file_get_contents($resolved['path']);
        if ($body === false) throw new \InvalidArgumentException('The image could not be read.', 400);
        return array('name' => $resolved['name'], 'body' => $body, 'dimensions' => $metadata,
            'sourceKind' => $metadata['sourceKind']);
    }

    public function readSvg(string $source, ?int $maxBytes = null): array
    {
        $resolved = $this->resolve($source);
        if ($maxBytes !== null && filesize($resolved['path']) > $maxBytes) throw new \LengthException('SVG exceeds the supported size.', 413);
        $metadata = $this->svgMetadata($source);
        $body = file_get_contents($resolved['path']);
        if ($body === false) throw new \InvalidArgumentException('The SVG could not be read.', 400);
        self::svgDocument($body);
        return array('name' => $resolved['name'], 'body' => $body, 'metadata' => $metadata);
    }

    public static function svgDocument(string $body): \SimpleXMLElement
    {
        if ($body === '' || preg_match('/<!\s*(?:DOCTYPE|ENTITY)\b/i', $body)) {
            throw new \InvalidArgumentException('The SVG contains unsupported XML.', 400);
        }
        $previous = libxml_use_internal_errors(true);
        try { $svg = simplexml_load_string($body, 'SimpleXMLElement', LIBXML_NONET); }
        finally { libxml_clear_errors(); libxml_use_internal_errors($previous); }
        if ($svg === false || $svg->getName() !== 'svg' || ($svg->getDocNamespaces()[''] ?? '') !== 'http://www.w3.org/2000/svg') {
            throw new \InvalidArgumentException('The file is not a valid SVG document.', 400);
        }
        return $svg;
    }

    private static function svgDimensions(\SimpleXMLElement $svg): array
    {
        $width = preg_replace('/px$/i', '', trim((string) $svg['width']));
        $height = preg_replace('/px$/i', '', trim((string) $svg['height']));
        if (!is_numeric($width) || !is_numeric($height) || !is_finite((float) $width) || !is_finite((float) $height) || (float) $width <= 0 || (float) $height <= 0) {
            $parts = preg_split('/[\s,]+/', trim((string) $svg['viewBox']));
            if (count($parts) !== 4 || !is_numeric($parts[2]) || !is_numeric($parts[3]) || !is_finite((float) $parts[2]) || !is_finite((float) $parts[3]) || (float) $parts[2] <= 0 || (float) $parts[3] <= 0) {
                throw new \InvalidArgumentException('The image SVG needs positive dimensions.', 400);
            }
            $width = $parts[2]; $height = $parts[3];
        }
        return array('width' => (float) $width, 'height' => (float) $height);
    }

    /** Browser MIME and filename alone are not the image contract. */
    public static function imageDimensions(string $path, string $name): array
    {
        $size = @getimagesize($path);
        $types = array(IMAGETYPE_PNG => array('image/png', array('png')),
            IMAGETYPE_JPEG => array('image/jpeg', array('jpg', 'jpeg')),
            IMAGETYPE_GIF => array('image/gif', array('gif')),
            IMAGETYPE_WEBP => array('image/webp', array('webp')));
        if (!$size || !isset($types[$size[2]]) || $size[0] <= 0 || $size[1] <= 0
            || !in_array(strtolower(pathinfo($name, PATHINFO_EXTENSION)), $types[$size[2]][1], true)) {
            throw new \InvalidArgumentException('Choose a valid PNG, JPEG, GIF or WebP image with a matching filename.', 400);
        }
        return array('width' => (int) $size[0], 'height' => (int) $size[1], 'mimeType' => $types[$size[2]][0]);
    }

    public function svgMetadata(string $source): array
    {
        $resolved = $this->resolve($source);
        if (strtolower(pathinfo($resolved['name'], PATHINFO_EXTENSION)) !== 'svg') {
            throw new \InvalidArgumentException('Choose an SVG file.', 400);
        }
        $body = file_get_contents($resolved['path']);
        // Retain local catalog choices with legacy DTD declarations (including commented
        // declarations), without parsing or fetching their DTD/entity metadata. Preparation stays strict.
        if ($body !== false && preg_match('/<!\s*(?:DOCTYPE|ENTITY)\b/i', $body)) {
            unset($resolved['path']);
            return array_merge($resolved, array('geoCalibrated' => false, 'googleOverlay' => false));
        }
        $metadata = self::svgBodyMetadata($body === false ? '' : $body);
        unset($resolved['path']);
        return array_merge($resolved, $metadata);
    }

    /** Classify the retained template bytes before upload persistence as well as catalog reads. */
    public static function svgBodyMetadata(string $body, bool $requireDecodedScreenshot = false): array
    {
        $svg = self::svgDocument($body);
        $attributes = $svg->attributes('http://mapsvg.com');
        $parts = preg_split('/[\s,]+/', trim((string) ($attributes['geoViewBox'] ?? '')));
        $geoCalibrated = count($parts) === 4;
        if ($geoCalibrated) {
            foreach ($parts as $part) if (!is_numeric($part) || !is_finite((float) $part)) $geoCalibrated = false;
            if ($geoCalibrated && ((float) $parts[1] <= (float) $parts[3] || (float) $parts[0] === (float) $parts[2])) $geoCalibrated = false;
        }
        $googleOverlay = false;
        if ($geoCalibrated) {
            $svg->registerXPathNamespace('s', 'http://www.w3.org/2000/svg');
            foreach ($svg->xpath('//s:image[@id="mapsvg-google-map-background"]') as $image) {
                $width = preg_replace('/px$/i', '', trim((string) $image['width']));
                $height = preg_replace('/px$/i', '', trim((string) $image['height']));
                if (!is_numeric($width) || !is_numeric($height) || !is_finite((float) $width)
                    || !is_finite((float) $height) || (float) $width <= 0 || (float) $height <= 0) continue;
                // SVG2 href takes precedence over the retained export's xlink:href.
                $href = isset($image['href']) ? (string) $image['href'] : (string) $image->attributes('http://www.w3.org/1999/xlink')['href'];
                if (!preg_match('~^data:image/png;base64,([A-Za-z0-9+/=\s]+)$~D', $href, $match)) continue;
                $png = base64_decode($match[1], true);
                if ($png !== false && self::decodablePng($png, $requireDecodedScreenshot)) { $googleOverlay = true; break; }
            }
        }
        return array('geoCalibrated' => $geoCalibrated, 'googleOverlay' => $googleOverlay);
    }

    /** Standard image decoders validate payload bytes; catalog reads tolerate absent optional decoders. */
    private static function decodablePng(string $png, bool $requireDecoded): bool
    {
        if (substr($png, 0, 8) !== "\x89PNG\r\n\x1a\n") return false;
        $size = @getimagesizefromstring($png);
        if (!$size || $size[2] !== IMAGETYPE_PNG || $size[0] <= 0 || $size[1] <= 0) return false;
        if (function_exists('imagecreatefromstring')) {
            $image = @imagecreatefromstring($png);
            if ($image === false) return false;
            imagedestroy($image);
            return true;
        }
        if (class_exists('Imagick')) {
            $image = new \Imagick();
            try {
                $image->readImageBlob($png);
                return $image->getImageFormat() === 'PNG' && $image->getImageWidth() > 0 && $image->getImageHeight() > 0;
            } catch (\Exception $error) { return false; }
            finally { $image->clear(); }
        }
        if ($requireDecoded) throw new \InvalidArgumentException('Google overlay upload needs PNG image decoding support (GD or Imagick) on this server.', 400);
        return true;
    }
}
