<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\SavedQuery;

use MapSVG\Database;
use MapSVG\DataLayer\Mapping\SchemaRecordMapper;
use MapSVG\DataLayer\Query\PrismaQueryPlanner;
use MapSVG\DataLayer\Query\QueryLimits;
use MapSVG\DataLayer\Query\QueryPlan;
use MapSVG\DataLayer\Validation\OperationValidationService;
use MapSVG\DataLayer\Validation\ValidationJson;
use MapSVG\RepositoryFactory;
use MapSVG\Schema;
use MapSVG\Shared\SavedQuery\SavedQueryInput;

/** Storage and validation boundary for installation-wide query definitions. */
final class SavedQueryStore
{
    private $db;
    private $schemaResolver;

    public function __construct($db = null, ?callable $schemaResolver = null)
    {
        $this->db = $db ?? Database::get();
        $this->schemaResolver = $schemaResolver ?? static function (int $id) {
            $repository = RepositoryFactory::get('schema');
            return $repository ? $repository->findById($id) : null;
        };
    }

    private function table(string $suffix): string
    {
        return '`' . $this->db->mapsvg_prefix . $suffix . '`';
    }

    /** @return array<int,array{id:int,title:string}> */
    public function folders(): array
    {
        $rows = $this->db->get_results('SELECT `id`, `title` FROM ' . $this->table('query_folders') . ' ORDER BY `title`, `id`');
        $this->assertReadSucceeded();
        return array_map(static function ($row): array {
            return array('id' => (int) $row->id, 'title' => (string) $row->title);
        }, $rows ?: array());
    }

    public function folder(int $id): ?array
    {
        if ($id < 1) return null;
        $row = $this->db->get_row($this->db->prepare(
            'SELECT `id`, `title` FROM ' . $this->table('query_folders') . ' WHERE `id` = %d',
            $id
        ));
        $this->assertReadSucceeded();
        return $row ? array('id' => (int) $row->id, 'title' => (string) $row->title) : null;
    }

    public function createFolder(string $title): array
    {
        $title = self::validTitle($title);
        $result = $this->db->insert($this->db->mapsvg_prefix . 'query_folders', array('title' => $title));
        if ($result === false) throw new \RuntimeException('Could not create query folder.');
        return array('id' => (int) $this->db->insert_id, 'title' => $title);
    }

    public function updateFolder(int $id, string $title): ?array
    {
        if (!$this->folder($id)) return null;
        $title = self::validTitle($title);
        if ($this->db->update($this->db->mapsvg_prefix . 'query_folders', array('title' => $title), array('id' => $id)) === false) {
            throw new \RuntimeException('Could not update query folder.');
        }
        return array('id' => $id, 'title' => $title);
    }

    public function deleteFolder(int $id): bool
    {
        if (!$this->folder($id)) return false;
        if ($this->db->query('START TRANSACTION') === false) {
            throw new \RuntimeException('Could not start query folder transaction.');
        }
        try {
            $updated = $this->db->query($this->db->prepare(
                'UPDATE ' . $this->table('saved_queries') . ' SET `folder_id` = NULL WHERE `folder_id` = %d',
                $id
            ));
            $deleted = $this->db->delete($this->db->mapsvg_prefix . 'query_folders', array('id' => $id));
            if ($updated === false || $deleted === false) {
                throw new \RuntimeException('Could not delete query folder.');
            }
            if ($this->db->query('COMMIT') === false) {
                throw new \RuntimeException('Could not commit query folder transaction.');
            }
            return true;
        } catch (\Throwable $error) {
            $this->db->query('ROLLBACK');
            throw $error;
        }
    }

    /** Creation compensation must never detach Queries added by another caller. */
    public function deleteEmptyFolder(int $id): bool
    {
        $deleted = $this->db->query($this->db->prepare(
            'DELETE FROM ' . $this->table('query_folders') . ' WHERE `id` = %d'
            . ' AND NOT EXISTS (SELECT 1 FROM ' . $this->table('saved_queries') . ' WHERE `folder_id` = %d)',
            $id, $id
        ));
        if ($deleted === false) throw new \RuntimeException('Could not remove empty query folder.');
        return $deleted > 0;
    }

    /** @return array<int,array<string,mixed>> */
    public function queries(): array
    {
        $rows = $this->db->get_results('SELECT * FROM ' . $this->table('saved_queries') . ' ORDER BY `name`');
        $this->assertReadSucceeded();
        return array_map(array(self::class, 'decodeQuery'), $rows ?: array());
    }

