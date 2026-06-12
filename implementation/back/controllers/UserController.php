<?php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Catalog.php';
require_once __DIR__ . '/../utils/validator.php';

class UserController
{
    private User $users;
    private Catalog $catalog;

    public function __construct()
    {
        $this->users = new User();
        $this->catalog = new Catalog();
    }

    public function me(array $data)
    {
        $auth = $this->currentUserPayload($data);
        $user = $this->users->findById($auth['id']);
        $user ? ok(['user' => $user]) : fail('Utilisateur introuvable', 404);
    }

    public function listUsers(array $data)
    {
        ok(['users' => $this->users->all()]);
    }

    public function getUser(array $data)
    {
        $id = $data['id'] ?? $data['idU'] ?? null;
        if (!$id) {
            fail('Identifiant utilisateur manquant', 422);
        }

        $user = $this->users->findById($id);
        $user ? ok(['user' => $user]) : fail('Utilisateur introuvable', 404);
    }

    public function updateUser(array $data)
    {
        $id = $data['id'] ?? $data['idU'] ?? null;
        if (!$id) {
            $auth = $this->currentUserPayload($data);
            $id = $auth['id'];
        }

        ok(['user' => $this->users->update($id, $data)], 'Utilisateur mis a jour');
    }

    public function changePassword(array $data)
    {
        $auth = $this->currentUserPayload($data);
        $currentPassword = $data['currentPassword'] ?? '';
        $newPassword = $data['newPassword'] ?? '';

        if (!$currentPassword || !$newPassword) {
            fail('Mots de passe requis');
        }

        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->prepare("SELECT mot_de_passe FROM utilisateur WHERE idU = :id");
        $stmt->execute(['id' => $auth['id']]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($currentPassword, $user['mot_de_passe'])) {
            fail('Mot de passe actuel incorrect');
        }

        $hashed = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE utilisateur SET mot_de_passe = :pass WHERE idU = :id");
        $stmt->execute(['pass' => $hashed, 'id' => $auth['id']]);

        ok([], 'Mot de passe mis a jour avec succes');
    }

    public function deleteUser(array $data)
    {
        $id = $data['id'] ?? $data['idU'] ?? null;
        if (!$id) {
            fail('Identifiant utilisateur manquant', 422);
        }

        $this->users->delete($id);
        ok([], 'Utilisateur supprime');
    }

    public function favorite(array $data)
    {
        $auth = $this->currentUserPayload($data);
        $toolId = $data['toolId'] ?? $data['idOut'] ?? null;
        if (!$toolId) {
            fail('Identifiant outil manquant', 422);
        }

        $active = !isset($data['active']) || filter_var($data['active'], FILTER_VALIDATE_BOOLEAN);
        $this->users->setFavorite($auth['id'], $toolId, $active);
        ok(['favorites' => $this->users->favorites($auth['id'])]);
    }

    public function myFavorites(array $data)
    {
        $auth = $this->currentUserPayload($data);
        $favoriteIds = $this->users->favorites($auth['id']);
        
        if (empty($favoriteIds)) {
            ok(['tools' => []]);
            return;
        }

        $tools = $this->catalog->tools(['ids' => $favoriteIds]);
        ok(['tools' => $tools]);
    }

    public function myReviews(array $data)
    {
        $auth = $this->currentUserPayload($data);
        ok(['reviews' => $this->catalog->userReviews($auth['id'])]);
    }

