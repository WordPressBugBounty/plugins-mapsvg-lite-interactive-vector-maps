<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Admin;

use MapSVG\Controller;
use MapSVG\DataLayer\Query\AdvancedQueryRequired;
use MapSVG\Logger;
use MapSVG\RepositoryFactory;

/** Authenticated React Admin canary endpoint for data-layer-v2 queries. */
final class MapDataQueryController extends Controller
{
    /** @param \WP_REST_Request $request */
    public static function execute($request)
    {
        try {
            $mapId = (int) self::requestValue($request, 'id');
            if ($mapId < 1) {
                throw new \InvalidArgumentException('A valid map id is required.');
            }

            $maps = RepositoryFactory::get('map');
            if (!$maps || !method_exists($maps, 'findById')) {
                throw new \RuntimeException('Map repository is unavailable.');
            }
            $map = $maps->findById($mapId);
            if (!is_object($map)
                || !isset($map->id)
                || (int) $map->id !== $mapId) {
                return self::render(array('error' => 'Map not found.'), 404);
            }

            $sourceRole = self::requestValue($request, 'sourceRole');
            if (!is_string($sourceRole)) {
                throw new \InvalidArgumentException('sourceRole must be a string.');
            }

            $query = self::requestValue($request, 'query');
            if ($query === null) {
                $query = array();
            }
            if (!is_array($query)) {
                throw new \InvalidArgumentException('query must be a JSON object.');
            }

            $result = (new MapDataQueryExecutor())->execute(
                $map,
                $sourceRole,
                $query
            );
            return self::render($result, 200);
        } catch (AdvancedQueryRequired $error) {
            return self::render(array(
                'error' => $error->getMessage(),
                'reasons' => $error->reasons(),
            ), 422);
        } catch (\InvalidArgumentException | \LengthException $error) {
            return self::render(array('error' => $error->getMessage()), 400);
        } catch (\UnexpectedValueException $error) {
            return self::render(array('error' => $error->getMessage()), 409);
        } catch (\Throwable $error) {
            if (class_exists(Logger::class)) {
                Logger::error('[DATA-V2-QUERY] ' . $error->getMessage());
            }
            return self::render(
                array('error' => 'The MapSVG data query could not be executed.'),
                500
            );
        }
    }

    /** @return mixed */
    private static function requestValue($request, string $name)
    {
        if (is_object($request) && method_exists($request, 'get_param')) {
            return $request->get_param($name);
        }
        if ($request instanceof \ArrayAccess) {
            return $request[$name];
        }
        if (is_array($request)) {
            return $request[$name] ?? null;
        }
        return null;
    }
}
