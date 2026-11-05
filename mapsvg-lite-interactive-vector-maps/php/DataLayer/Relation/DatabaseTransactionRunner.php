<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Relation;

use Plasma\Adapter\DatabaseAdapter;

/** Owns one adapter transaction/savepoint around a DML callback. */
final class DatabaseTransactionRunner
{
    private DatabaseAdapter $adapter;

    public function __construct(DatabaseAdapter $adapter)
    {
        $this->adapter = $adapter;
    }

    /** @return mixed */
    public function run(callable $callback)
    {
        $startDepth = $this->adapter->getTransactionDepth();
        $this->adapter->beginTransaction();

        try {
            $result = call_user_func($callback);
            if ($this->adapter->getTransactionDepth() !== $startDepth + 1) {
                throw new \LogicException(
                    'Transaction callback changed the owned transaction depth.'
                );
            }
            $this->adapter->commit();
            return $result;
        } catch (\Throwable $error) {
            $this->rollbackTo($startDepth, $error);
            throw $error;
        }
    }

    public function adapter(): DatabaseAdapter
    {
        return $this->adapter;
    }

    private function rollbackTo(int $startDepth, \Throwable $original): void
    {
        try {
            while ($this->adapter->getTransactionDepth() > $startDepth) {
                $this->adapter->rollback();
            }
        } catch (\Throwable $rollbackError) {
            throw new \RuntimeException(
                'Database rollback failed after "'
                . $original->getMessage()
                . '": '
                . $rollbackError->getMessage(),
                0,
                $original
            );
        }
    }
}
