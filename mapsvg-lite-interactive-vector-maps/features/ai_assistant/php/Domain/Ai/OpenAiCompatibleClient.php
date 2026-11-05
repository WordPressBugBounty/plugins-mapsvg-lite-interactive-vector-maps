<?php

namespace MapSVG;

/**
 * Managed Responses client, with retained legacy Chat Completions helpers.
 * Supports buffered and streaming requests.
 */
class OpenAiCompatibleClient
{
	private string $baseUrl;
	private string $apiKey;
	private string $provider;

	public function __construct(string $baseUrl, string $apiKey, string $provider = 'openai')
	{
		$this->baseUrl = rtrim($baseUrl, '/');
		$this->apiKey = $apiKey;
		$this->provider = 'openai';
	}

	public static function fromActiveConfig(): self
	{
		$config = AiProviderConfig::activeClientConfig();
		return new self($config['baseUrl'], $config['apiKey'], $config['provider']);
	}

	/** Accounted raster recognition service; no direct provider key or ambiguous retry. */
	public function mapRegions(array $payload, ?callable $progress = null): array
	{
		if ($this->apiKey === '' || !function_exists('curl_init')) return ['ok' => false, 'error' => 'Activate the license and enable cURL for region recognition.'];
		$url = $this->baseUrl . '/map-regions';
		$encodedBody = wp_json_encode($payload);
		$transport = AiProviderConfig::requestTransport($url, $this->apiKey, $encodedBody);
		$headers = $transport['headers'] + ['X-MapSVG-Request-Id' => wp_generate_uuid4(), 'Content-Type' => 'application/json'];
		$body = ''; $last = microtime(true); $ch = curl_init($url);
		curl_setopt_array($ch, array_replace([CURLOPT_POST => true, CURLOPT_FOLLOWLOCATION => false, CURLOPT_TIMEOUT => 190, CURLOPT_CONNECTTIMEOUT => 30,
			CURLOPT_POSTFIELDS => $encodedBody, CURLOPT_NOPROGRESS => false,
			CURLOPT_HTTPHEADER => array_map(static function ($key, $value) { return $key . ': ' . $value; }, array_keys($headers), array_values($headers)),
			CURLOPT_XFERINFOFUNCTION => static function () use ($progress, &$last) { if ($progress && microtime(true) - $last >= 10) { $last = microtime(true); $progress(); } return 0; },
			CURLOPT_WRITEFUNCTION => static function ($ch, $chunk) use (&$body) { if (strlen($body) + strlen($chunk) > 4000000) return 0; $body .= $chunk; return strlen($chunk); }], $transport['curlOptions']));
		$ok = curl_exec($ch); $status = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch); $data = json_decode($body, true);
		if ($ok === false || $status < 200 || $status >= 300 || !is_array($data)) return ['ok' => false, 'error' => $data['error']['message'] ?? $data['error'] ?? 'Region recognition did not complete. Do not retry an uncertain paid invocation automatically.'];
		return ['ok' => true, 'data' => $data];
	}

}
