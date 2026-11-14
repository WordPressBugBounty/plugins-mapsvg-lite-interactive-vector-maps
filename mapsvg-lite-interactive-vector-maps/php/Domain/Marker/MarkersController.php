<?php

namespace MapSVG;

require_once __DIR__ . '/Marker.php';

class MarkersController extends Controller
{
	// START marker_upload
	public static function create($request)
	{
		$repository = new MarkersRepository();
		$files = $request->get_file_params();

		// Validate file presence
		if (empty($files['file']) || empty($files['file']['tmp_name'])) {
			return self::render(array('error' => 'No file uploaded.'), 400);
		}

		// Allowed mime types and extensions
		$allowed_mimes = array(
			'jpg'  => 'image/jpeg',
			'jpeg' => 'image/jpeg',
			'png'  => 'image/png',
			'gif'  => 'image/gif',
			'svg'  => 'image/svg+xml',
			'webp'  => 'image/webp',
		);

		$file_type = wp_check_filetype_and_ext($files['file']['tmp_name'], $files['file']['name']);
		$extension = strtolower(pathinfo($files['file']['name'], PATHINFO_EXTENSION));

		// If the extension contains 'svg', set file_type accordingly because WordPress blocks SVG by default
		if (strpos($extension, 'svg') !== false) {
			$file_type['ext'] = 'svg';
			$file_type['type'] = 'image/svg+xml';
		}

		if (
			!$file_type['ext'] ||
			!$file_type['type'] ||
			!isset($allowed_mimes[$file_type['ext']]) ||
			$allowed_mimes[$file_type['ext']] !== $file_type['type']
		) {
			return self::render(array('error' => 'Only image files (jpg, jpeg, png, gif, svg) are allowed.'), 400);
		}

		// If SVG, and user does not have unfiltered_html permission, sanitize contents before upload
		if ($file_type['ext'] === 'svg' && !current_user_can('unfiltered_html')) {
			require_once(ABSPATH . 'wp-admin/includes/file.php');
			WP_Filesystem();
			global $wp_filesystem;


			$fileSvg = $wp_filesystem->get_contents($files['file']['tmp_name']);
			if ($fileSvg === false) {
				throw new \Exception("Failed to read file");
			}

			try {
				$sanitized_body = SVGFile::sanitize($fileSvg);
				$wp_filesystem->put_contents($files['file']['tmp_name'], $sanitized_body);
			} catch (\Exception $e) {
				return self::render(array('error' => 'SVG sanitization failed: ' . $e->getMessage()), 400);
			}
		}


		$file = $repository->upload($files['file']);
		return self::render(array('marker' => $file));
	}
	// END

}
