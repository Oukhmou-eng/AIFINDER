<?php

class Auth
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = require __DIR__ . '/../config/database.php';
    }

    /* public function findByEmail($email)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM utilisateur WHERE email = :email LIMIT 1");
        $stmt->execute(['email' => $email]);
        return $stmt->fetch();
    } */

    public function findByEmail($email)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM UTILISATEUR WHERE EMAIL = :email LIMIT 1");
        $stmt->execute(['email' => $email]);
        return $stmt->fetch();
    }

    /* public function emailExists($email)
    {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM utilisateur WHERE email = :email");
        $stmt->execute(['email' => $email]);
        return (int) $stmt->fetchColumn() > 0;
    } */

    public function emailExists($email)
    {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM UTILISATEUR WHERE EMAIL = :email");
        $stmt->execute(['email' => $email]);
        return (int) $stmt->fetchColumn() > 0;
    }

    /* public function register(array $data)
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

        return (int) $this->pdo->lastInsertId();
    } */

    public function register(array $data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO UTILISATEUR
            (NOM, PRENOM, EMAIL, MOT_DE_PASSE, ROLE, STATUT, AVATAR_URL, DATE_INSCRIPTION)
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
        return (int) $this->pdo->lastInsertId();
    }



   /*  public function updateLastLogin($id)
    {
        $stmt = $this->pdo->prepare("UPDATE utilisateur SET derniere_connexion = NOW() WHERE idU = :id");
        $stmt->execute(['id' => $id]);
    } */

    public function updateLastLogin($id)
    {
        $stmt = $this->pdo->prepare("UPDATE UTILISATEUR SET DERNIERE_CONNEXION = NOW() WHERE IDU = :id");
        $stmt->execute(['id' => $id]);
    }
}
