<?php

namespace MapSVG;

class SVGFileController extends Controller
{

	/**
	 * Forces generated SVG file download in the browser
	 * @param $request
	 *
	 * @return array|string[]
	 * @throws \Exception
	 */
	public static function download($request)
	{
		// Initialize WP_Filesystem
		if (!function_exists('WP_Filesystem')) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		WP_Filesystem();
		global $wp_filesystem;

		if (!$wp_filesystem) {
			wp_send_json_error('Filesystem access not available', 500);
			return;
		}

		$file_path = MAPSVG_UPLOADS_DIR . DIRECTORY_SEPARATOR . "mapsvg.svg";

		if ($wp_filesystem->exists($file_path)) {
			$file_contents = $wp_filesystem->get_contents($file_path);

			if ($file_contents === false) {
				wp_send_json_error('Could not read file', 500);
				return;
			}

			// Set headers for file download
			nocache_headers(); // WordPress function to prevent caching
			header('Content-Type: image/svg+xml');
			header('Content-Disposition: attachment; filename=mapsvg.svg');
			header('Content-Length: ' . strlen($file_contents));

			echo $file_contents;
			exit;
		} else {
			wp_send_json_error('File not found', 404);
		}
	}

	/**
	 * Uploads an SVG file.
	 * @param $request
	 * @return \WP_REST_Response
	 */
	public static function create($request)
	{
		$files = $request->get_file_params();
		$filesRepo = new SVGFileRepository();
		$registered = null;
		try {
			$createNew = self::parseCreateNew($request['createNew']);
			try { $requireGoogleOverlay = self::parseCreateNew($request['requireGoogleOverlay']); }
			catch (\Exception $error) { throw new \InvalidArgumentException('Invalid requireGoogleOverlay value.', 400); }
			if (!isset($files['file']) || !is_array($files['file'])) {
				throw new \Exception('Choose an SVG file.', 400);
			}
			$file = new SVGFile($files['file']);
			$file->maybeSanitize(current_user_can('unfiltered_html'));
			if ($requireGoogleOverlay) {
				$metadata = MapAssetCatalog::svgBodyMetadata((string) $file->body, true);
				if (!$metadata['geoCalibrated']) throw new \InvalidArgumentException('The Google overlay needs a valid MapSVG geoViewBox calibration. Download and edit a Google Map template.', 400);
				if (!$metadata['googleOverlay']) throw new \InvalidArgumentException('The Google overlay needs its template screenshot background: mapsvg-google-map-background with positive dimensions and an embedded PNG image.', 400);
			}
			$file = $createNew ? $filesRepo->createUnique($file) : $filesRepo->create($file);
            $registry = new SvgAssetRegistry();
            if ($createNew && $registry->available()) $registered = $registry->metadata($registry->importSource($file->relativeUrl, $file->name));
		} catch (\Exception $e) {
			return self::render(array(
				'error' => $e->getMessage()
			), 400);
		}

        if ($registered !== null) return self::render(array('file' => $registered));
		try { $metadata = (new MapAssetCatalog())->svgMetadata($file->relativeUrl); }
		catch (\InvalidArgumentException $error) { $metadata = array('geoCalibrated' => false, 'googleOverlay' => false); }
		return self::render(array('file' => array_merge(array(
			'name' => $file->name,
			'relativeUrl' => $file->relativeUrl,
			'pathShort' => $file->pathShort,
			'serverPath' => $file->serverPath,
			'origin' => 'uploads',
			'geoCalibrated' => $metadata['geoCalibrated'],
			'googleOverlay' => $metadata['googleOverlay']
		), $registered ?? [])));
	}

	/** Absent preserves legacy overwrite semantics; invalid values never enable a write. */
	private static function parseCreateNew($value): bool
	{
		if ($value === null || $value === false || $value === 0 || $value === '0' || $value === 'false') {
			return false;
		}
		if ($value === true || $value === 1 || $value === '1' || $value === 'true') {
			return true;
		}
		throw new \Exception('Invalid createNew value.', 400);
	}

