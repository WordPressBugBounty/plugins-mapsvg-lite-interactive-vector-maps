<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\SavedQuery;

use MapSVG\Controller;
use MapSVG\DataLayer\Query\AdvancedQueryRequired;
use MapSVG\Logger;
use MapSVG\RepositoryFactory;

/** REST boundary for global query definitions and saved-query invocation. */
final class SavedQueryController extends Controller
{
    public static function folders($request)
    {
        return self::respond(static function (SavedQueryStore $store) {
            return array('items' => $store->folders());
        });
    }

    public static function createFolder($request)
    {
        return self::respond(static function (SavedQueryStore $store) use ($request) {
            $title = self::body($request, array('title'))['title'] ?? null;
            if (!is_string($title)) throw new \InvalidArgumentException('Folder title is required.');
            return $store->createFolder($title);
        }, 201);
    }

    public static function getFolder($request)
    {
        return self::respond(static function (SavedQueryStore $store) use ($request) {
            $folder = $store->folder(self::folderId($request));
            if (!$folder) throw new \OutOfBoundsException('Folder not found.');
            return $folder;
        });
    }

    public static function updateFolder($request)
    {
        return self::respond(static function (SavedQueryStore $store) use ($request) {
            $title = self::body($request, array('title'))['title'] ?? null;
            if (!is_string($title)) throw new \InvalidArgumentException('Folder title is required.');
            $folder = $store->updateFolder(self::folderId($request), $title);
            if (!$folder) throw new \OutOfBoundsException('Folder not found.');
            return $folder;
        });
    }

    public static function deleteFolder($request)
    {
        return self::respond(static function (SavedQueryStore $store) use ($request) {
            if (!$store->deleteFolder(self::folderId($request))) {
                throw new \OutOfBoundsException('Folder not found.');
            }
            return array('deleted' => true);
        });
    }

    public static function queries($request)
    {
        return self::respond(static function (SavedQueryStore $store) {
            return array('items' => $store->queries());
        });
    }

    public static function createQuery($request)
    {
        return self::respond(static function (SavedQueryStore $store) use ($request) {
            $body = self::body($request, array('id', 'name', 'schemaId', 'folderId', 'builder', 'input', 'rpc'));
            unset($body['id']);
            QueryRpcManagementPolicy::assertWrite(null, $body);
            return $store->createQuery($body);
        }, 201);
    }

    public static function getQuery($request)
    {
        return self::respond(static function (SavedQueryStore $store) use ($request) {
            $query = $store->query(self::queryId($request));
            if (!$query) throw new \OutOfBoundsException('Query not found.');
            return $query;
        });
    }

    public static function updateQuery($request)
    {
        return self::respond(static function (SavedQueryStore $store) use ($request) {
            $id = self::queryId($request);
            $body = self::body($request, array('id', 'name', 'schemaId', 'folderId', 'builder', 'input', 'rpc'));
            if (array_key_exists('id', $body) && $body['id'] !== $id) {
                throw new \InvalidArgumentException('Query ID cannot be changed.');
            }
            $query = $store->updateQuery($id, $body, array(QueryRpcManagementPolicy::class, 'assertWrite'));
            if (!$query) throw new \OutOfBoundsException('Query not found.');
            return $query;
        });
    }

    public static function deleteQuery($request)
    {
        return self::respond(static function (SavedQueryStore $store) use ($request) {
            $id = self::queryId($request);
            if (!$store->deleteQuery($id, array(QueryRpcManagementPolicy::class, 'assertWrite'))) {
                throw new \OutOfBoundsException('Query not found.');
            }
            return array('deleted' => true);
        });
    }

    public static function execute($request)
    {
        try {
            if (!GlobalQueriesFeature::isEnabled()) {
                return new \WP_REST_Response(array('error' => 'The saved query service is unavailable.'), 503);
            }
            $body = self::body($request, array('queryId', 'skip', 'take', 'mapId', 'role', 'runtime', 'versionId'));
            $queryId = $body['queryId'] ?? null;
            if (!is_string($queryId) || !preg_match('/\A[a-zA-Z0-9-]{1,64}\z/D', $queryId)) {
                throw new \InvalidArgumentException('queryId is required.');
            }
            $pagination = array();
            foreach (array('skip', 'take') as $key) {
                if (!array_key_exists($key, $body)) continue;
                if (!is_int($body[$key]) || $body[$key] < 0) {
                    throw new \InvalidArgumentException($key . ' must be a non-negative integer.');
                }
                $pagination[$key] = $body[$key];
            }
            if (array_key_exists('mapId', $body)) {
                $mapId = self::mapId($body['mapId']);
                $role = $body['role'] ?? null;
                if (!$mapId || !in_array($role, array('objects', 'regions'), true)) {
                    throw new \InvalidArgumentException('Valid mapId and role are required.');
                }
                $runtime = array_key_exists('runtime', $body) ? $body['runtime'] : array();
                // Legacy Map callers use [] for an empty filter object.
                if (!is_array($runtime) || ($runtime !== array() && array_values($runtime) === $runtime)) {
                    throw new \InvalidArgumentException('Runtime filters must be an object.');
                }
                $service = new SavedQueryExecutionService();
                $map = RepositoryFactory::get('map')->findById($mapId);
                if (array_key_exists('versionId', $body)) \MapSVG\AppPublishedVersion::apply($map, $body['versionId']);
                $result = $service->executeBound($map, $role, $queryId, $pagination, $runtime, !current_user_can('edit_posts'));
            } else {
                if (!current_user_can('edit_posts')) return new \WP_REST_Response(array('error' => 'Forbidden.'), 403);
                if (array_key_exists('role', $body) || array_key_exists('runtime', $body) || array_key_exists('versionId', $body)) {
                    throw new \InvalidArgumentException('Map bindings are required for runtime filters.');
                }
                $result = (new SavedQueryExecutionService())->execute($queryId, $pagination);
            }
            return new \WP_REST_Response($result, 200);
        } catch (\OutOfBoundsException $error) {
            return new \WP_REST_Response(array('error' => $error->getMessage()), 404);
        } catch (\DomainException $error) {
            return new \WP_REST_Response(array('error' => $error->getMessage()), 403);
        } catch (\UnexpectedValueException $error) {
            return new \WP_REST_Response(array('error' => $error->getMessage()), 409);
        } catch (AdvancedQueryRequired $error) {
            return new \WP_REST_Response(array('error' => $error->getMessage(), 'reasons' => $error->reasons()), 422);
        } catch (\InvalidArgumentException | \LengthException $error) {
            return new \WP_REST_Response(array('error' => $error->getMessage()), 400);
        } catch (\Throwable $error) {
            Logger::error('[GLOBAL-QUERY-RPC] ' . $error->getMessage());
            return new \WP_REST_Response(array('error' => 'The saved query could not be executed.'), 500);
        }
    }

