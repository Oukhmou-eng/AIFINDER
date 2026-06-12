<?php

require_once __DIR__ . '/../models/Catalog.php';
require_once __DIR__ . '/../utils/validator.php';
require_once __DIR__ . '/../services/ToolValidationApi.php';

/**
 * Controleur de validation des propositions d'outils (scores par champ).
 *
 * NOUVEAU FICHIER - suit le meme pattern que AdminController :
 * helpers ok()/fail(), requireAdmin() avec token, donnees via Catalog.
 */
class ValidationController
{
    private Catalog $catalog;

    public function __construct()
    {
        $this->catalog = new Catalog();
    }

    /**
     * Action : admin_validate_tool
     * Calcule les scores de chaque champ d'un outil propose (en attente)
     * et retourne le resultat + les infos de soumission pour la modale admin.
     */
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

        // Infos du proposant (soumission liee a l'outil)
        $submission = $this->findSubmission((int) $tool['id']);

        // Construction du payload attendu par ToolValidationApi
        // (les cles correspondent au format de Catalog::formatTool)
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

    /**
     * Recupere la soumission la plus recente liee a un outil
     * (proposant, email, date) pour l'affichage dans la modale.
     */
    private function findSubmission(int $toolId): ?array
    {
        $pdo = require __DIR__ . '/../config/database.php';

        $stmt = $pdo->prepare("
            SELECT s.id_soum AS id, s.statut, s.note_admin AS adminNote, s.created_at AS createdAt,
                   u.idU AS userId, u.nom AS userName, u.prenom AS userFirstName, u.email AS userEmail
            FROM soumission_outil s
            JOIN utilisateur u ON u.idU = s.idU
            WHERE s.idOut = :tool_id
            ORDER BY s.created_at DESC, s.id_soum DESC
            LIMIT 1
        ");
        $stmt->execute(['tool_id' => $toolId]);
        $row = $stmt->fetch();

        if (!$row) {
            return null;
        }

        return [
            'id'        => (string) $row['id'],
            'status'    => $row['statut'],
            'adminNote' => $row['adminNote'],
            'createdAt' => $row['createdAt'],
            'userId'    => (string) $row['userId'],
            'userName'  => trim($row['userFirstName'] . ' ' . $row['userName']),
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
