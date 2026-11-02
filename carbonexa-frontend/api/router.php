<?php

declare(strict_types=1);

const GEMINI_DEFAULT_MODEL = 'gemini-3.8-flash';
const MAX_REQUEST_BYTES = 64000;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_TURNS = 12;

function sendJson(int $statusCode, array $body): void
{
    header_remove('X-Powered-By');
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
}

function serverConfig(string $name): ?string
{
    $value = getenv($name);
    if ($value !== false && trim($value) !== '') {
        return trim($value);
    }

    static $localEnvironment = null;
    if ($localEnvironment === null) {
        $localEnvironment = [];
        $environmentPath = dirname(__DIR__) . '/.env.local';
        if (is_file($environmentPath) && is_readable($environmentPath)) {
            foreach (file($environmentPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
                $line = trim($line);
                if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                    continue;
                }

                [$key, $entryValue] = explode('=', $line, 2);
                $key = trim($key);
                $entryValue = trim($entryValue);
                if (
                    strlen($entryValue) >= 2
                    && (($entryValue[0] === '"' && str_ends_with($entryValue, '"'))
                    || ($entryValue[0] === "'" && str_ends_with($entryValue, "'")))
                ) {
                    $entryValue = substr($entryValue, 1, -1);
                }
                $localEnvironment[$key] = $entryValue;
            }
        }
    }

    $localValue = $localEnvironment[$name] ?? null;
    return is_string($localValue) && trim($localValue) !== '' ? trim($localValue) : null;
}

function requestJson(): array
{
    $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > MAX_REQUEST_BYTES) {
        sendJson(413, ['error' => 'The chat request is too large.']);
        exit;
    }

    $rawBody = file_get_contents('php://input', false, null, 0, MAX_REQUEST_BYTES + 1);
    if ($rawBody === false || strlen($rawBody) > MAX_REQUEST_BYTES) {
        sendJson(413, ['error' => 'The chat request is too large.']);
        exit;
    }

    try {
        $body = json_decode($rawBody, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        sendJson(400, ['error' => 'The chat request must contain valid JSON.']);
        exit;
    }

    if (!is_array($body)) {
        sendJson(400, ['error' => 'The chat request must contain a JSON object.']);
        exit;
    }

    return $body;
}

function textLength(string $text): int
{
    $count = preg_match_all('/./us', $text, $matches);
    return $count === false ? strlen($text) : $count;
}

function truncateText(string $text, int $length): string
{
    if (preg_match('/^.{0,' . $length . '}/us', $text, $matches) === 1) {
        return $matches[0];
    }

    return substr($text, 0, $length);
}

function normalizeHistory(mixed $history): array
{
    if (!is_array($history)) {
        return [];
    }

    $turns = [];
    foreach (array_slice($history, -MAX_HISTORY_TURNS) as $turn) {
        if (
            !is_array($turn)
            || !in_array($turn['role'] ?? null, ['user', 'model'], true)
            || !is_string($turn['text'] ?? null)
            || trim($turn['text']) === ''
        ) {
            continue;
        }

        $text = truncateText(trim($turn['text']), MAX_MESSAGE_LENGTH);
        $role = $turn['role'];
        $lastIndex = count($turns) - 1;
        if ($lastIndex >= 0 && $turns[$lastIndex]['role'] === $role) {
            $turns[$lastIndex]['parts'][0]['text'] .= "\n" . $text;
        } else {
            $turns[] = [
                'role' => $role,
                'parts' => [['text' => $text]],
            ];
        }
    }

    return $turns;
}

function geminiErrorMessage(int $statusCode): string
{
    return match ($statusCode) {
        400 => 'Gemini rejected the request. Check the message and configured model.',
        401, 403 => 'Gemini rejected the API credentials or project access. Verify GEMINI_API_KEY and enable the Generative Language API.',
        404 => 'The configured Gemini model was not found. Check GEMINI_MODEL.',
        429 => 'The Gemini project quota or rate limit has been reached. Check the project’s usage limits and billing before retrying.',
        503 => 'Gemini is temporarily unavailable due to high demand. Please try again shortly.',
        default => 'Gemini could not complete the response. Please try again later.',
    };
}

