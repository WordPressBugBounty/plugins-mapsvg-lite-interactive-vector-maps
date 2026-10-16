<?php
namespace MapSVG;

/** Write-only validation of metadata used to construct SQL. Never sanitize SQL fragments. */
class SchemaSqlDefinition
{
    private const TYPES = [
        'id' => 'int(11)', 'text' => 'varchar(255)', 'title' => 'varchar(255)',
        'textarea' => 'text', 'number' => 'varchar(255)', 'select' => 'varchar(255)',
        'checkbox' => 'tinyint(1)', 'boolean' => 'tinyint(1)', 'checkboxes' => 'text',
        'radio' => 'varchar(255)', 'status' => 'varchar(255)', 'image' => 'text',
        'images' => 'text', 'location' => 'text', 'date' => 'varchar(50)',
        'datetime' => 'varchar(50)', 'post' => 'int(11)', 'region' => 'text',
        'regions' => 'text', 'colorpicker' => 'varchar(255)', 'json' => 'json',
    ];

    public static function input($data): array
    {
        if (!is_array($data)) throw new \InvalidArgumentException('Schema must be an object.', 400);
        if (array_key_exists('fields', $data)) {
            if (is_string($data['fields'])) $data['fields'] = json_decode($data['fields'], true);
            if (!is_array($data['fields'])) throw new \InvalidArgumentException('Schema fields must be an array.', 400);
            foreach ($data['fields'] as $field) {
                if (!is_array($field) && !is_object($field)) throw new \InvalidArgumentException('Invalid field definition.', 400);
            }
        }
        return $data;
    }

    public static function identifier($name): string
    {
        if (!is_string($name) || strlen($name) < 1 || strlen($name) > 64 || !preg_match('/\A[A-Za-z0-9_]+\z/D', $name)) {
            throw new \InvalidArgumentException('Invalid SQL identifier (use 1–64 letters, digits or underscores).', 400);
        }
        return '`' . $name . '`';
    }

    public static function columnType($raw): string
    {
        if (!is_string($raw)) throw new \InvalidArgumentException('Invalid column type.', 400);
        $type = strtolower(trim($raw));
        if (in_array($type, ['bool', 'boolean'], true)) return 'tinyint(1)';
        if (in_array($type, ['text', 'tinytext', 'mediumtext', 'longtext', 'json', 'date', 'datetime', 'timestamp', 'time', 'year'], true)) return $type;
        if (preg_match('/\A(tinyint|smallint|mediumint|int|integer|bigint)(?:\(\s*(\d+)\s*\))?(?:\s+(unsigned))?\z/D', $type, $m)) {
            if (isset($m[2]) && $m[2] !== '' && ((int)$m[2] < 1 || (int)$m[2] > 255)) throw new \InvalidArgumentException('Invalid integer display width.', 400);
            return ($m[1] === 'integer' ? 'int' : $m[1]) . (!empty($m[2]) ? '(' . (int)$m[2] . ')' : '') . (!empty($m[3]) ? ' unsigned' : '');
        }
        if (preg_match('/\A(char|varchar)\(\s*(\d+)\s*\)\z/D', $type, $m)) {
            if ((int)$m[2] < 1 || (int)$m[2] > ($m[1] === 'char' ? 255 : 65535)) throw new \InvalidArgumentException('Invalid character column length.', 400);
            return $m[1] . '(' . (int)$m[2] . ')';
        }
        if (preg_match('/\A(decimal|numeric|float|double)(?:\(\s*(\d+)(?:\s*,\s*(\d+))?\s*\))?(?:\s+(unsigned))?\z/D', $type, $m)) {
            $decimal = in_array($m[1], ['decimal', 'numeric'], true);
            $precision = !empty($m[2]) ? (int)$m[2] : null;
            $scale = isset($m[3]) && $m[3] !== '' ? (int)$m[3] : null;
            if (($precision !== null && ($precision < 1 || $precision > ($decimal ? 65 : 255))) ||
                ($scale !== null && ($scale > 30 || $scale > $precision)) ||
                (!$decimal && $precision !== null && $scale === null && $precision > 53)) {
                throw new \InvalidArgumentException('Invalid numeric precision or scale.', 400);
            }
            return ($m[1] === 'numeric' ? 'decimal' : $m[1]) . ($precision !== null ? '(' . $precision . ($scale !== null ? ',' . $scale : '') . ')' : '') . (!empty($m[4]) ? ' unsigned' : '');
        }
        throw new \InvalidArgumentException('Unsupported column type.', 400);
    }

