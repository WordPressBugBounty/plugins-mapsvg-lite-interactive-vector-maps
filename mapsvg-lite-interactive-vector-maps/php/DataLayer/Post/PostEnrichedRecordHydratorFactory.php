<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Post;

use MapSVG\DataLayer\Mapping\SchemaRecordMapper;
use MapSVG\Schema;

/** Explicit composition root for post-enriched legacy object hydration. */
final class PostEnrichedRecordHydratorFactory
{
    public static function forSchema(
        Schema $schema,
        ?PostEnricher $posts = null,
        ?string $storagePrimaryKey = null
    ): PostEnrichedRecordHydrator {
        if ($schema->isRemote()) {
            throw new \InvalidArgumentException(
                'Remote schemas cannot use local record hydration.'
            );
        }

        $postField = $schema->getFieldByType('post');
        $postFieldName = $postField !== null && !empty($postField->name)
            ? (string) $postField->name
            : null;

        if ($postFieldName !== null && $posts === null) {
            $posts = new WordPressPostEnricher();
        }

        return new PostEnrichedRecordHydrator(
            new SchemaRecordMapper(
                $schema,
                null,
                $storagePrimaryKey
            ),
            static fn (array $data): object =>
                new \MapSVG\ObjectDynamic($data),
            $posts,
            $postFieldName
        );
    }

    private function __construct()
    {
    }
}
