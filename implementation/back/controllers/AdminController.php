<?php

require_once __DIR__ . '/../models/Catalog.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/validator.php';

class AdminController
{
    private Catalog $catalog;
    private User $users;

    public function __construct()
    {
        $this->catalog = new Catalog();
        $this->users = new User();
    }

    public function dashboard(array $data)
    {
        $this->requireAdmin($data);
        $pdo = require __DIR__ . '/../config/database.php';

        // Pending tools from soumission_outil
        $stmt = $pdo->query("
            SELECT s.id_soum AS id, s.statut, s.created_at AS createdAt,
                   u.nom AS userName, u.prenom AS userFirstName,
                   o.nom AS toolName, o.idOut
            FROM soumission_outil s
            JOIN utilisateur u ON u.idU = s.idU
            LEFT JOIN outils o ON o.idOut = s.idOut
            WHERE s.statut = 'en_attente'
            ORDER BY s.created_at DESC
            LIMIT 5
        ");
        $pendingTools = $stmt->fetchAll();

        // Recent reports
        $stmt = $pdo->query("
            SELECT s.id_Sig AS id, s.motif AS reason, s.statut, s.date AS createdAt,
                   o.nom AS toolName, a.id_avis AS commentId
            FROM signalements s
            LEFT JOIN outils o ON o.idOut = s.idOut
            LEFT JOIN avis a ON a.id_avis = s.id_com
            WHERE s.statut = 'en_attente'
            ORDER BY s.date DESC
            LIMIT 5
        ");
        $pendingReports = $stmt->fetchAll();

        ok([
            'stats' => $this->catalog->stats(),
            'pendingTools' => $pendingTools,
            'pendingReports' => $pendingReports,
            'users' => array_slice($this->users->all(), 0, 5),
        ]);
    }

    public function users(array $data)
    {
        $this->requireAdmin($data);
        ok(['users' => $this->users->all()]);
    }

    public function tools(array $data)
    {
        $this->requireAdmin($data);
        ok(['tools' => $this->catalog->tools($data)]);
    }

    public function models(array $data)
    {
        $this->requireAdmin($data);
        ok(['models' => $this->catalog->models()]);
    }

    public function createModel(array $data)
    {
        $this->requireAdmin($data);
        
        $name = cleanString($data['name'] ?? $data['nom'] ?? '');
        if ($name === '') {
            fail('Le nom du modele est obligatoire');
        }

        $model = $this->saveModel($data);
        ok(['model' => $model], 'Modele cree avec succes');
    }

    public function updateModel(array $data)
    {
        $this->requireAdmin($data);

        $id = $data['id'] ?? $data['idMod'] ?? null;
        if (!$id || !ctype_digit((string) $id)) {
            fail('Modele invalide');
        }

        $model = $this->saveModel($data);
        ok(['model' => $model], 'Modele mis a jour avec succes');
    }

    public function deleteModel(array $data)
    {
        $this->requireAdmin($data);

        $id = $data['id'] ?? $data['idMod'] ?? null;
        if (!$id || !ctype_digit((string) $id)) {
            fail('Modele invalide');
        }

        $pdo = require __DIR__ . '/../config/database.php';
        
        // Check if model is used by tools
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM outil_model WHERE idMod = :id');
        $stmt->execute(['id' => (int) $id]);
        if ($stmt->fetchColumn() > 0) {
            fail('Ce modele ne peut pas etre supprime car il est utilise par des outils');
        }

        $stmt = $pdo->prepare('DELETE FROM models WHERE idMod = :id');
        $stmt->execute(['id' => (int) $id]);

        if ($stmt->rowCount() === 0) {
            fail('Modele introuvable', 404);
        }

        ok(['id' => (string) $id], 'Modele supprime avec succes');
    }

    private function saveModel(array $data)
    {
        $pdo = require __DIR__ . '/../config/database.php';
        $id = $data['id'] ?? $data['idMod'] ?? null;
        $name = cleanString($data['name'] ?? $data['nom'] ?? '');
        $slug = $data['slug'] ?? slugify($name);
        $type = cleanString($data['type'] ?? '');
        $description = cleanString($data['description'] ?? '');
        $licence = cleanString($data['licence'] ?? $data['license'] ?? '');
        $apiUrl = cleanString($data['api_url'] ?? '');
        $isOpenSource = (int)($data['est_open_source'] ?? $data['openSource'] ?? 0);
        $multimodal = (int)($data['multimodal'] ?? 0);
        $hasApi = (int)($data['a_api'] ?? $data['hasApi'] ?? 0);
        $releaseDate = $data['release_date'] ?? $data['releaseDate'] ?? null;
        $idFourn = $data['id_fourn'] ?? $data['providerId'] ?? null;

        if (!$idFourn) {
            // Find or create a default provider if none provided (simplified)
            $stmt = $pdo->query("SELECT id_fourn FROM fournisseur LIMIT 1");
            $idFourn = $stmt->fetchColumn();
            if (!$idFourn) fail('Aucun fournisseur disponible. Veuillez d\'abord creer un fournisseur.');
        }

        if ($id) {
            $exists = $pdo->prepare('SELECT idMod FROM models WHERE idMod = :id LIMIT 1');
            $exists->execute(['id' => $id]);
            if (!$exists->fetch()) fail('Modele introuvable', 404);

            $stmt = $pdo->prepare("
                UPDATE models
                SET nom = :name, slug = :slug, type = :type, description = :description,
                    licence = :licence, api_url = :apiUrl, est_open_source = :isOpenSource,
                    release_date = :releaseDate, multimodal = :multimodal, a_api = :hasApi,
                    id_fourn = :idFourn
                WHERE idMod = :id
            ");
            $stmt->execute([
                'name' => $name, 'slug' => $slug, 'type' => $type, 'description' => $description,
                'licence' => $licence, 'apiUrl' => $apiUrl, 'isOpenSource' => $isOpenSource,
                'releaseDate' => $releaseDate, 'multimodal' => $multimodal, 'hasApi' => $hasApi,
                'idFourn' => $idFourn, 'id' => $id
            ]);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO models (nom, slug, type, description, licence, api_url, est_open_source, release_date, multimodal, a_api, id_fourn)
                VALUES (:name, :slug, :type, :description, :licence, :apiUrl, :isOpenSource, :releaseDate, :multimodal, :hasApi, :idFourn)
            ");
            $stmt->execute([
                'name' => $name, 'slug' => $slug, 'type' => $type, 'description' => $description,
                'licence' => $licence, 'apiUrl' => $apiUrl, 'isOpenSource' => $isOpenSource,
                'releaseDate' => $releaseDate, 'multimodal' => $multimodal, 'hasApi' => $hasApi,
                'idFourn' => $idFourn
            ]);
            $id = (int) $pdo->lastInsertId();
        }

        return $this->catalog->model($id);
    }

    public function categories(array $data)
    {
        $this->requireAdmin($data);
        ok(['categories' => $this->catalog->categories()]);
    }

    public function createCategory(array $data)
    {
        $this->requireAdmin($data);

        $name = cleanString($data['name'] ?? $data['nom_Cat'] ?? '');
        if ($name === '') {
            fail('Le nom de la categorie est obligatoire');
        }

        $category = $this->saveCategory([
            'name' => $name,
            'slug' => $data['slug'] ?? null,
            'icon' => $data['icon'] ?? $data['icone'] ?? null,
            'description' => $data['description'] ?? null,
        ]);

        ok(['category' => $category], 'Categorie creee avec succes');
    }

    public function updateCategory(array $data)
    {
        $this->requireAdmin($data);

        $id = $data['id'] ?? $data['id_Cat'] ?? null;
        if (!$id || !ctype_digit((string) $id)) {
            fail('Categorie invalide');
        }

        $name = cleanString($data['name'] ?? $data['nom_Cat'] ?? '');
        if ($name === '') {
            fail('Le nom de la categorie est obligatoire');
        }

        $category = $this->saveCategory([
            'id' => (int) $id,
            'name' => $name,
            'slug' => $data['slug'] ?? null,
            'icon' => $data['icon'] ?? $data['icone'] ?? null,
            'description' => $data['description'] ?? null,
        ]);

        ok(['category' => $category], 'Categorie mise a jour avec succes');
    }

    public function deleteCategory(array $data)
    {
        $this->requireAdmin($data);

        $id = $data['id'] ?? $data['id_Cat'] ?? null;
        if (!$id || !ctype_digit((string) $id)) {
            fail('Categorie invalide');
        }

        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->prepare('DELETE FROM categories WHERE id_Cat = :id');
        $stmt->execute(['id' => (int) $id]);

        if ($stmt->rowCount() === 0) {
            fail('Categorie introuvable', 404);
        }

        ok(['id' => (string) $id], 'Categorie supprimee avec succes');
    }

    public function notifications(array $data)
    {
        $this->requireAdmin($data);
        $pdo = require __DIR__ . '/../config/database.php';
        
        // Group by title, message and created_at to show "broadcasts" as single entries
        $stmt = $pdo->query("
            SELECT titre AS title, message, type, cible, created_at AS createdAt, COUNT(*) AS recipientCount
            FROM notification
            GROUP BY titre, message, type, cible, created_at
            ORDER BY created_at DESC
        ");
        
        ok(['notifications' => $stmt->fetchAll()]);
    }

    public function sendNotification(array $data)
    {
        $this->requireAdmin($data);
        
        $title = cleanString($data['title'] ?? '');
        $message = cleanString($data['message'] ?? '');
        $type = cleanString($data['type'] ?? 'info');
        $cible = cleanString($data['recipients'] ?? 'all');
        
        if (!$title || !$message) {
            fail('Titre et message requis');
        }

        $pdo = require __DIR__ . '/../config/database.php';
        
        // Get recipients
        $userIds = [];
        if ($cible === 'all') {
            $stmt = $pdo->query("SELECT idU FROM utilisateur");
            $userIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
        } else if ($cible === 'active') {
            // Placeholder for active users logic, let's say anyone with a favori or review
            $stmt = $pdo->query("SELECT DISTINCT idU FROM utilisateur WHERE idU IN (SELECT idU FROM favori UNION SELECT idU FROM avis)");
            $userIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
        } else {
            // Default to all if unknown
            $stmt = $pdo->query("SELECT idU FROM utilisateur");
            $userIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
        }

        if (empty($userIds)) {
            fail('Aucun destinataire trouve');
        }

        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("
                INSERT INTO notification (cible, type, titre, message, created_at, idU)
                VALUES (:cible, :type, :title, :message, CURRENT_DATE, :user_id)
            ");
            
            foreach ($userIds as $userId) {
                $stmt->execute([
                    'cible' => $cible,
                    'type' => $type,
                    'title' => $title,
                    'message' => $message,
                    'user_id' => $userId
                ]);
            }
            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            fail('Erreur lors de l\'envoi : ' . $e->getMessage());
        }

        ok([], 'Notification envoyee a ' . count($userIds) . ' utilisateurs');
    }

    public function deleteNotification(array $data)
    {
        $this->requireAdmin($data);

        $title = $data['title'] ?? null;
        $message = $data['message'] ?? null;
        $createdAt = $data['createdAt'] ?? null;

        if (!$title || !$message || !$createdAt) {
            fail('Informations de notification manquantes');
        }

        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->prepare("
            DELETE FROM notification 
            WHERE titre = :title AND message = :message AND created_at = :createdAt
        ");
        $stmt->execute([
            'title' => $title,
            'message' => $message,
            'createdAt' => $createdAt
        ]);

        ok([], 'Campagne de notification supprimee');
    }

    public function reports(array $data)
    {
        $this->requireAdmin($data);
        $pdo = require __DIR__ . '/../config/database.php';
        
        $stmt = $pdo->query("
            SELECT s.id_Sig AS id, s.motif AS reason, s.statut AS status, s.date AS createdAt, s.description AS details,
                   u.nom AS reporterName, u.prenom AS reporterFirstName,
                   o.nom AS toolName, o.idOut AS toolId,
                   a.contenu AS commentContent, a.id_avis AS commentId
            FROM signalements s
            JOIN utilisateur u ON u.idU = s.idU
            LEFT JOIN outils o ON o.idOut = s.idOut
            LEFT JOIN avis a ON a.id_avis = s.id_com
            ORDER BY s.date DESC, s.id_Sig DESC
        ");
        
        $reports = array_map(function($row) {
            $type = $row['commentId'] ? 'comment' : 'tool';
            $targetName = $type === 'tool' ? $row['toolName'] : 'Commentaire';
            return [
                'id' => (string) $row['id'],
                'reason' => $row['reason'],
                'status' => $row['status'] === 'en_attente' ? 'pending' : ($row['status'] === 'resolu' ? 'resolved' : 'rejected'),
                'createdAt' => $row['createdAt'],
                'details' => $row['details'],
                'reporterName' => trim($row['reporterFirstName'] . ' ' . $row['reporterName']),
                'type' => $type,
                'targetName' => $targetName,
                'toolId' => $row['toolId'],
                'commentId' => $row['commentId'],
                'commentContent' => $row['commentContent']
            ];
        }, $stmt->fetchAll());
        
        ok(['reports' => $reports]);
    }

    public function updateReportStatus(array $data)
    {
        $this->requireAdmin($data);
        
        $id = $data['id'] ?? null;
        $status = $data['status'] ?? null; // 'resolved' or 'rejected'
        
        if (!$id || !$status) {
            fail('ID et statut requis');
        }
        
        $dbStatus = $status === 'resolved' ? 'resolu' : 'rejete';
        
        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->prepare("UPDATE signalements SET statut = :status WHERE id_Sig = :id");
        $stmt->execute(['status' => $dbStatus, 'id' => $id]);
        
        if ($stmt->rowCount() === 0) {
            fail('Signalement introuvable', 404);
        }
        
        ok([], 'Statut du signalement mis a jour');
    }

    public function submissions(array $data)
    {
        $this->requireAdmin($data);
        $pdo = require __DIR__ . '/../config/database.php';

        $status = $data['status'] ?? null;
        $where  = $status ? 'WHERE s.statut = :status' : '';
        $params = $status ? ['status' => $status] : [];

        $stmt = $pdo->prepare("
            SELECT s.id_soum AS id, s.statut, s.note_admin AS adminNote, s.created_at AS createdAt,
                   s.idU AS userId,
                   u.nom AS userName, u.prenom AS userFirstName, u.email AS userEmail,
                   o.idOut AS toolId, o.nom AS toolName, o.slug AS toolSlug,
                   o.statut AS toolStatus, o.description_courte AS toolDescription,
                   o.pricing_type AS toolPricing, o.site_url AS toolUrl, o.logo_url AS toolLogo
            FROM soumission_outil s
            JOIN utilisateur u ON u.idU = s.idU
            LEFT JOIN outils o ON o.idOut = s.idOut
            $where
            ORDER BY s.created_at DESC
        ");
        $stmt->execute($params);

        $submissions = array_map(function ($row) {
            $dbStatus = $row['statut'];
            return [
                'id'              => (string) $row['id'],
                'status'          => $dbStatus === 'en_attente' ? 'pending' : ($dbStatus === 'approuve' ? 'approved' : 'rejected'),
                'adminNote'       => $row['adminNote'],
                'createdAt'       => $row['createdAt'],
                'userId'          => (string) $row['userId'],
                'userName'        => trim($row['userFirstName'] . ' ' . $row['userName']),
                'userEmail'       => $row['userEmail'],
                'toolId'          => (string) $row['toolId'],
                'toolName'        => $row['toolName'],
                'toolSlug'        => $row['toolSlug'],
                'toolStatus'      => $row['toolStatus'],
                'toolDescription' => $row['toolDescription'],
                'toolPricing'     => $row['toolPricing'],
                'toolUrl'         => $row['toolUrl'],
                'toolLogo'        => $row['toolLogo'],
            ];
        }, $stmt->fetchAll());

        ok(['submissions' => $submissions]);
    }

    public function approveTool(array $data)
    {
        $this->requireAdmin($data);

        $toolId = $data['id'] ?? $data['toolId'] ?? null;
        if (!$toolId) fail('ID de l\'outil requis', 422);

        $pdo = require __DIR__ . '/../config/database.php';

        $stmt = $pdo->prepare("UPDATE outils SET statut = 'actif' WHERE idOut = :id");
        $stmt->execute(['id' => $toolId]);
        if ($stmt->rowCount() === 0) fail('Outil introuvable', 404);

        $note = cleanString($data['note'] ?? '');
        $pdo->prepare("UPDATE soumission_outil SET statut = 'approuve', note_admin = :note WHERE idOut = :tool_id")
            ->execute(['note' => $note ?: null, 'tool_id' => $toolId]);

        // Notify submitter
        $stmt = $pdo->prepare("
            SELECT s.idU, o.nom AS toolName
            FROM soumission_outil s JOIN outils o ON o.idOut = s.idOut
            WHERE s.idOut = :tool_id LIMIT 1
        ");
        $stmt->execute(['tool_id' => $toolId]);
        $info = $stmt->fetch();
        if ($info) {
            $pdo->prepare("
                INSERT INTO notification (cible, type, titre, message, created_at, idU)
                VALUES ('user', 'success', :title, :message, CURRENT_DATE, :user_id)
            ")->execute([
                'title'   => 'Outil approuvé',
                'message' => 'Votre outil "' . $info['toolName'] . '" a été approuvé et est maintenant publié dans le catalogue.',
                'user_id' => $info['idU'],
            ]);
        }

        ok(['id' => (string) $toolId], 'Outil approuvé avec succès');
    }

    public function rejectTool(array $data)
    {
        $this->requireAdmin($data);

        $toolId = $data['id'] ?? $data['toolId'] ?? null;
        if (!$toolId) fail('ID de l\'outil requis', 422);

        $pdo = require __DIR__ . '/../config/database.php';

        $stmt = $pdo->prepare("UPDATE outils SET statut = 'refusé' WHERE idOut = :id");
        $stmt->execute(['id' => $toolId]);
        if ($stmt->rowCount() === 0) fail('Outil introuvable', 404);

        $reason = cleanString($data['reason'] ?? $data['note'] ?? '');
        $pdo->prepare("UPDATE soumission_outil SET statut = 'rejete', note_admin = :reason WHERE idOut = :tool_id")
            ->execute(['reason' => $reason ?: null, 'tool_id' => $toolId]);

        // Notify submitter
        $stmt = $pdo->prepare("
            SELECT s.idU, o.nom AS toolName
            FROM soumission_outil s JOIN outils o ON o.idOut = s.idOut
            WHERE s.idOut = :tool_id LIMIT 1
        ");
        $stmt->execute(['tool_id' => $toolId]);
        $info = $stmt->fetch();
        if ($info) {
            $message = 'Votre outil "' . $info['toolName'] . '" n\'a pas été retenu.';
            if ($reason) $message .= ' Motif : ' . $reason;
            $pdo->prepare("
                INSERT INTO notification (cible, type, titre, message, created_at, idU)
                VALUES ('user', 'error', :title, :message, CURRENT_DATE, :user_id)
            ")->execute([
                'title'   => 'Outil refusé',
                'message' => $message,
                'user_id' => $info['idU'],
            ]);
        }

        ok(['id' => (string) $toolId], 'Outil refusé');
    }

    public function deleteTool(array $data)
    {
        $this->requireAdmin($data);

        $id = $data['id'] ?? $data['idOut'] ?? null;
        if (!$id) fail('ID de l\'outil requis', 422);

        $pdo = require __DIR__ . '/../config/database.php';
        $pdo->beginTransaction();
        try {
            foreach (['pricing_plans', 'signalements', 'soumission_outil', 'outil_categorie',
                      'outil_tag', 'outil_plateforme', 'outil_model', 'outil_feature',
                      'outil_performance', 'favori', 'avis'] as $table) {
                $pdo->prepare("DELETE FROM {$table} WHERE idOut = :id")->execute(['id' => $id]);
            }
            $stmt = $pdo->prepare("DELETE FROM outils WHERE idOut = :id");
            $stmt->execute(['id' => $id]);
            if ($stmt->rowCount() === 0) {
                $pdo->rollBack();
                fail('Outil introuvable', 404);
            }
            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }

        ok(['id' => (string) $id], 'Outil supprimé');
    }

    public function createTool(array $data)
    {
        $adminPayload = $this->requireAdmin($data);
        $missing = requireFields($data, ['name', 'provider', 'shortDescription', 'longDescription', 'url', 'pricingType']);
        if ($missing) fail('Champs obligatoires manquants : ' . implode(', ', $missing), 422);

        $tool = $this->users->submitTool($adminPayload['id'], $data, 'actif');
        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->prepare("SELECT * FROM outils WHERE idOut = :id LIMIT 1");
        $stmt->execute(['id' => $tool['toolId']]);

        ok(['tool' => $this->catalog->tool($tool['toolId'])], 'Outil créé avec succès');
    }

    private function saveCategory(array $data)
    {
        $pdo = require __DIR__ . '/../config/database.php';
        $id = $data['id'] ?? null;
        $name = cleanString($data['name']);
        $slug = slugify($data['slug'] ?? $name);
        $icon = cleanString($data['icon'] ?? '') ?: 'Layers';
        $description = cleanString($data['description'] ?? '');

        if ($id) {
            $exists = $pdo->prepare('SELECT id_Cat FROM categories WHERE id_Cat = :id LIMIT 1');
            $exists->execute(['id' => $id]);
            if (!$exists->fetch()) {
                fail('Categorie introuvable', 404);
            }

            $duplicate = $pdo->prepare('SELECT id_Cat FROM categories WHERE slug = :slug AND id_Cat <> :id LIMIT 1');
            $duplicate->execute(['slug' => $slug, 'id' => $id]);
            if ($duplicate->fetch()) {
                fail('Ce slug est deja utilise');
            }

            $stmt = $pdo->prepare("
                UPDATE categories
                SET nom_Cat = :name, slug = :slug, icone = :icon, description = :description
                WHERE id_Cat = :id
            ");
            $stmt->execute([
                'name' => $name,
                'slug' => $slug,
                'icon' => $icon,
                'description' => $description ?: null,
                'id' => $id,
            ]);
        } else {
            $duplicate = $pdo->prepare('SELECT id_Cat FROM categories WHERE slug = :slug LIMIT 1');
            $duplicate->execute(['slug' => $slug]);
            if ($duplicate->fetch()) {
                fail('Ce slug est deja utilise');
            }

            $stmt = $pdo->prepare("
                INSERT INTO categories (nom_Cat, slug, icone, description)
                VALUES (:name, :slug, :icon, :description)
            ");
            $stmt->execute([
                'name' => $name,
                'slug' => $slug,
                'icon' => $icon,
                'description' => $description ?: null,
            ]);
            $id = (int) $pdo->lastInsertId();
        }

        foreach ($this->catalog->categories() as $category) {
            if ((string) $category['id'] === (string) $id) {
                return $category;
            }
        }

        fail('Categorie introuvable apres sauvegarde', 500);
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
