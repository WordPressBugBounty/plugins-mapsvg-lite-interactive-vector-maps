<?php

namespace MapSVG;

/** Resource identity is independent of Apps. Revision URLs always identify fixed bytes. */
final class SvgAssetRegistry
{
    private $db;
    private $assets;
    private $revisions;
    private $createdFiles = [];

    public function __construct($db = null)
    {
        $this->db = $db ?: Database::get();
        $prefix = $this->db->mapsvg_prefix;
        if (!preg_match('/\A[A-Za-z0-9_]+\z/D', $prefix)) throw new \InvalidArgumentException('Invalid SVG storage prefix.');
        $this->assets = $prefix . 'svg_assets';
        $this->revisions = $prefix . 'svg_asset_revisions';
    }

    public function available(): bool
    {
        foreach ([$this->assets, $this->revisions] as $table) {
            if (!$this->db->get_var($this->db->prepare('SHOW TABLES LIKE %s', $this->db->esc_like($table)))) return false;
        }
        return true;
    }

    public static function managedSource(string $source): bool
    {
        $path = preg_replace('~/+~', '/', rawurldecode((string) wp_parse_url($source, PHP_URL_PATH)));
        $root = preg_replace('~/+~', '/', rawurldecode((string) wp_parse_url(MAPSVG_UPLOADS_URL, PHP_URL_PATH)));
        return strpos($path, rtrim($root, '/') . '/svg-registry/') === 0;
    }

    private function sql(string $sql)
    {
        $result = $this->db->query($sql);
        if ($result === false) throw new \RuntimeException('SVG registry write failed.', 500);
        return $result;
    }

    /** Standalone mutations own the transaction; App SVG Save uses appendInTransaction. */
    private function atomic(callable $operation)
    {
        return AppSvgReferenceLock::run($this->db, function () use ($operation) {
            $this->sql('START TRANSACTION');
            try {
                $result = $operation();
                $this->sql('COMMIT');
                $this->createdFiles = [];
                return $result;
            } catch (\Throwable $error) {
                $this->db->query('ROLLBACK');
                $this->rollbackFiles();
                throw $error;
            }
        });
    }

    public function rollbackFiles(): void
    {
        foreach ($this->createdFiles as $path) {
            $source = rtrim((string) wp_parse_url(MAPSVG_UPLOADS_URL, PHP_URL_PATH), '/') . '/svg-registry/' . basename($path);
            // A failed COMMIT can have an unknown outcome. Delete only after a fresh
            // successful read proves no committed revision references this owned file.
            $count = $this->db->get_var($this->db->prepare("SELECT COUNT(*) FROM `{$this->revisions}` WHERE source_key=%s", hash('sha256', $source)));
            if ($count !== null && (string) $count === '0' && empty($this->db->last_error)) @unlink($path);
        }
        $this->createdFiles = [];
    }

    private function revisionRow(int $id): array
    {
        $row = $this->db->get_row($this->db->prepare("SELECT r.*,a.name,a.origin,a.origin_source,a.latest_revision_id FROM `{$this->revisions}` r INNER JOIN `{$this->assets}` a ON a.id=r.asset_id WHERE r.id=%d", $id), ARRAY_A);
        if (!$row) throw new \OutOfBoundsException('SVG revision not found.', 404);
        foreach (['id', 'asset_id', 'parent_revision_id', 'latest_revision_id', 'author_id'] as $key) if (isset($row[$key])) $row[$key] = (int) $row[$key];
        return $row;
    }

    public function metadata(array $row): array
    {
        $metadata = (new MapAssetCatalog())->svgMetadata($row['source']);
        return array_merge($metadata, ['name' => $row['name'], 'pathShort' => ($row['origin'] === 'uploads' ? 'uploads/' : '') . $row['name'],
            'origin' => $row['origin'], 'assetId' => (int) $row['asset_id'], 'revisionId' => (int) $row['id'],
            'originalUrl' => $row['origin_source'], 'contentHash' => $row['content_hash'], 'createdAt' => $row['created_at']]);
    }

    public function findSource(string $source): ?array
    {
        $id = $this->db->get_var($this->db->prepare("SELECT id FROM `{$this->revisions}` WHERE source_key=%s AND BINARY source=BINARY %s", hash('sha256', $source), $source));
        return $id ? $this->revisionRow((int) $id) : null;
    }

    /** Import is idempotent by exact source and bytes, never filename similarity. */
    public function importSource(string $source, ?string $name = null): array
    {
        return $this->atomic(function () use ($source, $name) { return $this->ensureSource($source, $name); });
    }

