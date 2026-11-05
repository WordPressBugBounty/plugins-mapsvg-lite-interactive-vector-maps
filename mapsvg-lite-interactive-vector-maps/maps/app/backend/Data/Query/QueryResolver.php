<?php

declare(strict_types=1);
namespace MapSVG\App\Data\Query;

/** Registered implementation; context is server-owned, never taken from RPC params. */
interface QueryResolver
{
    public function authorize(object $context, \stdClass $params): void;
    public function validateParams(\stdClass $params): \stdClass;
    public function execute(\stdClass $params, object $context);
}
