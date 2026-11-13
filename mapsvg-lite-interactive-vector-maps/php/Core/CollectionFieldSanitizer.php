<?php

namespace MapSVG;

/**
 * Sanitizes collection object fields for users without unfiltered_html.
 *
 * Admins keep the current unsanitized write behavior. Contributors and other
 * edit_posts users get:
 *  - wp_kses_post for HTML-capable fields (textarea / html / html:true)
 *  - sanitize_text_field for plain text
 *  - esc_url_raw via wp_allowed_protocols() (javascript:/data:/vbscript:/file:/blob: rejected) for URL and image paths
 *
 * Structured values (coordinates, post relations, select values, IDs) are left
 * intact. Nested location.address.* strings and location image paths are covered.
 */
class CollectionFieldSanitizer
{
	/** Keys treated as URL or image-path values, including nested objects. */
	private const URL_KEYS = array(
		'link',
		'img',
		'imagePath',
		'markerImagePath',
		'url',
		'href',
		'src',
		'thumbnail',
		'medium',
		'large',
		'full',
	);

	/** Field types that store rich HTML. */
	private const HTML_TYPES = array('textarea', 'html', 'richtext', 'wysiwyg', 'editor');

	/** Field types that store image / URL payloads. */
	private const IMAGE_TYPES = array('image', 'marker');

	/** Structured types that must not be flattened into strings. */
	private const STRUCTURED_TYPES = array(
		'id',
		'post',
		'region',
		'select',
		'radio',
		'status',
		'checkbox',
		'datetime',
		'date',
		'json',
		'number',
		'integer',
	);

	private const LOCATION_DB_KEYS = array(
		'location_address',
		'location_img',
		'location_lat',
		'location_lng',
		'location_x',
		'location_y',
		'location_geocoding_status',
	);

	/** Schemes that must never be stored, even if a site adds them to wp_allowed_protocols(). */
	private const BLOCKED_URL_PROTOCOLS = array('javascript', 'data', 'vbscript', 'file', 'blob');

	/**
	 * True when the current user must have incoming fields sanitized.
	 */
	public static function currentUserNeedsSanitize(): bool
	{
		return !function_exists('current_user_can') || !current_user_can('unfiltered_html');
	}

	/**
	 * Sanitize one incoming collection object (REST / JSON-import shape).
	 *
	 * @param array|object $data
	 * @return array|object
	 */
	public static function sanitizeObject($data, ?Schema $schema = null, ?bool $force = null)
	{
		if (!self::shouldSanitize($force)) {
			return $data;
		}

		if (is_object($data)) {
			$data = clone $data;
			$sanitized = self::sanitizeArray((array) $data, $schema);
			foreach ($sanitized as $key => $value) {
				$data->{$key} = $value;
			}
			return $data;
		}

		if (!is_array($data)) {
			return $data;
		}

		return self::sanitizeArray($data, $schema);
	}

	/**
	 * @param array<int|string, mixed> $objects
	 * @return array<int|string, mixed>
	 */
	public static function sanitizeObjects(array $objects, ?Schema $schema = null, ?bool $force = null): array
	{
		foreach ($objects as $index => $object) {
			$objects[$index] = self::sanitizeObject($object, $schema, $force);
		}
		return $objects;
	}

	/**
	 * Sanitize a DB-encoded row (CSV field-parser output).
	 *
	 * @param array<string, mixed> $row
	 * @return array<string, mixed>
	 */
	public static function sanitizeEncodedRow(array $row, ?Schema $schema = null, ?bool $force = null): array
	{
		if (!self::shouldSanitize($force)) {
			return $row;
		}

		if (isset($row['location_address']) && is_string($row['location_address']) && $row['location_address'] !== '') {
			$decoded = json_decode($row['location_address'], true);
			if (is_array($decoded)) {
				$row['location_address'] = wp_json_encode(self::sanitizeLocationAddress($decoded), JSON_UNESCAPED_UNICODE);
			} else {
				$row['location_address'] = self::sanitizePlainText($row['location_address']);
			}
		}

		if (array_key_exists('location_img', $row)) {
			$row['location_img'] = self::sanitizeUrlOrPath($row['location_img']);
		}

		if ($schema) {
			foreach ($schema->getFields() as $field) {
				$name = isset($field->name) ? (string) $field->name : '';
				if ($name === '' || !array_key_exists($name, $row) || $name === 'location') {
					continue;
				}
				$row[$name] = self::sanitizeByField($row[$name], $field, $name);
			}
			return $row;
		}

		foreach ($row as $key => $value) {
			if (in_array($key, self::LOCATION_DB_KEYS, true)) {
				continue;
			}
			$row[$key] = self::sanitizeByKey($value, (string) $key);
		}

		return $row;
	}

