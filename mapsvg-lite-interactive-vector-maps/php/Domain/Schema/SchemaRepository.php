<?php

namespace MapSVG;

class SchemaRepository extends Repository
{

	/* @var Database $db Database instance */
	protected $db;

	public static $className = 'Schema';

	/**
	 * Find schema by Collection name
	 *
	 * @param string $name Collection name
	 * @return Schema|null Returns Schema, if found; bool false if not found.
	 */
	function findByName($name)
	{

		$res = $this->source->findOne(["name" => $name]);

		if ($res) {
			$data = $this->decodeParams($res);
			$schema =  new Schema($data);
			return $schema;
		} else {
			return null;
		}
	}

	/**
	 * Creates a new schema and table
	 *
	 * @param Schema $schema
	 * @return Schema
	 */
	function create($schema)
	{
		if (!is_object($schema)) {
			$schema = $this->newObject(SchemaSqlDefinition::input($schema));
		}


		if (isset($schema->id)) {
			unset($schema->id);
		}

		if ($schema->type === 'post' && !empty($schema->postType)) {
			if (!$this->source->isUnique(['type' => 'post', 'postType' => $schema->postType])) {
				throw new \Exception(
					"A schema for post type '{$schema->postType}' already exists."
				);
			}
		}

		// Get default fields for schema
		if ($schema->type === "object" || $schema->type === "region" || $schema->type === "post" || $schema->type === "api") {
			if (empty($schema->fields)) {
				$defSchema = RepositoryFactory::getDefaultSchema($schema->name, $schema->type);
				if ($schema->type === "post") {
					foreach ($defSchema->fields as $field) {
						if (isset($field->type) && $field->type === 'post') {
							$field->post_type = $schema->postType;
						}
					}
				}
				$schema->fields = $defSchema->fields;
			}

		}

		$this->validateForWrite($schema);
		$dataForDB = $this->encodeParams($schema->getData());


		$data = $this->source->create($dataForDB);
		if (!is_array($data)) {
			throw new \Exception("data is not an array.");
		}

		$pk = $schema->getPrimaryKeyFieldName();
		if (isset($data[$pk])) {
			$schema->setId($data[$pk]);
		} elseif (isset($data['id'])) {
			$schema->setId($data['id']);
		}

		// Don't create new table for "api"
		if ($schema->type === "object" || $schema->type === "post" || $schema->type === "region") {
			$this->tableSet($schema);
		}

		return $schema;
	}

	/**
	 * Updates a schema and optionally alters its database table.
	 *
	 * @param array|Schema $data Schema instance or array of schema options.
	 * @param bool         $skip_db_update If true, table will not be altered (only the schema is saved).
	 * @return Schema
	 */
	public function update($data, $skip_db_update = false)
	{

		if (!($data instanceof Schema)) {
			/** @var Schema $schema */
			$data = SchemaSqlDefinition::input($data);
			$existing = $this->findById($data['id']);
			if (!$existing || !$existing->id) throw new \InvalidArgumentException('Schema not found.', 404);
			$schema = clone $existing;
			$schema->update($data);
		} else {
			$schema = clone $data;
		}

		$this->validateForWrite($schema);
		parent::update($schema);
		if (!$skip_db_update) {
			if ($schema->type === "region" || $schema->type === "object" || $schema->type === "post") {
				$this->tableSet($schema);
			}
		}

		return $schema;
	}

	/**
	 * Deletes a schema row and drops its physical data table (if any).
	 *
	 * @param int $id Schema id.
	 * @return mixed
	 */
	public function delete($id)
	{
		if (!$this->db) {
			$this->db = Database::get();
		}

		$schema = $this->findById($id);
		if (!$schema) {
			return false;
		}

		if ($schema->type === 'region') {
			throw new \Exception('Region data sources cannot be deleted.');
		}

		if (
			!empty($schema->name)
			&& in_array($schema->type, ['object', 'post'], true)
		) {
			$this->dropSchemaTable($schema->name);

			$this->db->delete($this->db->mapsvg_prefix . 'r2o', [
				'objects_table' => $schema->name,
			]);
		}

		return parent::delete($id);
	}

	/**
	 * Drop the physical MySQL table for a schema name.
	 *
	 * @param string $schemaName Short schema name (without mapsvg prefix).
	 */
	private function dropSchemaTable(string $schemaName): void
	{
		if (!$this->db) {
			$this->db = Database::get();
		}

		$safeName = preg_replace('/[^a-zA-Z0-9_]/', '', $schemaName);
		if ($safeName === '') {
			return;
		}

		$table = $this->db->mapsvg_prefix . $safeName;
		$tableExists = (bool) $this->db->get_var($this->db->prepare('SHOW TABLES LIKE %s', $table));
		if (!$tableExists) {
			return;
		}

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is sanitized
		$this->db->query('DROP TABLE IF EXISTS `' . esc_sql($table) . '`');
	}