	/**
	 * Merge the editor-supplied SVG path into the uploaded file array so the
	 * file is written to the map's real location and maps can be looked up
	 * by the stored svgFilePath.
	 *
	 * @param array       $uploadedFile PHP $_FILES item.
	 * @param string|null $path         Map options.source / svgFilePath.
	 * @return array
	 */
	public static function resolveUploadedFileData(array $uploadedFile, $path = null): array
	{
		if (is_string($path) && $path !== '') {
			$uploadedFile['relativeUrl'] = $path;
		}
		return $uploadedFile;
	}

	/**
	 * Updates an SVG file
	 * @param $request
	 *
	 * @return \WP_REST_Response
	 * @throws \Exception
	 */
	public static function update($request)
	{
		$files = $request->get_file_params();
		$filesRepo = new SVGFileRepository();
		$path = $request->get_param('path');
		$fileData = static::resolveUploadedFileData($files['file'], $path);
		$file = new SVGFile($fileData);
		$file->maybeSanitize(current_user_can('unfiltered_html'));
        if (SvgAssetRegistry::managedSource((string) $file->relativeUrl) && !$request->get_param('mapsvg_legacy_app')) {
            return self::render(['error' => 'SVG revisions are immutable. Open Edit SVG in the map editor to save a new revision.'], 409);
        }
        if ($request->get_param('mapsvg_legacy_app')) {
            try {
                $result = (new AppDraftStore())->saveLegacySvg((int) $request->get_param('mapsvg_legacy_app'), (string) $path, $file->body, (int) $request->get_param('mapsvg_legacy_version'), get_current_user_id());
                return self::render($result);
            } catch (\Throwable $error) { return self::render(['error' => $error->getMessage()], $error->getCode() ?: 500); }
        }
		$filesRepo->save($file);

		$lookupPath = (is_string($path) && $path !== '') ? $path : $file->relativeUrl;
		$previous = max(0, (int) $request->get_param('svgFileLastChanged'));
		$regionSync = static::updateLastChanged($file, null, $lookupPath, $previous);

		return self::render(array(
			'status' => 'OK',
			'svgFileLastChanged' => $regionSync['svgFileLastChanged'],
			'regionSync' => $regionSync,
		));
	}


	/**
	 * Copies an SVG file
	 * @param $request
	 *
	 * @return \WP_REST_Response
	 * @throws \Exception
	 */
	public static function copy($request)
	{
		$filesRepo = new SVGFileRepository();
		$file = new SVGFile(["relativeUrl" => $request['file']['path']]);
		$file->maybeSanitize(current_user_can('unfiltered_html'));
		$newFile = $filesRepo->copy($file);
		return self::render(array('file' => $newFile));
	}

	/**
	 * Updates "lastChanged" timestamp for all maps created from the provided SVG file.
	 * @param SVGFile     $file
	 * @param mixed       $updateTitles
	 * @param string|null $svgFilePath  Path to match against maps.svgFilePath. Defaults to $file->relativeUrl.
	 * @return array{maps: array<int, array>, orphanedMarked: int, orphanedCount: int, svgFileLastChanged: int}
	 */
	private static function updateLastChanged($file, $updateTitles = null, $svgFilePath = null, int $previous = 0): array
	{
		$svgFilePath = (is_string($svgFilePath) && $svgFilePath !== '') ? $svgFilePath : $file->relativeUrl;

		$mapsRepo = RepositoryFactory::get("map");
		$query = new Query(array(
			'filters' => array('svgFilePath' => $svgFilePath),
			'perpage' => 0,
		));
		$maps = $mapsRepo->find($query);
		foreach ($maps['items'] as $map) {
			$previous = max($previous, (int) $map->svgFileLastChanged);
		}
		$lastChanged = $file->cacheBuster($previous);

		$syncResults = array();
		$orphanedMarked = 0;
		$orphanedCount = 0;

		foreach ($maps["items"] as $map) {
			/** @var $map Map */
			$map->update(array('svgFileLastChanged' => $lastChanged));
			$result = $mapsRepo->updateFromSvg($map, $updateTitles);
			if (is_array($result)) {
				$syncResults[] = array_merge(array('mapId' => $map->id), $result);
				$orphanedMarked += (int) ($result['orphanedMarked'] ?? 0);
				$orphanedCount += (int) ($result['orphanedCount'] ?? 0);
			}
		}

		return array(
			'maps'               => $syncResults,
			'orphanedMarked'     => $orphanedMarked,
			'orphanedCount'      => $orphanedCount,
			'svgFileLastChanged' => $lastChanged,
		);
	}

