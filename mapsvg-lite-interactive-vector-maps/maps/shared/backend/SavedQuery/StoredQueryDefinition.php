<?php

declare(strict_types=1);
namespace MapSVG\Shared\SavedQuery;

use MapSVG\Shared\QueryRpc\RpcJson;

/** Immutable request-local snapshot. Internal ID/revision are not a reusable access grant. */
final class StoredQueryDefinition
{
    private array $value;
    private QueryRpcOptions $options;
    private string $revision;
    public function __construct(array $value)
    {
        if (!is_string($value['id'] ?? null) || $value['id'] === ''
            || !is_int($value['schemaId'] ?? null) || $value['schemaId'] < 1
            || (!is_array($value['input'] ?? null) && !($value['input'] ?? null) instanceof \stdClass) || !is_array($value['fields'] ?? null)
            || !is_string($value['schemaRevision'] ?? null)) {
            throw new \InvalidArgumentException('Invalid stored Query definition.');
        }
        RpcJson::queryName($value['name'] ?? null);
        $copy = RpcJson::copyResult($value, RpcJson::REQUEST_BYTES);
        $this->value = json_decode(RpcJson::encode($copy), true, 512, JSON_THROW_ON_ERROR);
        $this->value['input'] = SavedQueryInput::members($value['input']);
        $this->options = QueryRpcOptions::fromArray($this->value['rpc'] ?? null);
        $this->options->assertFields($this->value['fields'], $this->value['input']);
        $this->revision = hash('sha256', RpcJson::encode($copy));
    }
    public function id(): string { return $this->value['id']; }
    public function name(): string { return $this->value['name']; }
    public function schemaId(): int { return $this->value['schemaId']; }
    public function schemaRevision(): string { return $this->value['schemaRevision']; }
    public function revision(): string { return $this->revision; }
    public function fields(): array { return $this->value['fields']; }
    public function input(): array { return SavedQueryInput::copy($this->value['input']); }
    public function options(): QueryRpcOptions { return $this->options; }
}
