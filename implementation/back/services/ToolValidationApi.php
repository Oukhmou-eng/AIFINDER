<?php

class ToolValidationApi
{
    private array $config;

    public function __construct()
    {
        $this->config = require __DIR__ . '/../config/validation.php';
    }

    public function validate(array $tool): array
    {
        $localValidation = $this->validateLocally($tool);
        $provider = strtolower((string) ($this->config['provider'] ?? 'local'));

        if ($provider === 'local') {
            return $localValidation;
        }

        try {
            if ($provider === 'openai') {
                $externalValidation = $this->validateWithOpenAI($tool, $localValidation);
            } elseif ($provider === 'google') {
                $externalValidation = $this->validateWithGoogle($tool, $localValidation);
            } else {
                $externalValidation = $this->validateWithCustomEndpoint($tool, $localValidation);
            }

            return $this->mergeValidation($localValidation, $externalValidation, $provider);
        } catch (Throwable $e) {
            if (!empty($this->config['require_external'])) {
                throw $e;
            }

            $localValidation['source'] = 'local_fallback';
            $localValidation['externalError'] = $e->getMessage();
            return $localValidation;
        }
    }

    private function validateLocally(array $tool): array
    {
        $checks = [
            'name' => $this->scoreName($tool['name'] ?? ''),
            'url' => $this->scoreUrl($tool['url'] ?? '', $tool['name'] ?? ''),
            'logoUrl' => $this->scoreLogoUrl($tool['logo'] ?? ''),
            'shortDescription' => $this->scoreText($tool['description'] ?? '', 20, 255, 'Description courte'),
            'longDescription' => $this->scoreText($tool['longDescription'] ?? '', 50, 5000, 'Description detaillee'),
            'semanticCoherence' => $this->scoreSemanticCoherence($tool),
            'category' => $this->scoreRequiredList($tool['categories'] ?? [], 'Categorie'),
            'platforms' => $this->scoreRequiredList($tool['platforms'] ?? [], 'Plateformes'),
            'pricing' => $this->scorePricing($tool['pricing'] ?? ''),
            'provider' => $this->scoreOptionalText($tool['provider'] ?? '', 'Fournisseur'),
            'releaseDate' => $this->scoreReleaseDate($tool['releaseDate'] ?? ''),
            'models' => $this->scoreOptionalList($tool['aiModels'] ?? [], 'Modeles IA'),
        ];

        $weights = [
            'name' => 16,
            'url' => 20,
            'logoUrl' => 4,
            'shortDescription' => 14,
            'longDescription' => 12,
            'semanticCoherence' => 16,
            'category' => 8,
            'platforms' => 7,
            'pricing' => 6,
            'provider' => 5,
            'releaseDate' => 4,
            'models' => 4,
        ];

        $weighted = 0;
        $totalWeight = array_sum($weights);
        foreach ($checks as $field => $check) {
            $weighted += $check['score'] * $weights[$field];
        }

        $finalScore = (int) round($weighted / $totalWeight);

        return [
            'finalScore' => $finalScore,
            'minFinalScore' => (int) $this->config['min_final_score'],
            'recommendation' => $finalScore >= (int) $this->config['min_final_score'] ? 'validable' : 'a_revoir',
            'fields' => $checks,
            'source' => 'local',
            'validatedAt' => date('c'),
        ];
    }

    private function validateWithCustomEndpoint(array $tool, array $localValidation): array
    {
        $endpoint = trim((string) ($this->config['custom_endpoint'] ?? ''));
        if ($endpoint === '') {
            throw new RuntimeException('AIFINDER_VALIDATION_ENDPOINT manquant pour le provider custom.');
        }

        $headers = ['Content-Type: application/json'];
        if (!empty($this->config['custom_api_key'])) {
            $headers[] = 'Authorization: Bearer ' . $this->config['custom_api_key'];
        }

        return $this->postJson($endpoint, [
            'tool' => $this->externalToolPayload($tool),
            'localValidation' => $localValidation,
            'expectedSchema' => $this->expectedExternalSchema(),
        ], $headers);
    }

