<?php

/* class User
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
            SELECT id_Notif AS id, cible, type, titre AS title, message, created_at AS createdAt, lu AS `read`
            FROM notification
            WHERE idU = :id
            ORDER BY created_at DESC, id_Notif DESC
        ");
        $stmt->execute(['id' => $userId]);
        $rows = $stmt->fetchAll();
        return array_map(function($row) {
            $row['read'] = (bool)$row['read'];
            return $row;
        }, $rows);
    }

    public function markNotificationAsRead($userId, $notifId)
    {
        $stmt = $this->pdo->prepare("UPDATE notification SET lu = 1 WHERE id_Notif = :id AND idU = :user_id");
        $stmt->execute(['id' => $notifId, 'user_id' => $userId]);
        return $this->notifications($userId);
    }

    public function markAllNotificationsAsRead($userId)
    {
        $stmt = $this->pdo->prepare("UPDATE notification SET lu = 1 WHERE idU = :user_id");
        $stmt->execute(['user_id' => $userId]);
        return $this->notifications($userId);
    }

    public function deleteNotification($userId, $notifId)
    {
        $stmt = $this->pdo->prepare("DELETE FROM notification WHERE id_Notif = :id AND idU = :user_id");
        $stmt->execute(['id' => $notifId, 'user_id' => $userId]);
        return $this->notifications($userId);
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
            ORDER BY c.created_at DESC, c.id_coll DESC
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

    public function updateCollection($userId, $collectionId, array $data)
    {
        $stmt = $this->pdo->prepare("
            UPDATE collection 
            SET nom = :nom, decription = :description 
            WHERE id_coll = :id AND idU = :user_id
        ");
        $stmt->execute([
            'nom' => $data['name'] ?? $data['nom'],
            'description' => $data['description'] ?? null,
            'id' => $collectionId,
            'user_id' => $userId,
        ]);

        return $this->collections($userId);
    }

    public function deleteCollection($userId, $collectionId)
    {
        $stmt = $this->pdo->prepare("DELETE FROM collection WHERE id_coll = :id AND idU = :user_id");
        $stmt->execute(['id' => $collectionId, 'user_id' => $userId]);

        return $this->collections($userId);
    }

    public function addToolToCollection($userId, $collectionId, $toolId)
    {
        // Verify collection ownership
        $stmt = $this->pdo->prepare("SELECT 1 FROM collection WHERE id_coll = :id AND idU = :user_id");
        $stmt->execute(['id' => $collectionId, 'user_id' => $userId]);
        if (!$stmt->fetch()) return $this->collections($userId);

        $stmt = $this->pdo->prepare("INSERT IGNORE INTO collection_outil (id_coll, idOut) VALUES (:coll_id, :tool_id)");
        $stmt->execute(['coll_id' => $collectionId, 'tool_id' => $toolId]);

        return $this->collections($userId);
    }

    public function removeToolFromCollection($userId, $collectionId, $toolId)
    {
        // Verify collection ownership
        $stmt = $this->pdo->prepare("SELECT 1 FROM collection WHERE id_coll = :id AND idU = :user_id");
        $stmt->execute(['id' => $collectionId, 'user_id' => $userId]);
        if (!$stmt->fetch()) return $this->collections($userId);

        $stmt = $this->pdo->prepare("DELETE FROM collection_outil WHERE id_coll = :coll_id AND idOut = :tool_id");
        $stmt->execute(['coll_id' => $collectionId, 'tool_id' => $toolId]);

        return $this->collections($userId);
    }

    public function submitTool($userId, array $data, string $toolStatus = 'en_attente')
    {
        $this->pdo->beginTransaction();
        try {
            // Fournisseur: find by name or fall back to first available
            $provId = $this->findOrCreateFournisseur(cleanString($data['provider'] ?? ''));

            // 1. Create or Find tool
            $name = cleanString($data['name']);
            $slug = slugify($name);

            $stmt = $this->pdo->prepare("SELECT idOut, statut FROM outils WHERE slug = :slug LIMIT 1");
            $stmt->execute(['slug' => $slug]);
            $existingTool = $stmt->fetch();

            $currentToolId = 0;

            if ($existingTool) {
                if ($existingTool['statut'] === 'actif' && $toolStatus === 'en_attente') {
                    throw new Exception("Cet outil ('$name') est déjà présent dans notre catalogue.");
                }
                $currentToolId = (int) $existingTool['idOut'];

                // Update basic info if it's still pending
                if ($existingTool['statut'] === 'en_attente') {
                    $stmt = $this->pdo->prepare("
                        UPDATE outils SET 
                            pricing_type = :pricing_type, 
                            description_courte = :short_desc, 
                            site_url = :site_url,
                            type_tarif = :type_tarif,
                            id_fourn = :prov_id
                        WHERE idOut = :id
                    ");
                    $stmt->execute([
                        'pricing_type' => $data['pricingType'] ?? 'freemium',
                        'short_desc'   => $data['shortDescription'] ?? '',
                        'site_url'     => $data['url'] ?? '',
                        'type_tarif'   => $data['pricingType'] ?? 'freemium',
                        'prov_id'      => $provId,
                        'id'           => $currentToolId
                    ]);
                }
            } else {
                $stmt = $this->pdo->prepare("
                    INSERT INTO outils
                    (nom, slug, pricing_type, description_courte, description_longue, site_url, logo_url,
                     statut, created_at, release_date, open_source, type_tarif, id_fourn)
                    VALUES (:nom, :slug, :pricing_type, :short_desc, :long_desc, :site_url, :logo_url,
                            :statut, CURRENT_DATE, :release_date, :open_source, :type_tarif, :id_fourn)
                ");
                $stmt->execute([
                    'nom'          => $name,
                    'slug'         => $slug,
                    'pricing_type' => $data['pricingType'] ?? 'freemium',
                    'short_desc'   => $data['shortDescription'] ?? '',
                    'long_desc'    => $data['longDescription'] ?? null,
                    'site_url'     => $data['url'] ?? '',
                    'logo_url'     => $data['logoUrl'] ?? null,
                    'statut'       => $toolStatus,
                    'release_date' => !empty($data['releaseDate']) ? $data['releaseDate'] : null,
                    'open_source'  => (int)($data['isOpenSource'] ?? 0),
                    'type_tarif'   => $data['pricingType'] ?? 'freemium',
                    'id_fourn'     => $provId,
                ]);
                $currentToolId = (int) $this->pdo->lastInsertId();
            }

            if ($currentToolId <= 0) {
                throw new Exception("Erreur technique lors de la création de l'outil.");
            }

            // 2. Category: link
            $catId = $data['categoryId'] ?? null;
            if ($catId === 'new' && !empty($data['newCategory']['name'])) {
                $catName = cleanString($data['newCategory']['name']);
                $catSlug = slugify($catName);

                $stmt = $this->pdo->prepare("SELECT id_Cat FROM categories WHERE slug = :slug LIMIT 1");
                $stmt->execute(['slug' => $catSlug]);
                $foundCatId = $stmt->fetchColumn();

                if (!$foundCatId) {
                    $catDesc = cleanString($data['newCategory']['description'] ?? '');
                    $stmt = $this->pdo->prepare(
                        "INSERT INTO categories (nom_Cat, slug, icone, description) VALUES (:name, :slug, 'Layers', :desc)"
                    );
                    $stmt->execute(['name' => $catName, 'slug' => $catSlug, 'desc' => $catDesc ?: null]);
                    $catId = (int) $this->pdo->lastInsertId();
                } else {
                    $catId = (int) $foundCatId;
                }
            }
            if ($catId && $catId > 0) {
                $stmt = $this->pdo->prepare("INSERT IGNORE INTO outil_categorie (idOut, id_Cat) VALUES (:tool_id, :cat_id)");
                $stmt->execute(['tool_id' => $currentToolId, 'cat_id' => $catId]);
            }

            // 3. Tags
            if (!empty($data['tags']) && is_array($data['tags'])) {
                // Clear existing
                $this->pdo->prepare("DELETE FROM outil_tag WHERE idOut = :id")->execute(['id' => $currentToolId]);

                foreach ($data['tags'] as $tag) {
                    $tagName = is_array($tag) ? cleanString($tag['name'] ?? '') : cleanString((string) $tag);
                    if (!$tagName) continue;
                    $tagSlug = slugify($tagName);

                    $stmt = $this->pdo->prepare("SELECT id_tag FROM tags WHERE slug = :slug LIMIT 1");
                    $stmt->execute(['slug' => $tagSlug]);
                    $tagId = $stmt->fetchColumn();

                    if (!$tagId) {
                        $stmt = $this->pdo->prepare("INSERT INTO tags (nom, slug) VALUES (:name, :slug)");
                        $stmt->execute(['name' => $tagName, 'slug' => $tagSlug]);
                        $tagId = (int) $this->pdo->lastInsertId();
                    } else {
                        $tagId = (int) $tagId;
                    }

                    if ($tagId > 0) {
                        $stmt = $this->pdo->prepare("INSERT INTO outil_tag (idOut, id_tag) VALUES (:tool_id, :tag_id) ON DUPLICATE KEY UPDATE id_tag = id_tag");
                        $stmt->execute(['tool_id' => $currentToolId, 'tag_id' => $tagId]);
                    }
                }
            }

            // 4. Platforms
            if (!empty($data['platforms']) && is_array($data['platforms'])) {
                $this->pdo->prepare("DELETE FROM outil_plateforme WHERE idOut = :id")->execute(['id' => $currentToolId]);
                foreach ($data['platforms'] as $platformName) {
                    $platformName = cleanString($platformName);
                    if (!$platformName) continue;
                    $pltfSlug = slugify($platformName);

                    $stmt = $this->pdo->prepare("SELECT id FROM plateforme WHERE slug = :slug LIMIT 1");
                    $stmt->execute(['slug' => $pltfSlug]);
                    $pltfId = $stmt->fetchColumn();

                    if (!$pltfId) {
                        $stmt = $this->pdo->prepare("INSERT INTO plateforme (nom, slug) VALUES (:name, :slug)");
                        $stmt->execute(['name' => $platformName, 'slug' => $pltfSlug]);
                        $pltfId = (int) $this->pdo->lastInsertId();
                    } else {
                        $pltfId = (int) $pltfId;
                    }
                    $stmt = $this->pdo->prepare("INSERT IGNORE INTO outil_plateforme (idOut, id) VALUES (:tool_id, :pltf_id)");
                    $stmt->execute(['tool_id' => $currentToolId, 'pltf_id' => $pltfId]);
                }
            }

            // 5. AI Models
            if (!empty($data['models']) && is_array($data['models'])) {
                $this->pdo->prepare("DELETE FROM outil_model WHERE idOut = :id")->execute(['id' => $currentToolId]);
                foreach ($data['models'] as $model) {
                    $linkedModelId = 0;
                    if (!empty($model['isNew'])) {
                        $modelName = cleanString($model['name'] ?? '');
                        if (!$modelName) continue;
                        $modelProvId = $this->findOrCreateFournisseur(
                            cleanString($model['provider'] ?? $data['provider'] ?? '')
                        ) ?? $provId;

                        $stmt = $this->pdo->prepare("
                            INSERT INTO models
                            (nom, slug, type, description, licence, api_url, est_open_source, multimodal, a_api, id_fourn)
                            VALUES (:name, :slug, :type, :desc, :licence, :apiUrl, :openSource, :multimodal, :hasApi, :provId)
                        ");
                        $stmt->execute([
                            'name'       => $modelName,
                            'slug'       => slugify($modelName),
                            'type'       => cleanString($model['type'] ?? 'LLM'),
                            'desc'       => cleanString($model['description'] ?? '') ?: null,
                            'licence'    => cleanString($model['license'] ?? $model['licence'] ?? '') ?: null,
                            'apiUrl'     => cleanString($model['apiUrl'] ?? '') ?: null,
                            'openSource' => (int)($model['openSource'] ?? 0),
                            'multimodal' => (int)($model['multimodal'] ?? 0),
                            'hasApi'     => (int)($model['hasApi'] ?? 0),
                            'provId'     => $modelProvId,
                        ]);
                        $linkedModelId = (int) $this->pdo->lastInsertId();
                    } else {
                        $linkedModelId = (int) ($model['modelId'] ?? $model['id'] ?? 0);
                        if ($linkedModelId <= 0) continue;
                    }

                    if ($linkedModelId > 0) {
                        $stmt = $this->pdo->prepare("INSERT IGNORE INTO outil_model (idOut, idMod) VALUES (:tool_id, :model_id)");
                        $stmt->execute(['tool_id' => $currentToolId, 'model_id' => $linkedModelId]);
                    }
                }
            }

            // 6. Features
            if (!empty($data['features']) && is_array($data['features'])) {
                $this->pdo->prepare("DELETE FROM outil_feature WHERE idOut = :id")->execute(['id' => $currentToolId]);
                foreach ($data['features'] as $feat) {
                    $featName = cleanString($feat['name'] ?? '');
                    if (!$featName) continue;
                    $stmt = $this->pdo->prepare("SELECT id_features FROM features WHERE name = :name LIMIT 1");
                    $stmt->execute(['name' => $featName]);
                    $featId = $stmt->fetchColumn();
                    if (!$featId) {
                        $stmt = $this->pdo->prepare("INSERT INTO features (name, description) VALUES (:name, :desc)");
                        $stmt->execute(['name' => $featName, 'desc' => cleanString($feat['description'] ?? '') ?: null]);
                        $featId = (int) $this->pdo->lastInsertId();
                    } else {
                        $featId = (int) $featId;
                    }
                    $stmt = $this->pdo->prepare("INSERT IGNORE INTO outil_feature (idOut, id_features) VALUES (:tool_id, :feat_id)");
                    $stmt->execute(['tool_id' => $currentToolId, 'feat_id' => $featId]);
                }
            }

            // 7. Performances
            if (!empty($data['performances']) && is_array($data['performances'])) {
                $this->pdo->prepare("DELETE FROM outil_performance WHERE idOut = :id")->execute(['id' => $currentToolId]);
                foreach ($data['performances'] as $perf) {
                    $domain = cleanString($perf['domain'] ?? '');
                    $score  = max(0, min(100, (int)($perf['score'] ?? 0)));
                    if (!$domain) continue;
                    $stmt = $this->pdo->prepare("INSERT INTO performance (domaine, score) VALUES (:domain, :score)");
                    $stmt->execute(['domain' => $domain, 'score' => $score]);
                    $perfId = (int) $this->pdo->lastInsertId();
                    $stmt = $this->pdo->prepare("INSERT INTO outil_performance (idOut, id_performance) VALUES (:tool_id, :perf_id)");
                    $stmt->execute(['tool_id' => $currentToolId, 'perf_id' => $perfId]);
                }
            }

            // 8. Submission record
            $submissionId = null;
            if ($toolStatus === 'en_attente') {
                $stmt = $this->pdo->prepare("
                    INSERT INTO soumission_outil
                    (statut, note_admin, nombre_soum, limite_soum, created_at, idU, idOut)
                    VALUES ('en_attente', :note_admin, 1, 3, CURRENT_DATE, :user_id, :tool_id)
                    ON DUPLICATE KEY UPDATE 
                        statut = 'en_attente',
                        note_admin = VALUES(note_admin),
                        created_at = CURRENT_DATE
                ");
                $stmt->execute([
                    'note_admin' => $data['note_admin'] ?? $data['note'] ?? null,
                    'user_id'    => $userId,
                    'tool_id'    => $currentToolId,
                ]);
                $submissionId = (int) $this->pdo->lastInsertId();
            }

            $this->pdo->commit();
            return [
                'id'     => (string) ($submissionId > 0 ? $submissionId : $currentToolId),
                'status' => $toolStatus === 'actif' ? 'approved' : 'pending',
                'toolId' => (string) $currentToolId,
            ];
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    private function findOrCreateFournisseur(string $name): ?int
    {
        if (!$name) {
            $row = $this->pdo->query("SELECT id_fourn FROM fournisseur LIMIT 1")->fetchColumn();
            return $row ? (int) $row : null;
        }
        $stmt = $this->pdo->prepare("SELECT id_fourn FROM fournisseur WHERE nom = :name LIMIT 1");
        $stmt->execute(['name' => $name]);
        $id = $stmt->fetchColumn();
        if ($id) return (int) $id;
        try {
            $stmt = $this->pdo->prepare("INSERT INTO fournisseur (nom, slug, created_at) VALUES (:name, :slug, CURRENT_DATE)");
            $stmt->execute(['name' => $name, 'slug' => slugify($name)]);
            return (int) $this->pdo->lastInsertId();
        } catch (Throwable $e) {
            $row = $this->pdo->query("SELECT id_fourn FROM fournisseur LIMIT 1")->fetchColumn();
            return $row ? (int) $row : null;
        }
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
} */



