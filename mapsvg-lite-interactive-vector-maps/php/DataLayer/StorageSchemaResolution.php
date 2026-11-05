<?php

declare(strict_types=1);

namespace MapSVG\DataLayer;

/** Immutable result of reconciling MapSVG UI schema with physical storage. */
final class StorageSchemaResolution
{
    private string $modelKey;
    private string $logicalTable;
    private string $physicalTable;
    private string $primaryKey;
    private string $declaredPrimaryKey;

    /** @var array<string, mixed> */
    private array $modelDefinition;
    /** @var array<string, array<string, mixed>> */
    private array $expectedColumns;
    /** @var array<string, array<string, mixed>> */
    private array $actualColumns;
    /** @var string[] */
    private array $missingExpectedColumns;
    /** @var string[] */
    private array $extraActualColumns;

    /**
     * @param array<string, mixed> $modelDefinition
     * @param array<string, array<string, mixed>> $expectedColumns
     * @param array<string, array<string, mixed>> $actualColumns
     * @param string[] $missingExpectedColumns
     * @param string[] $extraActualColumns
     */
    public function __construct(
        string $modelKey,
        string $logicalTable,
        string $physicalTable,
        string $primaryKey,
        string $declaredPrimaryKey,
        array $modelDefinition,
        array $expectedColumns,
        array $actualColumns,
        array $missingExpectedColumns,
        array $extraActualColumns
    ) {
        $this->modelKey = $modelKey;
        $this->logicalTable = $logicalTable;
        $this->physicalTable = $physicalTable;
        $this->primaryKey = $primaryKey;
        $this->declaredPrimaryKey = $declaredPrimaryKey;
        $this->modelDefinition = $modelDefinition;
        $this->expectedColumns = $expectedColumns;
        $this->actualColumns = $actualColumns;
        $this->missingExpectedColumns = array_values($missingExpectedColumns);
        $this->extraActualColumns = array_values($extraActualColumns);
    }

    public function modelKey(): string
    {
        return $this->modelKey;
    }

    public function logicalTable(): string
    {
        return $this->logicalTable;
    }

    public function physicalTable(): string
    {
        return $this->physicalTable;
    }

    public function primaryKey(): string
    {
        return $this->primaryKey;
    }

    public function declaredPrimaryKey(): string
    {
        return $this->declaredPrimaryKey;
    }

    /** @return array<string, mixed> */
    public function modelDefinition(): array
    {
        return $this->modelDefinition;
    }

    /** @return array<string, array<string, mixed>> */
    public function expectedColumns(): array
    {
        return $this->expectedColumns;
    }

    /** @return array<string, array<string, mixed>> */
    public function actualColumns(): array
    {
        return $this->actualColumns;
    }

    /** @return string[] */
    public function missingExpectedColumns(): array
    {
        return $this->missingExpectedColumns;
    }

    /** @return string[] */
    public function extraActualColumns(): array
    {
        return $this->extraActualColumns;
    }

    /** @return array<string, array<string, mixed>> */
    public function plasmaSchema(): array
    {
        return array($this->modelKey => $this->modelDefinition);
    }
}
