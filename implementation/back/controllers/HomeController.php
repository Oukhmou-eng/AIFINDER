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



    public function searchTools(array $data)
    {
        $result = $this->catalog->searchTools($data);
        ok($result);
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

    public function tags(array $data)
    {
        ok(['tags' => $this->catalog->tags()]);
    }

    public function models(array $data)
    {
        ok(['models' => $this->catalog->models()]);
    }

    public function model(array $data)
    {
        $id = $data['id'] ?? $data['slug'] ?? null;
        if (!$id) {
            fail('Identifiant modele manquant', 422);
        }

        $model = $this->catalog->model($id);
        $model ? ok(['model' => $model]) : fail('Modele introuvable', 404);
    }

    public function platforms(array $data)
    {
        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->query("SELECT ID_PLATEFORME AS id, NOM AS name FROM PLATEFORME ORDER BY NOM ASC");
        ok(['platforms' => $stmt->fetchAll()]);
    }

    public function reviews(array $data)
    {
        $toolId = $data['toolId'] ?? $data['idOut'] ?? null;
        if (!$toolId) {
            fail('Identifiant outil manquant', 422);
        }

        ok(['reviews' => $this->catalog->reviews($toolId)]);
    }

    public function comments(array $data)
    {
        $toolId = $data['toolId'] ?? $data['idOut'] ?? null;
        if (!$toolId) {
            fail('Identifiant outil manquant', 422);
        }

        ok(['comments' => $this->catalog->comments($toolId)]);
    }

    public function addComment(array $data)
    {
        $payload = decodeToken($data['token'] ?? bearerToken());
        if (!$payload || empty($payload['id'])) {
            fail('Authentification requise', 401);
        }

        $missing = requireFields($data, ['toolId', 'content']);
        if ($missing) {
            fail('Champs manquants', 422, ['missing' => $missing]);
        }

        ok(['comments' => $this->catalog->addComment($payload['id'], $data)], 'Commentaire ajoute');
    }

    public function deleteComment(array $data)
    {
        $payload = decodeToken($data['token'] ?? bearerToken());
        if (!$payload || empty($payload['id'])) {
            fail('Authentification requise', 401);
        }

        $commentId = $data['commentId'] ?? $data['id_com'] ?? null;
        if (!$commentId) {
            fail('Identifiant commentaire manquant', 422);
        }

        $this->catalog->deleteComment($commentId, $payload['id']);
        ok([], 'Commentaire supprime');
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
        $token = $data['token'] ?? bearerToken();
        $payload = decodeToken($token);
        $userId = $payload ? ($payload['id'] ?? null) : null;

        try {
            $report = $this->catalog->report($data, $userId);
            ok(['report' => $report], 'Signalement envoye');
        } catch (Throwable $e) {
            fail('Erreur lors du signalement : ' . $e->getMessage(), 500);
        }
    }

    public function stats(array $data)
    {
        ok(['stats' => $this->catalog->stats()]);
    }





}