    public function query(string $id): ?array
    {
        $row = $this->queryRow($id);
        return $row ? self::decodeQuery($row) : null;
    }

    private function queryRow(string $id)
    {
        if ($id === '') return null;
        $row = $this->db->get_row($this->db->prepare(
            'SELECT * FROM ' . $this->table('saved_queries') . ' WHERE `id` = %s',
            $id
        ));
        $this->assertReadSucceeded();
        return $row && (string) $row->id === $id ? $row : null;
    }

    /** Exact API-name lookup; a case-insensitive DB collation must not create accidental aliases. */
    public function queryByName(string $name): ?array
    {
        \MapSVG\Shared\QueryRpc\RpcJson::queryName($name);
        $row = $this->db->get_row($this->db->prepare(
            'SELECT * FROM ' . $this->table('saved_queries') . ' WHERE `name` = %s', $name
        ));
        $this->assertReadSucceeded();
        if (!$row || (string) $row->name !== $name) return null;
        return self::decodeQuery($row);
    }

    /** @param array<string,mixed> $payload */
    public function createQuery(array $payload): array
    {
        $definition = $this->validate($payload);
        $id = isset($payload['id']) && is_string($payload['id']) ? $payload['id'] : wp_generate_uuid4();
        if (!preg_match('/^[a-zA-Z0-9-]{1,64}$/', $id)) {
            throw new \InvalidArgumentException('Invalid query ID.');
        }
        if ($this->query($id)) throw new \DomainException('Query ID already exists.');
        $data = $this->encodeQuery($id, $definition);
        if ($this->db->insert($this->db->mapsvg_prefix . 'saved_queries', $data) === false) {
            throw new \DomainException('Query name already exists or could not be saved.');
        }
        return $this->query($id);
    }

    /** @param array<string,mixed> $payload */
    public function updateQuery(string $id, array $payload, ?callable $authorize = null): ?array
    {
        $row = $this->queryRow($id);
        if (!$row) return null;
        $current = self::decodeQuery($row);
        if ($authorize !== null) $authorize($current, $payload);
        if (array_key_exists('id', $payload) && $payload['id'] !== $id) {
            throw new \InvalidArgumentException('Query ID cannot be changed.');
        }
        $definition = $this->validate(array_merge($current, $payload));
        if ($definition['name'] !== $current['name']) {
            throw new \DomainException('Query names are stable API identifiers. Create a new Query and rebind references instead of renaming it.');
        }
        if ($definition['schemaId'] !== $current['schemaId']) {
            if ($this->isBoundToMap($id)) {
                throw new \DomainException('Rebind maps before changing this query collection.');
            }
        }
        $data = $this->encodeQuery($id, $definition);
        $where = $this->writeWhere($current, $row->rpc_json ?? null);
        $affected = $this->db->update($this->db->mapsvg_prefix . 'saved_queries', $data, $where);
        if ($affected === false) throw new \DomainException('Query name already exists or could not be saved.');
        if ($affected === 0) $this->assertUnchangedWrite($id, $data + $where);
        return $this->query($id);
    }

    public function deleteQuery(string $id, ?callable $authorize = null): bool
    {
        $row = $this->queryRow($id);
        if (!$row) return false;
        $current = self::decodeQuery($row);
        if ($authorize !== null) $authorize($current, array());
        if ($this->isBoundToMap($id)) {
            throw new \DomainException('This query is used by a map. Rebind the map before deleting it.');
        }
        $deleted = $this->db->delete($this->db->mapsvg_prefix . 'saved_queries', $this->writeWhere($current, $row->rpc_json ?? null));
        if ($deleted === false) throw new \RuntimeException('Could not delete query.');
        if ($deleted === 0) throw new \DomainException('Query changed; reload before deleting.');
        return true;
    }

    /** Compare exposure metadata atomically so an in-flight private edit cannot rewrite a newly public query. */
    private function writeWhere(array $current, ?string $rpcJson): array
    {
        $where = array('id' => $current['id']);
        if (SavedQueryRpcInstaller::available($this->db)) {
            $where['rpc_json'] = $rpcJson;
        }
        return $where;
    }

