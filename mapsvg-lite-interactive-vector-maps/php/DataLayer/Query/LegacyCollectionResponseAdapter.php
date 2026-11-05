<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

/** Restores the existing Repository::find() collection envelope and domain items. */
final class LegacyCollectionResponseAdapter
{
    /** @var callable fn(array<string,mixed>): mixed */
    private $objectFactory;

    public function __construct(callable $objectFactory)
    {
        $this->objectFactory = $objectFactory;
    }

    /** @return array<string, mixed> */
    public function adapt(QueryExecution $execution): array
    {
        $items = array();
        foreach ($execution->rows() as $row) {
            $items[] = call_user_func($this->objectFactory, $row);
        }

        $response = array(
            'items' => $items,
            'page' => $execution->page(),
            'take' => $execution->perpage(),
            'perpage' => $execution->perpage(),
            'hasMore' => $execution->hasMore(),
        );
        if ($execution->total() !== null) $response['count'] = $execution->total();
        return $response;
    }
}
