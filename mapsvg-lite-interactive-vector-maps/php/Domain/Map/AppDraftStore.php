<?php

namespace MapSVG;

/** Full authoring records. Collections, Queries and their rows are referenced, never copied. */
final class AppDraftStore
{
    private $db;
    private $maps;
    private $drafts;
    private $versions;
    private $liveVersions;

    public function __construct($db = null)
    {
        $this->db = $db ?: Database::get();
        $prefix = $this->db->mapsvg_prefix;
        if (!preg_match('/\A[A-Za-z0-9_]+\z/D', $prefix)) {
            throw new \InvalidArgumentException('Invalid MapSVG table prefix.');
        }
        $this->maps = $prefix . 'maps';
        $this->drafts = $prefix . 'map_drafts';
        $this->versions = $prefix . 'map_versions';
        $this->liveVersions = $prefix . 'map_live_versions';
    }

    private function sql(string $sql)
    {
        $result = $this->db->query($sql);
        if ($result === false) throw new \RuntimeException('App storage write failed.', 500);
        return $result;
    }

    private function atomic(callable $operation)
    {
        return AppSvgReferenceLock::run($this->db, function () use ($operation) {
            $this->sql('START TRANSACTION');
            try {
                $result = $operation();
                $this->sql('COMMIT');
                return $result;
            } catch (\Throwable $error) {
                $this->db->query('ROLLBACK');
                throw $error;
            }
        });
    }

    private function production(int $mapId, bool $lock = false): array
    {
        $row = $this->db->get_row($this->db->prepare("SELECT * FROM `{$this->maps}` WHERE id=%d" . ($lock ? ' FOR UPDATE' : ''), $mapId), ARRAY_A);
        if (!$row) throw new \RuntimeException('App not found.', 404);
        $nativeOptions = json_decode($row['options']);
        $row['options'] = $nativeOptions instanceof \stdClass ? (array) $nativeOptions : null;
        if (!is_array($row['options'])) throw new \RuntimeException('Published App JSON is invalid.', 422);
        $row['id'] = $mapId;
        return $row;
    }

    private function lockApp(int $mapId): void
    {
        if (!$this->db->get_var($this->db->prepare("SELECT id FROM `{$this->maps}` WHERE id=%d FOR UPDATE", $mapId))) {
            throw new \RuntimeException('App not found.', 404);
        }
    }

    /** Preserve nested JSON object/array identity, including empty dictionaries and opaque code data. */
    public static function decodeSnapshot(string $json): array
    {
        $native = json_decode($json);
        if (!$native instanceof \stdClass || !isset($native->options) || !$native->options instanceof \stdClass) {
            throw new \InvalidArgumentException('Invalid complete App snapshot.', 400);
        }
        $record = (array) $native;
        $record['options'] = (array) $native->options;
        return $record;
    }

    public static function snapshot(array $record, int $mapId): array
    {
        if (!isset($record['options']) || !is_array($record['options'])) {
            throw new \InvalidArgumentException('A complete App snapshot is required.', 400);
        }
        $record['id'] = $mapId;
        if ((int) ($record['options'][AppEngine::KEY] ?? 9) !== 8) unset($record['options']['useShadowRoot']);
        // Runtime record metadata is retained; title/source columns follow the authoring document.
        $record['title'] = (string) ($record['options']['title'] ?? $record['title'] ?? '');
        $record['svgFilePath'] = (string) ($record['options']['source'] ?? '');
        foreach (['svgFilePath', 'source'] as $field) {
            $path = $field === 'source' ? $record['options']['source'] ?? '' : $record[$field];
            if (!is_string($path) || strpos($path, '../') !== false || strpos($path, '..\\') !== false) {
                throw new \InvalidArgumentException('Invalid App source path.', 400);
            }
        }
        return $record;
    }

    private function json(array $record): string
    {
        $json = wp_json_encode($record, JSON_UNESCAPED_UNICODE);
        if ($json === false || strlen($json) > 8 * 1024 * 1024) {
            throw new \InvalidArgumentException('App snapshot is invalid or exceeds 8 MiB.', 413);
        }
        return $json;
    }

    private function decode(array $row): array
    {
        foreach (['id', 'map_id', 'draft_id', 'revision', 'author_id', 'source_version_id'] as $key) {
            if (isset($row[$key])) $row[$key] = (int) $row[$key];
        }
        if (array_key_exists('migration', $row)) $row['migration'] = (bool) $row['migration'];
        if (isset($row['snapshot'])) $row['snapshot'] = self::decodeSnapshot($row['snapshot']);
        return $row;
    }

