<?php

declare(strict_types=1);

namespace MapSVG\DataLayer;

use Plasma\Events\DatabaseEvent;
use Plasma\Events\DatabaseEventListener;

/** Optional bridge from Plasma events to MapSVG's existing debug logger. */
final class PlasmaDatabaseEventLogger implements DatabaseEventListener
{
    /** @var callable */
    private $queryLogger;
    /** @var callable */
    private $errorLogger;

    public function __construct(?callable $queryLogger = null, ?callable $errorLogger = null)
    {
        $this->queryLogger = $queryLogger ?? static function (string $sql, float $duration): void {
            $startedAt = microtime(true) - max(0.0, $duration / 1000);
            \MapSVG\Logger::addDatabaseQuery($sql, $startedAt);
        };
        $this->errorLogger = $errorLogger ?? static function (string $message): void {
            \MapSVG\Logger::error($message);
        };
    }

    public function handle(DatabaseEvent $event): void
    {
        if ($event->error !== null) {
            call_user_func(
                $this->errorLogger,
                '[Plasma ' . $event->operation . '] ' . $event->error->getMessage()
            );
        }
        if ($event->sql !== null && $event->sql !== '') {
            call_user_func(
                $this->queryLogger,
                $event->sql,
                (float) $event->duration
            );
        }
    }
}
