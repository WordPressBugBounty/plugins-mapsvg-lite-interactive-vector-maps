<?php

declare(strict_types=1);

namespace MapSVG\Shared\Collection;

final class CollectionReadSchema
{
    private int $id;
    private string $name;
    private string $title;
    private string $type;
    private array $fields;
    private string $revision;

    public function __construct(
        int $id,
        string $name,
        string $title,
        string $type,
        array $fields,
        string $revision
    ) {
        if ($id < 1 || $name === '' || strlen($name) > 255 || strlen($title) > 255
            || strlen($type) > 64 || !preg_match('/\A[a-f0-9]{64}\z/D', $revision)) {
            throw new \InvalidArgumentException('Invalid Collection schema snapshot.');
        }
        foreach ($fields as $fieldName => $field) {
            if (!is_string($fieldName) || $fieldName === '' || !is_array($field)
                || !is_string($field['type'] ?? null) || $field['type'] === '') {
                throw new \InvalidArgumentException('Invalid Collection field metadata.');
            }
        }

        $this->id = $id;
        $this->name = $name;
        $this->title = $title;
        $this->type = $type;
        $this->fields = json_decode(json_encode($fields, JSON_THROW_ON_ERROR), true, 512, JSON_THROW_ON_ERROR);
        $this->revision = $revision;
    }

    public function id(): int { return $this->id; }
    public function name(): string { return $this->name; }
    public function title(): string { return $this->title; }
    public function type(): string { return $this->type; }
    public function fields(): array { return $this->fields; }
    public function revision(): string { return $this->revision; }
}