    public function get(int $mapId, int $draftId): array
    {
        $row = $this->db->get_row($this->db->prepare("SELECT * FROM `{$this->drafts}` WHERE id=%d AND map_id=%d AND deleted_at IS NULL", $draftId, $mapId), ARRAY_A);
        if (!$row) throw new \RuntimeException('Draft not found in this App.', 404);
        return $this->decode($row);
    }

    public function version(int $mapId, int $versionId): array
    {
        $row = $this->db->get_row($this->db->prepare("SELECT * FROM `{$this->versions}` WHERE id=%d AND map_id=%d", $versionId, $mapId), ARRAY_A);
        if (!$row) throw new \RuntimeException('Version not found in this App.', 404);
        return $this->decode($row);
    }

    /** Public reads never expose drafts or unpublished restore backups. */
    public function publishedVersion(int $mapId, int $versionId): array
    {
        $row = $this->db->get_row($this->db->prepare("SELECT v.* FROM `{$this->versions}` v WHERE v.id=%d AND v.map_id=%d AND (v.published_at IS NOT NULL OR v.kind='publication' OR EXISTS (SELECT 1 FROM `{$this->liveVersions}` live WHERE live.map_id=v.map_id AND live.version_id=v.id))", $versionId, $mapId), ARRAY_A);
        if (!$row) throw new \OutOfBoundsException('Published version not found in this App.', 404);
        return $this->decode($row);
    }

    /** The version label is mutable metadata; its snapshot and publication identity stay intact. */
    public function renameVersion(int $mapId, int $versionId, string $title, string $expectedTitle): array
    {
        $title = trim($title);
        if ($title === '' || strlen($title) > 255) throw new \InvalidArgumentException('Version name is required (max 255 bytes).', 400);
        return $this->atomic(function () use ($mapId, $versionId, $title, $expectedTitle) {
            $this->lockApp($mapId);
            $version = $this->publishedVersion($mapId, $versionId);
            // An exact retry is harmless after an uncertain network response.
            if ($version['title'] !== $title) {
                if ($version['title'] !== $expectedTitle) throw new \RuntimeException('Version name changed in another tab. Reopen Versions and try again.', 409);
                $affected = $this->sql($this->db->prepare("UPDATE `{$this->versions}` SET title=%s WHERE map_id=%d AND id=%d AND BINARY title=BINARY %s", $title, $mapId, $versionId, $expectedTitle));
                if ($affected !== 1) throw new \RuntimeException('Version name conflict.', 409);
            }
            return ['version_id' => $versionId, 'title' => $title];
        });
    }

    private function addDraft(int $mapId, string $title, array $record, ?int $source, int $author, ?string $legacyKey = null, ?string $baseTitle = null, bool $migration = false): array
    {
        $title = trim($title);
        if (strlen($title) > 255) throw new \InvalidArgumentException('Draft name exceeds 255 bytes.', 400);
        $now = gmdate('Y-m-d H:i:s');
        if ($this->db->insert($this->drafts, [
            'map_id' => $mapId, 'title' => $title, 'snapshot' => $this->json(self::snapshot($record, $mapId)),
            'source_version_id' => $source, 'author_id' => $author, 'created_at' => $now,
            'updated_at' => $now, 'legacy_key' => $legacyKey, 'migration' => $migration ? 1 : 0,
        ]) === false) throw new \RuntimeException('Cannot create App draft.', 500);
        $id = (int) $this->db->insert_id;
        if ($title === '') {
            $suffix = ' draft #' . $id;
            $base = substr($baseTitle ?? (string) ($record['options']['title'] ?? $record['title'] ?? ''), 0, 255 - strlen($suffix));
            // Avoid cutting a multi-byte title in the middle of a UTF-8 character.
            while ($base !== '' && !preg_match('//u', $base)) $base = substr($base, 0, -1);
            $this->sql($this->db->prepare("UPDATE `{$this->drafts}` SET title=%s WHERE id=%d AND map_id=%d", $base . $suffix, $id, $mapId));
        }
        return $this->get($mapId, $id);
    }

    private function addVersion(int $mapId, ?int $draftId, string $title, array $snapshot, ?int $source, int $author, string $kind, ?string $requestId = null): int
    {
        $now = gmdate('Y-m-d H:i:s');
        if ($this->db->insert($this->versions, [
            'map_id' => $mapId, 'draft_id' => $draftId, 'title' => $title,
            'snapshot' => $this->json($snapshot), 'source_version_id' => $source,
            'author_id' => $author, 'created_at' => $now, 'kind' => $kind,
            'published_at' => $kind === 'publication' ? $now : null, 'request_id' => $requestId,
            'engine' => AppEngine::version($snapshot['options']),
        ]) === false) throw new \RuntimeException('Cannot create App version.', 500);
        return (int) $this->db->insert_id;
    }