	/**
	 * Rename a schema table when the schema name changes (e.g. post data source rename).
	 *
	 * @param string $oldSchemaName Previous schema name.
	 * @param string $newSchemaName New schema name.
	 * @throws \Exception When the target table already exists or rename fails.
	 */
	private function renamePostsTable(string $oldSchemaName, string $newSchemaName): void
	{
		if (!$this->db) {
			$this->db = Database::get();
		}

		$oldTable = $this->db->mapsvg_prefix . preg_replace('/[^a-zA-Z0-9_]/', '', $oldSchemaName);
		$newTable = $this->db->mapsvg_prefix . preg_replace('/[^a-zA-Z0-9_]/', '', $newSchemaName);

		if ($oldTable === $newTable) {
			return;
		}

		$oldTableExists = (bool) $this->db->get_var($this->db->prepare('SHOW TABLES LIKE %s', $oldTable));
		if (!$oldTableExists) {
			return;
		}

		$newTableExists = (bool) $this->db->get_var($this->db->prepare('SHOW TABLES LIKE %s', $newTable));
		if ($newTableExists) {
			throw new \Exception("Cannot rename table: target table '{$newTable}' already exists.");
		}

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table names are sanitized
		$this->db->query(
			'RENAME TABLE `' . esc_sql($oldTable) . '` TO `' . esc_sql($newTable) . '`'
		);

		if ($this->db->last_error) {
			throw new \Exception(
				"Failed to rename table from '{$oldTable}' to '{$newTable}': " . $this->db->last_error
			);
		}
	}

	/** Validate before metadata persistence, including identifiers read back from an existing table. */
	private function validateForWrite($schema): void
	{
		if (!$this->db) $this->db = Database::get();
		SchemaSqlDefinition::validate($schema);
		$schema->ensureInternalFields();
		SchemaSqlDefinition::validate($schema);
		$table = $this->db->mapsvg_prefix . $schema->name;
		$quoted = SchemaSqlDefinition::identifier($table);
		if (static::tableExists($schema->name)) {
			foreach ($this->db->get_col("DESC {$quoted}", 0) as $column) SchemaSqlDefinition::identifier($column);
		}
	}