    private static function normalizeDefault($value, string $type, bool $notNull)
    {
        if ($value === null) {
            if ($notNull) throw new \InvalidArgumentException('A NOT NULL column cannot default to NULL.', 400);
            return null;
        }
        if (!is_scalar($value)) throw new \InvalidArgumentException('Column defaults must be scalar values or NULL.', 400);
        if (preg_match('/\A(?:tinyint|smallint|mediumint|int|bigint|decimal|float|double|year)\b/', $type)) {
            if (is_bool($value)) $value = (int)$value;
            $numeric = (string)$value;
            $pattern = preg_match('/\A(?:decimal|float|double)\b/', $type) ? '/\A[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?\z/D' : '/\A[+-]?\d+\z/D';
            if (!preg_match($pattern, $numeric) || !is_finite((float)$numeric) || (strpos($type, 'unsigned') !== false && (float)$numeric < 0)) {
                throw new \InvalidArgumentException('Invalid numeric column default.', 400);
            }
            return $value;
        }
        if (in_array($type, ['text', 'tinytext', 'mediumtext', 'longtext', 'json'], true)) {
            throw new \InvalidArgumentException('Non-NULL defaults are not supported for text/JSON columns.', 400);
        }
        $value = (string)$value;
        if (in_array($type, ['datetime', 'timestamp'], true) && in_array(strtoupper($value), ['CURRENT_TIMESTAMP', 'CURRENT_TIMESTAMP()'], true)) return 'CURRENT_TIMESTAMP';
        if (in_array($type, ['date', 'datetime', 'timestamp'], true)) {
            $format = $type === 'date' ? 'Y-m-d' : 'Y-m-d H:i:s';
            $pattern = $type === 'date' ? '/\A\d{4}-\d{2}-\d{2}\z/D' : '/\A\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\z/D';
            if (!preg_match($pattern, $value)) throw new \InvalidArgumentException('Invalid date/time default.', 400);
            $date = \DateTimeImmutable::createFromFormat('!' . $format, $value);
            if (!$date || $date->format($format) !== $value) throw new \InvalidArgumentException('Invalid date/time default.', 400);
        }
        if ($type === 'time' && (!preg_match('/\A-?(\d{1,3}):[0-5]\d:[0-5]\d\z/D', $value, $m) || (int)$m[1] > 838)) throw new \InvalidArgumentException('Invalid time default.', 400);
        if (preg_match('/\A(?:var)?char\((\d+)\)\z/D', $type, $m) && preg_match_all('/./us', $value) > (int)$m[1]) throw new \InvalidArgumentException('Column default exceeds its character length.', 400);
        return $value;
    }

    /** Hex string literals keep quotes/newlines out of dbDelta's line/default parser. */
    public static function stringLiteral($value): string
    {
        if (!is_scalar($value)) throw new \InvalidArgumentException('Invalid choice label.', 400);
        return "X'" . bin2hex((string)$value) . "'";
    }

    public static function defaultSql($value, string $type): string
    {
        $type = self::columnType($type);
        $value = self::normalizeDefault($value, $type, false);
        if ($value === null) return 'NULL';
        if (preg_match('/\A(?:tinyint|smallint|mediumint|int|bigint|decimal|float|double|year)\b/', $type)) return (string)$value;
        if (in_array($type, ['datetime', 'timestamp'], true) && $value === 'CURRENT_TIMESTAMP') return 'CURRENT_TIMESTAMP';
        return self::stringLiteral($value);
    }