	/**
	 * Updates "lastChanged" timestamp for all maps created from the provided SVG file.
	 * @param $request
	 *
	 * @return \WP_REST_Response
	 */
	public static function reload($request)
	{
		$file = new SVGFile($request['file']);
		$updateTitles = $request['updateTitles'] === 'true';
		$regionSync = static::updateLastChanged($file, $updateTitles);
		return self::render(array(
			'file' => $file,
			'regionSync' => $regionSync,
		));
	}

	/**
	 * Commit only one saved Map's SVG source, without publishing its editor draft.
	 * A target already committed by an earlier attempt may retry Region sync.
	 */
	public static function mapSource($request)
	{
		try {
			$id = $request['mapId'];
			if (!(is_int($id) || (is_string($id) && preg_match('/^[1-9][0-9]*$/D', $id)))
				|| filter_var($id, FILTER_VALIDATE_INT) === false || (int) $id <= 0) {
				throw new \InvalidArgumentException('Choose a valid Map.', 400);
			}
			$source = $request['source'];
			$expected = $request['expectedSource'];
			if (!is_string($source) || $source === '' || !is_string($expected) || $expected === '') {
				throw new \InvalidArgumentException('Source and expectedSource are required.', 400);
			}
			try {
				$resetGeometry = $request['resetGeometry'] === null
					? true : self::parseCreateNew($request['resetGeometry']);
			} catch (\Exception $error) {
				throw new \InvalidArgumentException('Invalid resetGeometry value.', 400);
			}
			$repo = RepositoryFactory::get('map');
			$map = $repo->findById((int) $id);
			if (!$map || (int) $map->id !== (int) $id || (int) $map->status === 0) {
				throw new \OutOfBoundsException('Map not found.', 404);
			}
			if (!is_array($map->options) || !isset($map->options['source'])) {
				throw new \UnexpectedValueException('Saved Map options could not be read.', 409);
			}
			$current = $map->options['source'];
			if ($current !== $expected && $current !== $source) {
				throw new \DomainException('The saved SVG source changed. Reload the Map before trying again.', 409);
			}
			list($file, $geometry) = self::readMapSource($source);
			$options = $map->options;
			$options['source'] = $source;
			// A retry after a committed source must not reset newer saved geometry.
			if ($resetGeometry && $current === $expected) {
				$options = array_replace($options, $geometry);
			}
			// Attaching a saved drawing copy must retain the revision acknowledged
			// by /svgfile/update, even when both operations finish in one second.
			$previous = max((int) $map->svgFileLastChanged, (int) ($request['svgFileLastChanged'] ?? 0));
			$map->update(array('options' => $options, 'svgFileLastChanged' => $file->cacheBuster($previous)));
			// Change matches legacy title reload; a writable drawing copy preserves titles.
			$sync = $repo->updateFromSvg($map, $resetGeometry);
			// Match the authoritative GET projection used by editor draft baselines.
			$publicMap = $map->jsonSerialize();
			return self::render(array(
				'map' => array('id' => (int) $map->id, 'options' => $publicMap['options'],
					'svgFileLastChanged' => $map->svgFileLastChanged),
				'sync' => $sync,
			));
		} catch (\Throwable $error) {
			$status = (int) $error->getCode();
			if ($status < 400 || $status > 599) $status = 500;
			return self::render(array('error' => $error->getMessage()), $status);
		}
	}