    private function setLiveVersion(int $mapId, int $versionId, int $author): void
    {
        // Retain first-publication evidence when a backup is activated, including the outgoing
        // pointer from checkouts made before historical public shortcodes were introduced.
        $this->sql($this->db->prepare("UPDATE `{$this->versions}` v INNER JOIN `{$this->liveVersions}` live ON live.map_id=v.map_id AND live.version_id=v.id SET v.published_at=live.updated_at WHERE v.map_id=%d AND v.published_at IS NULL", $mapId));
        $this->sql($this->db->prepare("UPDATE `{$this->versions}` SET published_at=COALESCE(published_at,%s) WHERE id=%d AND map_id=%d", gmdate('Y-m-d H:i:s'), $versionId, $mapId));
        $this->sql($this->db->prepare("INSERT INTO `{$this->liveVersions}` (map_id,version_id,author_id,updated_at) VALUES (%d,%d,%d,%s) ON DUPLICATE KEY UPDATE version_id=VALUES(version_id),author_id=VALUES(author_id),updated_at=VALUES(updated_at)", $mapId, $versionId, $author, gmdate('Y-m-d H:i:s')));
    }

    private function writeProduction(int $mapId, array $snapshot): void
    {
        $options = Map::sanitizeOptionsForWrite($snapshot['options']);
        if ($options != $snapshot['options']) throw new \InvalidArgumentException('App contains invalid output content.', 422);
        $svgRevision = isset($snapshot['svgFileLastChanged']) ? ',svgFileLastChanged=' . max(0, (int) $snapshot['svgFileLastChanged']) : '';
        $this->sql($this->db->prepare("UPDATE `{$this->maps}` SET options=%s,title=%s,svgFilePath=%s{$svgRevision} WHERE id=%d", $this->json($options), $snapshot['title'], $snapshot['svgFilePath'], $mapId));
    }

    /** Idempotent upgrade: immutable v8 baseline first, then a separate v9 working draft. */
    public function migrateEngine(int $mapId, int $author = 0): void
    {
        $source = $this->atomic(function () use ($mapId, $author) {
            $production = $this->production($mapId, true);
            $engine = AppEngine::classify(json_decode(wp_json_encode($production['options']), true));
            if (!isset($production['options'][AppEngine::KEY])) {
                $production['options'][AppEngine::KEY] = $engine;
                $this->sql($this->db->prepare("UPDATE `{$this->maps}` SET options=%s WHERE id=%d", $this->json($production['options']), $mapId));
            }
            if ($engine !== 8) return null;
            $pointer = $this->db->get_var($this->db->prepare("SELECT version_id FROM `{$this->liveVersions}` WHERE map_id=%d", $mapId));
            $versionId = (int) $pointer;
            if (!$versionId) $versionId = (int) $this->db->get_var($this->db->prepare("SELECT id FROM `{$this->versions}` WHERE map_id=%d AND engine=8 ORDER BY id DESC LIMIT 1", $mapId));
            $baseline = $versionId ? $this->version($mapId, $versionId) : null;
            if (!$baseline || (int) $baseline['engine'] !== 8 || $baseline['snapshot']['options'] != $production['options']) {
                $versionId = $this->addVersion($mapId, null, $production['title'], $production, null, $author, $pointer !== null && (int) $pointer === 0 ? 'restore_backup' : 'publication');
            }
            if ($pointer === null || ((int) $pointer > 0 && (int) $pointer !== $versionId)) $this->setLiveVersion($mapId, $versionId, $author);
            return ['production' => $production, 'version' => $versionId];
        });
        if (!$source) return;
        // Baseline is already durable. Failed conversion cannot remove the v8 publication.
        $this->atomic(function () use ($mapId, $author, $source) {
            $this->lockApp($mapId);
            if ($this->db->get_var($this->db->prepare("SELECT id FROM `{$this->drafts}` WHERE legacy_key=%s", 'engine-v9:' . $mapId))) return;
            $draft = AppEngine::toV9($source['production'], $this->db);
            $this->addDraft($mapId, '', $draft, $source['version'], $author, 'engine-v9:' . $mapId, null, true);
        });
    }