function handleChat(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        header('Allow: POST');
        sendJson(405, ['error' => 'Use POST to send a chat message.']);
        return;
    }

    $apiKey = serverConfig('GEMINI_API_KEY');
    if ($apiKey === null) {
        error_log('Carbonexa chat API is not configured: GEMINI_API_KEY is missing.');
        sendJson(503, ['error' => 'Gemini is not configured. Add GEMINI_API_KEY to carbonexa-frontend/.env.local and restart the PHP server.']);
        return;
    }

    $requestBody = requestJson();
    $message = $requestBody['message'] ?? null;
    if (!is_string($message) || trim($message) === '') {
        sendJson(400, ['error' => 'Write a message before sending.']);
        return;
    }
    $message = trim($message);
    if (textLength($message) > MAX_MESSAGE_LENGTH) {
        sendJson(413, ['error' => 'Keep each message under 4,000 characters.']);
        return;
    }

    $model = serverConfig('GEMINI_MODEL') ?? GEMINI_DEFAULT_MODEL;
    if (!preg_match('/^[a-zA-Z0-9._-]+$/', $model)) {
        error_log('Carbonexa chat API has an invalid GEMINI_MODEL value.');
        sendJson(503, ['error' => 'The Gemini model configuration is invalid. Check GEMINI_MODEL in .env.local.']);
        return;
    }

    if (!function_exists('curl_init')) {
        error_log('Carbonexa chat API requires the PHP cURL extension.');
        sendJson(503, ['error' => 'The PHP server is missing the cURL extension required to contact Gemini.']);
        return;
    }

    $contents = normalizeHistory($requestBody['history'] ?? []);
    $contents[] = [
        'role' => 'user',
        'parts' => [['text' => $message]],
    ];
    $requestPayload = json_encode([
        'systemInstruction' => [
            'parts' => [[
                'text' => "You are Carbonexa AI, an assistant for mining field work, geology, production, reports, and environmental monitoring. Give clear, practical answers. Do not claim access to Carbonexa's live mine data, sensors, reports, or saved documents unless the user provided that information in the chat. Never invent site readings, production numbers, or document contents. For safety-critical field operations, encourage verification against the site's approved procedures and responsible supervisor.",
            ]],
        ],
        'contents' => $contents,
        'generationConfig' => [
            'maxOutputTokens' => 1200,
            'thinkingConfig' => ['thinkingLevel' => 'low'],
        ],
    ], JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);

    if ($requestPayload === false) {
        error_log('Carbonexa chat API could not encode the Gemini request.');
        sendJson(500, ['error' => 'The chat request could not be prepared. Please try again.']);
        return;
    }

    $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/'
        . rawurlencode($model)
        . ':generateContent';
    $attempt = 0;
    $upstreamStatus = 0;
    $upstreamBody = false;
    $curlError = '';

    do {
        $attempt++;
        $curl = curl_init($endpoint);
        if ($curl === false) {
            error_log('Carbonexa chat API failed to initialize cURL.');
            sendJson(503, ['error' => 'The PHP server could not start a secure connection to Gemini.']);
            return;
        }

        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $requestPayload,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'x-goog-api-key: ' . $apiKey,
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 45,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);
        $upstreamBody = curl_exec($curl);
        $upstreamStatus = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        $curlErrorNumber = curl_errno($curl);
        $curlError = curl_error($curl);
        $curl = null;

        if ($upstreamBody === false) {
            if ($curlErrorNumber === CURLE_OPERATION_TIMEDOUT) {
                error_log('Carbonexa chat API timed out while waiting for Gemini.');
                sendJson(504, ['error' => 'Gemini took too long to respond. Please try again.']);
            } else {
                error_log(sprintf(
                    'Carbonexa chat API could not reach Gemini (cURL %d): %s',
                    $curlErrorNumber,
                    $curlError
                ));
                sendJson(503, ['error' => 'The PHP server could not reach Gemini. Check the server connection and try again.']);
            }
            return;
        }

        if ($upstreamStatus !== 503 || $attempt >= 2) {
            break;
        }
        usleep(500000);
    } while (true);

    try {
        $providerPayload = json_decode($upstreamBody, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        error_log(sprintf('Gemini returned invalid JSON (HTTP %d).', $upstreamStatus));
        sendJson(502, ['error' => 'Gemini returned an invalid response. Please try again.']);
        return;
    }

    if ($upstreamStatus < 200 || $upstreamStatus >= 300) {
        $providerMessage = $providerPayload['error']['message'] ?? 'No provider details were returned.';
        if (!is_string($providerMessage)) {
            $providerMessage = 'No provider details were returned.';
        }
        $providerStatus = $providerPayload['error']['status'] ?? '';
        $invalidCredentials = in_array($upstreamStatus, [401, 403], true)
            || stripos($providerMessage, 'API key not valid') !== false
            || stripos($providerMessage, 'API_KEY_INVALID') !== false
            || $providerStatus === 'API_KEY_INVALID';
        $providerMessage = substr(str_replace($apiKey, '[redacted]', $providerMessage), 0, 500);
        error_log(sprintf(
            'Gemini API returned HTTP %d (%s): %s',
            $upstreamStatus,
            $providerStatus ?: 'unknown status',
            $providerMessage
        ));

        if ($invalidCredentials) {
            sendJson(503, ['error' => geminiErrorMessage(403)]);
            return;
        }
        if ($upstreamStatus === 429) {
            sendJson(429, ['error' => geminiErrorMessage($upstreamStatus)]);
            return;
        }
        if ($upstreamStatus === 503) {
            sendJson(503, ['error' => geminiErrorMessage($upstreamStatus)]);
            return;
        }
        if ($upstreamStatus === 404) {
            sendJson(503, ['error' => geminiErrorMessage($upstreamStatus)]);
            return;
        }
        if ($upstreamStatus === 400) {
            sendJson(400, ['error' => geminiErrorMessage($upstreamStatus)]);
            return;
        }
        sendJson(502, ['error' => geminiErrorMessage($upstreamStatus)]);
        return;
    }

    $parts = $providerPayload['candidates'][0]['content']['parts'] ?? [];
    $text = '';
    foreach ($parts as $part) {
        if (is_array($part) && is_string($part['text'] ?? null)) {
            $text .= $part['text'];
        }
    }
    $text = trim($text);
    if ($text === '') {
        error_log('Gemini returned a successful response without any text content.');
        sendJson(502, ['error' => 'Gemini returned an empty response. Please try rephrasing your question.']);
        return;
    }

    sendJson(200, ['text' => $text]);
}

$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
if (!str_starts_with($requestPath, '/api/')) {
    return false;
}

if ($requestPath === '/api/health') {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
        header('Allow: GET');
        sendJson(405, ['error' => 'Use GET to check API health.']);
    } else {
        sendJson(200, ['geminiConfigured' => serverConfig('GEMINI_API_KEY') !== null]);
    }
    return;
}

if ($requestPath === '/api/chat') {
    handleChat();
    return;
}

sendJson(404, ['error' => 'API route not found.']);