    private function validateWithOpenAI(array $tool, array $localValidation): array
    {
        $apiKey = trim((string) ($this->config['openai_api_key'] ?? ''));
        if ($apiKey === '') {
            throw new RuntimeException('OPENAI_API_KEY manquant pour le provider openai.');
        }

        $payload = [
            'model' => $this->config['openai_model'],
            'input' => [
                [
                    'role' => 'system',
                    'content' => [[
                        'type' => 'input_text',
                        'text' => implode("\n", [
                            'Tu es une API de validation de propositions d outils IA pour AIFinder.',
                            'Retourne uniquement un JSON valide, sans Markdown.',
                            'Evalue la coherence semantique, la credibilite, la validite du nom, la coherence du domaine officiel avec le nom, et la qualite des descriptions.',
                            'Le score doit etre entre 0 et 100. Un nom aleatoire comme sbvurbrzhvbhxxxxxxxxx doit etre fortement penalise.',
                            'Schema obligatoire: {"finalScore":number,"recommendation":"validable|a_revoir","fields":{"name":{"score":number,"issues":["..."]},"url":{"score":number,"issues":["..."]},"shortDescription":{"score":number,"issues":["..."]},"longDescription":{"score":number,"issues":["..."]},"semanticCoherence":{"score":number,"issues":["..."]}},"summary":"..."}',
                        ]),
                    ]],
                ],
                [
                    'role' => 'user',
                    'content' => [[
                        'type' => 'input_text',
                        'text' => json_encode([
                            'tool' => $this->externalToolPayload($tool),
                            'localValidation' => $localValidation,
                        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    ]],
                ],
            ],
            'temperature' => 0,
        ];

        $response = $this->postJson('https://api.openai.com/v1/responses', $payload, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey,
        ]);

        $text = $this->extractOpenAIText($response);
        $decoded = json_decode($text, true);
        if (!is_array($decoded)) {
            throw new RuntimeException('Reponse OpenAI invalide ou non JSON.');
        }

        return $decoded;
    }

    private function validateWithGoogle(array $tool, array $localValidation): array
    {
        $apiKey = trim((string) ($this->config['google_api_key'] ?? ''));
        if ($apiKey === '' || in_array($apiKey, ['TA_CLE_GOOGLE_AI_STUDIO', 'TA_NOUVELLE_CLE_GOOGLE_AI_STUDIO'], true)) {
            throw new RuntimeException('GEMINI_API_KEY manquant pour Google AI Studio.');
        }

        $prompt = implode("\n", [
            'Tu es une API de validation de propositions d outils IA pour AIFinder.',
            'Retourne uniquement un JSON valide, sans Markdown, sans texte avant/apres.',
            'Evalue la coherence semantique, la credibilite, la validite du nom, la coherence du domaine officiel avec le nom, et la qualite des descriptions.',
            'Un nom aleatoire comme sbvurbrzhvbhxxxxxxxxx doit etre fortement penalise.',
            'Schema obligatoire:',
            '{"finalScore":number,"recommendation":"validable|a_revoir","fields":{"name":{"score":number,"issues":["..."]},"url":{"score":number,"issues":["..."]},"shortDescription":{"score":number,"issues":["..."]},"longDescription":{"score":number,"issues":["..."]},"semanticCoherence":{"score":number,"issues":["..."]}},"summary":"..."}',
            'Donnees a evaluer:',
            json_encode([
                'tool' => $this->externalToolPayload($tool),
                'localValidation' => $localValidation,
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);

        $model = rawurlencode((string) ($this->config['google_model'] ?? 'gemini-2.5-flash-lite'));
        $response = $this->postJson(
            "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . rawurlencode($apiKey),
            [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => 0,
                    'responseMimeType' => 'application/json',
                ],
            ],
            [
                'Content-Type: application/json',
            ]
        );

        $text = $this->extractGoogleText($response);
        $decoded = json_decode($this->cleanJsonText($text), true);
        if (!is_array($decoded)) {
            throw new RuntimeException('Google AI Studio: reponse non JSON.');
        }

        return $decoded;
    }

    private function mergeValidation(array $localValidation, array $externalValidation, string $provider): array
    {
        $fields = $localValidation['fields'];
        foreach (($externalValidation['fields'] ?? []) as $field => $externalField) {
            $externalScore = (int) ($externalField['score'] ?? 0);
            $localScore = (int) ($fields[$field]['score'] ?? $externalScore);
            $fields[$field] = [
                'score' => max(0, min(100, (int) round(($localScore * 0.35) + ($externalScore * 0.65)))),
                'status' => $externalScore >= 80 ? 'ok' : ($externalScore >= 60 ? 'warning' : 'error'),
                'label' => $fields[$field]['label'] ?? $field,
                'issues' => array_values(array_unique(array_merge(
                    $fields[$field]['issues'] ?? [],
                    $externalField['issues'] ?? []
                ))),
            ];
        }

        $localFinal = (int) ($localValidation['finalScore'] ?? 0);
        $externalFinal = (int) ($externalValidation['finalScore'] ?? $localFinal);
        $finalScore = max(0, min(100, (int) round(($localFinal * 0.35) + ($externalFinal * 0.65))));

        return [
            'finalScore' => $finalScore,
            'minFinalScore' => (int) $this->config['min_final_score'],
            'recommendation' => $finalScore >= (int) $this->config['min_final_score'] ? 'validable' : 'a_revoir',
            'fields' => $fields,
            'source' => $provider,
            'externalSummary' => $externalValidation['summary'] ?? null,
            'validatedAt' => date('c'),
        ];
    }

    private function externalToolPayload(array $tool): array
    {
        return [
            'name' => $tool['name'] ?? '',
            'provider' => $tool['provider'] ?? '',
            'url' => $tool['url'] ?? '',
            'logoUrl' => $tool['logo'] ?? $tool['logoUrl'] ?? '',
            'shortDescription' => $tool['description'] ?? $tool['shortDescription'] ?? '',
            'longDescription' => $tool['longDescription'] ?? '',
            'pricing' => $tool['pricing'] ?? '',
            'releaseDate' => $tool['releaseDate'] ?? '',
            'categories' => $tool['categories'] ?? [],
            'platforms' => $tool['platforms'] ?? [],
            'models' => $tool['aiModels'] ?? $tool['models'] ?? [],
        ];
    }

    private function expectedExternalSchema(): array
    {
        return [
            'finalScore' => 'number 0..100',
            'recommendation' => 'validable|a_revoir',
            'fields' => [
                'name' => ['score' => 'number 0..100', 'issues' => ['string']],
                'url' => ['score' => 'number 0..100', 'issues' => ['string']],
                'shortDescription' => ['score' => 'number 0..100', 'issues' => ['string']],
                'longDescription' => ['score' => 'number 0..100', 'issues' => ['string']],
                'semanticCoherence' => ['score' => 'number 0..100', 'issues' => ['string']],
            ],
            'summary' => 'string',
        ];
    }

    private function postJson(string $url, array $payload, array $headers): array
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            CURLOPT_TIMEOUT => (int) ($this->config['external_timeout_seconds'] ?? 20),
        ]);

        $body = curl_exec($ch);
        $error = curl_error($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($body === false || $error) {
            throw new RuntimeException('Erreur API externe: ' . $error);
        }
        if ($status < 200 || $status >= 300) {
            if ($status === 401 || $status === 403) {
                throw new RuntimeException('Cle API Gemini invalide ou non autorisee. Regenerer la cle dans Google AI Studio puis mettre GEMINI_API_KEY dans .env.validation.');
            }
            throw new RuntimeException("API externe HTTP {$status}: " . mb_substr($body, 0, 300));
        }

        $decoded = json_decode($body, true);
        if (!is_array($decoded)) {
            throw new RuntimeException('API externe: reponse JSON invalide.');
        }

        return $decoded;
    }

    private function extractOpenAIText(array $response): string
    {
        if (isset($response['output_text']) && is_string($response['output_text'])) {
            return $response['output_text'];
        }

        foreach (($response['output'] ?? []) as $output) {
            foreach (($output['content'] ?? []) as $content) {
                if (isset($content['text']) && is_string($content['text'])) {
                    return $content['text'];
                }
            }
        }

        throw new RuntimeException('OpenAI: texte de sortie introuvable.');
    }

    private function extractGoogleText(array $response): string
    {
        foreach (($response['candidates'] ?? []) as $candidate) {
            foreach (($candidate['content']['parts'] ?? []) as $part) {
                if (isset($part['text']) && is_string($part['text'])) {
                    return $part['text'];
                }
            }
        }

        throw new RuntimeException('Google AI Studio: texte de sortie introuvable.');
    }

    private function cleanJsonText(string $text): string
    {
        $text = trim($text);
        if (str_starts_with($text, '```')) {
            $text = preg_replace('/^```(?:json)?\s*/i', '', $text);
            $text = preg_replace('/\s*```$/', '', $text);
        }

        return trim($text);
    }

    private function scoreName(string $name): array
    {
        $name = trim($name);
        $issues = [];
        $score = 100;

        if (mb_strlen($name) < 2 || mb_strlen($name) > 80) {
            $score -= 35;
            $issues[] = 'Longueur du nom invalide.';
        }

        if (!preg_match('/^[\p{L}\p{N} .+&_\-]+$/u', $name)) {
            $score -= 25;
            $issues[] = 'Le nom contient des caracteres non autorises.';
        }

        $letters = preg_replace('/[^\p{L}]/u', '', mb_strtolower($name));
        if (mb_strlen($letters) >= 8) {
            $vowels = preg_match_all('/[aeiouyàâäéèêëîïôöùûü]/iu', $letters);
            $ratio = $vowels / max(1, mb_strlen($letters));
            if ($ratio < 0.18) {
                $score -= 35;
                $issues[] = 'Le nom semble aleatoire ou peu lisible.';
            }
        }

        if ($this->looksRandom($name)) {
            $score -= 45;
            $issues[] = 'Le nom ne ressemble pas a un nom de produit lisible.';
        }

        if ($this->looksLikeLowQualityProductName($name)) {
            $score -= 45;
            $issues[] = 'Le nom ressemble a une chaine saisie au hasard.';
        }

        if (preg_match('/(.)\1{4,}/u', $name) || preg_match('/x{4,}$/i', $name)) {
            $score -= 35;
            $issues[] = 'Le nom contient des repetitions suspectes.';
        }

        return $this->result($score, $issues, 'Nom coherent');
    }

    private function scoreSemanticCoherence(array $tool): array
    {
        $name = trim((string) ($tool['name'] ?? ''));
        $provider = trim((string) ($tool['provider'] ?? ''));
        $short = trim((string) ($tool['description'] ?? $tool['shortDescription'] ?? ''));
        $long = trim((string) ($tool['longDescription'] ?? ''));
        $text = trim("{$name} {$provider} {$short} {$long}");
        $issues = [];
        $score = 100;

        $badWords = 0;
        foreach (preg_split('/\s+/u', $text) as $word) {
            $word = trim($word);
            if ($word === '') {
                continue;
            }
            if ($this->looksRandom($word)) {
                $badWords++;
            }
        }

        if ($badWords >= 1) {
            $score -= min(80, $badWords * 25);
            $issues[] = 'Certains mots semblent aleatoires ou non semantiques.';
        }

        if (!$this->hasUsefulAiContext($text)) {
            $score -= 25;
            $issues[] = 'La description ne precise pas clairement l usage IA de l outil.';
        }

        return $this->result($score, $issues, 'Coherence semantique');
    }

    private function scoreUrl(string $url, string $name): array
    {
        $url = trim($url);
        $issues = [];
        $score = 100;

        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return $this->result(0, ['URL invalide.'], 'URL valide');
        }

        $parts = parse_url($url);
        $host = strtolower($parts['host'] ?? '');
        if (!in_array($parts['scheme'] ?? '', ['http', 'https'], true) || $host === '') {
            return $this->result(0, ['URL HTTP/HTTPS requise.'], 'URL valide');
        }

        if (str_contains($host, 'localhost') || filter_var($host, FILTER_VALIDATE_IP)) {
            $score -= 35;
            $issues[] = 'URL publique attendue, pas une adresse locale/IP.';
        }

        $nameSlug = preg_replace('/[^a-z0-9]/', '', strtolower(iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $name)));
        $hostSlug = preg_replace('/[^a-z0-9]/', '', preg_replace('/^www\./', '', $host));
        if ($nameSlug && $hostSlug && !str_contains($hostSlug, $nameSlug) && !str_contains($nameSlug, $hostSlug)) {
            similar_text($nameSlug, $hostSlug, $percent);
            if ($percent < 35) {
                $score -= 25;
                $issues[] = 'Le domaine ne semble pas correspondre au nom de l outil.';
            }
        }