    private function assertUnchangedWrite(string $id, array $expected): void
    {
        $after = $this->query($id);
        if ($after === null) throw new \DomainException('Query changed; reload before saving.');
        $encoded = $this->encodeQuery($id, $after);
        foreach ($expected as $key => $value) {
            if (($encoded[$key] ?? null) !== $value) throw new \DomainException('Query changed; reload before saving.');
        }
    }

    public function resolveSchema(int $id): ?Schema
    {
        $schema = call_user_func($this->schemaResolver, $id);
        return $schema instanceof Schema ? $schema : null;
    }

    private function isBoundToMap(string $id): bool
    {
        $maps = $this->db->get_results('SELECT `options` FROM ' . $this->table('maps'));
        $this->assertReadSucceeded();
        foreach ($maps ?: array() as $map) {
            $raw = (string) $map->options;
            if (trim($raw) === '') continue;
            try {
                $options = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
            } catch (\JsonException $error) {
                throw new \UnexpectedValueException('Stored Map options could not be read.', 0, $error);
            }
            if ($options !== null && (!is_array($options) || ($options !== array() && array_values($options) === $options))) {
                throw new \UnexpectedValueException('Stored Map options must be an object.');
            }
            $scenes = is_array($options) && is_array($options['scenes'] ?? null) ? $options['scenes'] : array();
            foreach ($scenes as $scene) {
                if (!is_array($scene)) continue;
                foreach (array('objects', 'regions') as $role) {
                    if (($scene['dataBindings'][$role]['queryId'] ?? null) === $id) return true;
                }
            }
        }
        return false;
    }

    /** @param array<string,mixed> $payload */
    private function validate(array $payload): array
    {
        $name = $payload['name'] ?? null;
        if (!is_string($name) || !preg_match('/^[a-z][a-zA-Z0-9]{0,119}$/', $name)) {
            throw new \InvalidArgumentException('Query name must be camelCase, up to 120 characters.');
        }
        if (\MapSVG\Shared\QueryRpc\BuiltinQueryNames::isReserved($name)) {
            throw new \DomainException('Query name is reserved by MapSVG.');
        }
        $schemaId = filter_var($payload['schemaId'] ?? null, FILTER_VALIDATE_INT, array('options' => array('min_range' => 1)));
        $schema = $schemaId ? $this->resolveSchema((int) $schemaId) : null;
        if (!$schema) {
            throw new \InvalidArgumentException('A valid linked table is required.');
        }
        if (method_exists($schema, 'isLocal') && !$schema->isLocal()) {
            throw new \InvalidArgumentException('Queries can be linked to local MapSVG collections only.');
        }
        $folderId = $payload['folderId'] ?? null;
        if ($folderId !== null && $folderId !== '') {
            $folderId = filter_var($folderId, FILTER_VALIDATE_INT, array('options' => array('min_range' => 1)));
            if (!$folderId || !$this->folder((int) $folderId)) {
                throw new \InvalidArgumentException('Query folder not found.');
            }
        } else {
            $folderId = null;
        }
        $builder = $payload['builder'] ?? null;
        $input = SavedQueryInput::fromValue($payload['input'] ?? null);
        if (!is_array($builder) || !in_array($builder['combinator'] ?? null, array('and', 'or'), true) || !isset($builder['rules']) || !is_array($builder['rules'])) {
            throw new \InvalidArgumentException('Invalid query builder document.');
        }
        self::validateBuilder($builder);
        $inputMembers = SavedQueryInput::members($input);
        if (array_diff(array_keys($inputMembers), array('where', 'select', 'orderBy', 'take', 'skip'))) {
            throw new \InvalidArgumentException('Unsupported query input property.');
        }
        foreach (array('builder' => $builder, 'input' => $input) as $key => $value) {
            $json = ValidationJson::encode($value, JSON_THROW_ON_ERROR);
            if (strlen($json) > 65536) {
                throw new \InvalidArgumentException($key . ' JSON is invalid or too large.');
            }
        }
        $limits = new QueryLimits(250, 5000, 500, 24, 500);
        $effectiveInput = array_merge(
            $inputMembers,
            array('take' => $inputMembers['take'] ?? 50)
        );
        (new OperationValidationService($schema, $limits))
            ->validateFindMany($effectiveInput);

        $plan = (new PrismaQueryPlanner(
            $schema,
            new SchemaRecordMapper($schema),
            null,
            $limits
        ))->plan($effectiveInput);
        if ($plan->classification() !== QueryPlan::PLASMA) {
            throw new \InvalidArgumentException('This query needs an unsupported advanced executor.');
        }
        $definition = array('name' => $name, 'schemaId' => (int) $schemaId, 'folderId' => $folderId, 'builder' => $builder, 'input' => $input);
        if (array_key_exists('rpc', $payload)) {
            if ($payload['rpc'] !== null && !is_array($payload['rpc'])) throw new \InvalidArgumentException('RPC settings must be an object or null.');
            $definition['rpc'] = null;
            if ($payload['rpc'] !== null) {
                $rpc = \MapSVG\Shared\SavedQuery\QueryRpcOptions::fromArray($payload['rpc']);
                $rpc->assertFields(QuerySchemaProjection::fields($schema), $inputMembers);
                $definition['rpc'] = $rpc->toArray();
            }
        }
        return $definition;
    }

