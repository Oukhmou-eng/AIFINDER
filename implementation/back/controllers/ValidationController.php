<?php

require_once __DIR__ . '/../models/Catalog.php';
require_once __DIR__ . '/../utils/validator.php';
require_once __DIR__ . '/../services/ToolValidationApi.php';

class ValidationController
{
    private Catalog $catalog;

    public function __construct()
    {
        $this->catalog = new Catalog();
    }

    public function validateTool(array $data)
    {
        $this->requireAdmin($data);

        $toolId = $data['id'] ?? $data['toolId'] ?? null;
        if (!$toolId) {
            fail('ID de l\'outil requis', 422);
        }

        $tool = $this->catalog->tool($toolId);
        if (!$tool) {
            fail('Outil introuvable', 404);
        }

        // Récupérer la soumission liée à l'outil
        $submission = $this->findSubmission((int) $tool['id']);

        // Préparer le payload pour l'API de validation
        $payload = [
            'name'            => $tool['name'] ?? '',
            'provider'        => $tool['provider'] ?? '',
            'url'             => $tool['url'] ?? '',
            'logo'            => $tool['logo'] ?? '',
            'description'     => $tool['description'] ?? '',
            'longDescription' => $tool['longDescription'] ?? '',
            'pricing'         => $tool['pricing'] ?? '',
            'releaseDate'     => $tool['releaseDate'] ?? '',
            'categories'      => $tool['categories'] ?? [],
            'platforms'       => $tool['platforms'] ?? [],
            'aiModels'        => $tool['aiModels'] ?? [],
        ];

        try {
            $api = new ToolValidationApi();
            $validation = $api->validate($payload);
        } catch (Throwable $e) {
            fail('Erreur lors de la validation : ' . $e->getMessage(), 502);
        }

        ok([
            'validation' => $validation,
            'submission' => $submission,
            'tool'       => $tool,
        ]);
    }

    private function findSubmission(int $toolId): ?array
    {
        $pdo = require __DIR__ . '/../config/database.php';

        $stmt = $pdo->prepare("
            SELECT 
                s.ID_SOUMISSION AS id,
                s.STATUT,
                s.NOTE_ADMIN AS adminNote,
                s.DATE_MISE_A_JOUR AS createdAt,
                u.IDU AS userId,
                u.NOM AS userName,
                u.PRENOM AS userFirstName,
                u.EMAIL AS userEmail
            FROM SOUMISSION_OUTIL s
            JOIN UTILISATEUR u ON u.IDU = s.IDU
            WHERE s.IDOUT = :tool_id
            ORDER BY s.DATE_MISE_A_JOUR DESC, s.ID_SOUMISSION DESC
            LIMIT 1
        ");
        $stmt->execute(['tool_id' => $toolId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return [
            'id'        => (string) $row['id'],
            'status'    => $row['STATUT'],
            'adminNote' => $row['adminNote'],
            'createdAt' => $row['createdAt'],
            'userId'    => (string) $row['userId'],
            'userName'  => trim(($row['userFirstName'] ?? '') . ' ' . ($row['userName'] ?? '')),
            'userEmail' => $row['userEmail'],
        ];
    }

    private function requireAdmin(array $data)
    {
        $payload = decodeToken($data['token'] ?? bearerToken());
        if (!$payload || ($payload['role'] ?? null) !== 'admin') {
            fail('Acces admin requis', 403);
        }

        return $payload;
    }
}