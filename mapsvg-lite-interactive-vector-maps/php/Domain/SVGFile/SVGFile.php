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
	public function sanitize()
	{
		if (isset($this->body)) {
			$sanitizer = new Sanitizer();
			$this->body = $sanitizer->sanitize($this->body);
			if (!$this->body) {
				throw new \Exception('SVG file sanitization failed', 400);
			}
		}
		return $this;
	}
}
