<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

/** Complete classification and validated Plasma options for one query. */
final class QueryPlan
{
    public const PLASMA = 'plasma';
    public const ADVANCED = 'advanced';
    public const LEGACY_RESPONSE = 'legacy';
    public const PRISMA_RESPONSE = 'prisma';

    private string $classification;
    private string $responseMode;
    /** @var array<string, mixed> */
    private array $options;
    /** @var array<string, mixed> */
    private array $countOptions;
    /** @var array<string, mixed> */
    private array $advancedOptions;
    /** @var string[] */
    private array $advancedReasons;
    private int $page;
    private int $perpage;
    private bool $fetchesExtraRow;
    private ?int $hardRowLimit;
    private bool $needsCount;
    /** @var string[]|null */
    private ?array $publicSelect;

    /**
     * @param array<string, mixed> $options
     * @param array<string, mixed> $countOptions
     * @param array<string, mixed> $advancedOptions
     * @param string[] $advancedReasons
     */
    private function __construct(
        string $classification,
        string $responseMode,
        array $options,
        array $countOptions,
        array $advancedOptions,
        array $advancedReasons,
        int $page,
        int $perpage,
        bool $fetchesExtraRow,
        ?int $hardRowLimit,
        bool $needsCount,
        ?array $publicSelect
    ) {
        if (!in_array($classification, array(self::PLASMA, self::ADVANCED), true)) {
            throw new \InvalidArgumentException('Unknown query-plan classification.');
        }
        if (!in_array($responseMode, array(self::LEGACY_RESPONSE, self::PRISMA_RESPONSE), true)) {
            throw new \InvalidArgumentException('Unknown query-plan response mode.');
        }
        if ($classification === self::ADVANCED && $advancedReasons === array()) {
            throw new \InvalidArgumentException('Advanced plans require at least one reason.');
        }

        $this->classification = $classification;
        $this->responseMode = $responseMode;
        $this->options = $options;
        $this->countOptions = $countOptions;
        $this->advancedOptions = $advancedOptions;
        $this->advancedReasons = array_values(array_unique($advancedReasons));
        $this->page = $page;
        $this->perpage = $perpage;
        $this->fetchesExtraRow = $fetchesExtraRow;
        $this->hardRowLimit = $hardRowLimit;
        $this->needsCount = $needsCount;
        $this->publicSelect = $publicSelect === null
            ? null
            : array_values($publicSelect);
    }

    /** @param array<string, mixed> $options @param array<string, mixed> $countOptions */
    public static function plasma(
        string $responseMode,
        array $options,
        array $countOptions,
        int $page,
        int $perpage,
        bool $fetchesExtraRow,
        ?int $hardRowLimit,
        bool $needsCount,
        ?array $publicSelect = null
    ): self {
        return new self(
            self::PLASMA,
            $responseMode,
            $options,
            $countOptions,
            array(),
            array(),
            $page,
            $perpage,
            $fetchesExtraRow,
            $hardRowLimit,
            $needsCount,
            $publicSelect
        );
    }

    /**
     * @param string[] $reasons
     * @param array<string, mixed> $advancedOptions
     * @param string[]|null $publicSelect
     */
    public static function advanced(
        string $responseMode,
        array $reasons,
        int $page = 1,
        int $perpage = 0,
        array $advancedOptions = array(),
        bool $fetchesExtraRow = false,
        ?int $hardRowLimit = null,
        bool $needsCount = false,
        ?array $publicSelect = null
    ): self {
        return new self(
            self::ADVANCED,
            $responseMode,
            array(),
            array(),
            $advancedOptions,
            $reasons,
            $page,
            $perpage,
            $fetchesExtraRow,
            $hardRowLimit,
            $needsCount,
            $publicSelect
        );
    }

    public function isPlasma(): bool
    {
        return $this->classification === self::PLASMA;
    }

    public function isAdvanced(): bool
    {
        return $this->classification === self::ADVANCED;
    }

    public function classification(): string
    {
        return $this->classification;
    }

    public function responseMode(): string
    {
        return $this->responseMode;
    }

    /** @return array<string, mixed> */
    public function options(): array
    {
        return $this->options;
    }

    /** @return array<string, mixed> */
    public function countOptions(): array
    {
        return $this->countOptions;
    }

    /** @return array<string, mixed> */
    public function advancedOptions(): array
    {
        return $this->advancedOptions;
    }

    /** @return string[] */
    public function advancedReasons(): array
    {
        return $this->advancedReasons;
    }

    public function page(): int
    {
        return $this->page;
    }

    public function perpage(): int
    {
        return $this->perpage;
    }

    public function fetchesExtraRow(): bool
    {
        return $this->fetchesExtraRow;
    }

    public function hardRowLimit(): ?int
    {
        return $this->hardRowLimit;
    }

    public function needsCount(): bool
    {
        return $this->needsCount;
    }

    /** @return string[]|null */
    public function publicSelect(): ?array
    {
        return $this->publicSelect;
    }
}
