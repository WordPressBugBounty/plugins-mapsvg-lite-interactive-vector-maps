<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

/** Restores the existing Repository::find() envelope for hydrated objects. */
final class HydratedLegacyCollectionResponseAdapter
{
    /** @return array<string,mixed> */
    public function adapt(HydratedQueryExecution $execution): array
    {
        $response = array(
            'items' => $execution->items(),
            'page' => $execution->page(),
            'take' => $execution->perpage(),
            'perpage' => $execution->perpage(),
            'hasMore' => $execution->hasMore(),
        );
        if ($execution->total() !== null) $response['count'] = $execution->total();
        return $response;
    }
}
