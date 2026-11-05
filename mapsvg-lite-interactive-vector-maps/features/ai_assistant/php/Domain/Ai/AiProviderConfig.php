<?php

namespace MapSVG;

require_once __DIR__ . '/AiAuthorizationProvider.php';

/**
 * Resolves model preferences and license authentication for the MapSVG AI proxy.
 */
class AiProviderConfig
{
	private static ?AiAuthorizationProvider $authorizationProvider = null;

	/** Installed by a manifest-owned module before the admin/client is used. */
	public static function useAuthorizationProvider(AiAuthorizationProvider $provider): void
	{
		if (self::$authorizationProvider !== null) {
			throw new \LogicException('An AI authorization provider is already registered.');
		}
		self::$authorizationProvider = $provider;
	}

	public const PROVIDER_OPENAI = 'openai';
	public const PROVIDER_DEEPSEEK = 'deepseek';

	public const DEFAULT_OPENAI_MODEL = 'MapSVG-1.0';
	public const DEFAULT_DEEPSEEK_MODEL = 'deepseek-flash';

	public const SECRET_KEYS = array(
		'openai_api_key',
		'deepseek_api_key',
	);

	/**
	 * @return array{provider: string, model: string, openaiConfigured: bool, deepseekConfigured: bool, configured: bool}
	 */
	public static function publicSettings(): array
	{
		$provider = self::normalizeProvider(Options::get('ai_provider'));
		$model = self::DEFAULT_OPENAI_MODEL;
		$openaiConfigured = self::$authorizationProvider !== null
			? self::$authorizationProvider->configured()
			: trim((string) Options::get('purchase_code')) !== '';
		$deepseekConfigured = false;

		return array(
			'provider' => $provider,
			'model' => $model,
			'openaiConfigured' => $openaiConfigured,
			'deepseekConfigured' => $deepseekConfigured,
			'configured' => $provider === self::PROVIDER_OPENAI
				? $openaiConfigured
				: $deepseekConfigured,
		);
	}

	/**
	 * Strip secret AI keys from a settings bag before sending to the browser.
	 *
	 * @param array<string, mixed> $options
	 * @return array<string, mixed>
	 */
	public static function stripSecretsFromOptions(array $options): array
	{
		foreach (self::SECRET_KEYS as $key) {
			unset($options[$key]);
		}
		return $options;
	}

	public static function normalizeProvider(?string $provider): string
	{
		// Provider selection belongs to the MapSVG service.
		return self::PROVIDER_OPENAI;
	}

	public static function resolveModel(string $provider, $storedModel): string
	{
		$model = is_string($storedModel) ? trim($storedModel) : '';
		// Legacy DeepSeek ids retired by upstream.
		if ($model === 'deepseek-chat' || $model === 'deepseek-reasoner') {
			$model = '';
		}
		if ($model !== '') {
			return $model;
		}
		return $provider === self::PROVIDER_DEEPSEEK
			? self::DEFAULT_DEEPSEEK_MODEL
			: self::DEFAULT_OPENAI_MODEL;
	}

	public static function hasKey(string $provider): bool
	{
		$key = self::apiKeyFor($provider);
		return $key !== '';
	}

	/** Server-only site bearer credential, enrolled automatically from the license. */
	public static function apiKeyFor(string $provider): string
	{
		return self::$authorizationProvider !== null
			? self::$authorizationProvider->credential()
			: SiteCredential::token();
	}

	/** Private transport only; never include this result in public settings. */
	public static function requestTransport(string $url, string $credential, string $body = ''): array
	{
		if (self::$authorizationProvider !== null) {
			return self::$authorizationProvider->transport($url, $credential, $body);
		}
		return [
			'headers' => ['Authorization' => 'Bearer ' . $credential, 'X-MapSVG-Site' => SiteCredential::siteUrl()],
			'curlOptions' => [],
		];
	}

	public static function baseUrlFor(string $provider): string
	{
		return rtrim(MAPSVG_API_URL, '/') . '/ai';
	}

	/**
	 * Active provider credentials for chat requests.
	 *
	 * @return array{provider: string, model: string, apiKey: string, baseUrl: string}
	 */
	public static function activeClientConfig(): array
	{
		$provider = self::normalizeProvider(Options::get('ai_provider'));
		return array(
			'provider' => $provider,
			'model' => self::DEFAULT_OPENAI_MODEL,
			'apiKey' => self::apiKeyFor($provider),
			'baseUrl' => self::baseUrlFor($provider),
		);
	}
}
