<?php


namespace MapSVG;


class SVGFileRepository extends FilesRepository
{

	public $modelClass = 'SVGFile';

	public function __construct()
	{
		parent::__construct(array(MAPSVG_MAPS_DIR, MAPSVG_UPLOADS_DIR), MAPSVG_UPLOADS_DIR);
	}

    public function save($file)
    {
        $path = $file->serverPath ? realpath($file->serverPath) : false;
        $root = realpath(MAPSVG_UPLOADS_DIR);
        if (SvgAssetRegistry::managedSource((string) $file->relativeUrl)
            || ($path !== false && $root !== false && strpos($path, $root . DIRECTORY_SEPARATOR . 'svg-registry' . DIRECTORY_SEPARATOR) === 0)) {
            throw new \RuntimeException('Registered SVG revisions cannot be overwritten.', 409);
        }
        return parent::save($file);
    }
}