    /** Old editor Save publishes v8 immediately. CAS rejects an editor left open across Publish. */
    public function saveLegacy(int $mapId, array $record, int $expectedVersion, int $author): int
    {
        if (!AppDraftController::canEdit($mapId)) throw new \RuntimeException('You cannot edit this App.', 403);
        return $this->atomic(function () use ($mapId, $record, $expectedVersion, $author) {
            $production = $this->production($mapId, true);
            $live = (int) $this->db->get_var($this->db->prepare("SELECT version_id FROM `{$this->liveVersions}` WHERE map_id=%d", $mapId));
            if (AppEngine::version($production['options']) !== 8 || !$expectedVersion || $live !== $expectedVersion) throw new \RuntimeException('The published version changed. Reopen the old editor before saving.', 409);
            $record['options'][AppEngine::KEY] = 8;
            $snapshot = self::snapshot(array_merge($production, $record), $mapId);
            AppCodePolicy::assertUnchanged($snapshot['options'], $production['options']);
            $this->writeProduction($mapId, $snapshot);
            $version = $this->addVersion($mapId, null, $snapshot['title'], $snapshot, $expectedVersion, $author, 'publication');
            $this->setLiveVersion($mapId, $version, $author);
            return $version;
        });
    }

    /** Old Draw saves immediately, but never overwrites an SVG retained by a v9 draft/history. */
    public function saveLegacySvg(int $mapId, string $source, string $svg, int $expectedVersion, int $author): array
    {
        if (!AppDraftController::canEdit($mapId)) throw new \RuntimeException('You cannot edit this App.', 403);
        return AppSvgReferenceLock::run($this->db, function () use ($mapId, $source, $svg, $expectedVersion, $author) {
            $record = $this->production($mapId);
            if (LegacyV8::source($record['options']['source'] ?? '') !== $source) throw new \RuntimeException('The SVG source changed. Reopen the old editor.', 409);
            $file = new AppDraftSvgFile($source, $svg);
            $saved = $file->save(false, (int) ($record['svgFileLastChanged'] ?? 0));
            $record['options']['source'] = $saved['source'];
            $record['svgFileLastChanged'] = $saved['svgFileLastChanged'];
            $version = $this->saveLegacy($mapId, $record, $expectedVersion, $author);
            // Region records are shared data, following v8's immediate Draw behavior.
            $repo = RepositoryFactory::get('map');
            $regionSync = $repo->updateFromSvg($repo->findById($mapId));
            return ['status' => 'OK', 'source' => $saved['source'], 'legacyVersion' => $version, 'svgFileLastChanged' => $saved['svgFileLastChanged'], 'regionSync' => $regionSync];
        });
    }

    /** Initialize a newly created App without treating its seed row as a publication. */
    public function initializeUnpublished(int $mapId, int $author): array
    {
        return $this->atomic(function () use ($mapId, $author) {
            $record = $this->production($mapId, true);
            foreach ([$this->drafts, $this->versions] as $table) {
                if ($this->db->get_var($this->db->prepare("SELECT id FROM `{$table}` WHERE map_id=%d LIMIT 1", $mapId))) {
                    throw new \RuntimeException('App authoring history is already initialized.', 409);
                }
            }
            if ($this->db->get_var($this->db->prepare("SELECT map_id FROM `{$this->liveVersions}` WHERE map_id=%d", $mapId))) {
                throw new \RuntimeException('App publication state is already initialized.', 409);
            }
            $this->setLiveVersion($mapId, 0, $author);
            return $this->addDraft($mapId, '', $record, null, $author);
        });
    }