    private static function validateBuilder(array $group, int $depth = 0, int &$nodes = 0): void
    {
        if ($depth > 24 || ++$nodes > 500 || !in_array($group['combinator'] ?? null, array('and', 'or'), true) || !isset($group['rules']) || !is_array($group['rules'])) {
            throw new \InvalidArgumentException('Invalid or overly complex query builder document.');
        }
        foreach ($group['rules'] as $rule) {
            if (!is_array($rule)) throw new \InvalidArgumentException('Invalid query builder rule.');
            if (isset($rule['rules'])) {
                self::validateBuilder($rule, $depth + 1, $nodes);
            } elseif (++$nodes > 500 || !is_string($rule['field'] ?? null) || !is_string($rule['operator'] ?? null)) {
                throw new \InvalidArgumentException('Invalid query builder rule.');
            }
        }
    }

    private static function validTitle(string $title): string
    {
        $title = trim($title);
        if ($title === '' || strlen($title) > 255) {
            throw new \InvalidArgumentException('Folder title must be 1–255 bytes.');
        }
        return $title;
    }

    private function encodeQuery(string $id, array $definition): array
    {
        $data = array(
            'id' => $id,
            'name' => $definition['name'],
            'schema_id' => $definition['schemaId'],
            'folder_id' => $definition['folderId'],
            'builder_json' => ValidationJson::encode($definition['builder'], JSON_THROW_ON_ERROR),
            'input_json' => ValidationJson::encode($definition['input'], JSON_THROW_ON_ERROR),
        );
        if (array_key_exists('rpc', $definition)) $data['rpc_json'] = $definition['rpc'] === null ? null : ValidationJson::encode($definition['rpc'], JSON_THROW_ON_ERROR);
        return $data;
    }

    private static function decodeQuery($row): array
    {
        $builder = self::decodeDocument((string) $row->builder_json);
        try {
            self::validateBuilder($builder);
        } catch (\InvalidArgumentException $error) {
            throw new \UnexpectedValueException('Stored Query builder could not be read.', 0, $error);
        }
        $result = array(
            'id' => (string) $row->id,
            'name' => (string) $row->name,
            'schemaId' => (int) $row->schema_id,
            'folderId' => $row->folder_id === null ? null : (int) $row->folder_id,
            'builder' => $builder,
            'input' => self::decodeInput((string) $row->input_json),
        );
        if (isset($row->rpc_json)) {
            $rpc = json_decode((string) $row->rpc_json, true, 64, JSON_THROW_ON_ERROR);
            if (!is_array($rpc)) throw new \UnexpectedValueException('Invalid stored RPC settings.');
            $result['rpc'] = $rpc;
        }
        return $result;
    }

    private static function decodeDocument(string $json): array
    {
        try {
            $value = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $error) {
            throw new \UnexpectedValueException('Stored Query document could not be read.', 0, $error);
        }
        if (!is_array($value) || ($value !== array() && array_values($value) === $value)) {
            throw new \UnexpectedValueException('Stored Query document must be an object.');
        }
        return $value;
    }

    private static function decodeInput(string $json)
    {
        try {
            return SavedQueryInput::fromJson($json);
        } catch (\JsonException | \InvalidArgumentException | \LengthException $error) {
            throw new \UnexpectedValueException('Stored Query input could not be read.', 0, $error);
        }
    }

    private function assertReadSucceeded(): void
    {
        $connection = isset($this->db->db) && is_object($this->db->db) ? $this->db->db : $this->db;
        if ((string) ($connection->last_error ?? '') !== '') {
            throw new \RuntimeException('Saved Query storage read failed.');
        }
    }
}
