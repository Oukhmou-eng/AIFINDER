<?php

class Catalog
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = require __DIR__ . '/../config/database.php';
    }

    /*  public function tools(array $filters = [])
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
     } */

    public function tools(array $filters = [])
    {
        $where = [];
        $params = [];

        // Filtre recherche textuelle (nom, description courte/longue)
        if (!empty($filters['q'])) {
            $where[] = "(o.NOM LIKE :q OR o.DESCRIPTION_COURTE LIKE :q OR o.DESCRIPTION_LONGUE LIKE :q)";
            $params['q'] = '%' . $filters['q'] . '%';
        }

        // Filtre par catégorie (ID ou slug)
        if (!empty($filters['category'])) {
            $where[] = "EXISTS (
            SELECT 1 FROM OUTIL_CATEGORIE oc
            JOIN CATEGORIES c ON c.ID_CATEGORIE = oc.ID_CATEGORIE
            WHERE oc.IDOUT = o.IDOUT AND (c.ID_CATEGORIE = :category_id OR c.SLUG = :category_slug)
        )";
            $params['category_id'] = ctype_digit((string) $filters['category']) ? (int) $filters['category'] : 0;
            $params['category_slug'] = $filters['category'];
        }

        // Filtre par type de tarif (ex: free, freemium, paid)
        if (!empty($filters['pricing'])) {
            $where[] = "o.TYPE_TARIF = :pricing";
            $params['pricing'] = $filters['pricing'];
        }

        // Filtre par modèle (ID ou slug)
        if (!empty($filters['model'])) {
            $where[] = "EXISTS (
            SELECT 1 FROM OUTIL_MODELE om
            JOIN MODELS m ON m.IDMOD = om.IDMOD
            WHERE om.IDOUT = o.IDOUT AND (m.IDMOD = :model_id OR m.SLUG = :model_slug)
        )";
            $params['model_id'] = ctype_digit((string) $filters['model']) ? (int) $filters['model'] : 0;
            $params['model_slug'] = $filters['model'];
        }

        // Construction de la requête SQL de base
        $sql = $this->toolBaseSql(); // Cette méthode doit retourner la requête de sélection avec alias 'o' (ex: SELECT o.IDOUT, o.NOM, ... FROM OUTILS o)

        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }

        $sql .= " GROUP BY o.IDOUT "; // Regroupement utile si des agrégats sont présents
        $sql .= $this->sortSql($filters['sortBy'] ?? null);

        if (!empty($filters['limit']) && (int) $filters['limit'] > 0) {
            $sql .= ' LIMIT ' . min((int) $filters['limit'], 100);
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return array_map([$this, 'formatTool'], $stmt->fetchAll());
    }

    /* public function tool($idOrSlug)
    {
        $sql = $this->toolBaseSql() . " WHERE o.idOut = :id OR o.slug = :slug GROUP BY o.idOut LIMIT 1";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'id' => ctype_digit((string) $idOrSlug) ? $idOrSlug : 0,
            'slug' => $idOrSlug,
        ]);
        $tool = $stmt->fetch();

        return $tool ? $this->formatTool($tool) : null;
    } */

    public function tool($idOrSlug)
    {
        // Récupération de l'outil
        $sql = $this->toolBaseSql() . " WHERE o.IDOUT = :id OR o.SLUG = :slug GROUP BY o.IDOUT LIMIT 1";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'id' => ctype_digit((string) $idOrSlug) ? $idOrSlug : 0,
            'slug' => $idOrSlug,
        ]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            return null;
        }

        // Récupération de la dernière note administrative (soumission la plus récente)
        $stmt2 = $this->pdo->prepare("
        SELECT NOTE_ADMIN, TENTATIVES_EFFECTUEES, TENTATIVES_MAX
        FROM SOUMISSION_OUTIL
        WHERE IDOUT = :tool_id
        ORDER BY DATE_MISE_A_JOUR DESC
        LIMIT 1
    ");
        $stmt2->execute(['tool_id' => $row['IDOUT']]);
        $submission = $stmt2->fetch(PDO::FETCH_ASSOC);
        if ($submission) {
            $row['adminNote'] = $submission['NOTE_ADMIN'] ?? null;
            $row['tentativesEffectuees'] = (int) $submission['TENTATIVES_EFFECTUEES'];
            $row['tentativesMax'] = (int) $submission['TENTATIVES_MAX'];
        } else {
            $row['adminNote'] = null;
            $row['tentativesEffectuees'] = 0;
            $row['tentativesMax'] = 0;

            
        }

        return $this->formatTool($row);
    }



    /* public function model($idOrSlug)
    {
        $sql = "
            SELECT m.idMod, m.nom, m.slug, m.type, m.description, m.licence,
                   m.api_url, m.est_open_source, m.release_date, m.multimodal, m.a_api, m.id_fourn,
                   f.nom AS provider,
                   mpri.input_price, mpri.output_price,
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
            LEFT JOIN model_pricing mpri ON mpri.idMod = m.idMod
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
    } */


    public function model($idOrSlug)
    {
        $stmt = $this->pdo->prepare("
        SELECT 
            m.IDMOD AS idMod, 
            m.NOM AS nom, 
            m.SLUG AS slug, 
            m.TYPE AS type, 
            m.DESCRIPTION AS description,
            NULL AS licence,
            m.EST_OPEN_SOURCE AS est_open_source, 
            m.DATE_SORTIE AS release_date, 
            NULL AS multimodal,
            m.POSSEDE_API AS a_api,
            f.NOM AS provider,
            GROUP_CONCAT(DISTINCT feat.NOM ORDER BY feat.NOM SEPARATOR '||') AS features,
            GROUP_CONCAT(DISTINCT CONCAT(p.DOMAINE, ':', mp.SCORE) ORDER BY p.DOMAINE SEPARATOR '||') AS performances
        FROM MODELS m
        JOIN FOURNISSEUR f ON f.ID_FOURNISSEUR = m.ID_FOURNISSEUR
        LEFT JOIN FEATURE_MODELE mf ON mf.IDMOD = m.IDMOD
        LEFT JOIN FEATURES feat ON feat.ID_FEATURE = mf.ID_FEATURE
        LEFT JOIN PERFORMANCE_MODELE mp ON mp.IDMOD = m.IDMOD
        LEFT JOIN PERFORMANCE p ON p.ID_PERFORMANCE = mp.ID_PERFORMANCE
        WHERE m.IDMOD = :id OR m.SLUG = :slug
        GROUP BY m.IDMOD
        LIMIT 1
    ");

        $stmt->execute([
            'id' => ctype_digit((string) $idOrSlug) ? (int) $idOrSlug : 0,
            'slug' => $idOrSlug,
        ]);

        $row = $stmt->fetch();
        return $row ? $this->formatModel($row) : null;
    }


    /* public function categories()
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
    } */


    public function categories()
    {
        $stmt = $this->pdo->query("
        SELECT 
            c.ID_CATEGORIE AS id_Cat, 
            c.NOM AS nom_Cat, 
            c.SLUG AS slug, 
            c.ICONE AS icone, 
            c.DESCRIPTION AS description,
            COUNT(oc.IDOUT) AS tool_count
        FROM CATEGORIES c
        LEFT JOIN OUTIL_CATEGORIE oc ON oc.ID_CATEGORIE = c.ID_CATEGORIE
        GROUP BY c.ID_CATEGORIE
        ORDER BY c.NOM
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



    public function toolStats($toolId)
    {
        $stmt = $this->pdo->prepare("
        SELECT 
            ID_STAT,
            NOTE_MOYENNE,
            NB_NOTATIONS,
            NB_UTILISATEURS,
            CONTENU,
            DATE_MISE_A_JOUR
        FROM STATISTIQUES_EXTERNES
        WHERE IDOUT = :tool_id
        LIMIT 1
    ");
        $stmt->execute(['tool_id' => $toolId]);
        $row = $stmt->fetch();

        if (!$row) {
            return null;
        }

        return [
            'toolId' => (string) $toolId,
            'averageRating' => (float) $row['NOTE_MOYENNE'],
            'ratingCount' => (int) $row['NB_NOTATIONS'],
            'userCount' => (int) $row['NB_UTILISATEURS'],
            'details' => $row['CONTENU'],          // éventuel texte descriptif
            'lastUpdated' => $row['DATE_MISE_A_JOUR'],
        ];
    }


    public function tags()
    {
        $stmt = $this->pdo->query("
            SELECT id_tag AS id, nom AS name, slug 
            FROM tags 
            ORDER BY nom ASC
        ");
        return $stmt->fetchAll();
    }

    /* public function models()
    {
        $stmt = $this->pdo->query("
            SELECT m.idMod, m.nom, m.slug, m.type, m.description, m.licence,
                   m.api_url, m.est_open_source, m.release_date, m.multimodal, m.a_api, m.id_fourn,
                   f.nom AS provider,
                   mpri.input_price, mpri.output_price,
                   GROUP_CONCAT(DISTINCT feat.name ORDER BY feat.name SEPARATOR '||') AS features,
                   GROUP_CONCAT(DISTINCT CONCAT(p.domaine, ':', p.score) ORDER BY p.domaine SEPARATOR '||') AS performances
            FROM models m
            JOIN fournisseur f ON f.id_fourn = m.id_fourn
            LEFT JOIN model_pricing mpri ON mpri.idMod = m.idMod
            LEFT JOIN model_feature mf ON mf.idMod = m.idMod
            LEFT JOIN features feat ON feat.id_features = mf.id_features
            LEFT JOIN model_performance mp ON mp.idMod = m.idMod
            LEFT JOIN performance p ON p.id_performance = mp.id_performance
            GROUP BY m.idMod
            ORDER BY m.nom
        ");

        return array_map([$this, 'formatModel'], $stmt->fetchAll());
    } */

    public function models()
    {
        $stmt = $this->pdo->query("
        SELECT 
            m.IDMOD AS idMod, 
            m.NOM AS nom, 
            m.SLUG AS slug, 
            m.TYPE AS type, 
            m.DESCRIPTION AS description,
            NULL AS licence,
            m.EST_OPEN_SOURCE AS est_open_source, 
            m.DATE_SORTIE AS release_date, 
            NULL AS multimodal,
            m.POSSEDE_API AS a_api,
            f.NOM AS provider,
            GROUP_CONCAT(DISTINCT feat.NOM ORDER BY feat.NOM SEPARATOR '||') AS features,
            GROUP_CONCAT(DISTINCT CONCAT(p.DOMAINE, ':', mp.SCORE) ORDER BY p.DOMAINE SEPARATOR '||') AS performances
        FROM MODELS m
        JOIN FOURNISSEUR f ON f.ID_FOURNISSEUR = m.ID_FOURNISSEUR
        LEFT JOIN FEATURE_MODELE mf ON mf.IDMOD = m.IDMOD
        LEFT JOIN FEATURES feat ON feat.ID_FEATURE = mf.ID_FEATURE
        LEFT JOIN PERFORMANCE_MODELE mp ON mp.IDMOD = m.IDMOD
        LEFT JOIN PERFORMANCE p ON p.ID_PERFORMANCE = mp.ID_PERFORMANCE
        GROUP BY m.IDMOD
        ORDER BY m.NOM
        ");

        return array_map([$this, 'formatModel'], $stmt->fetchAll());
    }

    public function reviews($toolId)
    {
        $stmt = $this->pdo->prepare("
            SELECT a.id_avis, a.note, a.titre, a.contenu, a.created_at,
                   u.IDU, u.NOM, u.PRENOM, u.AVATAR_URL
            FROM avis a
            JOIN UTILISATEUR u ON u.IDU = a.idU
            WHERE a.idOut = :tool_id
            ORDER BY a.created_at DESC, a.id_avis DESC
        ");
        $stmt->execute(['tool_id' => $toolId]);

        return array_map(function ($row) use ($toolId) {
            return [
                'id' => (string) $row['id_avis'],
                'toolId' => (string) $toolId,
                'userId' => (string) $row['IDU'],
                'userName' => trim(($row['PRENOM'] ?? '') . ' ' . ($row['NOM'] ?? '')),
                'userAvatar' => $row['AVATAR_URL'],
                'rating' => (int) $row['note'],
                'title' => $row['titre'],
                'comment' => $row['contenu'],
                'createdAt' => $row['created_at'],
                'replies' => [],
            ];
        }, $stmt->fetchAll());
    }

    public function comments($toolId)
    {
        $stmt = $this->pdo->prepare("
        SELECT c.ID_COMMENTAIRE, c.CONTENU, c.DATE_MISE_A_JOUR, c.IDU, c.COMMENTAIRE_PARENT_ID,
               u.NOM, u.PRENOM, u.AVATAR_URL
        FROM COMMENTAIRES c
        JOIN UTILISATEUR u ON u.IDU = c.IDU
        WHERE c.IDOUT = :tool_id AND c.STATUT = 'actif'
        ORDER BY c.DATE_MISE_A_JOUR DESC, c.ID_COMMENTAIRE DESC
    ");
        $stmt->execute(['tool_id' => $toolId]);
        $rows = $stmt->fetchAll();

        $comments = [];
        $byParent = [];

        foreach ($rows as $row) {
            $comment = [
                'id' => (string) $row['ID_COMMENTAIRE'],
                'content' => $row['CONTENU'],
                'createdAt' => $row['DATE_MISE_A_JOUR'],
                'userId' => (string) $row['IDU'],
                'userName' => trim($row['PRENOM'] . ' ' . $row['NOM']),
                'userAvatar' => $row['AVATAR_URL'],
                'parentId' => $row['COMMENTAIRE_PARENT_ID'] ? (string) $row['COMMENTAIRE_PARENT_ID'] : null,
                'replies' => [],
            ];

            if ($row['COMMENTAIRE_PARENT_ID']) {
                $byParent[$row['COMMENTAIRE_PARENT_ID']][] = $comment;
            } else {
                $comments[] = $comment;
            }
        }



        // Attacher les réponses aux parents (un seul niveau)
        foreach ($comments as &$parent) {
            if (isset($byParent[$parent['id']])) {
                $parent['replies'] = $byParent[$parent['id']];
            }
        }

        return $comments;
    }


    public function addComment($userId, array $data)
    {
        $stmt = $this->pdo->prepare("
        INSERT INTO COMMENTAIRES (CONTENU, STATUT, DATE_MISE_A_JOUR, IDU, IDOUT, COMMENTAIRE_PARENT_ID)
        VALUES (:contenu, 'actif', CURRENT_DATE, :user_id, :tool_id, :parent_id)
    ");
        $stmt->execute([
            'contenu' => $data['content'] ?? $data['contenu'],
            'user_id' => $userId,
            'tool_id' => $data['toolId'] ?? $data['idOut'],
            'parent_id' => $data['parentId'] ?? null,
        ]);

        return $this->comments($data['toolId'] ?? $data['idOut']);
    }

    public function deleteComment($commentId, $userId)
    {
        $stmt = $this->pdo->prepare("DELETE FROM COMMENTAIRES WHERE ID_COMMENTAIRE = :id AND IDU = :user_id");
        return $stmt->execute(['id' => $commentId, 'user_id' => $userId]);
    }

    public function userReviews($userId)
    {
        $stmt = $this->pdo->prepare("
            SELECT a.id_avis, a.note, a.titre, a.contenu, a.created_at, a.idOut,
                   o.NOM AS tool_name, o.SLUG AS tool_slug
            FROM avis a
            JOIN OUTILS o ON o.IDOUT = a.idOut
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

    /* public function report(array $data, $userId = null)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO signalements
            (motif, statut, `date`, description, created_at, idU, idOut, id_com)
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
 */

    public function report(array $data, $userId = null)
    {
        $stmt = $this->pdo->prepare("
     INSERT INTO SIGNALEMENTS
     (IDOUT, IDU, ID_COMMENTAIRE, MOTIF, STATUT, DESCRIPTION, DATE_MISE_A_JOUR)
     VALUES (:tool_id, :user_id, :comment_id, :motif, 'en_attente', :description, CURRENT_DATE)
 ");
        $stmt->execute([
            'motif' => $data['motif'] ?? $data['reason'] ?? null,
            'description' => $data['description'] ?? $data['details'] ?? null,
            'user_id' => $userId ?? $data['idU'] ?? 1,
            'tool_id' => $data['idOut'] ?? $data['toolId'] ?? null,
            'comment_id' => $data['id_com'] ?? $data['commentId'] ?? null,
        ]);

        return [
            'id' => (string) $this->pdo->lastInsertId(),
            'status' => 'pending'
        ];
    }


    /* public function stats()
    {
        return [
            'totalTools' => (int) $this->pdo->query("SELECT COUNT(*) FROM outils")->fetchColumn(),
            'approvedTools' => (int) $this->pdo->query("SELECT COUNT(*) FROM outils WHERE statut = 'actif'")->fetchColumn(),
            'pendingTools' => (int) $this->pdo->query("SELECT COUNT(*) FROM soumission_outil WHERE statut = 'en_attente'")->fetchColumn(),
            'totalUsers' => (int) $this->pdo->query("SELECT COUNT(*) FROM utilisateur")->fetchColumn(),
            'totalCategories' => (int) $this->pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn(),
            'pendingReports' => (int) $this->pdo->query("SELECT COUNT(*) FROM signalements WHERE statut = 'en_attente'")->fetchColumn(),
        ];
    } */

    public function stats()
    {
        return [
            'totalTools' => (int) $this->pdo->query("SELECT COUNT(*) FROM OUTILS WHERE STATUT = 'actif'")->fetchColumn(),
            'approvedTools' => (int) $this->pdo->query("SELECT COUNT(*) FROM OUTILS WHERE STATUT = 'actif'")->fetchColumn(),
            'pendingTools' => (int) $this->pdo->query("SELECT COUNT(*) FROM SOUMISSION_OUTIL WHERE STATUT = 'en_attente'")->fetchColumn(),
            'totalUsers' => (int) $this->pdo->query("SELECT COUNT(*) FROM UTILISATEUR")->fetchColumn(),
            'totalCategories' => (int) $this->pdo->query("SELECT COUNT(*) FROM CATEGORIES")->fetchColumn(),
            'totalModels' => (int) $this->pdo->query("SELECT COUNT(*) FROM MODELS")->fetchColumn(),
            'averageRating' => $this->getGlobalAverageRating(), // nouvelle méthode
            'pendingReports' => (int) $this->pdo->query("SELECT COUNT(*) FROM SIGNALEMENTS WHERE STATUT = 'en_attente'")->fetchColumn(),
        ];
    }

    /**
     * Calcule la note moyenne globale (pondérée) à partir des statistiques externes
     */
    private function getGlobalAverageRating()
    {
        $stmt = $this->pdo->query("
        SELECT SUM(NOTE_MOYENNE * NB_NOTATIONS) / SUM(NB_NOTATIONS) as global_avg
        FROM STATISTIQUES_EXTERNES
        WHERE NB_NOTATIONS > 0 AND NOTE_MOYENNE IS NOT NULL
    ");
        $avg = $stmt->fetchColumn();
        return $avg ? round((float) $avg, 1) : 0.0;
    }

    /*  public function searchTools(array $params): array
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
                    GROUP_CONCAT(DISTINCT CONCAT(t.id_tag, ':', t.nom) ORDER BY t.nom SEPARATOR '||') AS tag_pairs,
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
             LEFT JOIN outil_tag ot ON ot.idOut = o.idOut
             LEFT JOIN tags t ON t.id_tag = ot.id_tag
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
     } */


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
               f.NOM AS provider,
               COALESCE(s.NOTE_MOYENNE, 0) AS rating,
               COALESCE(s.NB_NOTATIONS, 0) AS review_count,
               COUNT(DISTINCT fav.ID_FAVORI) AS favorite_count,
               GROUP_CONCAT(DISTINCT c.ID_CATEGORIE ORDER BY c.ID_CATEGORIE SEPARATOR ',') AS category_ids,
               GROUP_CONCAT(DISTINCT CONCAT(c.ID_CATEGORIE, ':', c.SLUG, ':', c.NOM) ORDER BY c.ID_CATEGORIE SEPARATOR '||') AS category_pairs,
               GROUP_CONCAT(DISTINCT p.NOM ORDER BY p.NOM SEPARATOR ',') AS platforms,
               GROUP_CONCAT(DISTINCT feat.NOM ORDER BY feat.NOM SEPARATOR '||') AS features,
               GROUP_CONCAT(DISTINCT CONCAT(m.IDMOD, ':', m.NOM) ORDER BY m.IDMOD SEPARATOR '||') AS model_pairs,
               GROUP_CONCAT(DISTINCT CONCAT(perf.DOMAINE, ':', operf.SCORE) ORDER BY perf.DOMAINE SEPARATOR '||') AS performance_pairs,
               CASE
                   WHEN o.NOM = :p_exact THEN 1
                   WHEN o.NOM LIKE :p_like THEN 2
                   WHEN o.DESCRIPTION_COURTE LIKE :p_like2 THEN 3
                   WHEN o.DESCRIPTION_LONGUE LIKE :p_like3 THEN 4
                   ELSE 5
               END AS priority
        FROM OUTILS o
        LEFT JOIN FOURNISSEUR f ON f.ID_FOURNISSEUR = o.ID_FOURNISSEUR
        LEFT JOIN STATISTIQUES_EXTERNES s ON s.IDOUT = o.IDOUT
        LEFT JOIN FAVORI fav ON fav.IDOUT = o.IDOUT
        LEFT JOIN OUTIL_CATEGORIE oc ON oc.IDOUT = o.IDOUT
        LEFT JOIN CATEGORIES c ON c.ID_CATEGORIE = oc.ID_CATEGORIE
        LEFT JOIN OUTIL_PLATEFORME op ON op.IDOUT = o.IDOUT
        LEFT JOIN PLATEFORME p ON p.ID_PLATEFORME = op.ID_PLATEFORME
        LEFT JOIN OUTIL_FEATURE ofe ON ofe.IDOUT = o.IDOUT
        LEFT JOIN FEATURES feat ON feat.ID_FEATURE = ofe.ID_FEATURE
        LEFT JOIN OUTIL_MODELE om ON om.IDOUT = o.IDOUT
        LEFT JOIN MODELS m ON m.IDMOD = om.IDMOD
        LEFT JOIN OUTIL_PERFORMANCE operf ON operf.IDOUT = o.IDOUT
        LEFT JOIN PERFORMANCE perf ON perf.ID_PERFORMANCE = operf.ID_PERFORMANCE
        WHERE o.STATUT = 'actif'
    ";


        $bindings = [];

        if (!empty($query)) {
            $sql .= " AND (o.NOM = :w_exact 
                       OR o.NOM LIKE :w_like 
                       OR o.DESCRIPTION_COURTE LIKE :w_like2
                       OR o.DESCRIPTION_LONGUE LIKE :w_like3)";
            $bindings[':p_exact'] = $query;
            $bindings[':p_like'] = "%$query%";
            $bindings[':p_like2'] = "%$query%";
            $bindings[':p_like3'] = "%$query%";
            $bindings[':w_exact'] = $query;
            $bindings[':w_like'] = "%$query%";
            $bindings[':w_like2'] = "%$query%";
            $bindings[':w_like3'] = "%$query%";
        } else {
            // Pour éviter les erreurs de liaisons, on met des valeurs par défaut
            $bindings[':p_exact'] = '';
            $bindings[':p_like'] = '';
            $bindings[':p_like2'] = '';
            $bindings[':p_like3'] = '';
        }

        if ($category) {
            $sql .= " AND EXISTS (
            SELECT 1 FROM OUTIL_CATEGORIE oc2
            JOIN CATEGORIES c2 ON c2.ID_CATEGORIE = oc2.ID_CATEGORIE
            WHERE oc2.IDOUT = o.IDOUT AND (c2.SLUG = :category_slug OR c2.ID_CATEGORIE = :category_id)
        )";
            $bindings[':category_slug'] = $category;
            $bindings[':category_id'] = is_numeric($category) ? (int) $category : 0;
        }

        if (!empty($pricing)) {
            $placeholders = [];
            foreach ($pricing as $i => $p) {
                $placeholder = ":pricing_$i";
                $placeholders[] = $placeholder;
                $bindings[$placeholder] = $p;
            }
            $sql .= " AND o.TYPE_TARIF IN (" . implode(',', $placeholders) . ")";
        }

        if (!empty($platforms)) {
            $sql .= " AND EXISTS (
            SELECT 1 FROM OUTIL_PLATEFORME op2
            JOIN PLATEFORME p2 ON p2.ID_PLATEFORME = op2.ID_PLATEFORME
            WHERE op2.IDOUT = o.IDOUT AND p2.NOM IN (";
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
            SELECT 1 FROM OUTIL_FEATURE ofe2
            JOIN FEATURES f2 ON f2.ID_FEATURE = ofe2.ID_FEATURE
            WHERE ofe2.IDOUT = o.IDOUT AND f2.NOM IN (";
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
            SELECT 1 FROM OUTIL_MODELE om2
            WHERE om2.IDOUT = o.IDOUT AND om2.IDMOD IN (";
            $placeholders = [];
            foreach ($models as $i => $mod) {
                $placeholder = ":mod_$i";
                $placeholders[] = $placeholder;
                $bindings[$placeholder] = (int) $mod;
            }
            $sql .= implode(',', $placeholders) . "))";
        }

        $sql .= " GROUP BY o.IDOUT ORDER BY priority ASC, ";

        switch ($sortBy) {
            case 'rating':
                $sql .= "rating DESC, review_count DESC";
                break;
            case 'usage':
                $sql .= "favorite_count DESC, review_count DESC";
                break;
            case 'recent':
                $sql .= "o.DATE_SORTIE DESC, o.IDOUT DESC";
                break;
            default:
                $sql .= "priority ASC, favorite_count DESC, review_count DESC, o.DATE_SORTIE DESC";
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

    /* private function toolBaseSql()
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
                   GROUP_CONCAT(DISTINCT CONCAT(t.id_tag, ':', t.nom) ORDER BY t.nom SEPARATOR '||') AS tag_pairs,
                   GROUP_CONCAT(DISTINCT CONCAT(m.idMod, ':', m.nom) ORDER BY m.idMod SEPARATOR '||') AS model_pairs,
                   GROUP_CONCAT(DISTINCT CONCAT(perf.domaine, ':', perf.score) ORDER BY perf.domaine SEPARATOR '||') AS performance_pairs
            FROM outils o
            LEFT JOIN fournisseur f ON f.id_fourn = o.id_fourn
            LEFT JOIN avis a ON a.idOut = o.idOut
            LEFT JOIN favori fav ON fav.idOut = o.idOut
            LEFT JOIN outil_categorie oc ON oc.idOut = o.idOut
            LEFT JOIN categories c ON c.id_Cat = oc.id_Cat
            LEFT JOIN outil_tag ot ON ot.idOut = o.idOut
            LEFT JOIN tags t ON t.id_tag = ot.id_tag
            LEFT JOIN outil_plateforme op ON op.idOut = o.idOut
            LEFT JOIN plateforme p ON p.id = op.id
            LEFT JOIN outil_feature ofe ON ofe.idOut = o.idOut
            LEFT JOIN features feat ON feat.id_features = ofe.id_features
            LEFT JOIN outil_model om ON om.idOut = o.idOut
            LEFT JOIN models m ON m.idMod = om.idMod
            LEFT JOIN outil_performance operf ON operf.idOut = o.idOut
            LEFT JOIN performance perf ON perf.id_performance = operf.id_performance
        ";
    } */


    private function toolBaseSql()
    {
        return "
        SELECT 
            o.*,
            f.NOM AS provider,
            COALESCE(s.NOTE_MOYENNE, 0) AS rating,
            COALESCE(s.NB_NOTATIONS, 0) AS review_count,
            COALESCE(s.NB_UTILISATEURS, 0) AS total_users,    
            s.DATE_MISE_A_JOUR AS stats_updated_at, 
            COUNT(DISTINCT fav.ID_FAVORI) AS favorite_count,
            GROUP_CONCAT(DISTINCT c.ID_CATEGORIE ORDER BY c.ID_CATEGORIE SEPARATOR ',') AS category_ids,
            GROUP_CONCAT(DISTINCT CONCAT(c.ID_CATEGORIE, ':', c.SLUG, ':', c.NOM) ORDER BY c.ID_CATEGORIE SEPARATOR '||') AS category_pairs,
            GROUP_CONCAT(DISTINCT p.NOM ORDER BY p.NOM SEPARATOR ',') AS platforms,
            GROUP_CONCAT(DISTINCT feat.NOM ORDER BY feat.NOM SEPARATOR '||') AS features,
            GROUP_CONCAT(DISTINCT CONCAT(m.IDMOD, ':', m.NOM) ORDER BY m.IDMOD SEPARATOR '||') AS model_pairs,
            GROUP_CONCAT(DISTINCT CONCAT(perf.DOMAINE, ':', operf.SCORE) ORDER BY perf.DOMAINE SEPARATOR '||') AS performance_pairs
        FROM OUTILS o
        LEFT JOIN FOURNISSEUR f ON f.ID_FOURNISSEUR = o.ID_FOURNISSEUR
        LEFT JOIN STATISTIQUES_EXTERNES s ON s.IDOUT = o.IDOUT
        LEFT JOIN FAVORI fav ON fav.IDOUT = o.IDOUT
        LEFT JOIN OUTIL_CATEGORIE oc ON oc.IDOUT = o.IDOUT
        LEFT JOIN CATEGORIES c ON c.ID_CATEGORIE = oc.ID_CATEGORIE
        LEFT JOIN OUTIL_PLATEFORME op ON op.IDOUT = o.IDOUT
        LEFT JOIN PLATEFORME p ON p.ID_PLATEFORME = op.ID_PLATEFORME
        LEFT JOIN OUTIL_FEATURE ofe ON ofe.IDOUT = o.IDOUT
        LEFT JOIN FEATURES feat ON feat.ID_FEATURE = ofe.ID_FEATURE
        LEFT JOIN OUTIL_MODELE om ON om.IDOUT = o.IDOUT
        LEFT JOIN MODELS m ON m.IDMOD = om.IDMOD
        LEFT JOIN OUTIL_PERFORMANCE operf ON operf.IDOUT = o.IDOUT
        LEFT JOIN PERFORMANCE perf ON perf.ID_PERFORMANCE = operf.ID_PERFORMANCE
    ";
    }

    /* private function sortSql($sortBy)
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
    } */

    private function sortSql($sortBy)
    {
        if ($sortBy === 'rating') {
            return ' ORDER BY rating DESC, review_count DESC';
        }

        if ($sortBy === 'recent') {
            // o.DATE_MISE_A_JOUR est la date de mise à jour (ou création) de l'outil
            return ' ORDER BY o.DATE_MISE_A_JOUR DESC, o.IDOUT DESC';
        }

        if ($sortBy === 'usage') {
            return ' ORDER BY favorite_count DESC, review_count DESC';
        }

        // Tri par défaut : favoris, puis nombre d'avis, puis récent
        return ' ORDER BY favorite_count DESC, review_count DESC, o.DATE_MISE_A_JOUR DESC';
    }

    /* private function formatTool(array $row)
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
            'tags' => array_map(function ($pair) {
                [$id, $name] = array_pad(explode(':', $pair, 2), 2, null);
                return ['id' => (string) $id, 'name' => $name];
            }, $this->splitList($row['tag_pairs'] ?? '', '||')),
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
 */

    private function formatTool(array $row)
    {
        $features = $this->splitList($row['features'] ?? '', '||');

        return [
            'id' => (string) $row['IDOUT'],
            'name' => $row['NOM'] ?? '',
            'slug' => $row['SLUG'] ?? '',
            'description' => $row['DESCRIPTION_COURTE'] ?? '',
            'longDescription' => $row['DESCRIPTION_LONGUE'] ?? '',
            'logo' => $row['LOGO_URL'] ?? '',
            'url' => $row['SITE_URL'] ?? '',
            'categoryIds' => $this->splitList($row['category_ids'] ?? '', ','),
            'categories' => array_map(function ($pair) {
                [$id, $slug, $name] = array_pad(explode(':', $pair, 3), 3, '');
                return ['id' => (string) $id, 'slug' => $slug, 'name' => $name];
            }, $this->splitList($row['category_pairs'] ?? '', '||')),
            'aiModels' => array_map(function ($pair) {
                [$id, $name] = array_pad(explode(':', $pair, 2), 2, null);
                return ['modelId' => (string) $id, 'name' => $name, 'accessType' => 'paid'];
            }, $this->splitList($row['model_pairs'] ?? '', '||')),
            'pricing' => $this->normalizePricing($row['TYPE_TARIF'] ?? ''),
            'priceDetails' => $row['TYPE_TARIF'] ?? '',
            'platforms' => $this->splitList($row['platforms'] ?? '', ','),
            'functions' => $this->inferFunctions($features),
            'rating' => isset($row['rating']) ? round((float) $row['rating'], 1) : 0,
            'reviewCount' => (int) ($row['review_count'] ?? 0),
            'totalUsers' => (int) ($row['total_users'] ?? 0),
            'statsUpdatedAt' => $row['stats_updated_at'] ?? null,
            'usageCount' => (int) ($row['favorite_count'] ?? 0),
            'trendingScore' => min(100, ((int) ($row['favorite_count'] ?? 0) * 8) + ((int) ($row['review_count'] ?? 0) * 5)),
            'createdAt' => $row['DATE_MISE_A_JOUR'] ?? null,
            'updatedAt' => $row['DATE_MISE_A_JOUR'] ?? null,
            'featured' => ((int) ($row['favorite_count'] ?? 0) >= 2) || ((float) ($row['rating'] ?? 0) >= 4.5),
            'hasApiTest' => in_array('API développeur', $features, true) || in_array('api', $this->splitList($row['platforms'] ?? '', ','), true),
            'screenshots' => [],
            'status' => ($row['STATUT'] ?? '') === 'actif' ? 'active' : ($row['STATUT'] ?? 'inactive'),
            'benchmarks' => $this->pairsToMap($row['performance_pairs'] ?? ''),
            'ownFeatures' => $features,
            'pricingPlans' => $this->pricingPlans($row['IDOUT']),
            'provider' => $row['provider'] ?? '',
            'openSource' => (bool) ($row['EST_OPEN_SOURCE'] ?? false),
            'releaseDate' => $row['DATE_SORTIE'] ?? null,
            'adminNote' => $row['adminNote'] ?? null,
            'tentativesEffectuees' => $row['tentativesEffectuees'] ?? 0,
            'tentativesMax' => $row['tentativesMax'] ?? 0,
            'userId' => $row['IDU'] ?? null,
        ];
    }

    /* private function formatModel(array $row)
    {
        return [
            'id' => (string) $row['idMod'],
            'id_fourn' => (string) ($row['id_fourn'] ?? ''),
            'name' => $row['nom'],
            'slug' => $row['slug'],
            'provider' => $row['provider'],
            'description' => $row['description'],
            'apiUrl' => $row['api_url'] ?? '',
            'capabilities' => $this->splitList($row['features'], '||'),
            'pricing' => $row['est_open_source'] ? 'free' : 'paid',
            'benchmarks' => $this->pairsToMap($row['performances']),
            'pricingPlans' => $this->modelPricingPlans($row['idMod']),
            'type' => $row['type'],
            'license' => $row['licence'],
            'openSource' => (bool) $row['est_open_source'],
            'multimodal' => (bool) $row['multimodal'],
            'hasApi' => (bool) $row['a_api'],
            'releaseDate' => $row['release_date'],
            'input_price' => isset($row['input_price']) ? (float) $row['input_price'] : null,
            'output_price' => isset($row['output_price']) ? (float) $row['output_price'] : null,
        ];
    } */

    private function formatModel(array $row)
    {
        $features = $this->splitList($row['features'] ?? '', '||');
        $benchmarks = $this->pairsToMap($row['performances'] ?? '');

        $pricing = (!empty($row['est_open_source']) && (bool) $row['est_open_source']) ? 'free' : 'paid';

        // La colonne 'multimodal' n'existe pas en base ; on peut la déduire du type si nécessaire
        $multimodal = false;
        if (!empty($row['type']) && stripos($row['type'], 'multimodal') !== false) {
            $multimodal = true;
        }

        return [
            'id' => (string) ($row['idMod'] ?? ''),
            'name' => $row['nom'] ?? '',
            'slug' => $row['slug'] ?? '',
            'provider' => $row['provider'] ?? '',
            'description' => $row['description'] ?? '',
            'capabilities' => $features,
            'pricing' => $pricing,
            'benchmarks' => $benchmarks,
            'type' => $row['type'] ?? '',
            'license' => null,                        // absent en base
            'openSource' => (bool) ($row['est_open_source'] ?? false),
            'multimodal' => $multimodal,                 // déduit du type
            'hasApi' => (bool) ($row['a_api'] ?? false),
            'releaseDate' => $row['release_date'] ?? null,
            'pricingPlans' => $this->modelPricingPlans($row['idMod'] ?? null),
        ];
    }



    /*  private function modelPricingPlans($modelId)
     {
         try {
             $stmt = $this->pdo->prepare("
                 SELECT pp.id_pricing_plans, pp.name, pp.price, pp.currency, pp.period, pp.description, pp.type
                 FROM pricing_plans pp
                 JOIN plan_models pm ON pm.id_pricing_plans = pp.id_pricing_plans
                 WHERE pm.idMod = :model_id
                 ORDER BY pp.price ASC
             ");
             $stmt->execute(['model_id' => $modelId]);

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
         } catch (\Throwable $e) {
             return [];
         }
     } */


    private function modelPricingPlans($modelId)
    {
        try {
            $stmt = $this->pdo->prepare("
            SELECT 
                pp.ID_PRICING_PLAN,
                pp.NOM,
                pp.PRIX,
                pp.DEVISE,
                pp.PERIODE,
                pp.DESCRIPTION,
                pp.TYPE,
                /* Prix input/output depuis MODEL_PRICING (une ligne par défaut) */
                mp.PRIX_ENTREE,
                mp.PRIX_SORTIE,
                mp.DEVISE AS pricing_devise,
                mp.UNITE,
                /* Fonctionnalités globales du plan */
                GROUP_CONCAT(DISTINCT feat.NOM SEPARATOR '||') AS feature_names,
                /* Limites associées au lien plan-modèle */
                (SELECT GROUP_CONCAT(CONCAT(l.TYPE_LIMITE, ':', l.VALEUR, ':', l.PERIODE) SEPARATOR '||')
                 FROM PRICING_MODELE_LIMITE l
                 JOIN PRICING_MODELE pm2 ON pm2.ID_PRICING_MODELE = l.ID_PRICING_MODELE
                 WHERE pm2.ID_PRICING_PLAN = pp.ID_PRICING_PLAN AND pm2.IDMOD = :model_id2
                ) AS limits
            FROM PRICING_PLANS pp
            JOIN PRICING_MODELE pm ON pm.ID_PRICING_PLAN = pp.ID_PRICING_PLAN
            LEFT JOIN FEATURE_PRICING fp ON fp.ID_PRICING_PLAN = pp.ID_PRICING_PLAN
            LEFT JOIN FEATURES feat ON feat.ID_FEATURE = fp.ID_FEATURE
            LEFT JOIN MODEL_PRICING mp ON mp.IDMOD = pm.IDMOD
            WHERE pm.IDMOD = :model_id
            GROUP BY pp.ID_PRICING_PLAN
            ORDER BY pp.PRIX ASC
        ");
            $stmt->execute([
                'model_id' => $modelId,
                'model_id2' => $modelId
            ]);
            $rows = $stmt->fetchAll();

            $plans = [];
            foreach ($rows as $row) {
                // Fonctionnalités du plan
                $features = $this->splitList($row['feature_names'] ?? '', '||');

                // Limites
                $limitsList = [];
                $limitPairs = $this->splitList($row['limits'] ?? '', '||');
                foreach ($limitPairs as $pair) {
                    [$type, $value, $period] = array_pad(explode(':', $pair, 3), 3, null);
                    if ($type && $value && $period) {
                        $limitsList[] = "$value $type / $period";
                    }
                }
                $limitsText = empty($limitsList) ? null : implode(', ', $limitsList);

                $plans[] = [
                    'id' => (string) $row['ID_PRICING_PLAN'],
                    'name' => $row['NOM'],
                    'price' => (float) $row['PRIX'],
                    'currency' => $row['DEVISE'],
                    'period' => $row['PERIODE'] ?: 'month',
                    'description' => $row['DESCRIPTION'],
                    'type' => $row['TYPE'],
                    'features' => $features,
                    // Informations spécifiques au modèle
                    'inputPrice' => isset($row['PRIX_ENTREE']) ? (float) $row['PRIX_ENTREE'] : null,
                    'outputPrice' => isset($row['PRIX_SORTIE']) ? (float) $row['PRIX_SORTIE'] : null,
                    'priceUnit' => $row['UNITE'] ?? 1000000, // tokens par défaut
                    'limits' => $limitsText,
                ];
            }
            return $plans;
        } catch (\Throwable $e) {
            return [];
        }
    }

    /* private function pricingPlans($toolId)
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
    } */

    private function pricingPlans($toolId)
    {
        $stmt = $this->pdo->prepare("
        SELECT 
            pp.ID_PRICING_PLAN,
            pp.NOM,
            pp.PRIX,
            pp.DEVISE,
            pp.PERIODE,
            pp.DESCRIPTION,
            pp.TYPE,
            GROUP_CONCAT(DISTINCT feat.NOM SEPARATOR '||') AS feature_names,
            GROUP_CONCAT(DISTINCT 
                CONCAT(
                    m.IDMOD, ':', 
                    m.NOM, ':', 
                    COALESCE(
                        (SELECT GROUP_CONCAT(f2.NOM SEPARATOR '||')
                         FROM FEATURE_MODELE fm
                         JOIN FEATURES f2 ON f2.ID_FEATURE = fm.ID_FEATURE
                         WHERE fm.IDMOD = m.IDMOD),
                        ''
                    )
                ) ORDER BY m.IDMOD SEPARATOR '||'
            ) AS models_with_features
        FROM PRICING_PLANS pp
        LEFT JOIN FEATURE_PRICING fp ON fp.ID_PRICING_PLAN = pp.ID_PRICING_PLAN
        LEFT JOIN FEATURES feat ON feat.ID_FEATURE = fp.ID_FEATURE
        LEFT JOIN PRICING_MODELE pm ON pm.ID_PRICING_PLAN = pp.ID_PRICING_PLAN
        LEFT JOIN MODELS m ON m.IDMOD = pm.IDMOD
        WHERE pp.IDOUT = :tool_id
        GROUP BY pp.ID_PRICING_PLAN
        ORDER BY pp.PRIX ASC
    ");
        $stmt->execute(['tool_id' => $toolId]);
        $rows = $stmt->fetchAll();

        $plans = [];
        foreach ($rows as $row) {
            // 1. Récupérer les fonctionnalités globales du plan
            $planFeatures = $this->splitList($row['feature_names'] ?? '', '||');

            // 2. Récupérer les modèles avec leurs fonctionnalités
            $models = [];
            $modelStrings = $this->splitList($row['models_with_features'] ?? '', '||');
            foreach ($modelStrings as $modelStr) {
                $parts = explode(':', $modelStr, 3);
                if (count($parts) >= 2) {
                    $modelId = $parts[0];
                    $modelName = $parts[1];
                    $modelFeatures = isset($parts[2]) && !empty($parts[2]) ? explode('||', $parts[2]) : [];

                    // Récupérer les limites (comme avant)
                    $limits = $this->getModelLimitsForPlan($row['ID_PRICING_PLAN'], $modelId);

                    $models[] = [
                        'modelId' => $modelId,
                        'name' => $modelName,
                        'limits' => $limits,
                        'features' => $modelFeatures,   // <-- ajout des fonctionnalités du modèle
                    ];
                }
            }

            $plans[] = [
                'id' => (string) $row['ID_PRICING_PLAN'],
                'name' => $row['NOM'],
                'price' => (float) $row['PRIX'],
                'currency' => $row['DEVISE'],
                'period' => $row['PERIODE'] ?: 'month',
                'description' => $row['DESCRIPTION'],
                'type' => $row['TYPE'],
                'features' => $planFeatures,
                'availableModels' => $models,
            ];
        }
        return $plans;
    }

    // Méthode utilitaire pour récupérer les limites d'un modèle pour un plan donné
    private function getModelLimitsForPlan($planId, $modelId)
    {
        $stmt = $this->pdo->prepare("
        SELECT TYPE_LIMITE, VALEUR, PERIODE
        FROM PRICING_MODELE_LIMITE l
        JOIN PRICING_MODELE pm ON pm.ID_PRICING_MODELE = l.ID_PRICING_MODELE
        WHERE pm.ID_PRICING_PLAN = :plan_id AND pm.IDMOD = :model_id
    ");
        $stmt->execute(['plan_id' => $planId, 'model_id' => $modelId]);
        $limits = $stmt->fetchAll();
        if (empty($limits))
            return null;
        return implode(', ', array_map(fn($l) => "{$l['VALEUR']} {$l['TYPE_LIMITE']} / {$l['PERIODE']}", $limits));
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