    private function ensureSource(string $source, ?string $name = null): array
    {
        $original = (new MapAssetCatalog())->readSvg($source, 8 * 1024 * 1024);
        $body = $original['body'];
        if (strlen($body) > 8 * 1024 * 1024) throw new \LengthException('SVG exceeds 8 MiB.', 413);
        $existing = $this->findSource($source);
        if ($existing) {
            if (!hash_equals($existing['content_hash'], hash('sha256', $body))) throw new \RuntimeException('Registered SVG bytes changed outside the editor.', 409);
            return $existing;
        }
        if (self::managedSource($source)) throw new \RuntimeException('This SVG revision is not registered.', 409);
        $asset = $this->db->get_row($this->db->prepare("SELECT * FROM `{$this->assets}` WHERE origin_key=%s", hash('sha256', $source)), ARRAY_A);
        if (!$asset) {
            $assetId = $this->createAsset($name ?? $original['name'], $original['metadata']['origin'], $source);
        } else {
            $assetId = (int) $asset['id'];
            $matching = $this->db->get_var($this->db->prepare("SELECT id FROM `{$this->revisions}` WHERE asset_id=%d AND content_hash=%s ORDER BY id LIMIT 1", $assetId, hash('sha256', $body)));
            if ($matching) return $this->revisionRow((int) $matching); // Never move a newer head backwards during backfill.
        }
        return $this->addRevision($assetId, isset($asset['latest_revision_id']) ? (int) $asset['latest_revision_id'] : null, $body);
    }

    private function createAsset(string $name, string $origin, ?string $source, ?int $parent = null): int
    {
        $name = trim(sanitize_text_field($name));
        if ($name === '' || strlen($name) > 255) throw new \InvalidArgumentException('SVG name must be 1–255 bytes.', 400);
        $now = gmdate('Y-m-d H:i:s');
        if ($this->db->insert($this->assets, ['name' => $name, 'origin' => $origin, 'origin_source' => $source,
            'origin_key' => hash('sha256', $source ?? wp_generate_uuid4()), 'derived_from_asset_id' => $parent,
            'created_at' => $now, 'updated_at' => $now]) === false) throw new \RuntimeException('Cannot register SVG resource.', 500);
        return (int) $this->db->insert_id;
    }

    private function addRevision(int $assetId, ?int $parent, string $body): array
    {
        SVGFileController::svgGeometry($body);
        $root = realpath(MAPSVG_UPLOADS_DIR);
        if ($root === false && (!wp_mkdir_p(MAPSVG_UPLOADS_DIR) || ($root = realpath(MAPSVG_UPLOADS_DIR)) === false)) throw new \RuntimeException('Cannot create SVG uploads directory.', 500);
        $directory = $root . '/svg-registry';
        if ((!is_dir($directory) && !wp_mkdir_p($directory)) || is_link($directory) || dirname((string) realpath($directory)) !== $root) throw new \RuntimeException('Invalid SVG registry directory.', 500);
        $path = $directory . '/' . wp_generate_uuid4() . '.svg';
        $handle = @fopen($path, 'xb');
        if (!$handle) throw new \RuntimeException('Cannot reserve SVG revision file.', 500);
        $this->createdFiles[] = $path;
        try {
            if (fwrite($handle, $body) !== strlen($body) || !fflush($handle)) throw new \RuntimeException('Cannot write SVG revision.', 500);
        } finally { fclose($handle); }
        if (!chmod($path, defined('FS_CHMOD_FILE') ? FS_CHMOD_FILE : 0644)) throw new \RuntimeException('Cannot finish SVG revision.', 500);
        $source = rtrim((string) wp_parse_url(MAPSVG_UPLOADS_URL, PHP_URL_PATH), '/') . '/svg-registry/' . basename($path);
        $now = gmdate('Y-m-d H:i:s');
        if ($this->db->insert($this->revisions, ['asset_id' => $assetId, 'parent_revision_id' => $parent, 'source' => $source,
            'source_key' => hash('sha256', $source), 'content_hash' => hash('sha256', $body), 'author_id' => get_current_user_id(), 'created_at' => $now]) === false) throw new \RuntimeException('Cannot register SVG revision.', 500);
        $id = (int) $this->db->insert_id;
        $this->sql($this->db->prepare("UPDATE `{$this->assets}` SET latest_revision_id=%d,updated_at=%s WHERE id=%d", $id, $now, $assetId));
        return $this->revisionRow($id);
    }

