<?php

function validateEmail($email)
{
    return is_string($email) && filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validateRequired($value)
{
    return is_string($value) ? trim($value) !== '' : $value !== null;
}

function validateLength($value, $min, $max)
{
    $length = mb_strlen(trim((string) $value));
    return $length >= $min && $length <= $max;
}

function cleanString($value)
{
    return trim((string) ($value ?? ''));
}

function slugify($value)
{
    $value = cleanString($value);
    $value = preg_replace('/[^\p{L}\p{N}]+/u', '-', $value);
    $value = mb_strtolower($value);
    return trim($value, '-') ?: 'item-' . time();
}

function requireFields(array $data, array $fields)
{
    $missing = [];

    foreach ($fields as $field) {
        if (!isset($data[$field]) || !validateRequired($data[$field])) {
            $missing[] = $field;
        }
    }

    return $missing;
}

function jsonResponse($payload, $status = 200)
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function ok($data = [], $message = null)
{
    $payload = ['success' => true];

    if ($message !== null) {
        $payload['message'] = $message;
    }

    return jsonResponse(array_merge($payload, $data));
}

function fail($message, $status = 400, $extra = [])
{
    return jsonResponse(array_merge([
        'success' => false,
        'message' => $message,
    ], $extra), $status);
}

function bearerToken()
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';

    if (preg_match('/Bearer\s+(.+)/i', $header, $matches)) {
        return trim($matches[1]);
    }

    return null;
}

function encodeToken(array $payload)
{
    return base64_encode(json_encode($payload, JSON_UNESCAPED_UNICODE));
}

function decodeToken($token)
{
    if (!$token) {
        return null;
    }

    $decoded = json_decode(base64_decode($token), true);
    return is_array($decoded) ? $decoded : null;
}
