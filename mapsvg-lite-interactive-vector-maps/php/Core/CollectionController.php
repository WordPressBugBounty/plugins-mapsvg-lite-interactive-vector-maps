<?php

namespace MapSVG;

/** Collection CRUD with optional module hooks for capabilities and writes. */
class CollectionController extends Controller
{
    /** Optional modules can supply legacy public methods without base implementations. */
    public static function __callStatic($method, $arguments)
    {
        $callback = apply_filters('mapsvg_collection_controller_method', null, $method);
        if (!is_callable($callback)) throw new \BadMethodCallException('Collection method is unavailable: ' . $method);
        return call_user_func_array($callback, $arguments);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Standard CRUD
    // ──────────────────────────────────────────────────────────────────────────

    public static function index(\WP_REST_Request $request): \WP_REST_Response
    {
        if ($error = PublicReadAccess::collectionError($request['_collection_name'])) {
            return static::render(['error' => $error->get_error_message()], $error->get_error_data()['status']);
        }
        $repo  = RepositoryFactory::get($request['_collection_name']);
        if ($repo && \MapSVG\Core\PostDataFeature::usesPosts($repo->schema) && !\MapSVG\Core\PostDataFeature::isEnabled()) {
            return static::render(['error' => 'WordPress data sources require a paid MapSVG add-on.'], 403);
        }
        if (!$repo) {
            return static::render(['error' => 'Collection not found.'], 400);
        }

        $query = new Query($request->get_params());
        $includeInfo = filter_var($request['includeCollectionInfo'] ?? false, FILTER_VALIDATE_BOOLEAN);
        if ($includeInfo) {
            if (!current_user_can('edit_posts')) return static::render(['error' => 'Collection editing access is required.'], 403);
            $query->withCount = !$repo->schema->isRemote();
        }

        $response = $repo->find($query);
        if ($includeInfo) {
            if ($repo->schema->isRemote()) {
                $response['count'] = isset($response['count']) && is_int($response['count']) && $response['count'] >= 0 ? $response['count'] : null;
                $response['page'] = $response['page'] ?? max(1, $query->page);
                $response['perpage'] = $response['perpage'] ?? $query->perpage;
                $response['hasMore'] = $response['hasMore'] ?? false;
            } elseif (!is_int($response['count'] ?? null) || $response['count'] < 0) return static::render(['error' => 'Collection pagination is unavailable.'], 500);
            $post = ($repo->schema->type ?? '') === 'post' || ($repo->schema->objectNameSingular ?? '') === 'post';
            $response['capabilities'] = apply_filters('mapsvg_collection_capabilities', [
                'canCreate' => !$post, 'canEdit' => true, 'canDelete' => true,
                'reason' => $post ? 'WordPress post records are created in WordPress.' : null,
            ], $repo->schema);
        }

        if ($query->withSchema) {
            $response['schema'] = $repo->getSchema();
        }
        return static::render($response, 200);
    }

    public static function get(\WP_REST_Request $request): \WP_REST_Response
    {
        if ($error = PublicReadAccess::collectionError($request['_collection_name'])) {
            return static::render(['error' => $error->get_error_message()], $error->get_error_data()['status']);
        }
        $repo   = RepositoryFactory::get($request['_collection_name']);
        if (!$repo) return static::render(['error' => 'Collection not found.'], 404);
        if ($repo && \MapSVG\Core\PostDataFeature::usesPosts($repo->schema) && !\MapSVG\Core\PostDataFeature::isEnabled()) {
            return static::render(['error' => 'WordPress data sources require a paid MapSVG add-on.'], 403);
        }
        $name   = $repo->schema->objectNameSingular;
        $object = $repo->findById($request['id']);

        if ($object) {
            return static::render([$name => $object], 200);
        }
        return static::render(['message' => ucfirst($name) . ' not found'], 404);
    }

    public static function create(\WP_REST_Request $request): \WP_REST_Response
    {
        if ($err = static::rejectIfCollectionReadOnly($request)) return $err;

        $repo   = RepositoryFactory::get($request['_collection_name']);
        if ($repo && \MapSVG\Core\PostDataFeature::usesPosts($repo->schema) && !\MapSVG\Core\PostDataFeature::isEnabled()) {
            return static::render(['error' => 'WordPress data sources require a paid MapSVG add-on.'], 403);
        }
        $name   = $repo->schema->objectNameSingular;

        if (empty($request[$name])) {
            return static::render([], 400);
        }

        $payload = CollectionFieldSanitizer::sanitizeObject($request[$name], $repo->getSchema());
        try {
            if (
                \MapSVG\DataLayer\Validation\OperationValidationService::writeValidationEnabled(
                    $repo->schema
                )
            ) {
                (new \MapSVG\DataLayer\Validation\OperationValidationService(
                    $repo->schema
                ))->validateCreate((array) $payload);
            }

            $object = $repo->create($payload);
        } catch (
            \InvalidArgumentException
            | \MapSVG\DataLayer\Validation\RecordValidationException $error
        ) {
            return static::writeValidationError($error);
        }

        $schema = $repo->getSchema();
        if ($schema->type === "post") {
            $objectData = $object->getData();
            if (!empty($objectData['post'])) {
                $postId = is_object($objectData['post'])
                    ? (int) ($objectData['post']->id ?? $objectData['post']->ID ?? 0)
                    : (int) $objectData['post'];
                if ($postId > 0) {
                    if (!empty($objectData['location'])) {
                        update_post_meta($postId, 'mapsvg_location', wp_json_encode($objectData['location'], JSON_UNESCAPED_UNICODE));
                    }
                    if (!empty($objectData['regions']) && is_array($objectData['regions'])) {
                        update_post_meta($postId, 'mapsvg_regions', wp_json_encode($objectData['regions'], JSON_UNESCAPED_UNICODE));
                    }
                }
            }
        }

        do_action('mapsvg_collection_record_saved', $object->getData(), $repo->schema);

        return static::render([$name => $object], 200);
    }

    public static function clear(\WP_REST_Request $request): \WP_REST_Response
    {
        // Don't reject if GS is read-only, because we're clearing the database.
        // if ($err = static::rejectIfCollectionReadOnly($request)) return $err;

        $repo = RepositoryFactory::get($request['_collection_name']);
        if ($repo && \MapSVG\Core\PostDataFeature::usesPosts($repo->schema) && !\MapSVG\Core\PostDataFeature::isEnabled()) {
            return static::render(['error' => 'WordPress data sources require a paid MapSVG add-on.'], 403);
        }
        $repo->clear();
        return static::render([], 200);
    }

    /**
     * Permanently delete orphaned region records and detach r2o links.
     * Regions only — returns 400 for non-region collections.
     */
    public static function deleteOrphans(\WP_REST_Request $request): \WP_REST_Response
    {
        $repo = RepositoryFactory::get($request['_collection_name']);
        if ($repo && \MapSVG\Core\PostDataFeature::usesPosts($repo->schema) && !\MapSVG\Core\PostDataFeature::isEnabled()) {
            return static::render(['error' => 'WordPress data sources require a paid MapSVG add-on.'], 403);
        }
        if (!$repo) {
            return static::render(['error' => 'Collection not found.'], 400);
        }

        $schema = $repo->getSchema();
        if (!$schema || $schema->type !== 'region') {
            return static::render(['error' => 'Orphan cleanup is only available for region collections.'], 400);
        }

        if (!($repo instanceof RegionsRepository)) {
            return static::render(['error' => 'Invalid regions repository.'], 400);
        }

        $result = $repo->deleteOrphaned();
        return static::render($result, 200);
    }

    public static function update(\WP_REST_Request $request): \WP_REST_Response
    {
        if ($err = static::rejectIfCollectionReadOnly($request)) return $err;

        $repo   = RepositoryFactory::get($request['_collection_name']);
        if ($repo && \MapSVG\Core\PostDataFeature::usesPosts($repo->schema) && !\MapSVG\Core\PostDataFeature::isEnabled()) {
            return static::render(['error' => 'WordPress data sources require a paid MapSVG add-on.'], 403);
        }
        $name   = $repo->schema->objectNameSingular;
        $schema = $repo->getSchema();

        $patch = (array) CollectionFieldSanitizer::sanitizeObject($request[$name], $schema);
        try {
            if (
                \MapSVG\DataLayer\Validation\OperationValidationService::writeValidationEnabled(
                    $schema
                )
            ) {
                (new \MapSVG\DataLayer\Validation\OperationValidationService(
                    $schema
                ))->validateUpdate($patch);
            }
        } catch (
            \InvalidArgumentException
            | \MapSVG\DataLayer\Validation\RecordValidationException $error
        ) {
            return static::writeValidationError($error);
        }

        $object = $repo->findById($patch['id']);
        $object->update($patch);
        try {
            $repo->updateFromController($object, $patch);
        } catch (
            \InvalidArgumentException
            | \MapSVG\DataLayer\Validation\RecordValidationException $error
        ) {
            return static::writeValidationError($error);
        }

        // WP Post CPT: sync location + regions meta.
        if ($schema->type === "post") {
            $objectData = $object->getData();
            if (!empty($objectData['post'])) {
                $postId = is_object($objectData['post'])
                    ? (int) ($objectData['post']->id ?? $objectData['post']->ID ?? 0)
                    : (int) $objectData['post'];

                if ($postId > 0) {
                    // An unrelated sparse edit must not delete existing CPT location metadata.
                    if (array_key_exists('location', $patch)) {
                        if (!empty($patch['location'])) {
                            update_post_meta($postId, 'mapsvg_location', wp_json_encode($objectData['location'], JSON_UNESCAPED_UNICODE));
                        } else {
                            delete_post_meta($postId, 'mapsvg_location');
                        }
                    }

                    if (array_key_exists('regions', $request[$name])) {
                        $regions = $objectData['regions'] ?? [];
                        if (!empty($regions) && is_array($regions)) {
                            update_post_meta($postId, 'mapsvg_regions', wp_json_encode($regions, JSON_UNESCAPED_UNICODE));
                        } else {
                            delete_post_meta($postId, 'mapsvg_regions');
                        }
                    }
                }
            }
        }

        do_action('mapsvg_collection_record_saved', $object->getData(), $schema);

        return static::render([], 200);
    }

    public static function delete(\WP_REST_Request $request): \WP_REST_Response
    {
        if ($err = static::rejectIfCollectionReadOnly($request)) return $err;

        $repo   = RepositoryFactory::get($request['_collection_name']);
        if ($repo && \MapSVG\Core\PostDataFeature::usesPosts($repo->schema) && !\MapSVG\Core\PostDataFeature::isEnabled()) {
            return static::render(['error' => 'WordPress data sources require a paid MapSVG add-on.'], 403);
        }
        $name   = $repo->schema->objectNameSingular;
        $schema = $repo->getSchema();
        $object = $repo->findById($request['id']);

        // WP Post CPT: remove the location meta field when the object is deleted.
        if ($schema->type === "post") {
            $objectData = $object ? $object->getData() : [];
            if (!empty($objectData['post'])) {
                if (!empty($request[$name]['location'])) {
                    update_post_meta($objectData['post']->id, 'mapsvg_location', wp_json_encode($objectData['location'], JSON_UNESCAPED_UNICODE));
                } else {
                    delete_post_meta($objectData['post']->id, 'mapsvg_location');
                }
            }
        }

        do_action('mapsvg_collection_record_deleting', $object ? $object->getData() : [$schema->getPrimaryKeyFieldName() => $request['id']], $schema);

        $repo->delete($request['id']);
        return static::render([], 200);
    }

    public static function geocodeStatus(\WP_REST_Request $request): \WP_REST_Response
    {
        return static::render(['queue' => GeocodingQueue::getStatus()], 200);
    }

    /** An older job may finish after another tab has checked a newer artifact. */


    public static function getDistinctValues(\WP_REST_Request $request): \WP_REST_Response
    {
        $repo           = RepositoryFactory::get($request['_collection_name']);
        if ($repo && \MapSVG\Core\PostDataFeature::usesPosts($repo->schema) && !\MapSVG\Core\PostDataFeature::isEnabled()) {
            return static::render(['error' => 'WordPress data sources require a paid MapSVG add-on.'], 403);
        }
        $distinctValues = $repo->getDistinctValues($request['_field_name']);
        return static::render(['items' => $distinctValues], 200);
    }

    /**
     * LocationNormalizer and other write guards throw InvalidArgumentException.
     * Surface those as the same 422 envelope the editor already understands.
     *
     * @param \InvalidArgumentException|\MapSVG\DataLayer\Validation\RecordValidationException $error
     */
    private static function writeValidationError(\Throwable $error): \WP_REST_Response
    {
        if ($error instanceof \MapSVG\DataLayer\Validation\OperationValidationException
            || $error instanceof \MapSVG\DataLayer\Validation\RecordValidationException) {
            return static::render(array(
                'error' => $error->getMessage(),
                'code' => $error->validationCode(),
                'issues' => $error->issues(),
            ), 422);
        }

        $message = $error->getMessage();
        $isLocation = strncmp($message, 'Location ', 9) === 0;
        return static::render(array(
            'error' => $message,
            'code' => 'record_validation_failed',
            'issues' => array(array(
                'path' => $isLocation ? array('location') : array(),
                'message' => $message,
                'keyword' => $isLocation ? 'location' : 'invalid',
            )),
        ), 422);
    }


}