	/**
	 * Create or alter custom table structure
	 */
	private function tableSet($schema)
	{

		$fields                 = array();

		if (!$this->db) {
			$this->db = Database::get();
		}

		$this->validateForWrite($schema);
		$tableNameSanitized = $this->db->mapsvg_prefix . $schema->name;
		$tableSql = SchemaSqlDefinition::identifier($tableNameSanitized);
		$defaults = [];

		$pkField              = $schema->getPrimaryKeyFieldName();
		$old_searchable_fields  = $schema->getSearchableFields($schema->getPrevFields(), ['onlyNames' => true, 'onlyFulltext' => true]);
		$searchable_fields      = $schema->getSearchableFields(null, ['onlyNames' => true, 'onlyFulltext' => true]);
		$new_field_names        = array($pkField);
		$primary_key            = '';
		$update_options         = array();
		$new_options            = array();
		$prev_options           = array();
		$clear_fields           = array();

		foreach ($schema->getFields() as $field) {

			$field = (array)$field;

			$field['type'] = strtolower($field['type']);

			if ($field['type'] == 'id' && ($field['db_type'] === 'varchar(255)' || strpos($field['db_type'], 'varchar') === 0)) {
				$primary_key = 'PRIMARY KEY  (`' . $field['name'] . '`(40))';
			} elseif ($field['type'] == 'id') {
				$primary_key = 'PRIMARY KEY  (`' . $field['name'] . '`)';
			}

			if ($field['type'] == 'select') {
				if (!isset($field['multiselect'])) {
					$field['multiselect'] = false;
				}
			}

			if ($field['type'] == 'select' && $field['multiselect'] === true) {
				$field['type'] = 'text';
			}

			$field_create_db_string = SchemaSqlDefinition::identifier($field['name']) . ' ' . $field['db_type'];
			if (array_key_exists('db_default', $field)) {
				$defaults[$field['name']] = SchemaSqlDefinition::defaultSql($field['db_default'], $field['db_type']);
				$field_create_db_string .= ' DEFAULT ' . $defaults[$field['name']];
			}
			if (isset($field['not_null']) && $field['not_null']) {
				$field_create_db_string .= ' NOT NULL';
			}
			if (isset($field['auto_increment']) && $field['auto_increment']) {
				$field_create_db_string .= ' AUTO_INCREMENT';
			}
			$fields[]          = $field_create_db_string;
			$new_field_names[] = $field['name'];

			if (($field['type'] == 'select' && $field['multiselect'] !== true) || $field['type'] == 'radio' || $field['type'] == 'status') {
				$db_string = SchemaSqlDefinition::identifier($field['name'] . '_text') . ' varchar(255)';
				if (isset($field['db_default'])) {
					foreach ($field['options'] as $opt) {
						$opt = (array)$opt;
						if ((string)$opt['value'] === (string)$field['db_default']) {
							$defaults[$field['name'] . '_text'] = SchemaSqlDefinition::stringLiteral($opt['label']);
							$db_string .= ' DEFAULT ' . $defaults[$field['name'] . '_text'];
							break;
						}
					}
				}
				$fields[] = $db_string;
				$new_field_names[] = $field['name'] . '_text';
			}

			if (isset($field['type']) && $field['type'] == 'location') {
				$fields[] = 'location_lat FLOAT(10,7)';
				$fields[] = 'location_lng FLOAT(10,7)';
				$fields[] = 'location_x FLOAT';
				$fields[] = 'location_y FLOAT';
				$fields[] = 'location_address TEXT';
				$fields[] = 'location_img varchar(255)';
				$fields[] = 'location_geocoding_status TINYINT UNSIGNED NOT NULL DEFAULT 6';
				$new_field_names[] = 'location_lat';
				$new_field_names[] = 'location_lng';
				$new_field_names[] = 'location_x';
				$new_field_names[] = 'location_y';
				$new_field_names[] = 'location_address';
				$new_field_names[] = 'location_img';
				$new_field_names[] = 'location_geocoding_status';
			}

			if (isset($field['options']) && $field['type'] != 'region') {
				$new_options[$field['name']] = array();
				foreach ($field['options'] as $o) {
					$o = (array)$o;
					$new_options[$field['name']][(string)$o['value']] = $o['label'];
				}
			}
		}

		if (!empty($schema->getPrevFields())) foreach ($schema->getPrevFields() as $_field) {
			$_field = json_decode(wp_json_encode($_field, JSON_UNESCAPED_UNICODE), true);

			if (isset($_field['options']) && $_field['type'] != 'marker' && $_field['type'] != 'region') {
				$prev_options[$_field['name']] = array();
				foreach ($_field['options'] as $_o) {
					$prev_options[$_field['name']][(string)$_o['value']] = $_o['label'];
				}
				if (!isset($prev_options[$_field['name']]) || !is_array($prev_options[$_field['name']]))
					$prev_options[$_field['name']] = array();
				if (!isset($new_options[$_field['name']]) || !is_array($new_options[$_field['name']]))
					$new_options[$_field['name']] = array();

				$diff = array_diff_assoc($new_options[$_field['name']], $prev_options[$_field['name']]);
				if (!isset($_field['multiselect'])) {
					$_field['multiselect'] = false;
				}

				if ($diff) {
					$update_options[] = array(
						'name'             => $_field['name'],
						'type'             => $_field['type'],
						'next_multiselect' => (bool)$_field['multiselect'],
						'prev_multiselect' => (bool)$_field['multiselect'],
						'options'          => $diff
					);
				}

				if ($_field['type'] == 'select' && ((bool)$_field['multiselect'] != (bool)$_field['multiselect'])) {
					$clear_fields[] = $_field['name'];
				}
			}
		}


		$table_exists = static::tableExists($schema->name);

		if ($table_exists && ($searchable_fields != $old_searchable_fields)) {
			$index = $this->db->get_row("SHOW INDEX FROM {$tableSql} WHERE Key_name = '_keywords'", OBJECT);
			if ($index) {
				$this->db->query("DROP INDEX `_keywords` ON {$tableSql}");
			}
		}

		$searchable_fields_sanitized = '';
		if (!empty($searchable_fields)) {
			$searchable_fields = array_map(function ($field) {
				return SchemaSqlDefinition::identifier($field);
			}, $searchable_fields);
			$searchable_fields_sanitized = ",\nFULLTEXT KEY _keywords (" . implode(',', $searchable_fields) . ')';
		} else {
			$searchable_fields_sanitized = '';
		}

		if (version_compare($this->db->db_version(), '5.6.0', '<')) {
			$engine = " ENGINE=MyISAM ";
		} else {
			$engine = " ENGINE=InnoDB ";
		}

		$charset_collate   = "default character set utf8\ncollate utf8_unicode_ci";

		$sql = "CREATE TABLE $tableSql (
		" . implode(",\n", $fields) . ",
		" . $primary_key . $searchable_fields_sanitized . "
		) " . $engine . $charset_collate;

