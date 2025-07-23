<?php

namespace MapSVG;

use enshrined\svgSanitize\Sanitizer;

class SVGFile extends File
{
	public function __construct($file)
	{
		// Check for path traversal
		if (isset($file['relativeUrl'])) {
			$relativePath = $file['relativeUrl'];
			if (strpos($relativePath, '../') !== false || strpos($relativePath, '..\\') !== false) {
				throw new \Exception('Invalid file path: path traversal detected', 400);
			}
			// Ensure .svg extension
			if (strtolower(pathinfo($relativePath, PATHINFO_EXTENSION)) !== 'svg') {
				throw new \Exception('Invalid file type: only SVG files are allowed', 400);
			}
		}

		// Check uploaded file type
		if (isset($file['file']) && is_array($file['file'])) {
			$uploadedFile = $file['file'];

			// Check file extension
			$fileName = $uploadedFile['name'] ?? '';
			if (strtolower(pathinfo($fileName, PATHINFO_EXTENSION)) !== 'svg') {
				throw new \Exception('Invalid file type: only SVG files are allowed', 400);
			}

			// Check MIME type for additional security
			$mimeType = $uploadedFile['type'] ?? '';
			$allowedMimeTypes = ['image/svg+xml', 'text/xml', 'application/xml'];
			if (!in_array($mimeType, $allowedMimeTypes)) {
				throw new \Exception('Invalid file type: only SVG files are allowed', 400);
			}
		}

		parent::__construct($file);
	}

	public function lastChanged()
	{
		if (file_exists($this->serverPath)) {
			return filemtime($this->serverPath);
		} else {
			return 0;
		}
	}

	/**
	 *  Remove all <script>...</script> tags (case-insensitive, multiline, greedy)
	 **/
	public function maybeSanitize($canHaveScripts = false)
	{
		if (!$canHaveScripts) {
			$this->body = self::sanitize($this->body);
		}

		return $this;
	}

	public static function sanitize($body)
	{
		if (isset($body)) {
			$sanitizer = new Sanitizer();
			$body = $sanitizer->sanitize($body);
			if (!$body) {
				throw new \Exception('SVG file sanitization failed', 400);
			}
		}
		return $body;
	}
}
