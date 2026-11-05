<?php

namespace MapSVG;

/**
 * Controller Class for server and setup information
 * @package MapSVG
 */
class InfoController extends Controller
{

    /**
     * Get PHPInfo page
     *
     * @return \WP_REST_Response
     */
    public static function phpInfoPage()
    {
        if (function_exists('phpinfo')) {
            ob_start();
            phpinfo();
            $phpinfo = ob_get_contents();
            ob_end_clean();
        } else {
            return self::render('phpinfo() function is disabled on this server for security reasons.', 500);
        }

        return self::render($phpinfo, 200);
    }
}
