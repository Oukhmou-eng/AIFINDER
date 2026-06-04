<?php

class BaseModel
{
    protected PDO $pdo;
    protected string $table;
    protected string $primaryKey;

    public function __construct()
    {
        $this->pdo = require __DIR__ . '/../config/database.php';
    }

    public function all($limit = 100)
    {
        $limit = max(1, min((int) $limit, 500));
        $stmt = $this->pdo->query("SELECT * FROM {$this->table} LIMIT {$limit}");
        return $stmt->fetchAll();
    }

    public function find($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE {$this->primaryKey} = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE {$this->primaryKey} = :id");
        return $stmt->execute(['id' => $id]);
    }
}
