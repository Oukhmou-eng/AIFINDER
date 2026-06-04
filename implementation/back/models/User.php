<?php

class User
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = require __DIR__ . '/../config/database.php';
    }

    public function all()
    {
        $stmt = $this->pdo->query("
            SELECT idU, nom, prenom, email, role, statut, avatar_url,
                   date_inscription, derniere_connexion
            FROM utilisateur
            ORDER BY date_inscription DESC
        ");

        return array_map([$this, 'formatUser'], $stmt->fetchAll());
    }

    public function findById($id)
    {
        $stmt = $this->pdo->prepare("
            SELECT idU, nom, prenom, email, role, statut, avatar_url,
                   date_inscription, derniere_connexion
            FROM utilisateur
            WHERE idU = :id
        ");
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch();

        return $user ? $this->formatUser($user) : null;
    }

    public function findAuthByEmail($email)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM utilisateur WHERE email = :email LIMIT 1");
        $stmt->execute(['email' => $email]);
        return $stmt->fetch();
    }

    public function emailExists($email)
    {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM utilisateur WHERE email = :email");
        $stmt->execute(['email' => $email]);
        return (int) $stmt->fetchColumn() > 0;
    }

    public function create(array $data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO utilisateur
            (nom, prenom, email, mot_de_passe, role, statut, avatar_url, date_inscription)
            VALUES (:nom, :prenom, :email, :password, :role, 'actif', :avatar_url, NOW())
        ");

        $stmt->execute([
            'nom' => $data['nom'],
            'prenom' => $data['prenom'],
            'email' => $data['email'],
            'password' => password_hash($data['password'], PASSWORD_DEFAULT),
            'role' => $data['role'] ?? 'user',
            'avatar_url' => $data['avatar_url'] ?? null,
        ]);

        return $this->findById($this->pdo->lastInsertId());
    }

    public function update($id, array $data)
    {
        $allowed = ['nom', 'prenom', 'email', 'role', 'statut', 'avatar_url'];
        $sets = [];
        $params = ['id' => $id];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $sets[] = "{$field} = :{$field}";
                $params[$field] = $data[$field];
            }
        }

        if (!$sets) {
            return $this->findById($id);
        }

        $stmt = $this->pdo->prepare("UPDATE utilisateur SET " . implode(', ', $sets) . " WHERE idU = :id");
        $stmt->execute($params);

        return $this->findById($id);
    }

    public function updateLastLogin($id)
    {
        $stmt = $this->pdo->prepare("UPDATE utilisateur SET derniere_connexion = NOW() WHERE idU = :id");
        $stmt->execute(['id' => $id]);
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM utilisateur WHERE idU = :id");
        return $stmt->execute(['id' => $id]);
    }

    public function favorites($userId)
    {
        $stmt = $this->pdo->prepare("SELECT idOut FROM favori WHERE idU = :id ORDER BY date_ajouter DESC");
        $stmt->execute(['id' => $userId]);
        return array_map('strval', array_column($stmt->fetchAll(), 'idOut'));
    }

    public function setFavorite($userId, $toolId, $active)
    {
        if ($active) {
            $stmt = $this->pdo->prepare("
                INSERT IGNORE INTO favori (date_ajouter, idU, idOut)
                VALUES (CURRENT_DATE, :user_id, :tool_id)
            ");
        } else {
            $stmt = $this->pdo->prepare("DELETE FROM favori WHERE idU = :user_id AND idOut = :tool_id");
        }

        return $stmt->execute(['user_id' => $userId, 'tool_id' => $toolId]);
    }

    public function notifications($userId)
    {
        $stmt = $this->pdo->prepare("
            SELECT id_Notif AS id, cible, type, titre AS title, message, created_at AS createdAt
            FROM notification
            WHERE idU = :id
            ORDER BY created_at DESC, id_Notif DESC
        ");
        $stmt->execute(['id' => $userId]);
        return $stmt->fetchAll();
    }

    public function collections($userId)
    {
        $stmt = $this->pdo->prepare("
            SELECT c.id_coll, c.nom, c.decription, c.created_at,
                   GROUP_CONCAT(co.idOut ORDER BY co.idOut) AS tool_ids
            FROM collection c
            LEFT JOIN collection_outil co ON co.id_coll = c.id_coll
            WHERE c.idU = :id
            GROUP BY c.id_coll
            ORDER BY c.created_at DESC
        ");
        $stmt->execute(['id' => $userId]);

        return array_map(function ($row) {
            return [
                'id' => (string) $row['id_coll'],
                'name' => $row['nom'],
                'description' => $row['decription'],
                'createdAt' => $row['created_at'],
                'toolIds' => $row['tool_ids'] ? explode(',', $row['tool_ids']) : [],
            ];
        }, $stmt->fetchAll());
    }

    public function createCollection($userId, array $data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO collection (nom, decription, created_at, idU)
            VALUES (:nom, :description, CURRENT_DATE, :user_id)
        ");
        $stmt->execute([
            'nom' => $data['name'] ?? $data['nom'],
            'description' => $data['description'] ?? null,
            'user_id' => $userId,
        ]);

        return $this->collections($userId);
    }

    public function submitTool($userId, array $data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO soumission_outil
            (statut, note_admin, nombre_soum, limite_soum, created_at, idU, idOut)
            VALUES ('en_attente', :note_admin, 1, 3, CURRENT_DATE, :user_id, :tool_id)
        ");
        $stmt->execute([
            'note_admin' => $data['note_admin'] ?? $data['note'] ?? null,
            'user_id' => $userId,
            'tool_id' => $data['idOut'] ?? $data['toolId'] ?? null,
        ]);

        return ['id' => (string) $this->pdo->lastInsertId(), 'status' => 'pending'];
    }

    private function formatUser(array $user)
    {
        return [
            'id' => (string) $user['idU'],
            'nom' => $user['nom'],
            'prenom' => $user['prenom'],
            'name' => trim($user['prenom'] . ' ' . $user['nom']),
            'email' => $user['email'],
            'avatar' => $user['avatar_url'],
            'role' => $user['role'],
            'status' => $user['statut'] === 'actif' ? 'active' : $user['statut'],
            'createdAt' => $user['date_inscription'],
            'lastLogin' => $user['derniere_connexion'],
            'favorites' => $this->favorites($user['idU']),
            'collections' => $this->collections($user['idU']),
        ];
    }
}