        if (!empty($this->config['url_reachability_enabled']) && !$this->isReachable($url)) {
            $score -= 25;
            $issues[] = 'URL non joignable par le test API.';
        }

        return $this->result($score, $issues, 'URL valide et coherente');
    }

    private function scoreLogoUrl(string $url): array
    {
        if (trim($url) === '') {
            return $this->result(70, ['Logo non fourni.'], 'Logo optionnel');
        }

        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return $this->result(20, ['URL du logo invalide.'], 'Logo valide');
        }

        $path = strtolower(parse_url($url, PHP_URL_PATH) ?? '');
        if (!preg_match('/\.(png|jpe?g|svg|webp|gif)$/', $path)) {
            return $this->result(65, ['Extension image non detectee.'], 'Logo valide');
        }

        return $this->result(100, [], 'Logo valide');
    }

    private function scoreText(string $text, int $min, int $max, string $label): array
    {
        $text = trim($text);
        $issues = [];
        $score = 100;
        $length = mb_strlen($text);

        if ($length < $min) {
            $score -= 45;
            $issues[] = "{$label} trop courte.";
        }
        if ($length > $max) {
            $score -= 30;
            $issues[] = "{$label} trop longue.";
        }
        if (preg_match('/(.)\1{5,}/u', $text)) {
            $score -= 35;
            $issues[] = "{$label} contient des repetitions suspectes.";
        }
        if (str_word_count($text) < 4) {
            $score -= 20;
            $issues[] = "{$label} manque de contenu semantique.";
        }

        $badWords = 0;
        foreach (preg_split('/\s+/u', $text) as $word) {
            if ($this->looksRandom($word)) {
                $badWords++;
            }
        }

        if ($badWords > 0) {
            $score -= min(70, $badWords * 25);
            $issues[] = "{$label} contient des mots aleatoires ou non lisibles.";
        }

        return $this->result($score, $issues, "{$label} valide");
    }

    private function looksRandom(string $word): bool
    {
        $word = mb_strtolower(trim($word));
        $letters = preg_replace('/[^\p{L}]/u', '', $word);
        $length = mb_strlen($letters);
        if ($length < 7) {
            return false;
        }

        $vowels = preg_match_all('/[aeiouyàâäéèêëîïôöùûü]/iu', $letters);
        $ratio = $vowels / max(1, $length);
        $consonantRuns = preg_match('/[bcdfghjklmnpqrstvwxz]{5,}/iu', $letters);

        return $ratio < 0.18 || $consonantRuns === 1 || preg_match('/(.)\1{3,}/u', $letters);
    }

    private function looksLikeLowQualityProductName(string $name): bool
    {
        $trimmed = trim($name);
        $ascii = strtolower(iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $trimmed));
        $letters = preg_replace('/[^a-z]/', '', $ascii);
        if (strlen($letters) < 8) {
            return false;
        }

        $isSingleLowerToken = preg_match('/^[a-z]{8,}$/', $trimmed) === 1;
        $rareLetters = preg_match_all('/[qvxz]/', $letters);
        $knownTokens = preg_match('/(ai|gpt|chat|bot|data|code|flow|mind|soft|cloud|studio|lab|labs|magic|gen|logic|vision|sonic|image|video|text)/', $letters);

        return $isSingleLowerToken && $rareLetters >= 2 && !$knownTokens;
    }

    private function hasUsefulAiContext(string $text): bool
    {
        return preg_match('/\b(ai|ia|intelligence|assistant|modele|model|generation|analyse|automation|automatisation|chat|image|texte|audio|video|code|api|recherche|productivite)\b/iu', $text) === 1;
    }

    private function scorePricing(string $pricing): array
    {
        $allowed = ['free', 'freemium', 'paid', 'gratuit', 'abonnement', 'credits', 'pay-as-you-go', 'gratuit-plus'];
        return in_array(strtolower(trim($pricing)), $allowed, true)
            ? $this->result(100, [], 'Tarification valide')
            : $this->result(55, ['Tarification peu precise.'], 'Tarification valide');
    }

    private function scoreRequiredList(array $items, string $label): array
    {
        return count($items) > 0
            ? $this->result(100, [], "{$label} renseignee")
            : $this->result(0, ["{$label} manquante."], "{$label} renseignee");
    }

    private function scoreOptionalList(array $items, string $label): array
    {
        return count($items) > 0
            ? $this->result(100, [], "{$label} renseignes")
            : $this->result(70, ["{$label} non renseignes."], "{$label} renseignes");
    }

    private function scoreOptionalText(string $value, string $label): array
    {
        return trim($value) !== ''
            ? $this->result(100, [], "{$label} renseigne")
            : $this->result(75, ["{$label} non renseigne."], "{$label} renseigne");
    }

    private function scoreReleaseDate(string $date): array
    {
        if (trim($date) === '') {
            return $this->result(75, ['Date de sortie non renseignee.'], 'Date valide');
        }

        $time = strtotime($date);
        if (!$time) {
            return $this->result(20, ['Date de sortie invalide.'], 'Date valide');
        }

        if ($time > time() + 86400) {
            return $this->result(50, ['Date de sortie future.'], 'Date valide');
        }

        return $this->result(100, [], 'Date valide');
    }

    private function result(int $score, array $issues, string $passedLabel): array
    {
        $score = max(0, min(100, $score));
        return [
            'score' => $score,
            'status' => $score >= 80 ? 'ok' : ($score >= 60 ? 'warning' : 'error'),
            'label' => $passedLabel,
            'issues' => $issues,
        ];
    }

    private function isReachable(string $url): bool
    {
        $context = stream_context_create([
            'http' => [
                'method' => 'HEAD',
                'timeout' => (int) $this->config['url_timeout_seconds'],
                'ignore_errors' => true,
            ],
        ]);

        $headers = @get_headers($url, true, $context);
        if (!$headers || empty($headers[0])) {
            return false;
        }

        return preg_match('/\s(2\d\d|3\d\d)\s/', $headers[0]) === 1;
    }
}
