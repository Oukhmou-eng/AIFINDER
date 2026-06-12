<?php

/**
 * Configuration du systeme de validation des propositions d'outils.
 *
 * Charge les variables depuis back/.env.validation (prioritaire)
 * ou, a defaut, depuis back/test_api (fichier existant du projet).
 *
 * NOUVEAU FICHIER - n'altere aucune logique existante du projet.
 */

function loadValidationEnv(string $path): void
{
    if (!is_file($path)) {
        return;
    }

    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }

        [$key, $value] = array_map('trim', explode('=', $line, 2));
        $value = trim($value, "\"'");
        if ($key !== '' && getenv($key) === false) {
            putenv("{$key}={$value}");
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
}

// .env.validation en priorite, sinon le fichier test_api existant
loadValidationEnv(__DIR__ . '/../.env.validation');
loadValidationEnv(__DIR__ . '/../test_api');

return [
    'min_final_score' => 65,
    'url_reachability_enabled' => false,
    'url_timeout_seconds' => 4,
    'provider' => getenv('AIFINDER_VALIDATION_PROVIDER') ?: 'local',
    'require_external' => filter_var(getenv('AIFINDER_VALIDATION_REQUIRE_EXTERNAL') ?: true, FILTER_VALIDATE_BOOLEAN),
    'external_timeout_seconds' => (int) (getenv('AIFINDER_VALIDATION_TIMEOUT') ?: 20),
    'custom_endpoint' => getenv('AIFINDER_VALIDATION_ENDPOINT') ?: '',
    'custom_api_key' => getenv('AIFINDER_VALIDATION_API_KEY') ?: '',
    'openai_api_key' => getenv('OPENAI_API_KEY') ?: '',
    'openai_model' => getenv('AIFINDER_OPENAI_MODEL') ?: 'gpt-4.1-mini',
    'google_api_key' => getenv('GEMINI_API_KEY') ?: (getenv('GOOGLE_API_KEY') ?: ''),
    'google_model' => getenv('AIFINDER_GOOGLE_MODEL') ?: 'gemini-2.5-flash-lite',
];