	/** Validate a local catalog/upload reference before any saved Map write. */
	public static function readMapSource(string $source): array
	{
		if (strpos($source, "\0") !== false || strpos($source, '\\') !== false
			|| wp_parse_url($source, PHP_URL_PATH) !== $source || substr($source, 0, 1) !== '/') {
			throw new \InvalidArgumentException('Choose an existing local SVG file.', 400);
		}
		$file = new SVGFile(array('relativeUrl' => $source));
		$path = realpath($file->serverPath);
		$allowed = false;
		foreach (array(MAPSVG_MAPS_DIR => MAPSVG_MAPS_URL, MAPSVG_UPLOADS_DIR => MAPSVG_UPLOADS_URL) as $folder => $url) {
			$root = realpath($folder);
			$urlPath = rtrim((string) wp_parse_url($url, PHP_URL_PATH), '/') . '/';
			if ($root !== false && $path !== false && strpos($source, $urlPath) === 0
				&& strpos($path, $root . DIRECTORY_SEPARATOR) === 0) $allowed = true;
		}
		if (!$allowed || !is_file($path) || !is_readable($path)) {
			throw new \InvalidArgumentException('The SVG file does not exist in the MapSVG catalog.', 400);
		}
		$body = file_get_contents($path);
		if ($body === false) throw new \InvalidArgumentException('Cannot read the SVG file.', 400);
		return array($file, self::svgGeometry($body));
	}

	/** Validate geometry before a draft SVG write, using the same catalog contract. */
	public static function svgGeometry(string $body): array
	{
		if ($body === false || preg_match('/<!\s*(?:DOCTYPE|ENTITY)\b/i', $body)) {
			throw new \InvalidArgumentException('The SVG file contains unsupported XML.', 400);
		}
		$previousErrors = libxml_use_internal_errors(true);
		try {
			$svg = simplexml_load_string($body, 'SimpleXMLElement', LIBXML_NONET);
		} finally {
			libxml_clear_errors();
			libxml_use_internal_errors($previousErrors);
		}
		if ($svg === false || $svg->getName() !== 'svg'
			|| ($svg->getDocNamespaces()[''] ?? '') !== 'http://www.w3.org/2000/svg') {
			throw new \InvalidArgumentException('The file is not a valid SVG document.', 400);
		}
		$viewBox = null;
		if (isset($svg['viewBox'])) {
			$parts = preg_split('/[\s,]+/', trim((string) $svg['viewBox']));
			if (count($parts) !== 4) throw new \InvalidArgumentException('The SVG viewBox is invalid.', 400);
			$viewBox = array();
			foreach ($parts as $part) {
				if (!is_numeric($part) || !is_finite((float) $part)) {
					throw new \InvalidArgumentException('The SVG viewBox is invalid.', 400);
				}
				$viewBox[] = (float) $part;
			}
			if ($viewBox[2] <= 0 || $viewBox[3] <= 0) {
				throw new \InvalidArgumentException('The SVG viewBox dimensions must be positive.', 400);
			}
		}
		$width = preg_replace('/px$/i', '', trim((string) $svg['width']));
		$height = preg_replace('/px$/i', '', trim((string) $svg['height']));
		if (!is_numeric($width) || !is_numeric($height) || !is_finite((float) $width)
			|| !is_finite((float) $height) || (float) $width <= 0 || (float) $height <= 0) {
			if (!$viewBox) throw new \InvalidArgumentException('The SVG needs positive width/height or a viewBox.', 400);
			$width = $viewBox[2];
			$height = $viewBox[3];
		}
		return array('width' => (float) $width, 'height' => (float) $height,
			'viewBox' => $viewBox ?? array(0, 0, (float) $width, (float) $height));
	}
}
