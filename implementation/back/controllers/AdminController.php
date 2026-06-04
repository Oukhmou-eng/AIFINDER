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
        ok([
            'stats' => $this->catalog->stats(),
            'tools' => $this->catalog->tools(['limit' => 10, 'sortBy' => 'recent']),
            'users' => array_slice($this->users->all(), 0, 10),
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

    private function requireAdmin(array $data)
    {
        $payload = decodeToken($data['token'] ?? bearerToken());
        if (!$payload || ($payload['role'] ?? null) !== 'admin') {
            fail('Acces admin requis', 403);
        }

        return $payload;
    }
}