    /** Validate a candidate without mutating persisted/previous field objects. */
    public static function validate(Schema $schema): void
    {
        self::identifier($schema->name);
        if (!is_string($schema->type) || $schema->type === '') throw new \InvalidArgumentException('Invalid schema type.', 400);
        $fields = []; $columns = []; $idCount = 0;
        $claim = static function ($name) use (&$columns) {
            self::identifier($name);
            $key = strtolower($name);
            if (isset($columns[$key])) throw new \InvalidArgumentException('Duplicate or generated column collision: ' . $name, 400);
            $columns[$key] = true;
        };
        foreach ($schema->getFields() as $field) {
            if (!is_object($field)) throw new \InvalidArgumentException('Invalid field definition.', 400);
            $field = clone $field;
            $claim($field->name ?? null);
            if (!isset($field->type) || !is_string($field->type)) throw new \InvalidArgumentException('Invalid field type.', 400);
            $type = strtolower($field->type);
            if (isset(self::TYPES[$type])) $field->type = $type;
            if ($type === 'select') $field->multiselect = filter_var($field->multiselect ?? false, FILTER_VALIDATE_BOOLEAN);
            $field->db_type = self::columnType(!isset($field->db_type) || $field->db_type === '' ? (self::TYPES[$type] ?? 'varchar(255)') : $field->db_type);
            if ($type === 'id') {
                $idCount++;
                if (in_array($field->db_type, ['text', 'tinytext', 'mediumtext', 'longtext', 'json'], true)) throw new \InvalidArgumentException('Unsupported primary key column type.', 400);
            }
            if (!empty($field->auto_increment) && ($type !== 'id' || !preg_match('/\A(?:tinyint|smallint|mediumint|int|bigint)\b/', $field->db_type) || property_exists($field, 'db_default'))) {
                throw new \InvalidArgumentException('AUTO_INCREMENT requires an integer primary key without a default.', 400);
            }
            if (property_exists($field, 'db_default')) $field->db_default = self::normalizeDefault($field->db_default, $field->db_type, !empty($field->not_null) || $type === 'id');
            if (isset($field->options)) {
                if (!is_array($field->options)) throw new \InvalidArgumentException('Invalid field choices.', 400);
                foreach ($field->options as $choice) {
                    $choice = (array)$choice;
                    if ($type !== 'region' && (!array_key_exists('value', $choice) || !array_key_exists('label', $choice))) throw new \InvalidArgumentException('Choices require a value and label.', 400);
                    if (array_key_exists('label', $choice) && !is_scalar($choice['label'])) throw new \InvalidArgumentException('Invalid choice label.', 400);
                    if (array_key_exists('value', $choice) && !is_scalar($choice['value'])) throw new \InvalidArgumentException('Invalid choice value.', 400);
                    $textColumn = ($type === 'select' && empty($field->multiselect)) || in_array($type, ['radio', 'status'], true);
                    if ($textColumn && isset($field->db_default) && (string)$choice['value'] === (string)$field->db_default) {
                        self::normalizeDefault($choice['label'], 'varchar(255)', false);
                    }
                }
            }
            $fields[] = $field;
        }
        if (in_array($schema->type, ['object', 'region', 'post', 'api'], true) && $idCount !== 1) throw new \InvalidArgumentException('Schema must have exactly one id-type field.', 400);
        foreach ($fields as $field) {
            $type = strtolower($field->type);
            if (($type === 'select' && empty($field->multiselect)) || in_array($type, ['radio', 'status'], true)) $claim($field->name . '_text');
            if ($type === 'location') {
                foreach (['lat', 'lng', 'x', 'y', 'address', 'img', 'geocoding_status'] as $suffix) $claim('location_' . $suffix);
            }
        }
        foreach ($schema->getPrevFields() as $field) self::identifier($field->name ?? null);
        $schema->fields = $fields;
    }
}