    /** Caller owns the App/reference lock and SQL transaction, and must roll back files on failure. */
    public function appendInTransaction(string $source, string $body): array
    {
        $base = $this->ensureSource($source);
        if (hash_equals($base['content_hash'], hash('sha256', $body))) return $base;
        $assetId = (int) $base['asset_id'];
        // Editing a bundled template creates an uploaded resource; stock choices stay original.
        if ($base['origin'] === 'library') $assetId = $this->createAsset($base['name'], 'uploads', null, $assetId);
        return $this->addRevision($assetId, $assetId === $base['asset_id'] ? $base['id'] : null, $body);
    }

    public static function selection(array $row): array
    {
        return ['id' => (int) $row['asset_id'], 'revisionId' => (int) $row['id'], 'name' => $row['name']];
    }

    public function pinOptions(array $options): array
    {
        $source = $options['source'] ?? '';
        if (!is_string($source) || $source === '' || !$this->available()) return $options;
        try { (new MapAssetCatalog())->readSvg($source, 8 * 1024 * 1024); }
        catch (\InvalidArgumentException $error) { unset($options['svgAsset']); return $options; } // Retain non-catalog/legacy sources.
        $selection = isset($options['svgAsset']) ? (array) $options['svgAsset'] : [];
        $revision = $this->importSource($source, is_string($selection['name'] ?? null) ? $selection['name'] : null);
        $options['source'] = $revision['source'];
        $options['svgAsset'] = self::selection($revision);
        return $options;
    }

    public function latest(int $assetId): array
    {
        $id = $this->db->get_var($this->db->prepare("SELECT latest_revision_id FROM `{$this->assets}` WHERE id=%d", $assetId));
        if (!$id) throw new \OutOfBoundsException('SVG resource not found.', 404);
        return $this->revisionRow((int) $id);
    }

    /** Source is the compatibility authority; clients cannot invent a different resource/revision. */
    public function withSelection(array $options): array
    {
        if (!$this->available()) return $options;
        $row = $this->findSource(is_string($options['source'] ?? null) ? $options['source'] : '');
        if ($row) $options['svgAsset'] = self::selection($row);
        else unset($options['svgAsset']);
        return $options;
    }

    public function catalog(int $after = 0, int $limit = 100): array
    {
        $limit = max(1, min(200, $limit));
        $rows = $this->db->get_results($this->db->prepare("SELECT id,latest_revision_id FROM `{$this->assets}` WHERE origin='uploads' AND id>%d ORDER BY id LIMIT %d", $after, $limit + 1), ARRAY_A) ?: [];
        $more = count($rows) > $limit;
        $rows = array_slice($rows, 0, $limit);
        $result = [];
        foreach ($rows as $row) {
            try { $result[] = $this->metadata($this->revisionRow((int) $row['latest_revision_id'])); }
            catch (\InvalidArgumentException $error) { /* Unavailable files do not become choices. */ }
        }
        return ['files' => $result, 'nextAfter' => $more && $rows ? (int) end($rows)['id'] : null];
    }

    public function mergeCatalog(array $files): array
    {
        $registered = [];
        $after = 0;
        do {
            $page = $this->catalog($after, 200);
            $registered = array_merge($registered, $page['files']);
            $after = $page['nextAfter'];
        } while ($after !== null);
        $originals = array_fill_keys(array_filter(array_column($registered, 'originalUrl')), true);
        $files = array_values(array_filter($files, static function ($file) use ($originals) {
            return !self::managedSource($file['relativeUrl']) && !isset($originals[$file['relativeUrl']]);
        }));
        return array_merge($files, $registered);
    }

    public function history(int $assetId, int $before = PHP_INT_MAX, int $limit = 50): array
    {
        $this->latest($assetId);
        $rows = $this->db->get_results($this->db->prepare("SELECT id FROM `{$this->revisions}` WHERE asset_id=%d AND id<%d ORDER BY id DESC LIMIT %d", $assetId, $before, max(1, min(100, $limit))), ARRAY_A);
        return array_map(function ($row) { return $this->metadata($this->revisionRow((int) $row['id'])); }, $rows ?: []);
    }

    /** Legacy files get separate resources; migration never infers a family from names. */
    public function backfillUploads(): void
    {
        $catalog = new MapAssetCatalog([['directory' => MAPSVG_UPLOADS_DIR, 'url' => MAPSVG_UPLOADS_URL, 'origin' => 'uploads']]);
        foreach ($catalog->svgFiles() as $file) {
            if (self::managedSource($file['relativeUrl'])) continue;
            try { $this->importSource($file['relativeUrl'], $file['name']); }
            catch (\InvalidArgumentException | \LengthException $error) { Logger::error('SVG registry backfill retained unsupported source: ' . $file['relativeUrl']); }
        }
    }
}
