<?php

require_once __DIR__ . '/../models/Catalog.php';
require_once __DIR__ . '/../utils/validator.php';

class HomeController
{
    private Catalog $catalog;

    public function __construct()
    {
        $this->catalog = new Catalog();
    }

    public function index(array $data)
    {
        ok([
            'message' => 'API AIFinder',
            'routes' => [
                'tools',
                'tool',
                'categories',
                'models',
                'reviews',
                'stats',
            ],
        ]);
    }

    public function tools(array $data)
    {
        ok(['tools' => $this->catalog->tools($data)]);
    }

    public function featuredTools(array $data)
    {
        $data['sortBy'] = 'usage';
        $data['limit'] = $data['limit'] ?? 6;
        ok(['tools' => $this->catalog->tools($data)]);
    }

    public function tool(array $data)
    {
        $id = $data['id'] ?? $data['slug'] ?? null;
        if (!$id) {
            fail('Identifiant outil manquant', 422);
        }

        $tool = $this->catalog->tool($id);
        $tool ? ok(['tool' => $tool]) : fail('Outil introuvable', 404);
    }

    public function categories(array $data)
    {
        ok(['categories' => $this->catalog->categories()]);
    }

    public function models(array $data)
    {
        ok(['models' => $this->catalog->models()]);
    }

    public function reviews(array $data)
    {
        $toolId = $data['toolId'] ?? $data['idOut'] ?? null;
        if (!$toolId) {
            fail('Identifiant outil manquant', 422);
        }

        ok(['reviews' => $this->catalog->reviews($toolId)]);
    }

    public function createReview(array $data)
    {
        $payload = decodeToken($data['token'] ?? bearerToken());
        if (!$payload || empty($payload['id'])) {
            fail('Authentification requise', 401);
        }

        $missing = requireFields($data, ['toolId', 'rating', 'comment']);
        if ($missing) {
            fail('Champs manquants', 422, ['missing' => $missing]);
        }

        ok(['reviews' => $this->catalog->createReview($payload['id'], $data)], 'Avis enregistre');
    }

    public function report(array $data)
    {
        $payload = decodeToken($data['token'] ?? bearerToken());
        ok(['report' => $this->catalog->report($data, $payload['id'] ?? null)], 'Signalement envoye');
    }

    public function stats(array $data)
    {
        ok(['stats' => $this->catalog->stats()]);
    }
}
