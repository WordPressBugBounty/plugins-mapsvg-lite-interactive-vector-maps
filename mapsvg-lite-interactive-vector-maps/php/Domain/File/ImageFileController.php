<?php

namespace MapSVG;

final class ImageFileController extends Controller
{
    public static function create($request)
    {
        try {
            $files = $request->get_file_params();
            if (!isset($files['file']) || !is_array($files['file'])) throw new \InvalidArgumentException('Choose an image file.', 400);
            return self::render(array('file' => (new ImageFileService())->upload($files['file'])));
        } catch (\Throwable $error) {
            return self::render(array('error' => $error->getMessage()), 400);
        }
    }

    public static function svg($request)
    {
        try {
            $source = $request['source'];
            if (!is_string($source) || $source === '') throw new \InvalidArgumentException('Choose an existing image.', 400);
            return self::render(array('file' => (new ImageFileService())->createSvg($source)));
        } catch (\Throwable $error) {
            return self::render(array('error' => $error->getMessage()), 400);
        }
    }
}