class User
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = require __DIR__ . '/../config/database.php';
    }

    /**
     * Retourne tous les utilisateurs
     */
    public function all()
    {
        $stmt = $this->pdo->query("
            SELECT IDU, NOM, PRENOM, EMAIL, ROLE, STATUT, AVATAR_URL,
                   DATE_INSCRIPTION, DERNIERE_CONNEXION
            FROM UTILISATEUR
            ORDER BY DATE_INSCRIPTION DESC
        ");
        return array_map([$this, 'formatUser'], $stmt->fetchAll());
    }

    /**
     * Trouve un utilisateur par son ID
     */
    public function findById($id)
    {
        $stmt = $this->pdo->prepare("
            SELECT IDU, NOM, PRENOM, EMAIL, ROLE, STATUT, AVATAR_URL,
                   DATE_INSCRIPTION, DERNIERE_CONNEXION
            FROM UTILISATEUR
            WHERE IDU = :id
        ");
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch();
        return $user ? $this->formatUser($user) : null;
    }

    /**
     * Authentification par email
     */
    public function findAuthByEmail($email)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM UTILISATEUR WHERE EMAIL = :email LIMIT 1");
        $stmt->execute(['email' => $email]);
        return $stmt->fetch();
    }

    /**
     * Vérifie si un email existe déjà
     */
    public function emailExists($email)
    {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM UTILISATEUR WHERE EMAIL = :email");
        $stmt->execute(['email' => $email]);
        return (int) $stmt->fetchColumn() > 0;
    }

    /**
     * Crée un nouvel utilisateur
     */
    public function create(array $data)
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
        return $this->findById($this->pdo->lastInsertId());
    }

    /**
     * Met à jour un utilisateur (champs autorisés)
     */
    public function update($id, array $data)
    {
        $allowed = ['NOM', 'PRENOM', 'EMAIL', 'ROLE', 'STATUT', 'AVATAR_URL'];
        $sets = [];
        $params = ['id' => $id];
        foreach ($allowed as $field) {
            $snake = strtolower($field);
            $camel = lcfirst(str_replace('_', '', ucwords($snake, '_')));

            // Check for both camelCase and snake_case keys
            $value = null;
            $found = false;

            if (array_key_exists($camel, $data)) {
                $value = $data[$camel];
                $found = true;
            } elseif (array_key_exists($snake, $data)) {
                $value = $data[$snake];
                $found = true;
            }

            if ($found) {
                $sets[] = "$field = :$field";
                $params[$field] = $value;
            }
        }
        if (!$sets) {
            return $this->findById($id);
        }
        $stmt = $this->pdo->prepare("UPDATE UTILISATEUR SET " . implode(', ', $sets) . " WHERE IDU = :id");
        $stmt->execute($params);
        return $this->findById($id);
    }

    /**
     * Met à jour la date de dernière connexion
     */
    public function updateLastLogin($id)
    {
        $stmt = $this->pdo->prepare("UPDATE UTILISATEUR SET DERNIERE_CONNEXION = NOW() WHERE IDU = :id");
        $stmt->execute(['id' => $id]);
    }

    /**
     * Supprime un utilisateur
     */
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM UTILISATEUR WHERE IDU = :id");
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Liste des IDs d'outils favoris d'un utilisateur
     */
    public function favorites($userId)
    {
        $stmt = $this->pdo->prepare("
            SELECT IDOUT FROM FAVORI WHERE IDU = :id ORDER BY DATE_AJOUT DESC
        ");
        $stmt->execute(['id' => $userId]);
        return array_map('strval', array_column($stmt->fetchAll(), 'IDOUT'));
    }

    /**
     * Ajoute ou supprime un favori
     */
    public function setFavorite($userId, $toolId, $active)
    {
        if ($active) {
            $stmt = $this->pdo->prepare("
                INSERT IGNORE INTO FAVORI (IDOUT, IDU, DATE_AJOUT)
                VALUES (:tool_id, :user_id, CURRENT_DATE)
            ");
        } else {
            $stmt = $this->pdo->prepare("DELETE FROM FAVORI WHERE IDU = :user_id AND IDOUT = :tool_id");
        }
        return $stmt->execute(['user_id' => $userId, 'tool_id' => $toolId]);
    }

    /**
     * Récupère les notifications d'un utilisateur (via NOTIFICATION_UTILISATEUR)
     */
    public function notifications($userId)
    {
        $stmt = $this->pdo->prepare("
            SELECT n.ID_NOTIF AS id, n.CIBLE, n.TYPE, n.MESSAGE, n.DATE_MISE_A_JOUR AS date,
                   nu.DATE_LECTURE AS read_at
            FROM NOTIFICATION n
            JOIN NOTIFICATION_UTILISATEUR nu ON nu.ID_NOTIF = n.ID_NOTIF
            WHERE nu.IDU = :id
            ORDER BY n.DATE_MISE_A_JOUR DESC, n.ID_NOTIF DESC
        ");
        $stmt->execute(['id' => $userId]);
        $rows = $stmt->fetchAll();
        return array_map(function ($row) {
            return [
                'id' => (string) $row['id'],
                'cible' => $row['CIBLE'],
                'type' => $row['TYPE'],
                'message' => $row['MESSAGE'],
                'createdAt' => $row['date'],
                'read' => !is_null($row['read_at']),
            ];
        }, $rows);
    }

    /**
     * Marque une notification comme lue
     */
    public function markNotificationAsRead($userId, $notifId)
    {
        $stmt = $this->pdo->prepare("
            UPDATE NOTIFICATION_UTILISATEUR SET DATE_LECTURE = CURRENT_DATE
            WHERE ID_NOTIF = :id AND IDU = :user_id AND DATE_LECTURE IS NULL
        ");
        $stmt->execute(['id' => $notifId, 'user_id' => $userId]);
        return $this->notifications($userId);
    }

    /**
     * Marque toutes les notifications comme lues
     */
    public function markAllNotificationsAsRead($userId)
    {
        $stmt = $this->pdo->prepare("
            UPDATE NOTIFICATION_UTILISATEUR SET DATE_LECTURE = CURRENT_DATE
            WHERE IDU = :user_id AND DATE_LECTURE IS NULL
        ");
        $stmt->execute(['user_id' => $userId]);
        return $this->notifications($userId);
    }

    /**
     * Supprime une notification (supprime la liaison)
     */
    public function deleteNotification($userId, $notifId)
    {
        $stmt = $this->pdo->prepare("
            DELETE FROM NOTIFICATION_UTILISATEUR WHERE ID_NOTIF = :id AND IDU = :user_id
        ");
        $stmt->execute(['id' => $notifId, 'user_id' => $userId]);
        return $this->notifications($userId);
    }

    /**
     * Récupère toutes les collections d'un utilisateur
     */
    public function collections($userId)
    {
        $stmt = $this->pdo->prepare("
            SELECT c.ID_COLLECTION AS id_coll, c.NOM, c.DESCRIPTION, c.DATE_MISE_A_JOUR AS updated_at,
                   GROUP_CONCAT(co.IDOUT ORDER BY co.IDOUT) AS tool_ids
            FROM COLLECTION c
            LEFT JOIN COLLECTION_OUTIL co ON co.ID_COLLECTION = c.ID_COLLECTION
            WHERE c.IDU = :id
            GROUP BY c.ID_COLLECTION
            ORDER BY c.DATE_MISE_A_JOUR DESC, c.ID_COLLECTION DESC
        ");
        $stmt->execute(['id' => $userId]);
        return array_map(function ($row) {
            return [
                'id' => (string) $row['id_coll'],
                'name' => $row['NOM'],
                'description' => $row['DESCRIPTION'],
                'updatedAt' => $row['updated_at'],
                'toolIds' => $row['tool_ids'] ? explode(',', $row['tool_ids']) : [],
            ];
        }, $stmt->fetchAll());
    }

    /**
     * Crée une nouvelle collection
     */
    public function createCollection($userId, array $data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO COLLECTION (NOM, DESCRIPTION, DATE_MISE_A_JOUR, IDU)
            VALUES (:nom, :description, CURRENT_DATE, :user_id)
        ");
        $stmt->execute([
            'nom' => $data['name'] ?? $data['nom'],
            'description' => $data['description'] ?? null,
            'user_id' => $userId,
        ]);
        return $this->collections($userId);
    }

    /**
     * Met à jour une collection
     */
    public function updateCollection($userId, $collectionId, array $data)
    {
        $stmt = $this->pdo->prepare("
            UPDATE COLLECTION
            SET NOM = :nom, DESCRIPTION = :description, DATE_MISE_A_JOUR = CURRENT_DATE
            WHERE ID_COLLECTION = :id AND IDU = :user_id
        ");
        $stmt->execute([
            'nom' => $data['name'] ?? $data['nom'],
            'description' => $data['description'] ?? null,
            'id' => $collectionId,
            'user_id' => $userId,
        ]);
        return $this->collections($userId);
    }

    /**
     * Supprime une collection
     */
    public function deleteCollection($userId, $collectionId)
    {
        $stmt = $this->pdo->prepare("DELETE FROM COLLECTION WHERE ID_COLLECTION = :id AND IDU = :user_id");
        $stmt->execute(['id' => $collectionId, 'user_id' => $userId]);
        return $this->collections($userId);
    }

    /**
     * Ajoute un outil à une collection
     */
    public function addToolToCollection($userId, $collectionId, $toolId)
    {
        // Vérifier la propriété de la collection
        $stmt = $this->pdo->prepare("SELECT 1 FROM COLLECTION WHERE ID_COLLECTION = :id AND IDU = :user_id");
        $stmt->execute(['id' => $collectionId, 'user_id' => $userId]);
        if (!$stmt->fetch())
            return $this->collections($userId);

        $stmt = $this->pdo->prepare("INSERT IGNORE INTO COLLECTION_OUTIL (ID_COLLECTION, IDOUT, DATE_AJOUT) VALUES (:coll_id, :tool_id, CURRENT_DATE)");
        $stmt->execute(['coll_id' => $collectionId, 'tool_id' => $toolId]);
        return $this->collections($userId);
    }

    /**
     * Retire un outil d'une collection
     */
    public function removeToolFromCollection($userId, $collectionId, $toolId)
    {
        $stmt = $this->pdo->prepare("SELECT 1 FROM COLLECTION WHERE ID_COLLECTION = :id AND IDU = :user_id");
        $stmt->execute(['id' => $collectionId, 'user_id' => $userId]);
        if (!$stmt->fetch())
            return $this->collections($userId);

        $stmt = $this->pdo->prepare("DELETE FROM COLLECTION_OUTIL WHERE ID_COLLECTION = :coll_id AND IDOUT = :tool_id");
        $stmt->execute(['coll_id' => $collectionId, 'tool_id' => $toolId]);
        return $this->collections($userId);
    }

    /**
     * Soumission d'un nouvel outil (ou mise à jour d'un brouillon)
     */
    public function submitTool($userId, array $data, string $toolStatus = 'en_attente')
    {
        $this->pdo->beginTransaction();
        try {
            // Nettoyer le nom du fournisseur
            $providerName = cleanString($data['provider'] ?? '');
            $provId = $this->findOrCreateFournisseur($providerName);

            // Préparer les données de l'outil
            $name = cleanString($data['name']);
            $slug = slugify($name);

            $submissionId = null;
            // Vérifier si l'outil existe déjà
            $stmt = $this->pdo->prepare("SELECT IDOUT, STATUT FROM OUTILS WHERE SLUG = :slug LIMIT 1");
            $stmt->execute(['slug' => $slug]);
            $existingTool = $stmt->fetch();
            $currentToolId = 0;

            if ($existingTool) {
                if ($existingTool['STATUT'] === 'actif' && $toolStatus === 'en_attente') {
                    throw new Exception("Cet outil ('$name') est déjà présent dans notre catalogue.");
                }
                $currentToolId = (int) $existingTool['IDOUT'];
                // Mise à jour d'un brouillon
                if ($existingTool['STATUT'] === 'en_attente') {
                    $stmt = $this->pdo->prepare("
                    UPDATE OUTILS SET
                    STATUT = en_attente,
                        TYPE_TARIF = :pricing_type,
                        DESCRIPTION_COURTE = :short_desc,
                        SITE_URL = :site_url,
                        ID_FOURNISSEUR = :prov_id,
                        DATE_MISE_A_JOUR = CURRENT_DATE
                    WHERE IDOUT = :id
                ");
                    $stmt->execute([
                        'pricing_type' => $data['pricingType'] ?? 'freemium',
                        'short_desc' => $data['shortDescription'] ?? '',
                        'site_url' => $data['url'] ?? '',
                        'prov_id' => $provId,
                        'id' => $currentToolId
                    ]);
                }
            } else {
                $stmt = $this->pdo->prepare("
                INSERT INTO OUTILS
                (NOM,IDU, SLUG, TYPE_TARIF, DESCRIPTION_COURTE, DESCRIPTION_LONGUE, SITE_URL, LOGO_URL,
                 STATUT, DATE_SORTIE, EST_OPEN_SOURCE, ID_FOURNISSEUR)
                VALUES (:nom, :id_user, :slug, :pricing_type, :short_desc, :long_desc, :site_url, :logo_url,
                    'en_attente', :release_date, :open_source, :id_fourn)
            ");
                $stmt->execute([
                    'nom' => $name,
                    'id_user' => $userId,
                    'slug' => $slug,
                    'pricing_type' => $data['pricingType'] ?? 'freemium',
                    'short_desc' => $data['shortDescription'] ?? '',
                    'long_desc' => $data['longDescription'] ?? null,
                    'site_url' => $data['url'] ?? '',
                    'logo_url' => $data['logoUrl'] ?? null,
                    'release_date' => !empty($data['releaseDate']) ? $data['releaseDate'] : null,
                    'open_source' => (int) ($data['isOpenSource'] ?? 0),
                    'id_fourn' => $provId,
                ]);
                $currentToolId = (int) $this->pdo->lastInsertId();
            }

            if ($currentToolId <= 0) {
                throw new Exception("Erreur technique lors de la création de l'outil.");
            }


             $stmtAttempt = $this->pdo->prepare("SELECT * FROM SOUMISSION_OUTIL WHERE IDOUT = :id");
            $stmtAttempt->execute(['id' => $currentToolId]);
            $currentsubmit = $stmtAttempt->fetch();

            if ($currentsubmit) {
                $stmt = $this->pdo->prepare("
        UPDATE SOUMISSION_OUTIL 
        SET STATUT = 'en_attente', 
            TENTATIVES_EFFECTUEES = TENTATIVES_EFFECTUEES + 1,
            DATE_MISE_A_JOUR = CURRENT_DATE
        WHERE IDOUT = :id
    ");
                $stmt->execute(['id' => $currentToolId]);
            } else {
                $stmt = $this->pdo->prepare("
    INSERT INTO SOUMISSION_OUTIL (IDOUT, IDU, STATUT, TENTATIVES_EFFECTUEES, TENTATIVES_MAX, DATE_MISE_A_JOUR)
    VALUES (:tool_id, :user_id, 'en_attente', 0, 3, CURRENT_DATE)
");
                $stmt->execute([
                    'tool_id' => $currentToolId,
                    'user_id' => $userId,
                ]);

                $idSoumission = (int) $this->pdo->lastInsertId();
                $submissionId = $idSoumission;

                $stmt = $this->pdo->prepare("update OUTILS set ID_SOUMISSION = :submit_id where IDOUT = :id");
                $stmt->execute([
                    'submit_id' => $idSoumission,
                    'id' => $currentToolId
                ]);
            } 



            // --- Catégorie ---
            $catId = $data['categoryId'] ?? null;
            if ($catId === 'new' && !empty($data['newCategory']['name'])) {
                $catName = cleanString($data['newCategory']['name']);
                $catSlug = slugify($catName);
                $stmt = $this->pdo->prepare("SELECT ID_CATEGORIE FROM CATEGORIES WHERE SLUG = :slug LIMIT 1");
                $stmt->execute(['slug' => $catSlug]);
                $foundCatId = $stmt->fetchColumn();
                if (!$foundCatId) {
                    $catDesc = cleanString($data['newCategory']['description'] ?? '');
                    $stmt = $this->pdo->prepare("
                    INSERT INTO CATEGORIES (NOM, SLUG, ICONE, DESCRIPTION)
                    VALUES (:name, :slug, 'Layers', :desc)
                ");
                    $stmt->execute(['name' => $catName, 'slug' => $catSlug, 'desc' => $catDesc ?: null]);
                    $catId = (int) $this->pdo->lastInsertId();
                } else {
                    $catId = (int) $foundCatId;
                }
            }
            if ($catId && $catId > 0) {
                $stmt = $this->pdo->prepare("INSERT IGNORE INTO OUTIL_CATEGORIE (IDOUT, ID_CATEGORIE) VALUES (:tool_id, :cat_id)");
                $stmt->execute(['tool_id' => $currentToolId, 'cat_id' => $catId]);
            }


            // --- Catégories (multiples) ---
            if (!empty($data['categoryIds']) && is_array($data['categoryIds'])) {
                // Supprimer les anciennes liaisons catégories
                $this->pdo->prepare("DELETE FROM OUTIL_CATEGORIE WHERE IDOUT = :tool_id")->execute(['tool_id' => $currentToolId]);

                foreach ($data['categoryIds'] as $catId) {
                    $catId = (int) $catId;
                    if ($catId <= 0)
                        continue;

                    // Vérifier si la catégorie existe (optionnel)
                    $stmt = $this->pdo->prepare("SELECT 1 FROM CATEGORIES WHERE ID_CATEGORIE = :id");
                    $stmt->execute(['id' => $catId]);
                    if (!$stmt->fetch())
                        continue;

                    $stmt = $this->pdo->prepare("INSERT IGNORE INTO OUTIL_CATEGORIE (IDOUT, ID_CATEGORIE) VALUES (:tool_id, :cat_id)");
                    $stmt->execute(['tool_id' => $currentToolId, 'cat_id' => $catId]);
                }
            }

            // --- Plateformes ---
            $platformsData = $data['platforms'] ?? [];
            // Gestion des cas où platforms est une chaîne (par exemple "Array" ou JSON)
            if (is_string($platformsData)) {
                if ($platformsData === 'Array') {
                    $platformsData = [];
                } elseif (str_starts_with($platformsData, '[') || str_starts_with($platformsData, '{')) {
                    $decoded = json_decode($platformsData, true);
                    if (is_array($decoded))
                        $platformsData = $decoded;
                    else
                        $platformsData = [];
                } else {
                    $platformsData = [$platformsData];
                }
            }
            if (!empty($platformsData) && is_array($platformsData)) {
                $this->pdo->prepare("DELETE FROM OUTIL_PLATEFORME WHERE IDOUT = :id")->execute(['id' => $currentToolId]);
                foreach ($platformsData as $platformName) {
                    $platformName = cleanString($platformName);
                    if (!$platformName)
                        continue;
                    $stmt = $this->pdo->prepare("SELECT ID_PLATEFORME FROM PLATEFORME WHERE NOM = :name LIMIT 1");
                    $stmt->execute(['name' => $platformName]);
                    $pltfId = $stmt->fetchColumn();
                    if (!$pltfId) {
                        $stmt = $this->pdo->prepare("INSERT INTO PLATEFORME (NOM) VALUES (:name)");
                        $stmt->execute(['name' => $platformName]);
                        $pltfId = (int) $this->pdo->lastInsertId();
                    }
                    $stmt = $this->pdo->prepare("INSERT IGNORE INTO OUTIL_PLATEFORME (IDOUT, ID_PLATEFORME) VALUES (:tool_id, :pltf_id)");
                    $stmt->execute(['tool_id' => $currentToolId, 'pltf_id' => $pltfId]);
                }
            }



            // --- Modèles IA (OUTIL_MODELE) + création détaillée si nouveau ---
            if (!empty($data['models']) && is_array($data['models'])) {
                $this->pdo->prepare("DELETE FROM OUTIL_MODELE WHERE IDOUT = :id")->execute(['id' => $currentToolId]);
                foreach ($data['models'] as $model) {
                    $linkedModelId = 0;
                    if (!empty($model['isNew'])) {
                        $modelName = cleanString($model['name'] ?? '');
                        if (!$modelName)
                            continue;
                        $modelProvId = $this->findOrCreateFournisseur(
                            cleanString($model['provider'] ?? $data['provider'] ?? '')
                        ) ?? $provId;
                        // Insertion du modèle
                        $stmt = $this->pdo->prepare("
                        INSERT INTO MODELS
                        (NOM, SLUG, TYPE, DESCRIPTION, API_URL, EST_OPEN_SOURCE, DATE_SORTIE, POSSEDE_API, ID_FOURNISSEUR)
                        VALUES (:name, :slug, :type, :desc, :apiUrl, :openSource, :releaseDate, :hasApi, :provId)
                    ");
                        $stmt->execute([
                            'name' => $modelName,
                            'slug' => slugify($modelName),
                            'type' => cleanString($model['type'] ?? 'LLM'),
                            'desc' => cleanString($model['description'] ?? '') ?: null,
                            'apiUrl' => cleanString($model['apiUrl'] ?? '') ?: null,
                            'openSource' => (int) ($model['isOpenSource'] ?? 0),
                            'releaseDate' => !empty($model['releaseDate']) ? $model['releaseDate'] : null,
                            'hasApi' => (int) ($model['hasApi'] ?? 0),
                            'provId' => $modelProvId,
                        ]);
                        $linkedModelId = (int) $this->pdo->lastInsertId();

                        // --- Plans tarifaires du modèle (MODEL_PRICING) ---
                        if (!empty($model['pricingPlans']) && is_array($model['pricingPlans'])) {
                            foreach ($model['pricingPlans'] as $mp) {
                                // On suppose qu'il y a au plus un plan par modèle (sinon on prend le premier ou on itère)
                                $inputPrice = isset($mp['inputTokenPrice']) ? (float) $mp['inputTokenPrice'] : null;
                                $outputPrice = isset($mp['outputTokenPrice']) ? (float) $mp['outputTokenPrice'] : null;
                                $currency = cleanString($mp['currency'] ?? '€');
                                $unit = (int) ($mp['priceUnit'] ?? 1000000); // tokens par défaut
                                if ($inputPrice !== null || $outputPrice !== null) {
                                    $stmtPrice = $this->pdo->prepare("
                                    INSERT INTO MODEL_PRICING (IDMOD, PRIX_ENTREE, PRIX_SORTIE, DEVISE, UNITE, DATE_EFFECTIVE)
                                    VALUES (:id, :input, :output, :currency, :unit, CURDATE())
                                ");
                                    $stmtPrice->execute([
                                        'id' => $linkedModelId,
                                        'input' => $inputPrice,
                                        'output' => $outputPrice,
                                        'currency' => $currency,
                                        'unit' => $unit,
                                    ]);
                                }
                            }
                        }



                        // --- Capacités (FEATURE_MODELE) ---
                        if (!empty($model['capabilities']) && is_array($model['capabilities'])) {
                            $this->pdo->prepare("DELETE FROM FEATURE_MODELE WHERE IDMOD = :id")->execute(['id' => $linkedModelId]);
                            $featStmt = $this->pdo->prepare("INSERT INTO FEATURE_MODELE (IDMOD, ID_FEATURE) VALUES (:model, :feat)");
                            foreach ($model['capabilities'] as $cap) {
                                $capName = cleanString($cap);
                                if (!$capName)
                                    continue;
                                $stmt = $this->pdo->prepare("SELECT ID_FEATURE FROM FEATURES WHERE NOM = :name LIMIT 1");
                                $stmt->execute(['name' => $capName]);
                                $featId = $stmt->fetchColumn();
                                if (!$featId) {
                                    $stmt = $this->pdo->prepare("INSERT INTO FEATURES (NOM) VALUES (:name)");
                                    $stmt->execute(['name' => $capName]);
                                    $featId = (int) $this->pdo->lastInsertId();
                                }
                                $featStmt->execute(['model' => $linkedModelId, 'feat' => $featId]);
                            }
                        }

                        // --- Performances (PERFORMANCE_MODELE) ---
                        if (!empty($model['performances']) && is_array($model['performances'])) {
                            $this->pdo->prepare("DELETE FROM PERFORMANCE_MODELE WHERE IDMOD = :id")->execute(['id' => $linkedModelId]);
                            $perfStmt = $this->pdo->prepare("INSERT INTO PERFORMANCE_MODELE (IDMOD, ID_PERFORMANCE, SCORE) VALUES (:model, :perf, :score)");
                            foreach ($model['performances'] as $perf) {
                                $domain = cleanString($perf['domain'] ?? '');
                                $score = (int) ($perf['score'] ?? 0);
                                if (!$domain)
                                    continue;
                                $stmt = $this->pdo->prepare("SELECT ID_PERFORMANCE FROM PERFORMANCE WHERE DOMAINE = :domain LIMIT 1");
                                $stmt->execute(['domain' => $domain]);
                                $perfId = $stmt->fetchColumn();
                                if (!$perfId) {
                                    $stmt = $this->pdo->prepare("INSERT INTO PERFORMANCE (DOMAINE) VALUES (:domain)");
                                    $stmt->execute(['domain' => $domain]);
                                    $perfId = (int) $this->pdo->lastInsertId();
                                }
                                $perfStmt->execute(['model' => $linkedModelId, 'perf' => $perfId, 'score' => $score]);
                            }
                        }
                    } else {
                        $linkedModelId = (int) ($model['modelId'] ?? $model['id'] ?? 0);
                        if ($linkedModelId <= 0)
                            continue;
                    }

                    if ($linkedModelId > 0) {
                        $stmt = $this->pdo->prepare("INSERT IGNORE INTO OUTIL_MODELE (IDOUT, IDMOD) VALUES (:tool_id, :model_id)");
                        $stmt->execute(['tool_id' => $currentToolId, 'model_id' => $linkedModelId]);
                    }
                }
            }

            // --- Fonctionnalités propres (OUTIL_FEATURE) ---
            if (!empty($data['features']) && is_array($data['features'])) {
                $this->pdo->prepare("DELETE FROM OUTIL_FEATURE WHERE IDOUT = :id")->execute(['id' => $currentToolId]);
                foreach ($data['features'] as $feat) {
                    $featName = cleanString($feat['name'] ?? '');
                    if (!$featName)
                        continue;
                    $stmt = $this->pdo->prepare("SELECT ID_FEATURE FROM FEATURES WHERE NOM = :name LIMIT 1");
                    $stmt->execute(['name' => $featName]);
                    $featId = $stmt->fetchColumn();
                    if (!$featId) {
                        $stmt = $this->pdo->prepare("INSERT INTO FEATURES (NOM) VALUES (:name)");
                        $stmt->execute(['name' => $featName]);
                        $featId = (int) $this->pdo->lastInsertId();
                    } else {
                        $featId = (int) $featId;
                    }
                    $stmt = $this->pdo->prepare("INSERT IGNORE INTO OUTIL_FEATURE (IDOUT, ID_FEATURE) VALUES (:tool_id, :feat_id)");
                    $stmt->execute(['tool_id' => $currentToolId, 'feat_id' => $featId]);
                }
            }

            // --- Performances de l'outil (OUTIL_PERFORMANCE) ---
            if (!empty($data['performances']) && is_array($data['performances'])) {
                $this->pdo->prepare("DELETE FROM OUTIL_PERFORMANCE WHERE IDOUT = :id")->execute(['id' => $currentToolId]);
                foreach ($data['performances'] as $perf) {
                    $domain = cleanString($perf['domain'] ?? '');
                    $score = max(0, min(100, (int) ($perf['score'] ?? 0)));
                    if (!$domain)
                        continue;
                    $stmt = $this->pdo->prepare("SELECT ID_PERFORMANCE FROM PERFORMANCE WHERE DOMAINE = :domain LIMIT 1");
                    $stmt->execute(['domain' => $domain]);
                    $perfId = $stmt->fetchColumn();
                    if (!$perfId) {
                        $stmt = $this->pdo->prepare("INSERT INTO PERFORMANCE (DOMAINE) VALUES (:domain)");
                        $stmt->execute(['domain' => $domain]);
                        $perfId = (int) $this->pdo->lastInsertId();
                    } else {
                        $perfId = (int) $perfId;
                    }
                    $stmt = $this->pdo->prepare("INSERT IGNORE INTO OUTIL_PERFORMANCE (IDOUT, ID_PERFORMANCE, SCORE) VALUES (:tool_id, :perf_id, :score)");
                    $stmt->execute(['tool_id' => $currentToolId, 'perf_id' => $perfId, 'score' => $score]);
                }
            }

            // --- Plans tarifaires de l'outil (PRICING_PLANS, FEATURE_PRICING, PRICING_MODELE, PRICING_MODELE_LIMITE) ---
            if (!empty($data['pricingPlans']) && is_array($data['pricingPlans'])) {
                // Supprimer les anciens plans de l'outil
                $stmt = $this->pdo->prepare("SELECT ID_PRICING_PLAN FROM PRICING_PLANS WHERE IDOUT = :tool_id");
                $stmt->execute(['tool_id' => $currentToolId]);
                $oldPlanIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
                foreach ($oldPlanIds as $pid) {
                    $this->pdo->prepare("DELETE FROM FEATURE_PRICING WHERE ID_PRICING_PLAN = :pid")->execute(['pid' => $pid]);
                    $this->pdo->prepare("DELETE FROM PRICING_MODELE_LIMITE WHERE ID_PRICING_MODELE IN (SELECT ID_PRICING_MODELE FROM PRICING_MODELE WHERE ID_PRICING_PLAN = :pid)")->execute(['pid' => $pid]);
                    $this->pdo->prepare("DELETE FROM PRICING_MODELE WHERE ID_PRICING_PLAN = :pid")->execute(['pid' => $pid]);
                    $this->pdo->prepare("DELETE FROM PRICING_PLANS WHERE ID_PRICING_PLAN = :pid")->execute(['pid' => $pid]);
                }

                foreach ($data['pricingPlans'] as $plan) {
                    // Insertion du plan
                    $stmt = $this->pdo->prepare("
                    INSERT INTO PRICING_PLANS (NOM, PRIX, DEVISE, PERIODE, DESCRIPTION, TYPE, IDOUT)
                    VALUES (:name, :price, :currency, :period, :desc, :type, :tool_id)
                ");
                    $stmt->execute([
                        'name' => cleanString($plan['name']),
                        'price' => (float) ($plan['price'] ?? 0),
                        'currency' => cleanString($plan['currency'] ?? '€'),
                        'period' => cleanString($plan['period'] ?? 'month'),
                        'desc' => cleanString($plan['description'] ?? ''),
                        'type' => cleanString($plan['type'] ?? 'paid'),
                        'tool_id' => $currentToolId,
                    ]);
                    $planId = $this->pdo->lastInsertId();

                    // Fonctionnalités globales du plan (FEATURE_PRICING)
                    if (!empty($plan['features']) && is_array($plan['features'])) {
                        foreach ($plan['features'] as $feature) {
                            $featureName = cleanString($feature['name'] ?? '');
                            if (!$featureName)
                                continue;
                            $stmt = $this->pdo->prepare("SELECT ID_FEATURE FROM FEATURES WHERE NOM = :name LIMIT 1");
                            $stmt->execute(['name' => $featureName]);
                            $featId = $stmt->fetchColumn();
                            if (!$featId) {
                                $stmt = $this->pdo->prepare("INSERT INTO FEATURES (NOM) VALUES (:name)");
                                $stmt->execute(['name' => $featureName]);
                                $featId = $this->pdo->lastInsertId();
                            }
                            $stmt = $this->pdo->prepare("INSERT IGNORE INTO FEATURE_PRICING (ID_FEATURE, ID_PRICING_PLAN) VALUES (:feat_id, :plan_id)");
                            $stmt->execute(['feat_id' => $featId, 'plan_id' => $planId]);
                        }
                    }

                    // Modèles disponibles dans ce plan (PRICING_MODELE + limites)
                    if (!empty($plan['availableModels']) && is_array($plan['availableModels'])) {
                        foreach ($plan['availableModels'] as $modelAccess) {
                            $modelId = (int) ($modelAccess['modelId'] ?? 0);
                            if (!$modelId)
                                continue;
                            // Vérifier que le modèle est bien lié à l'outil
                            $stmt = $this->pdo->prepare("SELECT 1 FROM OUTIL_MODELE WHERE IDOUT = :tool_id AND IDMOD = :model_id");
                            $stmt->execute(['tool_id' => $currentToolId, 'model_id' => $modelId]);
                            if (!$stmt->fetch())
                                continue;

                            $stmt = $this->pdo->prepare("INSERT INTO PRICING_MODELE (ID_PRICING_PLAN, IDMOD) VALUES (:plan_id, :model_id)");
                            $stmt->execute(['plan_id' => $planId, 'model_id' => $modelId]);
                            $pricingModeleId = $this->pdo->lastInsertId();

                            // Limites pour ce modèle dans ce plan
                            if (!empty($modelAccess['limits']) && is_array($modelAccess['limits'])) {
                                $limitStmt = $this->pdo->prepare("
                                INSERT INTO PRICING_MODELE_LIMITE (ID_PRICING_MODELE, TYPE_LIMITE, VALEUR, PERIODE)
                                VALUES (:pm_id, :type, :value, :period)
                            ");
                                foreach ($modelAccess['limits'] as $limit) {
                                    $type = cleanString($limit['type'] ?? '');
                                    $value = (int) ($limit['value'] ?? 0);
                                    $period = cleanString($limit['period'] ?? 'month');
                                    if ($type && $value) {
                                        $limitStmt->execute([
                                            'pm_id' => $pricingModeleId,
                                            'type' => $type,
                                            'value' => $value,
                                            'period' => $period,
                                        ]);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            

            $this->pdo->commit();
            return [
                'id' => (string) ($submissionId > 0 ? $submissionId : $currentToolId),
                'status' => $toolStatus === 'actif' ? 'approved' : 'pending',
                'toolId' => (string) $currentToolId,
            ];
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Trouve ou crée un fournisseur
     */
    private function findOrCreateFournisseur(string $name): ?int
    {
        if (!$name) {
            $row = $this->pdo->query("SELECT ID_FOURNISSEUR FROM FOURNISSEUR LIMIT 1")->fetchColumn();
            return $row ? (int) $row : null;
        }
        $stmt = $this->pdo->prepare("SELECT ID_FOURNISSEUR FROM FOURNISSEUR WHERE NOM = :name LIMIT 1");
        $stmt->execute(['name' => $name]);
        $id = $stmt->fetchColumn();
        if ($id)
            return (int) $id;
        try {
            $stmt = $this->pdo->prepare("INSERT INTO FOURNISSEUR (NOM, SLUG, DATE_MISE_A_JOUR) VALUES (:name, :slug, CURRENT_DATE)");
            $stmt->execute(['name' => $name, 'slug' => slugify($name)]);
            return (int) $this->pdo->lastInsertId();
        } catch (Throwable $e) {
            $row = $this->pdo->query("SELECT ID_FOURNISSEUR FROM FOURNISSEUR LIMIT 1")->fetchColumn();
            return $row ? (int) $row : null;
        }
    }

    /**
     * Formate un utilisateur pour les réponses API
     */
    private function formatUser(array $user)
    {
        return [
            'id' => (string) $user['IDU'],
            'nom' => $user['NOM'],
            'prenom' => $user['PRENOM'],
            'name' => trim($user['PRENOM'] . ' ' . $user['NOM']),
            'email' => $user['EMAIL'],
            'avatar' => $user['AVATAR_URL'],
            'role' => $user['ROLE'],
            'status' => $user['STATUT'] === 'actif' ? 'active' : $user['STATUT'],
            'createdAt' => $user['DATE_INSCRIPTION'],
            'lastLogin' => $user['DERNIERE_CONNEXION'],
            'favorites' => $this->favorites($user['IDU']),
            'collections' => $this->collections($user['IDU']),
        ];
    }

    public function comments($userId)
    {
        $stmt = $this->pdo->prepare("
        SELECT 
            c.ID_COMMENTAIRE AS id,
            c.CONTENU AS content,
            c.CONTENU AS comment,
            c.DATE_MISE_A_JOUR AS createdAt,
            c.IDOUT AS toolId,
            o.NOM AS toolName,
            o.SLUG AS toolSlug
        FROM COMMENTAIRES c
        JOIN OUTILS o ON o.IDOUT = c.IDOUT
        WHERE c.IDU = :id AND c.STATUT = 'actif'
        ORDER BY c.DATE_MISE_A_JOUR DESC, c.ID_COMMENTAIRE DESC
    ");
        $stmt->execute(['id' => $userId]);

        return array_map(function ($row) {
            $row['id'] = (string) $row['id'];
            $row['toolId'] = (string) $row['toolId'];
            $row['userName'] = 'Vous';
            $row['rating'] = 5;
            return $row;
        }, $stmt->fetchAll());
    }
}
