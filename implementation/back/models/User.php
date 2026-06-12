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

            if ($existingTool) {
                if ($existingTool['statut'] === 'actif' && $toolStatus === 'en_attente') {
                    throw new Exception("Cet outil ('$name') est déjà présent dans notre catalogue.");
                }
                $toolId = $existingTool['idOut'];
                
                // Update basic info if it's still pending
                if ($existingTool['statut'] === 'en_attente') {
                    $stmt = $this->pdo->prepare("
                        UPDATE outils SET 
                            pricing_type = :pricing_type, 
                            description_courte = :short_desc, 
                            site_url = :site_url,
                            type_tarif = :type_tarif
                        WHERE idOut = :id
                    ");
                    $stmt->execute([
                        'pricing_type' => $data['pricingType'] ?? 'freemium',
                        'short_desc'   => $data['shortDescription'] ?? '',
                        'site_url'     => $data['url'] ?? '',
                        'type_tarif'   => $data['pricingType'] ?? 'freemium',
                        'id'           => $toolId
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
                $toolId = $this->pdo->lastInsertId();
            }

            // 2. Category: create new if requested, then link
            $catId = $data['categoryId'] ?? null;
            if ($catId === 'new' && !empty($data['newCategory']['name'])) {
                $catName = cleanString($data['newCategory']['name']);
                $catSlug = slugify($catName);
                
                // Check if category already exists by slug
                $stmt = $this->pdo->prepare("SELECT id_Cat FROM categories WHERE slug = :slug LIMIT 1");
                $stmt->execute(['slug' => $catSlug]);
                $catId = $stmt->fetchColumn();
                
                if (!$catId) {
                    $catDesc = cleanString($data['newCategory']['description'] ?? '');
                    $stmt = $this->pdo->prepare(
                        "INSERT INTO categories (nom_Cat, slug, icone, description) VALUES (:name, :slug, 'Layers', :desc)"
                    );
                    $stmt->execute(['name' => $catName, 'slug' => $catSlug, 'desc' => $catDesc ?: null]);
                    $catId = $this->pdo->lastInsertId();
                }
            }
            if ($catId && $catId !== 'new') {
                $stmt = $this->pdo->prepare("INSERT IGNORE INTO outil_categorie (idOut, id_Cat) VALUES (:tool_id, :cat_id)");
                $stmt->execute(['tool_id' => $toolId, 'cat_id' => $catId]);
            }

            // 3. Tags — frontend sends [{name: 'tag'}] objects or plain strings
            if (!empty($data['tags']) && is_array($data['tags'])) {
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
                        $tagId = $this->pdo->lastInsertId();
                    }
                    $stmt = $this->pdo->prepare("INSERT IGNORE INTO outil_tag (idOut, id_tag) VALUES (:tool_id, :tag_id)");
                    $stmt->execute(['tool_id' => $toolId, 'tag_id' => $tagId]);
                }
            }

            // 4. Platforms
            if (!empty($data['platforms']) && is_array($data['platforms'])) {
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
                        $pltfId = $this->pdo->lastInsertId();
                    }
                    $stmt = $this->pdo->prepare("INSERT IGNORE INTO outil_plateforme (idOut, id) VALUES (:tool_id, :pltf_id)");
                    $stmt->execute(['tool_id' => $toolId, 'pltf_id' => $pltfId]);
                }
            }

            // 5. AI Models: link existing OR create new (isNew: true)
            if (!empty($data['models']) && is_array($data['models'])) {
                foreach ($data['models'] as $model) {
                    if (!empty($model['isNew'])) {
                        $modelName = cleanString($model['name'] ?? '');
                        if (!$modelName) continue;
                        $modelProvId = $this->findOrCreateFournisseur(
                            cleanString($model['provider'] ?? $data['provider'] ?? '')
                        ) ?? $provId;
                        if (!$modelProvId) continue;
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
                        $linkedModelId = $this->pdo->lastInsertId();
                    } else {
                        $linkedModelId = $model['modelId'] ?? $model['id'] ?? null;
                        if (!$linkedModelId || str_starts_with((string) $linkedModelId, 'new-')) continue;
                    }
                    $stmt = $this->pdo->prepare("INSERT IGNORE INTO outil_model (idOut, idMod) VALUES (:tool_id, :model_id)");
                    $stmt->execute(['tool_id' => $toolId, 'model_id' => $linkedModelId]);
                }
            }

            // 6. Features
            if (!empty($data['features']) && is_array($data['features'])) {
                foreach ($data['features'] as $feat) {
                    $featName = cleanString($feat['name'] ?? '');
                    if (!$featName) continue;
                    $stmt = $this->pdo->prepare("SELECT id_features FROM features WHERE name = :name LIMIT 1");
                    $stmt->execute(['name' => $featName]);
                    $featId = $stmt->fetchColumn();
                    if (!$featId) {
                        $stmt = $this->pdo->prepare("INSERT INTO features (name, description) VALUES (:name, :desc)");
                        $stmt->execute(['name' => $featName, 'desc' => cleanString($feat['description'] ?? '') ?: null]);
                        $featId = $this->pdo->lastInsertId();
                    }
                    $stmt = $this->pdo->prepare("INSERT IGNORE INTO outil_feature (idOut, id_features) VALUES (:tool_id, :feat_id)");
                    $stmt->execute(['tool_id' => $toolId, 'feat_id' => $featId]);
                }
            }

            // 7. Performances — stored as individual performance records linked to the tool
            if (!empty($data['performances']) && is_array($data['performances'])) {
                foreach ($data['performances'] as $perf) {
                    $domain = cleanString($perf['domain'] ?? '');
                    $score  = max(0, min(100, (int)($perf['score'] ?? 0)));
                    if (!$domain) continue;
                    $stmt = $this->pdo->prepare("INSERT INTO performance (domaine, score) VALUES (:domain, :score)");
                    $stmt->execute(['domain' => $domain, 'score' => $score]);
                    $perfId = $this->pdo->lastInsertId();
                    $stmt = $this->pdo->prepare("INSERT INTO outil_performance (idOut, id_performance) VALUES (:tool_id, :perf_id)");
                    $stmt->execute(['tool_id' => $toolId, 'perf_id' => $perfId]);
                }
            }

            // 8. Submission record (only for user proposals, not admin direct creation)
            $submissionId = null;
            if ($toolStatus === 'en_attente') {
                $stmt = $this->pdo->prepare("
                    INSERT INTO soumission_outil
                    (statut, note_admin, nombre_soum, limite_soum, created_at, idU, idOut)
                    VALUES ('en_attente', :note_admin, 1, 3, CURRENT_DATE, :user_id, :tool_id)
                ");
                $stmt->execute([
                    'note_admin' => $data['note_admin'] ?? $data['note'] ?? null,
                    'user_id'    => $userId,
                    'tool_id'    => $toolId,
                ]);
                $submissionId = $this->pdo->lastInsertId();
            }

            $this->pdo->commit();
            return [
                'id'     => (string) ($submissionId ?? $toolId),
                'status' => $toolStatus === 'actif' ? 'approved' : 'pending',
                'toolId' => (string) $toolId,
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
}