	private static function shouldSanitize(?bool $force): bool
	{
		return $force !== null ? $force : self::currentUserNeedsSanitize();
	}

	/**
	 * @param array<string|int, mixed> $data
	 * @return array<string|int, mixed>
	 */
	private static function sanitizeArray(array $data, ?Schema $schema): array
	{
		foreach ($data as $key => $value) {
			if (!is_string($key)) {
				$data[$key] = self::sanitizeByKey($value, '');
				continue;
			}

			$field = $schema ? $schema->getField($key) : null;
			if ($field) {
				$data[$key] = self::sanitizeByField($value, $field, $key);
				continue;
			}

			$data[$key] = self::sanitizeByKey($value, $key);
		}

		return $data;
	}

	/**
	 * @param mixed $value
	 * @return mixed
	 */
	private static function sanitizeByField($value, object $field, string $key)
	{
		$type = isset($field->type) ? strtolower((string) $field->type) : '';
		$html = !empty($field->html);

		if ($type === 'location') {
			return self::sanitizeLocation($value);
		}

		if (in_array($type, self::HTML_TYPES, true) || $html) {
			return self::sanitizeHtml($value);
		}

		if ($type === 'url' || self::isUrlKey($key)) {
			if (is_array($value)) {
				return self::sanitizeImageField($value);
			}
			return self::sanitizeUrlOrPath($value);
		}

		if (in_array($type, self::IMAGE_TYPES, true)) {
			return self::sanitizeImageField($value);
		}

		if (in_array($type, self::STRUCTURED_TYPES, true)) {
			return self::sanitizeStructured($value, $type);
		}

		if ($type === 'text') {
			return self::sanitizePlainText($value);
		}

		return self::sanitizeByKey($value, $key);
	}

	/**
	 * @param mixed $value
	 * @return mixed
	 */
	private static function sanitizeByKey($value, string $key)
	{
		if (is_array($value)) {
			$out = array();
			foreach ($value as $childKey => $childValue) {
				$out[$childKey] = self::sanitizeByKey($childValue, is_string($childKey) ? $childKey : '');
			}
			return $out;
		}

		if (!is_string($value)) {
			return $value;
		}

		if (self::isUrlKey($key)) {
			return self::sanitizeUrlOrPath($value);
		}

		if ($key === 'description') {
			return self::sanitizeHtml($value);
		}

		return self::sanitizePlainText($value);
	}

	/**
	 * @param mixed $value
	 * @return mixed
	 */
	private static function sanitizeLocation($value)
	{
		if (is_string($value)) {
			return self::sanitizePlainText($value);
		}
		if (!is_array($value)) {
			return $value;
		}

		if (isset($value['address'])) {
			if (is_string($value['address'])) {
				$value['address'] = self::sanitizePlainText($value['address']);
			} elseif (is_array($value['address'])) {
				$value['address'] = self::sanitizeLocationAddress($value['address']);
			}
		}

		foreach (array('img', 'imagePath', 'markerImagePath') as $urlKey) {
			if (array_key_exists($urlKey, $value)) {
				$value[$urlKey] = self::sanitizeUrlOrPath($value[$urlKey]);
			}
		}

		return $value;
	}

	/**
	 * @param array<string, mixed> $address
	 * @return array<string, mixed>
	 */
	private static function sanitizeLocationAddress(array $address): array
	{
		foreach ($address as $key => $value) {
			if (is_string($value)) {
				$address[$key] = self::sanitizePlainText($value);
			}
		}
		return $address;
	}

