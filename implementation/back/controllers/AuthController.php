<?php

require_once __DIR__ . '/../models/Auth.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/validator.php';

class AuthController
{
    private Auth $auth;
    private User $users;

    public function __construct()
    {
        $this->auth = new Auth();
        $this->users = new User();
    }

    public function login(array $data)
    {
        $missing = requireFields($data, ['email', 'password']);
        if ($missing) {
            fail('Champs manquants', 422, ['missing' => $missing]);
        }

        $user = $this->auth->findByEmail(cleanString($data['email']));
        if (!$user || !password_verify((string) $data['password'], $user['mot_de_passe'])) {
            fail('Email ou mot de passe incorrect', 401);
        }

        if ($user['statut'] !== 'actif') {
            fail('Compte non actif', 403);
        }

        $this->auth->updateLastLogin($user['idU']);
        $publicUser = $this->users->findById($user['idU']);
        $token = encodeToken([
            'id' => (int) $user['idU'],
            'email' => $user['email'],
            'role' => $user['role'],
            'iat' => time(),
        ]);

        ok([
            'user' => $publicUser,
            'token' => $token,
            'redirectTo' => $user['role'] === 'admin' ? '/admin' : '/dashboard',
        ], 'Connexion reussie');
    }

    public function register(array $data)
    {
        $missing = requireFields($data, ['email', 'password']);
        if ($missing) {
            fail('Champs manquants', 422, ['missing' => $missing]);
        }

        if (!validateEmail($data['email'])) {
            fail('Email invalide', 422);
        }

        if (!validateLength($data['password'], 8, 255)) {
            fail('Le mot de passe doit contenir au moins 8 caracteres', 422);
        }

        if ($this->auth->emailExists($data['email'])) {
            fail('Cet email est deja utilise', 409);
        }

        $role = ($data['role'] ?? 'user') === 'admin' ? 'admin' : 'user';
        $name = cleanString($data['name'] ?? $data['nom'] ?? '');
        $parts = preg_split('/\s+/', $name, 2);
        $id = $this->auth->register([
            'nom' => cleanString($data['nom'] ?? $parts[1] ?? $parts[0] ?? 'Utilisateur'),
            'prenom' => cleanString($data['prenom'] ?? $parts[0] ?? 'User'),
            'email' => cleanString($data['email']),
            'password' => (string) $data['password'],
            'role' => $role,
            'avatar_url' => $data['avatar_url'] ?? null,
        ]);

        ok(['user' => $this->users->findById($id)], 'Compte cree avec succes');
    }
}