    public function myProposals(array $data)
    {
        $auth = $this->currentUserPayload($data);
        $pdo = require __DIR__ . '/../config/database.php';

        $stmt = $pdo->prepare("
            SELECT s.id_soum AS id, s.statut, s.note_admin AS adminNote, s.created_at AS createdAt,
                   o.idOut AS toolId, o.nom AS toolName, o.slug AS toolSlug,
                   o.statut AS toolStatus, o.description_courte AS toolDescription,
                   o.pricing_type AS toolPricing, o.site_url AS toolUrl, o.logo_url AS toolLogo
            FROM soumission_outil s
            LEFT JOIN outils o ON o.idOut = s.idOut
            WHERE s.idU = :user_id
            ORDER BY s.created_at DESC
        ");
        $stmt->execute(['user_id' => $auth['id']]);

        $submissions = array_map(function ($row) {
            $dbStatus = $row['statut'];
            return [
                'id'              => (string) $row['id'],
                'status'          => $dbStatus === 'en_attente' ? 'pending' : ($dbStatus === 'approuve' ? 'approved' : 'rejected'),
                'adminNote'       => $row['adminNote'],
                'createdAt'       => $row['createdAt'],
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

    public function updateReview(array $data)
    {
        $auth = $this->currentUserPayload($data);
        $id = $data['id'] ?? $data['id_avis'] ?? null;
        if (!$id) {
            fail('Identifiant avis manquant', 422);
        }

        ok(['reviews' => $this->catalog->updateReview($auth['id'], $id, $data)], 'Avis mis a jour');
    }

    public function deleteReview(array $data)
    {
        $auth = $this->currentUserPayload($data);
        $id = $data['id'] ?? $data['id_avis'] ?? null;
        if (!$id) {
            fail('Identifiant avis manquant', 422);
        }

        ok(['reviews' => $this->catalog->deleteReview($auth['id'], $id)], 'Avis supprime');
    }

    public function notifications(array $data)
    {
        $auth = $this->currentUserPayload($data);
        ok(['notifications' => $this->users->notifications($auth['id'])]);
    }

    public function markNotificationAsRead(array $data)
    {
        $auth = $this->currentUserPayload($data);
        $id = $data['id'] ?? $data['id_Notif'] ?? null;
        if (!$id) {
            fail('Identifiant notification manquant', 422);
        }

        ok(['notifications' => $this->users->markNotificationAsRead($auth['id'], $id)], 'Notification marquee comme lue');
    }

    public function markAllNotificationsAsRead(array $data)
    {
        $auth = $this->currentUserPayload($data);
        ok(['notifications' => $this->users->markAllNotificationsAsRead($auth['id'])], 'Toutes les notifications marquees comme lues');
    }

    public function deleteNotification(array $data)
    {
        $auth = $this->currentUserPayload($data);
        $id = $data['id'] ?? $data['id_Notif'] ?? null;
        if (!$id) {
            fail('Identifiant notification manquant', 422);
        }

        ok(['notifications' => $this->users->deleteNotification($auth['id'], $id)], 'Notification supprimee');
    }

    public function collections(array $data)
    {
        $auth = $this->currentUserPayload($data);
        ok(['collections' => $this->users->collections($auth['id'])]);
    }

    public function createCollection(array $data)
    {
        $auth = $this->currentUserPayload($data);
        $missing = requireFields($data, ['name']);
        if ($missing) {
            fail('Nom de collection manquant', 422);
        }

        ok(['collections' => $this->users->createCollection($auth['id'], $data)], 'Collection creee');
    }

    public function updateCollection(array $data)
    {
        $auth = $this->currentUserPayload($data);
        $id = $data['id'] ?? $data['id_coll'] ?? null;
        if (!$id) {
            fail('Identifiant collection manquant', 422);
        }

        ok(['collections' => $this->users->updateCollection($auth['id'], $id, $data)], 'Collection mise a jour');
    }

    public function deleteCollection(array $data)
    {
        $auth = $this->currentUserPayload($data);
        $id = $data['id'] ?? $data['id_coll'] ?? null;
        if (!$id) {
            fail('Identifiant collection manquant', 422);
        }

        ok(['collections' => $this->users->deleteCollection($auth['id'], $id)], 'Collection supprimee');
    }

    public function addToolToCollection(array $data)
    {
        $auth = $this->currentUserPayload($data);
        $collId = $data['collectionId'] ?? $data['id_coll'] ?? null;
        $toolId = $data['toolId'] ?? $data['idOut'] ?? null;

        if (!$collId || !$toolId) {
            fail('Identifiants manquants', 422);
        }

        ok(['collections' => $this->users->addToolToCollection($auth['id'], $collId, $toolId)], 'Outil ajoute a la collection');
    }

    public function removeToolFromCollection(array $data)
    {
        $auth = $this->currentUserPayload($data);
        $collId = $data['collectionId'] ?? $data['id_coll'] ?? null;
        $toolId = $data['toolId'] ?? $data['idOut'] ?? null;

        if (!$collId || !$toolId) {
            fail('Identifiants manquants', 422);
        }

        ok(['collections' => $this->users->removeToolFromCollection($auth['id'], $collId, $toolId)], 'Outil retire de la collection');
    }

    public function submitTool(array $data)
    {
        $auth = $this->currentUserPayload($data);
        ok(['submission' => $this->users->submitTool($auth['id'], $data)], 'Soumission envoyee');
    }

    public function logout(array $data)
    {
        ok([], 'Deconnexion reussie');
    }

    private function currentUserPayload(array $data)
    {
        $payload = decodeToken($data['token'] ?? bearerToken());
        if (!$payload || empty($payload['id'])) {
            fail('Authentification requise', 401);
        }

        return $payload;
    }
}
