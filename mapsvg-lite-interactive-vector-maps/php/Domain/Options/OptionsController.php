<?php

namespace MapSVG;

/**
 * Options Controller.
 * Contains just one "update" method that updates options in the database.
 * @package MapSVG
 */
class OptionsController extends Controller
{

    public static function update($request)
    {

        $raw = $request['options'] ?? null;
        if (is_string($raw)) {
            $options = json_decode($raw, true);
        } elseif (is_array($raw)) {
            $options = $raw;
        } else {
            $options = null;
        }

        if (!is_array($options)) {
            return new \WP_REST_Response(['error' => 'Invalid options payload'], 400);
        }

        foreach ($options as $key => $value) {
            if ($key === 'apiKey') {
                continue;
            }
            if (is_string($value)) {
                $value = trim($value);
            }
            Options::set($key, $value);
        }

        return new \WP_REST_Response(Options::getAll(), 200);
    }
}
