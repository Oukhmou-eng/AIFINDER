<?php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/validator.php';

class UserController
{
    private User $users;

    public function __construct()
    {
        $this->users = new User();
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

    public function notifications(array $data)
    {
        $auth = $this->currentUserPayload($data);
        ok(['notifications' => $this->users->notifications($auth['id'])]);
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
