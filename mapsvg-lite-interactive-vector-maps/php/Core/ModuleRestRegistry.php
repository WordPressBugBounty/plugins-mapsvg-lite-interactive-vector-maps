<?php

declare(strict_types=1);
namespace MapSVG\Core;

/** Owned module routes. Modules declare routes during boot; core publishes once. */
final class ModuleRestRegistry
{
    private array $routes = [];
    private bool $sealed = false;
    private bool $published = false;

    public function register(string $owner, string $route, array $args, string $namespace = 'mapsvg/v1'): void
    {
        if ($this->sealed) throw new \LogicException('Module REST registration is closed.');
        if ($owner === '' || $route === '' || $route[0] !== '/' || $namespace === '' || trim($namespace, '/') !== $namespace) {
            throw new \InvalidArgumentException('A module owner, namespace and absolute route are required.');
        }
        $key = '/' . $namespace . $route;
        if (isset($this->routes[$key])) throw new \LogicException('Duplicate module REST route: ' . $key);
        $endpoints = isset($args['callback']) ? [$args] : $args;
        if (!$endpoints) throw new \InvalidArgumentException('A module route needs endpoints.');
        foreach ($endpoints as $endpoint) {
            if (!is_array($endpoint) || empty($endpoint['methods']) || empty($endpoint['callback']) || !isset($endpoint['permission_callback'])) {
                throw new \InvalidArgumentException('Each module endpoint needs methods, callback and explicit permission_callback.');
            }
        }
        $this->routes[$key] = ['owner' => $owner, 'namespace' => $namespace, 'route' => $route, 'args' => $args];
    }

    public function collection(string $owner, string $route, array $endpoints): void
    {
        $this->register($owner, $route, self::scopeCollection($endpoints));
    }

    /** Canonical and legacy Collection routes share reserved-source and publication checks. */
    public static function scopeCollection(array $endpoints): array
    {
        foreach ($endpoints as &$endpoint) {
            $permission = $endpoint['permission_callback'];
            $endpoint['permission_callback'] = static function ($request) use ($permission) {
                $name = $request['_collection_name'];
                if (!is_string($name) || !preg_match('/^[a-zA-Z0-9_-]+$/D', $name)) {
                    return new \WP_Error('mapsvg_invalid_collection', 'Invalid collection name.', ['status' => 400]);
                }
                if (\MapSVG\RepositoryFactory::isInternalSchemaName($name)) {
                    return new \WP_Error('mapsvg_internal_collection', 'Internal repositories are not available through collection routes.', ['status' => 403]);
                }
                if (in_array($request->get_method(), ['GET', 'HEAD'], true)) {
                    $error = \MapSVG\PublicReadAccess::collectionError($name);
                    if ($error) return $error;
                }
                return call_user_func($permission, $request);
            };
        }
        unset($endpoint);
        return $endpoints;
    }

    public function seal(): void { $this->sealed = true; }
    public function publish(): void
    {
        if ($this->published) return;
        $this->sealed = true;
        $existing = rest_get_server()->get_routes();
        foreach ($this->routes as $key => $route) {
            if (isset($existing[$key])) throw new \LogicException('Module REST route conflicts with an existing route: ' . $key);
        }
        foreach ($this->routes as $route) register_rest_route($route['namespace'], $route['route'], $route['args']);
        $this->published = true;
    }
}
