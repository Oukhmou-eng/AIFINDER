<?php
require_once __DIR__ . '/BaseModel.php';
class Comment extends BaseModel { protected string $table = 'commentaires'; protected string $primaryKey = 'id_com'; }
