<?php

namespace MapSVG;

/** Filesystem half of a draft SVG save. Caller owns the reference/revision lock. */
final class AppDraftSvgFile
{
    private $file;
    private $original;
    private $geometry;
    private $replaced = false;
    private $registry;

    public function __construct(string $source, string $svg, ?SvgAssetRegistry $registry = null)
    {
        $this->registry = $registry;
        if ($svg === '' || strlen($svg) > 8 * 1024 * 1024) throw new \InvalidArgumentException('SVG must be nonempty and at most 8 MiB.', 413);
        list($this->file) = SVGFileController::readMapSource($source);
        $this->original = file_get_contents($this->file->serverPath);
        if ($this->original === false) throw new \RuntimeException('Cannot read the original SVG.', 500);
        $this->file->setBody($svg);
        $this->file->maybeSanitize(current_user_can('unfiltered_html'));
        $this->geometry = SVGFileController::svgGeometry($this->file->body);
    }

    public function path(): string { return (string) realpath($this->file->serverPath); }
    public function contents(): string { return $this->file->body; }

    /** Include canonical/absolute/encoded/query aliases and Scene/source overrides. */
    public static function references($value, string $target): bool
    {
        if (is_object($value) || is_array($value)) {
            foreach ($value as $child) if (self::references($child, $target)) return true;
            return false;
        }
        if (!is_string($value) || ($value[0] ?? '') !== '/' && !preg_match('~^https?://~i', $value)) return false;
        $path = wp_parse_url($value, PHP_URL_PATH);
        if (!is_string($path)) return false;
        $path = rawurldecode($path);
        if (strpos($path, "\0") !== false) return false;
        foreach ([MAPSVG_UPLOADS_DIR => MAPSVG_UPLOADS_URL, MAPSVG_MAPS_DIR => MAPSVG_MAPS_URL] as $directory => $url) {
            $prefix = rtrim((string) wp_parse_url($url, PHP_URL_PATH), '/') . '/';
            if (strpos($path, $prefix) === 0 && realpath($directory . DIRECTORY_SEPARATOR . substr($path, strlen($prefix))) === $target) return true;
        }
        return false;
    }

    public function save(bool $exclusive, int $previous): array
    {
        if ($this->registry) {
            $row = $this->registry->appendInTransaction($this->file->relativeUrl, $this->file->body);
            $saved = new SVGFile(['relativeUrl' => $row['source']]);
            return ['source' => $row['source'], 'svgAsset' => SvgAssetRegistry::selection($row),
                'svgFileLastChanged' => $saved->cacheBuster($previous), 'geometry' => $this->geometry,
                'reused' => $row['source'] === $this->file->relativeUrl];
        }
        $root = realpath(MAPSVG_UPLOADS_DIR);
        $reused = $exclusive && !SvgAssetRegistry::managedSource($this->file->relativeUrl) && $root !== false && strpos($this->path(), $root . DIRECTORY_SEPARATOR) === 0;
        if ($reused) {
            $this->replace($this->file->body);
            $this->replaced = true;
            $saved = $this->file;
        } else {
            $saved = new SVGFile(['name' => 'draft.svg']);
            $saved->setBody($this->file->body);
            (new SVGFileRepository())->createUnique($saved);
        }
        return ['source' => $saved->relativeUrl, 'svgFileLastChanged' => $saved->cacheBuster($previous),
            'geometry' => $this->geometry, 'reused' => $reused];
    }

    /** Atomic replacement prevents readers from receiving partially written XML. */
    private function replace(string $body): void
    {
        $path = $this->path();
        $temporary = tempnam(dirname($path), '.mapsvg-svg-');
        if ($temporary === false) throw new \RuntimeException('Cannot stage the SVG file.', 500);
        try {
            if (file_put_contents($temporary, $body, LOCK_EX) !== strlen($body)
                || !chmod($temporary, defined('FS_CHMOD_FILE') ? FS_CHMOD_FILE : 0644)
                || !rename($temporary, $path)) throw new \RuntimeException('Cannot replace the draft SVG file.', 500);
            clearstatcache(true, $path);
        } finally { if (is_file($temporary)) unlink($temporary); }
    }

    public function rollback(): void
    {
        if ($this->registry) $this->registry->rollbackFiles();
        if ($this->replaced) $this->replace($this->original);
        // A new upload is retained on an uncertain DB outcome; it cannot damage an old reference.
    }
}
