<?php
namespace MapSVG;

/** Private, bounded CSV bytes; tokens identify an owner's file, never a public URL/path. */
final class AiCsvAttachments
{
    public const MAX_BYTES = 2097152;
    public const TTL = 86400;
    private const MAX_FILES = 10;
    private const PREFIX = 'mapsvg_ai_csv_';

    public static function allowed(): bool
    {
        return current_user_can('edit_posts') && \MapSVG\Core\CollectionImportFeature::isEnabled();
    }

    public static function upload($request)
    {
        if (!self::allowed()) return new \WP_Error('mapsvg_ai_csv_forbidden', 'CSV import is unavailable for this user or installation.', ['status' => 403]);
        $file = $request->get_file_params()['file'] ?? [];
        $error = CsvUpload::validate($file);
        if (is_wp_error($error)) return $error;
        $size = filesize($file['tmp_name']);
        if (!$size || $size > self::MAX_BYTES) return new \WP_Error('mapsvg_ai_csv_size', 'Attach a non-empty CSV file up to 2 MB.', ['status' => 400]);
        $bytes = file_get_contents($file['tmp_name'], false, null, 0, self::MAX_BYTES + 1);
        try {
            return new \WP_REST_Response(['attachment' => self::store((string) $bytes, (string) $file['name'])], 200);
        } catch (\Throwable $error) {
            return new \WP_Error('mapsvg_ai_csv_invalid', $error->getMessage(), ['status' => 400]);
        }
    }

    /** Server-only ingestion; upload() first validates the native uploaded file. */
    public static function store(string $bytes, string $name): array
    {
        if (!self::allowed()) throw new \RuntimeException('CSV import is unavailable for this user or installation.', 403);
        if ($bytes === '' || strlen($bytes) > self::MAX_BYTES || strpos($bytes, "\0") !== false) throw new \InvalidArgumentException('Attach a non-empty text CSV file up to 2 MB.');
        $analysis = (new CsvSchemaInferencer())->analyzeString($bytes);
        if (empty($analysis['headers'])) throw new \InvalidArgumentException('CSV has no readable columns.');
        $id = bin2hex(random_bytes(16)); $owner = get_current_user_id();
        $record = ['owner' => $owner, 'name' => sanitize_file_name($name), 'content' => base64_encode($bytes), 'sha256' => hash('sha256', $bytes), 'expiresAt' => time() + self::TTL];
        if (!set_transient(self::PREFIX . $id, $record, self::TTL)) throw new \RuntimeException('Could not retain CSV attachment.');
        $indexKey = self::PREFIX . 'owner_' . $owner;
        $index = (array) get_transient($indexKey);
        $index = array_values(array_filter($index, static function ($token) { return is_string($token) && get_transient(self::PREFIX . $token) !== false; }));
        $index[] = $id;
        while (count($index) > self::MAX_FILES) delete_transient(self::PREFIX . array_shift($index));
        set_transient($indexKey, $index, self::TTL);
        return ['kind' => 'csv', 'name' => $record['name'] ?: 'data.csv', 'attachmentId' => $id, 'url' => 'mapsvg-csv:' . $id, 'bytes' => strlen($bytes), 'expiresAt' => $record['expiresAt']];
    }

    public static function read(string $id): array
    {
        if (!self::allowed()) throw new \RuntimeException('CSV import is unavailable for this user or installation.', 403);
        $record = preg_match('/\A[a-f0-9]{32}\z/D', $id) ? get_transient(self::PREFIX . $id) : false;
        if (!is_array($record) || ($record['owner'] ?? null) !== get_current_user_id() || ($record['expiresAt'] ?? 0) <= time()) throw new \InvalidArgumentException('CSV attachment is unavailable, expired or belongs to another user. Attach the file again.');
        $bytes = base64_decode((string) ($record['content'] ?? ''), true);
        if (!is_string($bytes) || strlen($bytes) > self::MAX_BYTES || !hash_equals((string) $record['sha256'], hash('sha256', $bytes))) throw new \RuntimeException('CSV attachment integrity check failed.');
        return ['name' => $record['name'], 'content' => $bytes, 'sha256' => $record['sha256']];
    }

    /** A path exists only inside this callback; tmpfile() is unlinked on close. */
    public static function withArtifact(string $id, callable $callback): array
    {
        $record = self::read($id);
        $handle = tmpfile();
        if ($handle === false) throw new \RuntimeException('Could not allocate private CSV buffer.');
        try {
            if (fwrite($handle, $record['content']) !== strlen($record['content'])) throw new \RuntimeException('Could not write private CSV buffer.');
            return $callback(['path' => stream_get_meta_data($handle)['uri'], 'hash' => md5($record['content']), 'retain' => true]);
        } finally { fclose($handle); }
    }
}