    public function index(int $mapId, int $author): array
    {
        // Map row serializes initialization/import across tabs; legacy payloads are never deleted.
        $this->atomic(function () use ($mapId, $author) {
            $production = $this->production($mapId, true);
            if ($this->hasPublishedVersion($mapId) && !$this->db->get_var($this->db->prepare("SELECT id FROM `{$this->versions}` WHERE map_id=%d LIMIT 1", $mapId))) {
                $this->addVersion($mapId, null, $production['title'], $production, null, $author, 'publication');
            }
            $legacy = get_user_meta($author, 'mapsvg_react_admin_drafts_v2_' . get_current_blog_id(), true);
            if (is_array($legacy) && isset($legacy[$mapId]['options']) && is_array($legacy[$mapId]['options'])) {
                $payload = $legacy[$mapId];
                $key = 'usermeta:' . $author . ':' . $mapId . ':' . hash('sha256', $this->json($payload));
                if (!$this->db->get_var($this->db->prepare("SELECT id FROM `{$this->drafts}` WHERE legacy_key=%s", $key))) {
                    // Old usermeta was client-controlled. Restricted editors cannot migrate new code.
                    try {
                        AppCodePolicy::assertUnchanged($payload['options'], $production['options']);
                        $this->addDraft($mapId, 'Recovered draft · user ' . $author, array_merge($production, ['options' => $payload['options']]), null, $author, $key);
                    } catch (\RuntimeException $error) {
                        if ($error->getCode() !== 403) throw $error;
                    }
                }
            }
            if (AppEngine::version($production['options']) !== 8 && !$this->db->get_var($this->db->prepare("SELECT id FROM `{$this->drafts}` WHERE map_id=%d LIMIT 1", $mapId)) && !$this->db->get_var($this->db->prepare("SELECT map_id FROM `{$this->liveVersions}` WHERE map_id=%d", $mapId))) {
                $this->addDraft($mapId, '', $production, null, $author);
            }
            // Adopt the previous latest-publication convention only when it still matches production.
            if (!$this->db->get_var($this->db->prepare("SELECT map_id FROM `{$this->liveVersions}` WHERE map_id=%d", $mapId))) {
                $latest = $this->db->get_row($this->db->prepare("SELECT id,snapshot FROM `{$this->versions}` WHERE map_id=%d AND kind='publication' ORDER BY id DESC LIMIT 1", $mapId), ARRAY_A);
                if ($latest && self::decodeSnapshot($latest['snapshot'])['options'] == $production['options']) {
                    $this->setLiveVersion($mapId, (int) $latest['id'], $author);
                }
            }
        });
        $drafts = $this->db->get_results($this->db->prepare("SELECT * FROM `{$this->drafts}` WHERE map_id=%d AND deleted_at IS NULL ORDER BY id", $mapId), ARRAY_A);
        // Unpublished legacy autosaves stay hidden; explicitly activated ones are public history.
        $versions = $this->db->get_results($this->db->prepare("SELECT id,map_id,draft_id,title,source_version_id,author_id,created_at,kind,published_at,engine FROM `{$this->versions}` WHERE map_id=%d AND (kind<>'autosave' OR published_at IS NOT NULL) ORDER BY id DESC", $mapId), ARRAY_A);
        foreach ($versions as &$metadata) {
            $metadata['engine'] = (int) ($metadata['engine'] ?? 9);
            if ($metadata['engine'] === 8) $metadata['old_editor_url'] = LegacyV8::editorUrl($mapId, (int) $metadata['id']);
        }
        unset($metadata);
        $published = $this->db->get_row($this->db->prepare("SELECT v.id,v.snapshot FROM `{$this->versions}` v INNER JOIN `{$this->liveVersions}` live ON live.version_id=v.id AND live.map_id=v.map_id WHERE v.map_id=%d", $mapId), ARRAY_A);
        $production = $this->production($mapId);
        $publishedId = $published && self::decodeSnapshot($published['snapshot'])['options'] == $production['options'] ? (int) $published['id'] : null;
        return ['drafts' => array_map([$this, 'decode'], $drafts), 'versions' => array_map([$this, 'decode'], $versions), 'published_version_id' => $publishedId];
    }

    public function create(int $mapId, array $params, int $author): array
    {
        return $this->atomic(function () use ($mapId, $params, $author) {
            $production = $this->production($mapId, true);
            $source = isset($params['version_id']) ? (int) $params['version_id'] : null;
            $version = $source ? $this->version($mapId, $source) : null;
            $record = $version ? $version['snapshot'] : ($params['snapshot'] ?? $production);
            if (!$source) AppCodePolicy::assertUnchanged($record['options'] ?? [], $production['options']);
            // Idempotent migration/new-draft retries after an unknown network outcome.
            $key = isset($params['client_key']) ? 'client:' . $mapId . ':' . $author . ':' . hash('sha256', $params['client_key']) : null;
            if ($key) {
                $id = $this->db->get_var($this->db->prepare("SELECT id FROM `{$this->drafts}` WHERE legacy_key=%s", $key));
                if ($id) return $this->get($mapId, (int) $id);
            }
            $migration = AppEngine::version($record['options']) === 8;
            if ($migration) $record = AppEngine::toV9($record, $this->db);
            $record['options'][AppEngine::KEY] = 9;
            return $this->addDraft($mapId, (string) ($params['title'] ?? ''), $record, $source, $author, $key, $version['title'] ?? null, $migration);
        });
    }