		require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
		// dbDelta must never split a SQL literal on semicolons.
		dbDelta([$sql]);
		// dbDelta does not reliably compare/parse quoted defaults. Apply validated literals ourselves.
		foreach ($defaults as $column => $default) {
			$columnSql = SchemaSqlDefinition::identifier($column);
			$this->db->query("ALTER TABLE {$tableSql} ALTER COLUMN {$columnSql} SET DEFAULT {$default}");
		}
		foreach ($schema->getPrevFields() as $previous) {
			$previousColumns = [$previous->name];
			if (($previous->type === 'select' && empty($previous->multiselect)) || in_array($previous->type, ['radio', 'status'], true)) {
				$previousColumns[] = $previous->name . '_text';
			}
			foreach ($previousColumns as $column) {
				if (property_exists($previous, 'db_default') && in_array($column, $new_field_names, true) && !array_key_exists($column, $defaults)) {
					$columnSql = SchemaSqlDefinition::identifier($column);
					$this->db->query("ALTER TABLE {$tableSql} ALTER COLUMN {$columnSql} DROP DEFAULT");
				}
			}
		}

		// DROP removed columns
		$columns = $this->db->get_col("DESC {$tableSql}", 0);
		foreach ($columns as $column_name) {
			if (!in_array($column_name, $new_field_names)) {
				$columnSql = SchemaSqlDefinition::identifier($column_name);
				$this->db->query("ALTER TABLE {$tableSql} DROP COLUMN {$columnSql}");
			}
		}

		if ($update_options) {
			$field = '';
			foreach ($update_options as $field) {
				foreach ($field['options'] as $id => $label) {
					$data = array();
					if ($field['type'] == 'select' && ($field['prev_multiselect'] === true || $field['next_multiselect'] === true)) {
						if ($field['prev_multiselect'] === true && $field['next_multiselect'] === true) {
							$columnSql = SchemaSqlDefinition::identifier($field['name']);
							if (!array_key_exists($id, $prev_options[$field['name']])) continue;
							$prev = '"label":' . wp_json_encode($prev_options[$field['name']][$id], JSON_UNESCAPED_UNICODE);
							$next = '"label":' . wp_json_encode($label, JSON_UNESCAPED_UNICODE);
							$query = $this->db->prepare("UPDATE {$tableSql} SET {$columnSql} = REPLACE({$columnSql}, %s, %s)", $prev, $next);
							$this->db->query($query);
						} else {
							$columnSql = SchemaSqlDefinition::identifier($field['name']);
							$this->db->query("UPDATE {$tableSql} SET {$columnSql}=''");
						}
					} else {
						$f = $field['name'] . '_text';
						$data[$f] = $label;
						$where = array();
						$where[$field['name']] = $id;
						$this->db->update($tableNameSanitized, $data, $where);
					}
				}
			}
		}

		if ($clear_fields) {
			$field = '';
			foreach ($clear_fields as $field) {
				$columnSql = SchemaSqlDefinition::identifier($field);
				$this->db->query("UPDATE {$tableSql} SET {$columnSql}='' ");
			}
		}

		// Clear previous fields list
		$schema->clearPrevFields();
	}

	public function decodeParams($data)
	{
		if (!$data) return null;
		$data['fields'] = json_decode($data['fields']);
		if (isset($data["apiEndpoints"]) && is_string($data["apiEndpoints"])) {
			$data['apiEndpoints'] = json_decode($data['apiEndpoints'], true);
		}

		return $this->newObject($data);
	}

	public function encodeParams($data, $options = false)
	{

		if (is_object($data) && method_exists($data, 'getData')) {
			$data = $data->getData();
		}

		$data = (array)$data;

		foreach ($data as $key => $val) {
			if ($val === null) {
				unset($data[$key]);
			}
		}
		if (isset($data["fields"]) && !is_string($data['fields'])) {
			$data['fields'] = wp_json_encode($data['fields'], JSON_UNESCAPED_UNICODE);
		}


		if (isset($data["apiEndpoints"]) && !is_string($data["apiEndpoints"])) {
			$data["apiEndpoints"] = wp_json_encode($data["apiEndpoints"], JSON_UNESCAPED_UNICODE);
		}

		return $data;
	}

	public static function tableExists($name)
	{
		$db = Database::get();
		$tableNameSanitized = $db->mapsvg_prefix . preg_replace('/[^a-zA-Z0-9_]/', '', $name);
		$table_exists = $db->get_var($db->prepare("SHOW TABLES LIKE %s", $db->esc_like($tableNameSanitized)));
		return (bool)$table_exists;
	}
}
