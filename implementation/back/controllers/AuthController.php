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

        if (!$user) {
            fail('Email incorrect', 401);
        }
        error_log("Tentative de connexion pour email: " . cleanString($data['email']));
        error_log("Mot de passe fourni: " . (string) $data['password']);
        
        if (!$user || !password_verify((string) $data['password'], $user['MOT_DE_PASSE'])) {
            fail('Email ou mot de passe incorrect', 401);
        }

        if ($user['STATUT'] !== 'actif') {
            fail('Compte non actif', 403);
        }

        $this->auth->updateLastLogin($user['IDU']);
        $publicUser = $this->users->findById($user['IDU']);
        $token = encodeToken([
            'id' => (int) $user['IDU'],
            'email' => $user['EMAIL'],
            'role' => $user['ROLE'],
            'iat' => time(),
        ]);

        ok([
            'user' => $publicUser,
            'token' => $token,
            'redirectTo' => $user['ROLE'] === 'admin' ? '/admin' : '/dashboard',
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

        $user = $this->users->findById($id);
        $token = encodeToken([
            'id' => (int) $id,
            'email' => $data['email'],
            'role' => $role,
            'iat' => time(),
        ]);

        ok([
            'user' => $user,
            'token' => $token
        ], 'Compte cree avec succes');
    }

    public function googleAuth(array $data)
    {
        $credential = $data['credential'] ?? null;
        if (!$credential) {
            fail('Jeton Google manquant', 400);
        }

        // Verification du jeton aupres de Google via l'API publique
        $url = "https://oauth2.googleapis.com/tokeninfo?id_token=" . $credential;
        $response = @file_get_contents($url);
        
        if ($response === false) {
            fail('Echec de la verification du jeton Google. Verifiez que l\'extension openssl est activee dans php.ini', 401);
        }

        $payload = json_decode($response, true);
        if (!$payload || isset($payload['error'])) {
            fail('Jeton Google invalide', 401);
        }

        $email = $payload['email'];
        $nom = $payload['family_name'] ?? '';
        $prenom = $payload['given_name'] ?? '';
        $avatar = $payload['picture'] ?? null;

        $user = $this->auth->findByEmail($email);

        if (!$user) {
            $id = $this->auth->register([
                'nom' => $nom ?: 'User',
                'prenom' => $prenom ?: 'Google',
                'email' => $email,
                'password' => bin2hex(random_bytes(16)),
                'role' => 'user',
                'avatar_url' => $avatar,
            ]);
            $user = $this->auth->findByEmail($email);
        }

        if ($user['STATUT'] !== 'actif') {
            fail('Compte non actif', 403);
        }

        $this->auth->updateLastLogin($user['IDU']);
        $publicUser = $this->users->findById($user['IDU']);
        $token = encodeToken([
            'id' => (int) $user['IDU'],
            'email' => $user['EMAIL'],
            'role' => $user['ROLE'],
            'iat' => time(),
        ]);

        ok([
            'user' => $publicUser,
            'token' => $token,
            'redirectTo' => $user['ROLE'] === 'admin' ? '/admin' : '/dashboard',
        ], 'Authentification Google reussie');
    }
}