    /** Rename metadata only; content and publication remain unchanged. */
    public function rename(int $mapId, int $draftId, int $revision, string $title): array
    {
        $title = trim($title);
        if ($title === '' || strlen($title) > 255) throw new \InvalidArgumentException('Draft name is required (max 255 bytes).', 400);
        return $this->atomic(function () use ($mapId, $draftId, $revision, $title) {
            $this->lockApp($mapId);
            $this->metadata($mapId, $draftId, $revision);
            $affected = $this->sql($this->db->prepare("UPDATE `{$this->drafts}` SET title=%s,revision=revision+1,updated_at=%s WHERE map_id=%d AND id=%d AND revision=%d AND deleted_at IS NULL", $title, gmdate('Y-m-d H:i:s'), $mapId, $draftId, $revision));
            if ($affected !== 1) throw new \RuntimeException('Draft revision conflict.', 409);
            return ['title' => $title, 'revision' => $revision + 1];
        });
    }

    private function metadata(int $mapId, int $draftId, int $revision): array
    {
        // Autosave reads metadata only, not the previous multi-MiB snapshot.
        $row = $this->db->get_row($this->db->prepare("SELECT title,revision,source_version_id FROM `{$this->drafts}` WHERE map_id=%d AND id=%d AND deleted_at IS NULL FOR UPDATE", $mapId, $draftId), ARRAY_A);
        if (!$row) throw new \RuntimeException('Draft not found in this App.', 404);
        if ((int) $row['revision'] !== $revision) throw new \RuntimeException('Draft changed in another tab or by another editor. Recover your copy as a new draft.', 409);
        return $row;
    }

    private function write(int $mapId, int $draftId, int $revision, array $snapshot, ?int $source): void
    {
        $affected = $this->sql($this->db->prepare("UPDATE `{$this->drafts}` SET snapshot=%s, revision=revision+1, source_version_id=" . ($source === null ? 'NULL' : (string) $source) . ", updated_at=%s WHERE id=%d AND map_id=%d AND revision=%d", $this->json($snapshot), gmdate('Y-m-d H:i:s'), $draftId, $mapId, $revision));
        if ($affected !== 1) throw new \RuntimeException('Draft revision conflict.', 409);
    }

    public function save(int $mapId, int $draftId, int $revision, array $record, int $author): array
    {
        $record['options'][AppEngine::KEY] = 9;
        $record['options'] = (new SvgAssetRegistry($this->db))->withSelection($record['options']);
        $snapshot = self::snapshot($record, $mapId);
        return $this->atomic(function () use ($mapId, $draftId, $revision, $snapshot) {
            $this->lockApp($mapId);
            $meta = $this->metadata($mapId, $draftId, $revision);
            if (AppCodePolicy::isRestricted()) {
                AppCodePolicy::assertUnchanged($snapshot['options'], $this->get($mapId, $draftId)['snapshot']['options']);
            }
            $source = isset($meta['source_version_id']) ? (int) $meta['source_version_id'] : null;
            // Keep one mutable working snapshot; Publish and Restore own immutable history.
            $this->write($mapId, $draftId, $revision, $snapshot, $source);
            return ['revision' => $revision + 1];
        });
    }

    /** Save bytes and the draft reference under the same revision/reference lease. */
    public function saveSvg(int $mapId, int $draftId, int $revision, string $source, string $svg, bool $resetGeometry): array
    {
        // Keep rollback compensation inside the reference lock as well.
        return AppSvgReferenceLock::run($this->db, function () use ($mapId, $draftId, $revision, $source, $svg, $resetGeometry) {
            $registry = new SvgAssetRegistry($this->db);
            $registered = $registry->available();
            $file = new AppDraftSvgFile($source, $svg, $registered ? $registry : null);
            try {
                return $this->atomic(function () use ($mapId, $draftId, $revision, $source, $resetGeometry, $file, $registered) {
                    $this->lockApp($mapId);
                    $meta = $this->metadata($mapId, $draftId, $revision);
                    $snapshot = $this->get($mapId, $draftId)['snapshot'];
                    if (($snapshot['options']['source'] ?? '') !== $source) throw new \RuntimeException('Draft SVG source changed. Reopen Draw.', 409);
                    $shared = $registered || $this->svgReferencedElsewhere($draftId, $file->path());
                    $result = $file->save(!$shared, (int) ($snapshot['svgFileLastChanged'] ?? 0));
                    $snapshot['options']['source'] = $result['source'];
                    if (isset($result['svgAsset'])) $snapshot['options']['svgAsset'] = $result['svgAsset'];
                    if ($resetGeometry) $snapshot['options'] = array_merge($snapshot['options'], $result['geometry']);
                    $snapshot['svgFileLastChanged'] = $result['svgFileLastChanged'];
                    $this->write($mapId, $draftId, $revision, self::snapshot($snapshot, $mapId), isset($meta['source_version_id']) ? (int) $meta['source_version_id'] : null);
                    return ['draft' => $this->get($mapId, $draftId), 'reused' => $result['reused'], 'svg' => $file->contents()];
                });
            } catch (\Throwable $error) {
                $file->rollback();
                throw $error;
            }
        });
    }