	/**
	 * @param mixed $value
	 * @return mixed
	 */
	private static function sanitizeImageField($value)
	{
		if (is_string($value)) {
			$decoded = json_decode($value, true);
			if (is_array($decoded)) {
				$sanitized = self::sanitizeByKey($decoded, '');
				return wp_json_encode($sanitized, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
			}
			return self::sanitizeUrlOrPath($value);
		}

		if (is_array($value)) {
			return self::sanitizeByKey($value, '');
		}

		return $value;
	}

	/**
	 * @param mixed $value
	 * @return mixed
	 */
	private static function sanitizeStructured($value, string $type)
	{
		if ($type === 'region') {
			return self::sanitizeRegionValue($value);
		}

		if ($type === 'json') {
			if (is_array($value)) {
				return self::sanitizeByKey($value, '');
			}
			if (is_string($value)) {
				$decoded = json_decode($value, true);
				if (is_array($decoded)) {
					return wp_json_encode(self::sanitizeByKey($decoded, ''), JSON_UNESCAPED_UNICODE);
				}
			}
			return $value;
		}

		return $value;
	}

	/**
	 * @param mixed $value
	 * @return mixed
	 */
	private static function sanitizeRegionValue($value)
	{
		if (is_string($value)) {
			return self::sanitizePlainText($value);
		}
		if (!is_array($value)) {
			return $value;
		}

		$isList = $value === array() || array_keys($value) === range(0, count($value) - 1);
		if ($isList) {
			foreach ($value as $index => $region) {
				$value[$index] = self::sanitizeRegionValue($region);
			}
			return $value;
		}

		if (isset($value['title']) && is_string($value['title'])) {
			$value['title'] = self::sanitizePlainText($value['title']);
		}

		return $value;
	}

	/**
	 * @param mixed $value
	 * @return mixed
	 */
	private static function sanitizeHtml($value)
	{
		if (!is_string($value)) {
			return $value;
		}
		if (function_exists('wp_kses_post')) {
			return wp_kses_post($value);
		}
		return strip_tags($value);
	}

	/**
	 * @param mixed $value
	 * @return mixed
	 */
	private static function sanitizePlainText($value)
	{
		if (!is_string($value)) {
			return $value;
		}
		if (function_exists('sanitize_text_field')) {
			return sanitize_text_field($value);
		}
		return trim(strip_tags($value));
	}

	/**
	 * Allow relative marker filenames and wp_allowed_protocols() URLs; reject javascript:/data:.
	 *
	 * Relative paths keep percent-encoding (sanitize_text_field would strip it).
	 *
	 * @param mixed $value
	 */
	public static function sanitizeUrlOrPath($value): string
	{
		if (!is_string($value) && !is_numeric($value)) {
			return '';
		}

		$value = trim((string) $value);
		if ($value === '') {
			return '';
		}

		$value = preg_replace('/[\x00-\x1F\x7F]+/', '', $value);
		if (!is_string($value) || $value === '') {
			return '';
		}

		if (self::hasDangerousScheme($value)) {
			return '';
		}

		if (preg_match('#^([a-z][a-z0-9+.-]*:)?//#i', $value) || preg_match('#^[a-z][a-z0-9+.-]*:#i', $value)) {
			if (!function_exists('esc_url_raw')) {
				return '';
			}
			$clean = esc_url_raw($value, self::allowedUrlProtocols());
			return is_string($clean) ? $clean : '';
		}

		// Marker filenames and relative paths: strip attribute-breakout characters, keep % encoding.
		$safe = preg_replace('/[<>"\'\\\\]/', '', $value);
		return is_string($safe) ? $safe : '';
	}

	/**
	 * wp_allowed_protocols() minus schemes that can execute script or local files.
	 *
	 * @return string[]
	 */
	public static function allowedUrlProtocols(): array
	{
		$protocols = function_exists('wp_allowed_protocols')
			? wp_allowed_protocols()
			: array('http', 'https', 'mailto', 'tel');
		if (!is_array($protocols)) {
			$protocols = array();
		}

		$allowed = array();
		foreach ($protocols as $protocol) {
			$protocol = strtolower((string) $protocol);
			if ($protocol === '' || in_array($protocol, self::BLOCKED_URL_PROTOCOLS, true)) {
				continue;
			}
			$allowed[] = $protocol;
		}

		return $allowed;
	}

	private static function hasDangerousScheme(string $value): bool
	{
		$normalized = $value;
		for ($i = 0; $i < 3; $i++) {
			$normalized = rawurldecode($normalized);
			if (function_exists('html_entity_decode')) {
				$normalized = html_entity_decode($normalized, ENT_QUOTES, 'UTF-8');
			}
			$normalized = strtolower((string) preg_replace('/[\s\0\\\\]+/', '', $normalized));
			$normalized = str_replace(array('&#58;', '&#x3a;', '%3a'), ':', $normalized);
		}
		return (bool) preg_match('/^(javascript|data|vbscript|file|blob):/i', $normalized);
	}

	private static function isUrlKey(string $key): bool
	{
		if ($key === '') {
			return false;
		}
		if (in_array($key, self::URL_KEYS, true)) {
			return true;
		}
		return (bool) preg_match('/(_url|Url|URL|Href)$/', $key);
	}
}
