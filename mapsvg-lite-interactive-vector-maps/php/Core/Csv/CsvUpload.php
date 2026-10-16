<?php
namespace MapSVG;

/** Shared multipart CSV boundary for direct imports and preflight. */
class CsvUpload
{
    /** @return string|\WP_Error */
    public static function save(array $file)
    {
        $name = $file['name'] ?? null;
        $temporary = $file['tmp_name'] ?? null;
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || !is_string($name) || !is_string($temporary)) {
            return new \WP_Error('mapsvg_invalid_csv_upload', 'Could not read uploaded CSV.', ['status' => 400]);
        }
        $extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        if (!in_array($extension, ['csv', 'txt'], true)) {
            return new \WP_Error('mapsvg_invalid_csv_type', 'Only CSV or TXT text files are allowed.', ['status' => 400]);
        }
        if (!is_uploaded_file($temporary)) {
            return new \WP_Error('mapsvg_invalid_csv_upload', 'Could not read uploaded CSV.', ['status' => 400]);
        }
        // Inspect actual bytes; do not trust multipart Content-Type or a sanitized filename.
        // TXT imports may contain CSV bytes detected as text/csv; WordPress also allows text/plain for CSV.
        $type = wp_check_filetype_and_ext($temporary, $name, ['csv|txt' => 'text/csv']);
        $checkedExtension = strtolower((string) ($type['ext'] ?? ''));
        if (!in_array($checkedExtension, ['csv', 'txt'], true) || !in_array($type['type'] ?? false, ['text/csv', 'text/plain'], true)) {
            return new \WP_Error('mapsvg_invalid_csv_type', 'Only CSV or TXT text files are allowed.', ['status' => 400]);
        }
        $path = self::temporaryPath();
        if (is_wp_error($path)) return $path;
        if (!move_uploaded_file($temporary, $path)) {
            return new \WP_Error('mapsvg_csv_save_failed', 'Could not save uploaded CSV.', ['status' => 500]);
        }
        return $path;
    }

    /** Remote imports use the same unpredictable, non-executable filename policy. @return string|\WP_Error */
    public static function temporaryPath()
    {
        $directory = MAPSVG_UPLOADS_DIR . DIRECTORY_SEPARATOR . 'csv';
        if (!wp_mkdir_p($directory)) {
            return new \WP_Error('mapsvg_csv_save_failed', 'Could not create CSV directory.', ['status' => 500]);
        }
        try {
            return $directory . DIRECTORY_SEPARATOR . 'csv_' . bin2hex(random_bytes(16)) . '.csv';
        } catch (\Exception $error) {
            return new \WP_Error('mapsvg_csv_save_failed', 'Could not create CSV temporary file.', ['status' => 500]);
        }
    }
}