    /** Preview/apply use the same revision and source lease as SVG/draft writes. */
    public function syncRegions(int $mapId, int $draftId, int $revision, string $pageId, string $stateId, ?string $token = null, bool $cleanup = false): array
    {
        return $this->atomic(function () use ($mapId, $draftId, $revision, $pageId, $stateId, $token, $cleanup) {
            $this->lockApp($mapId);
            $this->metadata($mapId, $draftId, $revision);
            $draft = $this->get($mapId, $draftId);
            $sync = new AppRegionSync();
            if ($cleanup) return $token === null ? $sync->previewCleanup($draft, $pageId, $stateId) : $sync->applyCleanup($draft, $pageId, $stateId, $token);
            return $token === null ? $sync->preview($draft, $pageId, $stateId) : $sync->apply($draft, $pageId, $stateId, $token);
        });
    }

    private function svgReferencedElsewhere(int $draftId, string $path): bool
    {
        foreach ([
            [$this->maps, 'options,svgFilePath', '1=1'],
            [$this->drafts, 'snapshot', 'deleted_at IS NULL AND id<>' . $draftId],
            [$this->versions, 'snapshot', '1=1'],
        ] as $source) {
            $last = 0;
            do {
                $rows = $this->db->get_results($this->db->prepare("SELECT id,{$source[1]} FROM `{$source[0]}` WHERE {$source[2]} AND id>%d ORDER BY id LIMIT 8", $last), ARRAY_A);
                if (!is_array($rows) || $this->db->last_error) throw new \RuntimeException('Cannot check SVG references.', 500);
                foreach ($rows as $row) {
                    $last = (int) $row['id'];
                    if (isset($row['svgFilePath']) && AppDraftSvgFile::references($row['svgFilePath'], $path)) return true;
                    $document = json_decode($row['snapshot'] ?? $row['options']);
                    // Unknown/broken documents cannot establish exclusive ownership.
                    if (json_last_error() !== JSON_ERROR_NONE || !is_object($document)) return true;
                    if (AppDraftSvgFile::references($document, $path)) return true;
                }
            } while (count($rows) === 8);
        }
        return false;
    }

    public function restore(int $mapId, int $draftId, int $revision, int $versionId, int $author): array
    {
        return $this->atomic(function () use ($mapId, $draftId, $revision, $versionId, $author) {
            $this->lockApp($mapId);
            $this->metadata($mapId, $draftId, $revision);
            $draft = $this->get($mapId, $draftId);
            $version = $this->version($mapId, $versionId);
            AppCodePolicy::assertUnchanged($version['snapshot']['options'], $draft['snapshot']['options']);
            $this->addVersion($mapId, $draftId, $draft['title'], $draft['snapshot'], $draft['source_version_id'], $author, 'restore_backup');
            $restored = AppEngine::version($version['snapshot']['options']) === 8 ? AppEngine::toV9($version['snapshot'], $this->db) : $version['snapshot'];
            $this->write($mapId, $draftId, $revision, $restored, $versionId);
            $this->sql($this->db->prepare("UPDATE `{$this->drafts}` SET migration=%d WHERE map_id=%d AND id=%d", AppEngine::version($version['snapshot']['options']) === 8 ? 1 : 0, $mapId, $draftId));
            return $this->get($mapId, $draftId);
        });
    }

    /** Activate an immutable historical snapshot without changing any working draft. */
    public function checkout(int $mapId, int $versionId, int $author): array
    {
        return $this->atomic(function () use ($mapId, $versionId, $author) {
            $production = $this->production($mapId, true);
            $version = $this->version($mapId, $versionId);
            $snapshot = self::snapshot($version['snapshot'], $mapId);
            AppCodePolicy::assertUnchanged($snapshot['options'], $production['options']);
            $this->writeProduction($mapId, $snapshot);
            $this->setLiveVersion($mapId, $versionId, $author);
            return ['version_id' => $versionId, 'snapshot' => $snapshot];
        });
    }

    /** A zero pointer deliberately means no current publication; absence still permits legacy initialization. */
    public function hasPublishedVersion(int $mapId): bool
    {
        $value = $this->db->get_var($this->db->prepare("SELECT version_id FROM `{$this->liveVersions}` WHERE map_id=%d", $mapId));
        return $value === null || (int) $value > 0;
    }

