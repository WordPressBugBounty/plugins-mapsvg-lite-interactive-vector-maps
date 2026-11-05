<?php

namespace MapSVG;

use Plasma\Logging\ImprovedLogger;

/** MapSVG's logging facade; output is explicitly enabled and owned by WordPress. */
class Logger
{
    public static $logToFile = false;

    const ERROR = 'ERROR';
    const WARNING = 'WARNING';
    const INFO = 'INFO';
    const DEBUG = 'DEBUG';

    private static ?ImprovedLogger $logger = null;

    public static function init(array $params = []): void
    {
        self::$logToFile = !empty($params['logToFile']);
    }

    /** @return ImprovedLogger|null Disabled logging never creates a handler. */
    private static function logger(): ?ImprovedLogger
    {
        if (!self::$logToFile || !defined('WP_DEBUG') || !WP_DEBUG) {
            return null;
        }
        if (self::$logger === null) {
            self::$logger = new ImprovedLogger();
            self::$logger->addHandler(ImprovedLogger::errorLogHandler());
        }
        return self::$logger;
    }

    public static function error($data, $label = null): void
    {
        $logger = self::logger();
        if ($logger !== null) {
            $logger->error(self::message($data));
        }
    }

    public static function info($data, $label = null): void
    {
        $logger = self::logger();
        if ($logger !== null) {
            $logger->info(self::message($data));
        }
    }

    /** SQL is emitted only to the explicitly enabled development log, in milliseconds. */
    public static function addDatabaseQuery($query, $startedAt): void
    {
        $logger = self::logger();
        if ($logger !== null) {
            $logger->query((string) $query, max(0.0, (microtime(true) - $startedAt) * 1000));
        }
    }

    private static function message($data): string
    {
        return is_array($data) || is_object($data) ? print_r($data, true) : (string) $data;
    }
}
