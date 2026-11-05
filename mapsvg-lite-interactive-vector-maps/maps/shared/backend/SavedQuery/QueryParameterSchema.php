<?php

declare(strict_types=1);
namespace MapSVG\Shared\SavedQuery;

use MapSVG\Shared\QueryRpc\RpcJson;
use Opis\JsonSchema\Validator;

/** Standard JSON Schema, deliberately limited to scalar RPC parameters in this first slice. */
final class QueryParameterSchema
{
    private string $json;
    private array $properties;
    public function __construct(string $json)
    {
        if (strlen($json) > RpcJson::PARAMS_BYTES) throw new \LengthException('Parameter schema too large.');
        $schema = json_decode($json, false, 32, JSON_THROW_ON_ERROR);
        RpcJson::object($schema, array('$schema', 'type', 'properties', 'required', 'additionalProperties', 'title', 'description'));
        if (($schema->type ?? null) !== 'object' || ($schema->additionalProperties ?? null) !== false
            || (isset($schema->{'$schema'}) && $schema->{'$schema'} !== 'https://json-schema.org/draft/2020-12/schema')) {
            throw new \InvalidArgumentException('Parameters require a closed object JSON Schema.');
        }
        $properties = get_object_vars(RpcJson::object($schema->properties ?? null));
        if (count($properties) > 50) throw new \LengthException('Too many Query parameters.');
        foreach ($properties as $name => $property) {
            RpcJson::queryName($name);
            RpcJson::object($property, array('type', 'enum', 'const', 'minimum', 'maximum', 'exclusiveMinimum',
                'exclusiveMaximum', 'multipleOf', 'minLength', 'maxLength', 'title', 'description'));
            if (!in_array($property->type ?? null, array('string', 'integer', 'number', 'boolean'), true)) {
                throw new \InvalidArgumentException('Only scalar Query parameters are supported.');
            }
            if (isset($property->enum)) {
                if (!is_array($property->enum) || count($property->enum) > 100) throw new \InvalidArgumentException('Invalid parameter enum.');
                foreach ($property->enum as $item) if (!is_scalar($item) && $item !== null) throw new \InvalidArgumentException('Invalid enum value.');
            }
            if (property_exists($property, 'const') && !is_scalar($property->const) && $property->const !== null) {
                throw new \InvalidArgumentException('Invalid constant parameter.');
            }
        }
        $required = $schema->required ?? array();
        if (!is_array($required) || array_values($required) !== $required) throw new \InvalidArgumentException('Invalid required parameters.');
        foreach ($required as $name) if (!is_string($name) || !array_key_exists($name, $properties)) throw new \InvalidArgumentException('Unknown required parameter.');
        $this->json = RpcJson::encode(RpcJson::copy($schema, RpcJson::PARAMS_BYTES));
        $this->properties = json_decode(RpcJson::encode((object) $properties), true, 512, JSON_THROW_ON_ERROR);
        // Compile now; invalid schema keywords fail at definition load, not after SQL.
        $this->validator()->validate(new \stdClass(), json_decode($this->json));
    }
    public function properties(): array { return $this->properties; }
    public function json(): string { return $this->json; }
    public function validate(\stdClass $params): \stdClass
    {
        $copy = RpcJson::object(RpcJson::copy($params, RpcJson::PARAMS_BYTES));
        if (!$this->validator()->validate($copy, json_decode($this->json))->isValid()) {
            throw new \InvalidArgumentException('Invalid Query parameters.');
        }
        return $copy;
    }
    private function validator(): Validator
    {
        $validator = new Validator(null, 10, false);
        // Schema keywords above exclude references/extensions; disable resolution as defense in depth.
        $validator->setResolver(null);
        return $validator;
    }
}
