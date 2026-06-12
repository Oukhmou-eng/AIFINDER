<?php

class Catalog
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = require __DIR__ . '/../config/database.php';
    }

    public function tools(array $filters = [])
    {
        $where = [];
        $params = [];

        if (!empty($filters['q'])) {
            $where[] = "(o.nom LIKE :q1 OR o.description_courte LIKE :q2 OR o.description_longue LIKE :q3)";
            $params['q1'] = '%' . $filters['q'] . '%';
            $params['q2'] = '%' . $filters['q'] . '%';
            $params['q3'] = '%' . $filters['q'] . '%';
        }

        if (!empty($filters['category'])) {
            $where[] = "EXISTS (
                SELECT 1 FROM outil_categorie oc
                JOIN categories c ON c.id_Cat = oc.id_Cat
                WHERE oc.idOut = o.idOut AND (c.id_Cat = :category_id OR c.slug = :category_slug)
            )";
            $params['category_id'] = ctype_digit((string) $filters['category']) ? $filters['category'] : 0;
            $params['category_slug'] = $filters['category'];
        }

        if (!empty($filters['model'])) {
            $where[] = "EXISTS (
                SELECT 1 FROM outil_model om
                JOIN models m ON m.idMod = om.idMod
                WHERE om.idOut = o.idOut AND (m.idMod = :model_id OR m.slug = :model_slug)
            )";
            $params['model_id'] = ctype_digit((string) $filters['model']) ? $filters['model'] : 0;
            $params['model_slug'] = $filters['model'];
        }

        if (!empty($filters['pricing'])) {
            $where[] = "o.pricing_type = :pricing";
            $params['pricing'] = $filters['pricing'];
        }

        if (!empty($filters['ids'])) {
            $ids = is_array($filters['ids']) ? $filters['ids'] : explode(',', (string)$filters['ids']);
            $ids = array_filter(array_map('trim', $ids), 'ctype_digit');
            if (!empty($ids)) {
                $placeholders = [];
                foreach ($ids as $i => $id) {
                    $placeholder = ":id_filter_$i";
                    $placeholders[] = $placeholder;
                    $params[$placeholder] = $id;
                }
                $where[] = "o.idOut IN (" . implode(',', $placeholders) . ")";
            } else {
                // If ids is provided but empty/invalid, return nothing
                $where[] = "1=0";
            }
        }

        $sql = $this->toolBaseSql();
        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }

        $sql .= ' GROUP BY o.idOut';
        $sql .= $this->sortSql($filters['sortBy'] ?? null);

        if (!empty($filters['limit']) && (int) $filters['limit'] > 0) {
            $sql .= ' LIMIT ' . min((int) $filters['limit'], 100);
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return array_map([$this, 'formatTool'], $stmt->fetchAll());
    }

    public function tool($idOrSlug)
    {
        $sql = $this->toolBaseSql() . " WHERE o.idOut = :id OR o.slug = :slug GROUP BY o.idOut LIMIT 1";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'id' => ctype_digit((string) $idOrSlug) ? $idOrSlug : 0,
            'slug' => $idOrSlug,
        ]);
        $tool = $stmt->fetch();

        return $tool ? $this->formatTool($tool) : null;
    }

    public function model($idOrSlug)
    {
        $sql = "
            SELECT m.idMod, m.nom, m.slug, m.type, m.description, m.licence,
                   m.est_open_source, m.release_date, m.multimodal, m.a_api, m.id_fourn,
                   f.nom AS provider,
                   (SELECT GROUP_CONCAT(feat.name ORDER BY feat.name SEPARATOR '||')
                    FROM model_feature mf
                    JOIN features feat ON feat.id_features = mf.id_features
                    WHERE mf.idMod = m.idMod) AS features,
                   (SELECT GROUP_CONCAT(CONCAT(p.domaine, ':', p.score) ORDER BY p.domaine SEPARATOR '||')
                    FROM model_performance mp
                    JOIN performance p ON p.id_performance = mp.id_performance
                    WHERE mp.idMod = m.idMod) AS performances
            FROM models m
            LEFT JOIN fournisseur f ON f.id_fourn = m.id_fourn
            WHERE m.idMod = :id OR m.slug = :slug
            LIMIT 1
        ";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'id' => ctype_digit((string) $idOrSlug) ? $idOrSlug : 0,
            'slug' => $idOrSlug,
        ]);
        $model = $stmt->fetch();

        return $model ? $this->formatModel($model) : null;
    }

    public function categories()
    {
        $stmt = $this->pdo->query("
            SELECT c.id_Cat, c.nom_Cat, c.slug, c.icone, c.description,
                   COUNT(oc.idOut) AS tool_count
            FROM categories c
            LEFT JOIN outil_categorie oc ON oc.id_Cat = c.id_Cat
            GROUP BY c.id_Cat
            ORDER BY c.nom_Cat
        ");

        return array_map(function ($row) {
            return [
                'id' => (string) $row['id_Cat'],
                'name' => $row['nom_Cat'],
                'slug' => $row['slug'],
                'icon' => $row['icone'] ?: 'Zap',
                'description' => $row['description'],
                'toolCount' => (int) $row['tool_count'],
            ];
        }, $stmt->fetchAll());
    }

    public function models()
    {
        $stmt = $this->pdo->query("
            SELECT m.idMod, m.nom, m.slug, m.type, m.description, m.licence,
                   m.est_open_source, m.release_date, m.multimodal, m.a_api, m.id_fourn,
                   f.nom AS provider,
                   GROUP_CONCAT(DISTINCT feat.name ORDER BY feat.name SEPARATOR '||') AS features,
                   GROUP_CONCAT(DISTINCT CONCAT(p.domaine, ':', p.score) ORDER BY p.domaine SEPARATOR '||') AS performances
            FROM models m
            JOIN fournisseur f ON f.id_fourn = m.id_fourn
            LEFT JOIN model_feature mf ON mf.idMod = m.idMod
            LEFT JOIN features feat ON feat.id_features = mf.id_features
            LEFT JOIN model_performance mp ON mp.idMod = m.idMod
            LEFT JOIN performance p ON p.id_performance = mp.id_performance
            GROUP BY m.idMod
            ORDER BY m.nom
        ");

        return array_map([$this, 'formatModel'], $stmt->fetchAll());
    }

    public function reviews($toolId)
    {
        $stmt = $this->pdo->prepare("
            SELECT a.id_avis, a.note, a.titre, a.contenu, a.created_at,
                   u.idU, u.nom, u.prenom, u.avatar_url
            FROM avis a
            JOIN utilisateur u ON u.idU = a.idU
            WHERE a.idOut = :tool_id
            ORDER BY a.created_at DESC, a.id_avis DESC
        ");
        $stmt->execute(['tool_id' => $toolId]);

        return array_map(function ($row) use ($toolId) {
            return [
                'id' => (string) $row['id_avis'],
                'toolId' => (string) $toolId,
                'userId' => (string) $row['idU'],
                'userName' => trim($row['prenom'] . ' ' . $row['nom']),
                'userAvatar' => $row['avatar_url'],
                'rating' => (int) $row['note'],
                'title' => $row['titre'],
                'comment' => $row['contenu'],
                'createdAt' => $row['created_at'],
                'replies' => [],
            ];
        }, $stmt->fetchAll());
    }

    public function userReviews($userId)
    {
        $stmt = $this->pdo->prepare("
            SELECT a.id_avis, a.note, a.titre, a.contenu, a.created_at, a.idOut,
                   o.nom AS tool_name, o.slug AS tool_slug
            FROM avis a
            JOIN outils o ON o.idOut = a.idOut
            WHERE a.idU = :user_id
            ORDER BY a.created_at DESC, a.id_avis DESC
        ");
        $stmt->execute(['user_id' => $userId]);

        return array_map(function ($row) {
            return [
                'id' => (string) $row['id_avis'],
                'toolId' => (string) $row['idOut'],
                'toolName' => $row['tool_name'],
                'toolSlug' => $row['tool_slug'],
                'rating' => (int) $row['note'],
                'title' => $row['titre'],
                'comment' => $row['contenu'],
                'createdAt' => $row['created_at'],
                'replies' => [],
            ];
        }, $stmt->fetchAll());
    }

    public function createReview($userId, array $data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO avis (note, titre, contenu, created_at, idU, idOut)
            VALUES (:note, :titre, :contenu, CURRENT_DATE, :user_id, :tool_id)
            ON DUPLICATE KEY UPDATE
                note = VALUES(note),
                titre = VALUES(titre),
                contenu = VALUES(contenu),
                created_at = CURRENT_DATE
        ");
        $stmt->execute([
            'note' => $data['note'] ?? $data['rating'],
            'titre' => $data['titre'] ?? $data['title'] ?? null,
            'contenu' => $data['contenu'] ?? $data['comment'],
            'user_id' => $userId,
            'tool_id' => $data['idOut'] ?? $data['toolId'],
        ]);

        return $this->reviews($data['idOut'] ?? $data['toolId']);
    }

    public function updateReview($userId, $reviewId, array $data)
    {
        $stmt = $this->pdo->prepare("
            UPDATE avis 
            SET note = :note, titre = :titre, contenu = :contenu 
            WHERE id_avis = :id AND idU = :user_id
        ");
        $stmt->execute([
            'note' => $data['note'] ?? $data['rating'],
            'titre' => $data['titre'] ?? $data['title'] ?? null,
            'contenu' => $data['contenu'] ?? $data['comment'],
            'id' => $reviewId,
            'user_id' => $userId,
        ]);

        return $this->userReviews($userId);
    }

    public function deleteReview($userId, $reviewId)
    {
        $stmt = $this->pdo->prepare("DELETE FROM avis WHERE id_avis = :id AND idU = :user_id");
        $stmt->execute(['id' => $reviewId, 'user_id' => $userId]);

        return $this->userReviews($userId);
    }

    public function report(array $data, $userId = null)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO signalements
            (motif, statut, date, description, created_at, idU, idOut, id_com)
            VALUES (:motif, 'en_attente', CURRENT_DATE, :description, CURRENT_DATE, :user_id, :tool_id, :comment_id)
        ");
        $stmt->execute([
            'motif' => $data['motif'] ?? $data['reason'],
            'description' => $data['description'] ?? $data['details'] ?? null,
            'user_id' => $userId ?? $data['idU'] ?? 1,
            'tool_id' => $data['idOut'] ?? $data['toolId'],
            'comment_id' => $data['id_com'] ?? $data['commentId'] ?? null,
        ]);

        return ['id' => (string) $this->pdo->lastInsertId(), 'status' => 'pending'];
    }

    public function stats()
    {
        return [
            'totalTools' => (int) $this->pdo->query("SELECT COUNT(*) FROM outils")->fetchColumn(),
            'approvedTools' => (int) $this->pdo->query("SELECT COUNT(*) FROM outils WHERE statut = 'actif'")->fetchColumn(),
            'pendingTools' => (int) $this->pdo->query("SELECT COUNT(*) FROM soumission_outil WHERE statut = 'en_attente'")->fetchColumn(),
            'totalUsers' => (int) $this->pdo->query("SELECT COUNT(*) FROM utilisateur")->fetchColumn(),
            'totalCategories' => (int) $this->pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn(),
            'pendingReports' => (int) $this->pdo->query("SELECT COUNT(*) FROM signalements WHERE statut = 'en_attente'")->fetchColumn(),
        ];
    }

    public function searchTools(array $params): array
    {
        $query = $params['q'] ?? '';
        $category = $params['category'] ?? null;
        $pricing = isset($params['pricing']) ? explode(',', $params['pricing']) : [];
        $platforms = isset($params['platforms']) ? explode(',', $params['platforms']) : [];
        $functions = isset($params['functions']) ? explode(',', $params['functions']) : [];
        $models = isset($params['models']) ? explode(',', $params['models']) : [];
        $sortBy = $params['sortBy'] ?? 'trending';

        $sql = "
            SELECT o.*,
                   f.nom AS provider,
                   AVG(a.note) AS rating,
                   COUNT(DISTINCT a.id_avis) AS review_count,
                   COUNT(DISTINCT fav.idFav) AS favorite_count,
                   GROUP_CONCAT(DISTINCT c.id_Cat ORDER BY c.id_Cat SEPARATOR ',') AS category_ids,
                   GROUP_CONCAT(DISTINCT CONCAT(c.id_Cat, ':', c.slug, ':', c.nom_Cat) ORDER BY c.id_Cat SEPARATOR '||') AS category_pairs,
                   GROUP_CONCAT(DISTINCT p.slug ORDER BY p.slug SEPARATOR ',') AS platforms,
                   GROUP_CONCAT(DISTINCT feat.name ORDER BY feat.name SEPARATOR '||') AS features,
                   GROUP_CONCAT(DISTINCT CONCAT(m.idMod, ':', m.nom) ORDER BY m.idMod SEPARATOR '||') AS model_pairs,
                   GROUP_CONCAT(DISTINCT CONCAT(perf.domaine, ':', perf.score) ORDER BY perf.domaine SEPARATOR '||') AS performance_pairs,
                   CASE
                       WHEN o.nom = :p_exact THEN 1
                       WHEN o.nom LIKE :p_like THEN 2
                       WHEN MATCH(o.recherche_texte) AGAINST(:p_match IN NATURAL LANGUAGE MODE) THEN 3
                       ELSE 4
                   END AS priority
            FROM outils o
            LEFT JOIN fournisseur f ON f.id_fourn = o.id_fourn
            LEFT JOIN avis a ON a.idOut = o.idOut
            LEFT JOIN favori fav ON fav.idOut = o.idOut
            LEFT JOIN outil_categorie oc ON oc.idOut = o.idOut
            LEFT JOIN categories c ON c.id_Cat = oc.id_Cat
            LEFT JOIN outil_plateforme op ON op.idOut = o.idOut
            LEFT JOIN plateforme p ON p.id = op.id
            LEFT JOIN outil_feature ofe ON ofe.idOut = o.idOut
            LEFT JOIN features feat ON feat.id_features = ofe.id_features
            LEFT JOIN outil_model om ON om.idOut = o.idOut
            LEFT JOIN models m ON m.idMod = om.idMod
            LEFT JOIN outil_performance operf ON operf.idOut = o.idOut
            LEFT JOIN performance perf ON perf.id_performance = operf.id_performance
            WHERE 1=1
        ";

        $bindings = [];

        if (!empty($query)) {
            $sql .= " AND (o.nom = :w_exact 
                           OR o.nom LIKE :w_like 
                           OR MATCH(o.recherche_texte) AGAINST(:w_match IN NATURAL LANGUAGE MODE))";
            $bindings[':p_exact'] = $query;
            $bindings[':p_like'] = "%$query%";
            $bindings[':p_match'] = $query;
            $bindings[':w_exact'] = $query;
            $bindings[':w_like'] = "%$query%";
            $bindings[':w_match'] = $query;
        } else {
            $sql .= " AND (1=1)";
            $bindings[':p_exact'] = '';
            $bindings[':p_like'] = '';
            $bindings[':p_match'] = '';
        }

        if ($category) {
            $sql .= " AND EXISTS (
                SELECT 1 FROM outil_categorie oc2
                JOIN categories c2 ON c2.id_Cat = oc2.id_Cat
                WHERE oc2.idOut = o.idOut AND (c2.slug = :category_slug OR c2.id_Cat = :category_id)
            )";
            $bindings[':category_slug'] = $category;
            $bindings[':category_id'] = is_numeric($category) ? (int)$category : 0;
        }

        if (!empty($pricing)) {
            $placeholders = [];
            foreach ($pricing as $i => $p) {
                $placeholder = ":pricing_$i";
                $placeholders[] = $placeholder;
                $bindings[$placeholder] = $p;
            }
            $sql .= " AND o.pricing_type IN (" . implode(',', $placeholders) . ")";
        }

        if (!empty($platforms)) {
            $sql .= " AND EXISTS (
                SELECT 1 FROM outil_plateforme op2
                JOIN plateforme p2 ON p2.id = op2.id
                WHERE op2.idOut = o.idOut AND p2.nom IN (";
            $placeholders = [];
            foreach ($platforms as $i => $plat) {
                $placeholder = ":plat_$i";
                $placeholders[] = $placeholder;
                $bindings[$placeholder] = $plat;
            }
            $sql .= implode(',', $placeholders) . "))";
        }

        if (!empty($functions)) {
            $sql .= " AND EXISTS (
                SELECT 1 FROM outil_feature ofe2
                JOIN features f2 ON f2.id_features = ofe2.id_features
                WHERE ofe2.idOut = o.idOut AND f2.name IN (";
            $placeholders = [];
            foreach ($functions as $i => $func) {
                $placeholder = ":func_$i";
                $placeholders[] = $placeholder;
                $bindings[$placeholder] = $func;
            }
            $sql .= implode(',', $placeholders) . "))";
        }

        if (!empty($models)) {
            $sql .= " AND EXISTS (
                SELECT 1 FROM outil_model om2
                WHERE om2.idOut = o.idOut AND om2.idMod IN (";
            $placeholders = [];
            foreach ($models as $i => $mod) {
                $placeholder = ":mod_$i";
                $placeholders[] = $placeholder;
                $bindings[$placeholder] = (int)$mod;
            }
            $sql .= implode(',', $placeholders) . "))";
        }

        $sql .= " GROUP BY o.idOut ORDER BY priority ASC, ";

        switch ($sortBy) {
            case 'rating':
                $sql .= "rating DESC, review_count DESC";
                break;
            case 'usage':
                $sql .= "favorite_count DESC, review_count DESC";
                break;
            case 'recent':
                $sql .= "o.created_at DESC, o.idOut DESC";
                break;
            default:
                $sql .= "priority ASC, favorite_count DESC, review_count DESC, o.created_at DESC";
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($bindings);
        $rows = $stmt->fetchAll();

        $tools = array_map([$this, 'formatTool'], $rows);

        return [
            'total' => count($tools),
            'tools' => $tools,
        ];
    }

    private function toolBaseSql()
    {
        return "
            SELECT o.*,
                   f.nom AS provider,
                   AVG(a.note) AS rating,
                   COUNT(DISTINCT a.id_avis) AS review_count,
                   COUNT(DISTINCT fav.idFav) AS favorite_count,
                   GROUP_CONCAT(DISTINCT c.id_Cat ORDER BY c.id_Cat SEPARATOR ',') AS category_ids,
                   GROUP_CONCAT(DISTINCT CONCAT(c.id_Cat, ':', c.slug, ':', c.nom_Cat) ORDER BY c.id_Cat SEPARATOR '||') AS category_pairs,
                   GROUP_CONCAT(DISTINCT p.slug ORDER BY p.slug SEPARATOR ',') AS platforms,
                   GROUP_CONCAT(DISTINCT feat.name ORDER BY feat.name SEPARATOR '||') AS features,
                   GROUP_CONCAT(DISTINCT CONCAT(m.idMod, ':', m.nom) ORDER BY m.idMod SEPARATOR '||') AS model_pairs,
                   GROUP_CONCAT(DISTINCT CONCAT(perf.domaine, ':', perf.score) ORDER BY perf.domaine SEPARATOR '||') AS performance_pairs
            FROM outils o
            LEFT JOIN fournisseur f ON f.id_fourn = o.id_fourn
            LEFT JOIN avis a ON a.idOut = o.idOut
            LEFT JOIN favori fav ON fav.idOut = o.idOut
            LEFT JOIN outil_categorie oc ON oc.idOut = o.idOut
            LEFT JOIN categories c ON c.id_Cat = oc.id_Cat
            LEFT JOIN outil_plateforme op ON op.idOut = o.idOut
            LEFT JOIN plateforme p ON p.id = op.id
            LEFT JOIN outil_feature ofe ON ofe.idOut = o.idOut
            LEFT JOIN features feat ON feat.id_features = ofe.id_features
            LEFT JOIN outil_model om ON om.idOut = o.idOut
            LEFT JOIN models m ON m.idMod = om.idMod
            LEFT JOIN outil_performance operf ON operf.idOut = o.idOut
            LEFT JOIN performance perf ON perf.id_performance = operf.id_performance
        ";
    }

    private function sortSql($sortBy)
    {
        if ($sortBy === 'rating') {
            return ' ORDER BY rating DESC, review_count DESC';
        }

        if ($sortBy === 'recent') {
            return ' ORDER BY o.created_at DESC, o.idOut DESC';
        }

        if ($sortBy === 'usage') {
            return ' ORDER BY favorite_count DESC, review_count DESC';
        }

        return ' ORDER BY favorite_count DESC, review_count DESC, o.created_at DESC';
    }

    private function formatTool(array $row)
    {
        $features = $this->splitList($row['features'], '||');

        return [
            'id' => (string) $row['idOut'],
            'name' => $row['nom'],
            'slug' => $row['slug'],
            'description' => $row['description_courte'],
            'longDescription' => $row['description_longue'],
            'logo' => $row['logo_url'],
            'url' => $row['site_url'],
            'categoryIds' => $this->splitList($row['category_ids'], ','),
            'categories' => array_map(function ($pair) {
                [$id, $slug, $name] = array_pad(explode(':', $pair, 3), 3, '');
                return ['id' => (string) $id, 'slug' => $slug, 'name' => $name];
            }, $this->splitList($row['category_pairs'], '||')),
            'aiModels' => array_map(function ($pair) {
                [$id, $name] = array_pad(explode(':', $pair, 2), 2, null);
                return ['modelId' => (string) $id, 'name' => $name, 'accessType' => 'paid'];
            }, $this->splitList($row['model_pairs'], '||')),
            'pricing' => $this->normalizePricing($row['pricing_type'] ?: $row['type_tarif']),
            'priceDetails' => $row['type_tarif'],
            'platforms' => $this->splitList($row['platforms'], ','),
            'functions' => $this->inferFunctions($features),
            'rating' => $row['rating'] ? round((float) $row['rating'], 1) : 0,
            'reviewCount' => (int) $row['review_count'],
            'usageCount' => (int) $row['favorite_count'],
            'trendingScore' => min(100, ((int) $row['favorite_count'] * 8) + ((int) $row['review_count'] * 5)),
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['update_at'],
            'featured' => (int) $row['favorite_count'] >= 2 || (float) $row['rating'] >= 4.5,
            'hasApiTest' => in_array('API developpeur', $features, true) || in_array('api', $this->splitList($row['platforms'], ','), true),
            'screenshots' => [],
            'status' => $row['statut'] === 'actif' ? 'active' : $row['statut'],
            'benchmarks' => $this->pairsToMap($row['performance_pairs']),
            'ownFeatures' => $features,
            'pricingPlans' => $this->pricingPlans($row['idOut']),
            'provider' => $row['provider'],
            'openSource' => (bool) $row['open_source'],
            'releaseDate' => $row['release_date'],
        ];
    }

    private function formatModel(array $row)
    {
        return [
            'id' => (string) $row['idMod'],
            'id_fourn' => (string) ($row['id_fourn'] ?? ''),
            'name' => $row['nom'],
            'slug' => $row['slug'],
            'provider' => $row['provider'],
            'description' => $row['description'],
            'capabilities' => $this->splitList($row['features'], '||'),
            'pricing' => $row['est_open_source'] ? 'free' : 'paid',
            'benchmarks' => $this->pairsToMap($row['performances']),
            'type' => $row['type'],
            'license' => $row['licence'],
            'openSource' => (bool) $row['est_open_source'],
            'multimodal' => (bool) $row['multimodal'],
            'hasApi' => (bool) $row['a_api'],
            'releaseDate' => $row['release_date'],
        ];
    }

    private function pricingPlans($toolId)
    {
        $stmt = $this->pdo->prepare("
            SELECT id_pricing_plans, name, price, currency, period, description, type
            FROM pricing_plans
            WHERE idOut = :tool_id
            ORDER BY price ASC
        ");
        $stmt->execute(['tool_id' => $toolId]);

        return array_map(function ($row) {
            return [
                'id' => (string) $row['id_pricing_plans'],
                'name' => $row['name'],
                'price' => (float) $row['price'],
                'currency' => $row['currency'],
                'period' => $row['period'] ?: 'month',
                'description' => $row['description'],
                'type' => $row['type'],
            ];
        }, $stmt->fetchAll());
    }

    private function splitList($value, $separator)
    {
        if (!$value) {
            return [];
        }

        return array_values(array_filter(array_map('trim', explode($separator, $value)), fn($item) => $item !== ''));
    }

    private function pairsToMap($value)
    {
        $map = [];
        foreach ($this->splitList($value, '||') as $pair) {
            [$key, $score] = array_pad(explode(':', $pair, 2), 2, null);
            if ($key !== null && $score !== null) {
                $map[$key] = is_numeric($score) ? (int) $score : $score;
            }
        }
        return $map;
    }

    private function normalizePricing($value)
    {
        $value = strtolower((string) $value);
        if (str_contains($value, 'free') || str_contains($value, 'gratuit')) {
            return str_contains($value, 'plus') || str_contains($value, 'freemium') ? 'freemium' : 'free';
        }
        if (str_contains($value, 'freemium')) {
            return 'freemium';
        }
        return 'paid';
    }

    private function inferFunctions(array $features)
    {
        $text = strtolower(implode(' ', $features));
        $functions = [];
        foreach (['text' => 'texte', 'image' => 'image', 'audio' => 'audio', 'video' => 'video', 'code' => 'code'] as $key => $needle) {
            if (str_contains($text, $needle) || str_contains($text, $key)) {
                $functions[] = $key;
            }
        }
        return $functions ?: ['text'];
    }
}