    public function unpublish(int $mapId, int $versionId, int $author): array
    {
        return $this->atomic(function () use ($mapId, $versionId, $author) {
            $this->lockApp($mapId);
            $this->publishedVersion($mapId, $versionId);
            $current = $this->db->get_var($this->db->prepare("SELECT version_id FROM `{$this->liveVersions}` WHERE map_id=%d", $mapId));
            if ($current === null || ((int) $current !== 0 && (int) $current !== $versionId)) {
                throw new \RuntimeException('The published version changed. Refresh Versions and try again.', 409);
            }
            // Clearing the current publication does not revoke historical pinned shortcodes.
            if ((int) $current !== 0) {
                $this->sql($this->db->prepare("UPDATE `{$this->versions}` SET published_at=COALESCE(published_at,%s) WHERE map_id=%d AND id=%d", gmdate('Y-m-d H:i:s'), $mapId, $versionId));
                $this->sql($this->db->prepare("UPDATE `{$this->liveVersions}` SET version_id=0,author_id=%d,updated_at=%s WHERE map_id=%d AND version_id=%d", $author, gmdate('Y-m-d H:i:s'), $mapId, $versionId));
            }
            return ['unpublished_version_id' => $versionId, 'published_version_id' => null];
        });
    }

    public function deleteDraft(int $mapId, int $draftId, int $revision): array
    {
        return $this->atomic(function () use ($mapId, $draftId, $revision) {
            $this->lockApp($mapId);
            $deleted = $this->db->get_row($this->db->prepare("SELECT revision,deleted_at FROM `{$this->drafts}` WHERE map_id=%d AND id=%d", $mapId, $draftId), ARRAY_A);
            if ($deleted && $deleted['deleted_at'] !== null && (int) $deleted['revision'] === $revision + 1) {
                return ['deleted_draft_id' => $draftId];
            }
            $this->metadata($mapId, $draftId, $revision);
            // Tombstone keeps legacy migration/client retry keys from resurrecting deleted drafts.
            $this->sql($this->db->prepare("UPDATE `{$this->drafts}` SET deleted_at=%s,revision=revision+1 WHERE map_id=%d AND id=%d", gmdate('Y-m-d H:i:s'), $mapId, $draftId));
            return ['deleted_draft_id' => $draftId];
        });
    }

    public function publish(int $mapId, int $draftId, int $revision, array $record, int $author, string $requestId): array
    {
        if (!preg_match('/\A[A-Za-z0-9-]{16,64}\z/D', $requestId)) throw new \InvalidArgumentException('Publication request ID is required.', 400);
        $record['options'][AppEngine::KEY] = 9;
        $snapshot = self::snapshot($record, $mapId);
        return $this->atomic(function () use ($mapId, $draftId, $revision, $snapshot, $author, $requestId) {
            $this->lockApp($mapId);
            $previous = $this->db->get_row($this->db->prepare("SELECT id,draft_id,snapshot FROM `{$this->versions}` WHERE map_id=%d AND request_id=%s", $mapId, $requestId), ARRAY_A);
            if ($previous) {
                if ((int) $previous['draft_id'] !== $draftId || self::decodeSnapshot($previous['snapshot']) != $snapshot) throw new \RuntimeException('Publication request ID was already used.', 409);
                return ['version_id' => (int) $previous['id'], 'revision' => $this->get($mapId, $draftId)['revision']];
            }
            if (AppCodePolicy::isRestricted()) {
                AppCodePolicy::assertUnchanged($snapshot['options'], $this->production($mapId)['options']);
            }
            $meta = $this->metadata($mapId, $draftId, $revision);
            if (AppCodePolicy::isRestricted()) {
                AppCodePolicy::assertUnchanged($snapshot['options'], $this->get($mapId, $draftId)['snapshot']['options']);
            }
            $source = isset($meta['source_version_id']) ? (int) $meta['source_version_id'] : null;
            $this->write($mapId, $draftId, $revision, $snapshot, $source);
            $title = preg_replace('/ draft #' . $draftId . '\z/', '', $meta['title']);
            $versionId = $this->addVersion($mapId, $draftId, $title, $snapshot, $source, $author, 'publication', $requestId);
            $this->sql($this->db->prepare("UPDATE `{$this->drafts}` SET migration=0 WHERE map_id=%d AND id=%d", $mapId, $draftId));
            // Preserve published row compatibility and unknown authoring options; no resource/schema writes.
            $this->writeProduction($mapId, $snapshot);
            $this->setLiveVersion($mapId, $versionId, $author);
            return ['version_id' => $versionId, 'revision' => $revision + 1];
        });
    }
}