    private static function respond(callable $operation, int $successStatus = 200)
    {
        try {
            // Store DTOs are already plain JSON. Do not round their numbers in
            // Controller::render before the owned final WordPress JSON writer.
            return new \WP_REST_Response($operation(new SavedQueryStore()), $successStatus);
        } catch (\OutOfBoundsException $error) {
            return new \WP_REST_Response(array('error' => $error->getMessage()), 404);
        } catch (AdvancedQueryRequired $error) {
            return new \WP_REST_Response(array('error' => $error->getMessage(), 'reasons' => $error->reasons()), 422);
        } catch (\InvalidArgumentException | \LengthException $error) {
            return new \WP_REST_Response(array('error' => $error->getMessage()), 400);
        } catch (\DomainException $error) {
            return new \WP_REST_Response(array('error' => $error->getMessage()), 409);
        } catch (\Throwable $error) {
            Logger::error('[GLOBAL-QUERY-API] ' . $error->getMessage());
            return new \WP_REST_Response(array('error' => 'The query operation failed.'), 500);
        }
    }

    private static function mapId($value): int
    {
        if (is_int($value) && $value > 0) return $value;
        if (is_string($value) && preg_match('/\A[1-9][0-9]*\z/D', $value)
            && (strlen($value) < strlen((string) PHP_INT_MAX)
                || (strlen($value) === strlen((string) PHP_INT_MAX) && strcmp($value, (string) PHP_INT_MAX) <= 0))) {
            return (int) $value;
        }
        throw new \InvalidArgumentException('Valid mapId and role are required.');
    }

    private static function queryId($request): string
    {
        $id = $request->get_url_params()['id'] ?? null;
        if (!is_string($id) || !preg_match('/\A[a-zA-Z0-9-]{1,64}\z/D', $id)) {
            throw new \InvalidArgumentException('Invalid query ID.');
        }
        return $id;
    }

    private static function folderId($request): int
    {
        $id = $request->get_url_params()['id'] ?? null;
        if (!is_string($id) || !preg_match('/\A[1-9][0-9]*\z/D', $id)
            || strlen($id) > strlen((string) PHP_INT_MAX)
            || (strlen($id) === strlen((string) PHP_INT_MAX) && strcmp($id, (string) PHP_INT_MAX) > 0)) {
            throw new \InvalidArgumentException('Invalid folder ID.');
        }
        return (int) $id;
    }

    private static function body($request, array $allowed): array
    {
        // WP's associative decoding conflates [] and {}. Inspect the original
        // envelope before reading its decoded fields; never merge URL/query data.
        if (!$request->is_json_content_type()) throw new \InvalidArgumentException('A JSON object is required.');
        $raw = $request->get_body();
        if (!is_string($raw) || strlen($raw) > 262144) {
            throw new \LengthException('The JSON request is too large.');
        }
        try {
            $envelope = json_decode($raw, false, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $error) {
            throw new \InvalidArgumentException('A valid JSON object is required.');
        }
        if (!$envelope instanceof \stdClass) throw new \InvalidArgumentException('A JSON object is required.');
        $body = $request->get_json_params();
        if (!is_array($body)) {
            throw new \InvalidArgumentException('A JSON object is required.');
        }
        if (array_diff(array_keys($body), $allowed)) {
            throw new \InvalidArgumentException('Unsupported request property.');
        }
        if (property_exists($envelope, 'input')) {
            if (!$envelope->input instanceof \stdClass) {
                throw new \InvalidArgumentException('Query input must be a Prisma JSON object.');
            }
            $body['input'] = \MapSVG\Shared\SavedQuery\SavedQueryInput::fromValue($envelope->input);
        }
        return $body;
    }
}
