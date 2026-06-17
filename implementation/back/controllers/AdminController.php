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

    /* public function dashboard(array $data)
    {
        $this->requireAdmin($data);
        $pdo = require __DIR__ . '/../config/database.php';

        // Pending tools from soumission_outil
        $stmt = $pdo->query("
            SELECT s.id_soum AS id, s.statut, s.created_at AS createdAt,
                   u.nom AS userName, u.prenom AS userFirstName,
                   o.nom AS toolName, o.idOut
            FROM soumission_outil s
            JOIN utilisateur u ON u.idU = s.idU
            LEFT JOIN outils o ON o.idOut = s.idOut
            WHERE s.statut = 'en_attente'
            ORDER BY s.created_at DESC
            LIMIT 5
        ");
        $pendingTools = $stmt->fetchAll();

        // Recent reports
        $stmt = $pdo->query("
            SELECT s.id_Sig AS id, s.motif AS reason, s.statut, s.date AS createdAt,
                   o.nom AS toolName, a.id_avis AS commentId
            FROM signalements s
            LEFT JOIN outils o ON o.idOut = s.idOut
            LEFT JOIN avis a ON a.id_avis = s.id_com
            WHERE s.statut = 'en_attente'
            ORDER BY s.date DESC
            LIMIT 5
        ");
        $pendingReports = $stmt->fetchAll();

        ok([
            'stats' => $this->catalog->stats(),
            'pendingTools' => $pendingTools,
            'pendingReports' => $pendingReports,
            'users' => array_slice($this->users->all(), 0, 5),
        ]);
    }
 */

    public function dashboard(array $data)
    {
        $this->requireAdmin($data);
        $pdo = require __DIR__ . '/../config/database.php';

        // Outils en attente (soumissions)
        $stmt = $pdo->query("
        SELECT s.ID_SOUMISSION AS id, s.STATUT, s.DATE_MISE_A_JOUR AS createdAt,
               u.NOM AS userName, u.PRENOM AS userFirstName,
               o.NOM AS toolName, o.IDOUT
        FROM SOUMISSION_OUTIL s
        JOIN UTILISATEUR u ON u.IDU = s.IDU
        LEFT JOIN OUTILS o ON o.IDOUT = s.IDOUT
        WHERE s.STATUT = 'en_attente'
        ORDER BY s.DATE_MISE_A_JOUR DESC
        LIMIT 5
    ");
        $pendingTools = $stmt->fetchAll();

        // Signalements récents
        $stmt = $pdo->query("
        SELECT s.ID_SIGNALEMENT AS id, s.MOTIF AS reason, s.STATUT, s.DATE_MISE_A_JOUR AS createdAt,
               o.NOM AS toolName, a.ID_COMMENTAIRE AS commentId
        FROM SIGNALEMENTS s
        LEFT JOIN OUTILS o ON o.IDOUT = s.IDOUT
        LEFT JOIN COMMENTAIRES a ON a.ID_COMMENTAIRE = s.ID_COMMENTAIRE
        WHERE s.STATUT = 'en_attente'
        ORDER BY s.DATE_MISE_A_JOUR DESC
        LIMIT 5
    ");
        $pendingReports = $stmt->fetchAll();

        ok([
            'stats' => $this->catalog->stats(),
            'pendingTools' => $pendingTools,
            'pendingReports' => $pendingReports,
            'users' => array_slice($this->users->all(), 0, 5),
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

    public function models(array $data)
    {
        $this->requireAdmin($data);
        ok(['models' => $this->catalog->models()]);
    }

    /* public function providers(array $data)
    {
        $this->requireAdmin($data);
        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->query("SELECT id_fourn AS id, nom AS name FROM fournisseur ORDER BY nom ASC");
        ok(['providers' => $stmt->fetchAll()]);
    } */

    public function providers(array $data)
    {
        $this->requireAdmin($data);
        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->query("SELECT ID_FOURNISSEUR AS id, NOM AS name FROM FOURNISSEUR ORDER BY NOM ASC");
        ok(['providers' => $stmt->fetchAll()]);
    }
    /* public function features(array $data)
    {
        $this->requireAdmin($data);
        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->query("SELECT id_features AS id, name FROM features ORDER BY name ASC");
        ok(['features' => $stmt->fetchAll()]);
    }

    public function plans(array $data)
    {
        $this->requireAdmin($data);
        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->query("
            SELECT pp.id_pricing_plans AS id, CONCAT(o.nom, ' - ', pp.name) AS name 
            FROM pricing_plans pp 
            JOIN outils o ON o.idOut = pp.idOut 
            ORDER BY o.nom, pp.price
        ");
        ok(['plans' => $stmt->fetchAll()]);
    } */


    public function features(array $data)
    {
        $this->requireAdmin($data);
        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->query("SELECT ID_FEATURE AS id, NOM AS name FROM FEATURES ORDER BY NOM ASC");
        ok(['features' => $stmt->fetchAll()]);
    }

    public function plans(array $data)
    {
        $this->requireAdmin($data);
        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->query("
        SELECT pp.ID_PRICING_PLAN AS id, CONCAT(o.NOM, ' - ', pp.NOM) AS name 
        FROM PRICING_PLANS pp 
        JOIN OUTILS o ON o.IDOUT = pp.IDOUT 
        ORDER BY o.NOM, pp.PRIX
    ");
        ok(['plans' => $stmt->fetchAll()]);
    }
    public function createModel(array $data)
    {
        $this->requireAdmin($data);

        $name = cleanString($data['name'] ?? $data['nom'] ?? '');
        if ($name === '') {
            fail('Le nom du modele est obligatoire');
        }

        $model = $this->saveModel($data);
        ok(['model' => $model], 'Modele cree avec succes');
    }

    public function updateModel(array $data)
    {
        $this->requireAdmin($data);

        $id = $data['id'] ?? $data['idMod'] ?? null;
        if (!$id || !ctype_digit((string) $id)) {
            fail('Modele invalide');
        }

        $model = $this->saveModel($data);
        ok(['model' => $model], 'Modele mis a jour avec succes');
    }

    /* public function deleteModel(array $data)
    {
        $this->requireAdmin($data);

        $id = $data['id'] ?? $data['idMod'] ?? null;
        if (!$id || !ctype_digit((string) $id)) {
            fail('Modele invalide');
        }

        $pdo = require __DIR__ . '/../config/database.php';

        // Check if model is used by tools
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM outil_model WHERE idMod = :id');
        $stmt->execute(['id' => (int) $id]);
        if ($stmt->fetchColumn() > 0) {
            fail('Ce modele ne peut pas etre supprime car il est utilise par des outils');
        }

        $stmt = $pdo->prepare('DELETE FROM models WHERE idMod = :id');
        $stmt->execute(['id' => (int) $id]);

        if ($stmt->rowCount() === 0) {
            fail('Modele introuvable', 404);
        }

        ok(['id' => (string) $id], 'Modele supprime avec succes');
    }
 */

    public function deleteModel(array $data)
    {
        $this->requireAdmin($data);

        $id = $data['id'] ?? $data['idMod'] ?? null;
        if (!$id || !ctype_digit((string) $id)) {
            fail('Modele invalide');
        }

        $pdo = require __DIR__ . '/../config/database.php';

        // Vérifier si le modèle est utilisé par des outils
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM OUTIL_MODELE WHERE IDMOD = :id');
        $stmt->execute(['id' => (int) $id]);
        if ($stmt->fetchColumn() > 0) {
            fail('Ce modele ne peut pas etre supprime car il est utilise par des outils');
        }

        // Supprimer le modèle
        $stmt = $pdo->prepare('DELETE FROM MODELS WHERE IDMOD = :id');
        $stmt->execute(['id' => (int) $id]);

        if ($stmt->rowCount() === 0) {
            fail('Modele introuvable', 404);
        }

        ok(['id' => (string) $id], 'Modele supprime avec succes');
    }
    /* private function saveModel(array $data)
    {
        $pdo = require __DIR__ . '/../config/database.php';
        $id = $data['id'] ?? $data['idMod'] ?? null;
        $name = cleanString($data['name'] ?? $data['nom'] ?? '');
        $baseSlug = $data['slug'] ?? slugify($name);
        // Ensure unique slug in models table
        $slug = $baseSlug;
        $counter = 1;
        while (true) {
            if ($id) {
                $chk = $pdo->prepare("SELECT COUNT(*) FROM models WHERE slug = :slug AND idMod != :id");
                $chk->execute(['slug' => $slug, 'id' => $id]);
            } else {
                $chk = $pdo->prepare("SELECT COUNT(*) FROM models WHERE slug = :slug");
                $chk->execute(['slug' => $slug]);
            }
            if ((int) $chk->fetchColumn() === 0)
                break;
            $slug = $baseSlug . '-' . (++$counter);
        }
        $type = cleanString($data['type'] ?? '');
        $description = cleanString($data['description'] ?? '');
        $licence = cleanString($data['licence'] ?? $data['license'] ?? '');
        $apiUrl = cleanString($data['api_url'] ?? '');
        $isOpenSource = (int) ($data['est_open_source'] ?? $data['openSource'] ?? 0);
        $multimodal = (int) ($data['multimodal'] ?? 0);
        $hasApi = (int) ($data['a_api'] ?? $data['hasApi'] ?? 0);
        $releaseDate = $data['release_date'] ?? $data['releaseDate'] ?? null;
        if ($releaseDate === '')
            $releaseDate = null;
        $idFourn = $data['id_fourn'] ?? $data['providerId'] ?? null;
        $providerName = cleanString($data['provider_name'] ?? '');
        $performances = $data['performances'] ?? [];
        $features = $data['features'] ?? [];
        $plans = $data['plans'] ?? [];
        $inputPrice = $data['input_price'] ?? null;
        $outputPrice = $data['output_price'] ?? null;

        // Create a new provider inline if requested
        if ($idFourn === 'new' || ($providerName && !$idFourn)) {
            if (!$providerName)
                fail('Le nom du nouveau fournisseur est obligatoire');
            $stmt = $pdo->prepare("INSERT INTO fournisseur (nom) VALUES (:name)");
            $stmt->execute(['name' => $providerName]);
            $idFourn = $pdo->lastInsertId();
        }

        if (!$idFourn) {
            $stmt = $pdo->query("SELECT id_fourn FROM fournisseur LIMIT 1");
            $idFourn = $stmt->fetchColumn();
            if (!$idFourn)
                fail('Aucun fournisseur disponible. Veuillez d\'abord creer un fournisseur.');
        }

        if ($id) {
            $exists = $pdo->prepare('SELECT idMod FROM models WHERE idMod = :id LIMIT 1');
            $exists->execute(['id' => $id]);
            if (!$exists->fetch())
                fail('Modele introuvable', 404);

            $stmt = $pdo->prepare("
                UPDATE models
                SET nom = :name, slug = :slug, type = :type, description = :description,
                    licence = :licence, api_url = :apiUrl, est_open_source = :isOpenSource,
                    release_date = :releaseDate, multimodal = :multimodal, a_api = :hasApi,
                    id_fourn = :idFourn
                WHERE idMod = :id
            ");
            $stmt->execute([
                'name' => $name,
                'slug' => $slug,
                'type' => $type,
                'description' => $description,
                'licence' => $licence,
                'apiUrl' => $apiUrl,
                'isOpenSource' => $isOpenSource,
                'releaseDate' => $releaseDate,
                'multimodal' => $multimodal,
                'hasApi' => $hasApi,
                'idFourn' => $idFourn,
                'id' => $id
            ]);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO models (nom, slug, type, description, licence, api_url, est_open_source, release_date, multimodal, a_api, id_fourn)
                VALUES (:name, :slug, :type, :description, :licence, :apiUrl, :isOpenSource, :releaseDate, :multimodal, :hasApi, :idFourn)
            ");
            $stmt->execute([
                'name' => $name,
                'slug' => $slug,
                'type' => $type,
                'description' => $description,
                'licence' => $licence,
                'apiUrl' => $apiUrl,
                'isOpenSource' => $isOpenSource,
                'releaseDate' => $releaseDate,
                'multimodal' => $multimodal,
                'hasApi' => $hasApi,
                'idFourn' => $idFourn
            ]);
            $id = (int) $pdo->lastInsertId();
        }

        // Handle performances
        $pdo->prepare("DELETE FROM model_performance WHERE idMod = :id")->execute(['id' => $id]);
        if (!empty($performances) && is_array($performances)) {
            foreach ($performances as $perf) {
                $domain = cleanString($perf['domain'] ?? $perf['domaine'] ?? '');
                $score = (int) ($perf['score'] ?? 0);
                if ($domain !== '') {
                    $insPerf = $pdo->prepare("INSERT INTO performance (domaine, score) VALUES (:domain, :score)");
                    $insPerf->execute(['domain' => $domain, 'score' => $score]);
                    $perfId = $pdo->lastInsertId();

                    $pdo->prepare("INSERT INTO model_performance (idMod, id_performance) VALUES (:idMod, :idPerf)")
                        ->execute(['idMod' => $id, 'idPerf' => $perfId]);
                }
            }
        }

        // Handle capabilities (free-text) or features (IDs)
        $capabilities = $data['capabilities'] ?? [];
        $pdo->prepare("DELETE FROM model_feature WHERE idMod = :id")->execute(['id' => $id]);

        if (!empty($capabilities) && is_array($capabilities)) {
            // Free-text: find or create each feature by name
            $stmtInsert = $pdo->prepare("INSERT INTO model_feature (idMod, id_features) VALUES (:idMod, :idFeat)");
            foreach ($capabilities as $capName) {
                $capName = cleanString($capName);
                if ($capName === '')
                    continue;
                $stmtFind = $pdo->prepare("SELECT id_features FROM features WHERE name = :name LIMIT 1");
                $stmtFind->execute(['name' => $capName]);
                $featId = $stmtFind->fetchColumn();
                if (!$featId) {
                    $pdo->prepare("INSERT INTO features (name) VALUES (:name)")->execute(['name' => $capName]);
                    $featId = $pdo->lastInsertId();
                }
                $stmtInsert->execute(['idMod' => $id, 'idFeat' => $featId]);
            }
        } elseif (!empty($features) && is_array($features)) {
            // Feature IDs (legacy)
            $stmt = $pdo->prepare("INSERT INTO model_feature (idMod, id_features) VALUES (:idMod, :idFeat)");
            foreach ($features as $featId) {
                $stmt->execute(['idMod' => $id, 'idFeat' => $featId]);
            }
        }

        // Handle tags (free-text) → find or create in tags table + model_tag junction
        $tags = $data['tags'] ?? [];
        if (!empty($tags) && is_array($tags)) {
            try {
                $pdo->prepare("DELETE FROM model_tag WHERE idMod = :id")->execute(['id' => $id]);
                $stmtInsertTag = $pdo->prepare("INSERT INTO model_tag (idMod, id_tag) VALUES (:idMod, :idTag)");
                foreach ($tags as $tagName) {
                    $tagName = cleanString($tagName);
                    if ($tagName === '')
                        continue;
                    $tagSlug = slugify($tagName);
                    // Case-insensitive lookup
                    $stmtFindTag = $pdo->prepare("SELECT id_tag FROM tags WHERE LOWER(nom) = LOWER(:name) OR slug = :slug LIMIT 1");
                    $stmtFindTag->execute(['name' => $tagName, 'slug' => $tagSlug]);
                    $tagId = $stmtFindTag->fetchColumn();
                    if (!$tagId) {
                        // INSERT IGNORE silently skips duplicate slug violations
                        $pdo->prepare("INSERT IGNORE INTO tags (nom, slug) VALUES (:name, :slug)")
                            ->execute(['name' => $tagName, 'slug' => $tagSlug]);
                        $tagId = $pdo->lastInsertId();
                        // If INSERT IGNORE skipped due to duplicate, fetch the existing row
                        if (!$tagId) {
                            $stmtRefetch = $pdo->prepare("SELECT id_tag FROM tags WHERE slug = :slug LIMIT 1");
                            $stmtRefetch->execute(['slug' => $tagSlug]);
                            $tagId = $stmtRefetch->fetchColumn();
                        }
                    }
                    if ($tagId) {
                        $stmtInsertTag->execute(['idMod' => $id, 'idTag' => $tagId]);
                    }
                }
            } catch (\Throwable $e) {
                // model_tag table may not exist yet — fail silently
            }
        }

        // Handle pricing plans (create new plans and link via plan_models)
        $pricingPlansData = $data['pricingPlans'] ?? [];
        try {
            // Remove old plan links and delete orphaned model-only plans (idOut IS NULL)
            $oldPlans = $pdo->prepare("SELECT id_pricing_plans FROM plan_models WHERE idMod = :id");
            $oldPlans->execute(['id' => $id]);
            $oldPlanIds = $oldPlans->fetchAll(PDO::FETCH_COLUMN);
            $pdo->prepare("DELETE FROM plan_models WHERE idMod = :id")->execute(['id' => $id]);
            foreach ($oldPlanIds as $oldPlanId) {
                $usedBy = $pdo->prepare("SELECT COUNT(*) FROM plan_models WHERE id_pricing_plans = :pid");
                $usedBy->execute(['pid' => $oldPlanId]);
                $toolCheck = $pdo->prepare("SELECT idOut FROM pricing_plans WHERE id_pricing_plans = :pid");
                $toolCheck->execute(['pid' => $oldPlanId]);
                $linkedTool = $toolCheck->fetchColumn();
                if ($usedBy->fetchColumn() == 0 && !$linkedTool) {
                    $pdo->prepare("DELETE FROM pricing_plans WHERE id_pricing_plans = :pid")->execute(['pid' => $oldPlanId]);
                }
            }
            if (!empty($pricingPlansData) && is_array($pricingPlansData)) {
                $stmtPlan = $pdo->prepare("
                    INSERT INTO pricing_plans (name, price, currency, period, type, description, idOut)
                    VALUES (:name, :price, :currency, :period, :type, :description, NULL)
                ");
                $stmtLink = $pdo->prepare("INSERT INTO plan_models (idMod, id_pricing_plans) VALUES (:idMod, :idPlan)");
                foreach ($pricingPlansData as $plan) {
                    $planName = cleanString($plan['name'] ?? '');
                    if ($planName === '')
                        continue;
                    $stmtPlan->execute([
                        'name' => $planName,
                        'price' => (float) ($plan['price'] ?? 0),
                        'currency' => cleanString($plan['currency'] ?? 'USD'),
                        'period' => cleanString($plan['period'] ?? 'month'),
                        'type' => cleanString($plan['type'] ?? 'paid'),
                        'description' => cleanString($plan['description'] ?? ''),
                    ]);
                    $stmtLink->execute(['idMod' => $id, 'idPlan' => $pdo->lastInsertId()]);
                }
            }
        } catch (\Throwable $e) {
            // Tables plan_models / pricing_plans may not be configured yet — skip silently
            // Run the SQL below in phpMyAdmin to enable plan saving:
            // ALTER TABLE pricing_plans MODIFY idOut INT NULL;
            // CREATE TABLE IF NOT EXISTS plan_models (idMod INT NOT NULL, id_pricing_plans INT NOT NULL, PRIMARY KEY (idMod, id_pricing_plans));
        }

        return $this->catalog->model($id);
    } */


    private function saveModel(array $data)
    {
        $pdo = require __DIR__ . '/../config/database.php';
        $id = $data['id'] ?? $data['idMod'] ?? null;
        $name = cleanString($data['name'] ?? $data['nom'] ?? '');
        $baseSlug = $data['slug'] ?? slugify($name);
        // Ensure unique slug in MODELS table
        $slug = $baseSlug;
        $counter = 1;
        while (true) {
            if ($id) {
                $chk = $pdo->prepare("SELECT COUNT(*) FROM MODELS WHERE SLUG = :slug AND IDMOD != :id");
                $chk->execute(['slug' => $slug, 'id' => $id]);
            } else {
                $chk = $pdo->prepare("SELECT COUNT(*) FROM MODELS WHERE SLUG = :slug");
                $chk->execute(['slug' => $slug]);
            }
            if ((int) $chk->fetchColumn() === 0)
                break;
            $slug = $baseSlug . '-' . (++$counter);
        }
        $type = cleanString($data['type'] ?? '');
        $description = cleanString($data['description'] ?? '');
        $licence = cleanString($data['licence'] ?? $data['license'] ?? '');
        $apiUrl = cleanString($data['api_url'] ?? '');
        $isOpenSource = (int) ($data['est_open_source'] ?? $data['openSource'] ?? 0);
        $multimodal = (int) ($data['multimodal'] ?? 0);
        $hasApi = (int) ($data['a_api'] ?? $data['hasApi'] ?? 0);
        $releaseDate = $data['release_date'] ?? $data['releaseDate'] ?? null;
        if ($releaseDate === '')
            $releaseDate = null;
        $idFourn = $data['id_fourn'] ?? $data['providerId'] ?? null;
        $providerName = cleanString($data['provider_name'] ?? '');
        $performances = $data['performances'] ?? [];
        $features = $data['features'] ?? [];
        $plans = $data['plans'] ?? [];
        $inputPrice = $data['input_price'] ?? null;
        $outputPrice = $data['output_price'] ?? null;

        // Create a new provider inline if requested
        if ($idFourn === 'new' || ($providerName && !$idFourn)) {
            if (!$providerName)
                fail('Le nom du nouveau fournisseur est obligatoire');
            $stmt = $pdo->prepare("INSERT INTO FOURNISSEUR (NOM) VALUES (:name)");
            $stmt->execute(['name' => $providerName]);
            $idFourn = $pdo->lastInsertId();
        }

        if (!$idFourn) {
            $stmt = $pdo->query("SELECT ID_FOURNISSEUR FROM FOURNISSEUR LIMIT 1");
            $idFourn = $stmt->fetchColumn();
            if (!$idFourn)
                fail('Aucun fournisseur disponible. Veuillez d\'abord creer un fournisseur.');
        }

        if ($id) {
            $exists = $pdo->prepare('SELECT IDMOD FROM MODELS WHERE IDMOD = :id LIMIT 1');
            $exists->execute(['id' => $id]);
            if (!$exists->fetch())
                fail('Modele introuvable', 404);

            $stmt = $pdo->prepare("
            UPDATE MODELS
            SET NOM = :name, SLUG = :slug, TYPE = :type, DESCRIPTION = :description,
                API_URL = :apiUrl, EST_OPEN_SOURCE = :isOpenSource,
                DATE_SORTIE = :releaseDate, POSSEDE_API = :hasApi,
                ID_FOURNISSEUR = :idFourn
            WHERE IDMOD = :id
        ");
            $stmt->execute([
                'name' => $name,
                'slug' => $slug,
                'type' => $type,
                'description' => $description,
                'apiUrl' => $apiUrl,
                'isOpenSource' => $isOpenSource,
                'releaseDate' => $releaseDate,
                'hasApi' => $hasApi,
                'idFourn' => $idFourn,
                'id' => $id
            ]);
        } else {
            $stmt = $pdo->prepare("
            INSERT INTO MODELS (NOM, SLUG, TYPE, DESCRIPTION, API_URL, EST_OPEN_SOURCE, DATE_SORTIE, POSSEDE_API, ID_FOURNISSEUR)
            VALUES (:name, :slug, :type, :description, :apiUrl, :isOpenSource, :releaseDate, :hasApi, :idFourn)
        ");
            $stmt->execute([
                'name' => $name,
                'slug' => $slug,
                'type' => $type,
                'description' => $description,
                'apiUrl' => $apiUrl,
                'isOpenSource' => $isOpenSource,
                'releaseDate' => $releaseDate,
                'hasApi' => $hasApi,
                'idFourn' => $idFourn
            ]);
            $id = (int) $pdo->lastInsertId();
        }

        // Handle performances (table PERFORMANCE et PERFORMANCE_MODELE)
        $pdo->prepare("DELETE FROM PERFORMANCE_MODELE WHERE IDMOD = :id")->execute(['id' => $id]);
        if (!empty($performances) && is_array($performances)) {
            foreach ($performances as $perf) {
                $domain = cleanString($perf['domain'] ?? $perf['domaine'] ?? '');
                $score = (int) ($perf['score'] ?? 0);
                if ($domain !== '') {
                    // Vérifier si le domaine existe déjà
                    $stmtCheck = $pdo->prepare("SELECT ID_PERFORMANCE FROM PERFORMANCE WHERE DOMAINE = :domain LIMIT 1");
                    $stmtCheck->execute(['domain' => $domain]);
                    $perfId = $stmtCheck->fetchColumn();
                    if (!$perfId) {
                        $insPerf = $pdo->prepare("INSERT INTO PERFORMANCE (DOMAINE) VALUES (:domain)");
                        $insPerf->execute(['domain' => $domain]);
                        $perfId = $pdo->lastInsertId();
                    }
                    $pdo->prepare("INSERT INTO PERFORMANCE_MODELE (IDMOD, ID_PERFORMANCE, SCORE) VALUES (:idMod, :idPerf, :score)")
                        ->execute(['idMod' => $id, 'idPerf' => $perfId, 'score' => $score]);
                }
            }
        }

        // Handle capabilities (free-text) or features (IDs) via table FEATURE_MODELE
        $capabilities = $data['capabilities'] ?? [];
        $pdo->prepare("DELETE FROM FEATURE_MODELE WHERE IDMOD = :id")->execute(['id' => $id]);

        if (!empty($capabilities) && is_array($capabilities)) {
            $stmtInsert = $pdo->prepare("INSERT INTO FEATURE_MODELE (IDMOD, ID_FEATURE) VALUES (:idMod, :idFeat)");
            foreach ($capabilities as $capName) {
                $capName = cleanString($capName);
                if ($capName === '')
                    continue;
                $stmtFind = $pdo->prepare("SELECT ID_FEATURE FROM FEATURES WHERE NOM = :name LIMIT 1");
                $stmtFind->execute(['name' => $capName]);
                $featId = $stmtFind->fetchColumn();
                if (!$featId) {
                    $pdo->prepare("INSERT INTO FEATURES (NOM) VALUES (:name)")->execute(['name' => $capName]);
                    $featId = $pdo->lastInsertId();
                }
                $stmtInsert->execute(['idMod' => $id, 'idFeat' => $featId]);
            }
        } elseif (!empty($features) && is_array($features)) {
            $stmt = $pdo->prepare("INSERT INTO FEATURE_MODELE (IDMOD, ID_FEATURE) VALUES (:idMod, :idFeat)");
            foreach ($features as $featId) {
                $stmt->execute(['idMod' => $id, 'idFeat' => $featId]);
            }
        }

        // Handle tags (free-text) — table TAGS et MODEL_TAG
        $tags = $data['tags'] ?? [];
        if (!empty($tags) && is_array($tags)) {
            try {
                // Supprimer les anciens tags du modèle
                $pdo->prepare("DELETE FROM MODEL_TAG WHERE IDMOD = :id")->execute(['id' => $id]);
                $stmtInsertTag = $pdo->prepare("INSERT INTO MODEL_TAG (IDMOD, ID_TAG) VALUES (:idMod, :idTag)");
                foreach ($tags as $tagName) {
                    $tagName = cleanString($tagName);
                    if ($tagName === '')
                        continue;
                    $tagSlug = slugify($tagName);
                    $stmtFindTag = $pdo->prepare("SELECT ID_TAG FROM TAGS WHERE LOWER(NOM) = LOWER(:name) OR SLUG = :slug LIMIT 1");
                    $stmtFindTag->execute(['name' => $tagName, 'slug' => $tagSlug]);
                    $tagId = $stmtFindTag->fetchColumn();
                    if (!$tagId) {
                        $pdo->prepare("INSERT INTO TAGS (NOM, SLUG) VALUES (:name, :slug)")->execute(['name' => $tagName, 'slug' => $tagSlug]);
                        $tagId = $pdo->lastInsertId();
                        if (!$tagId) {
                            $stmtRefetch = $pdo->prepare("SELECT ID_TAG FROM TAGS WHERE SLUG = :slug LIMIT 1");
                            $stmtRefetch->execute(['slug' => $tagSlug]);
                            $tagId = $stmtRefetch->fetchColumn();
                        }
                    }
                    if ($tagId) {
                        $stmtInsertTag->execute(['idMod' => $id, 'idTag' => $tagId]);
                    }
                }
            } catch (\Throwable $e) {
                // Table MODEL_TAG peut ne pas exister – ignorer silencieusement
            }
        }

        // Handle pricing plans (table PRICING_PLANS, PRICING_MODELE, PRICING_MODELE_LIMITE)
        $pricingPlansData = $data['pricingPlans'] ?? [];
        try {
            // Récupérer les anciens liens plan-modèle
            $oldPlans = $pdo->prepare("SELECT ID_PRICING_PLAN FROM PRICING_MODELE WHERE IDMOD = :id");
            $oldPlans->execute(['id' => $id]);
            $oldPlanIds = $oldPlans->fetchAll(PDO::FETCH_COLUMN);
            $pdo->prepare("DELETE FROM PRICING_MODELE WHERE IDMOD = :id")->execute(['id' => $id]);

            // Supprimer les plans orphelins (ceux qui ne sont liés ni à un outil ni à un autre modèle)
            foreach ($oldPlanIds as $oldPlanId) {
                $usedByModel = $pdo->prepare("SELECT COUNT(*) FROM PRICING_MODELE WHERE ID_PRICING_PLAN = :pid");
                $usedByModel->execute(['pid' => $oldPlanId]);
                $usedByTool = $pdo->prepare("SELECT IDOUT FROM PRICING_PLANS WHERE ID_PRICING_PLAN = :pid");
                $usedByTool->execute(['pid' => $oldPlanId]);
                $linkedTool = $usedByTool->fetchColumn();
                if ($usedByModel->fetchColumn() == 0 && !$linkedTool) {
                    $pdo->prepare("DELETE FROM PRICING_PLANS WHERE ID_PRICING_PLAN = :pid")->execute(['pid' => $oldPlanId]);
                }
            }

            if (!empty($pricingPlansData) && is_array($pricingPlansData)) {
                $stmtPlan = $pdo->prepare("
                INSERT INTO PRICING_PLANS (NOM, PRIX, DEVISE, PERIODE, TYPE, DESCRIPTION, IDOUT)
                VALUES (:name, :price, :currency, :period, :type, :description, NULL)
            ");
                $stmtLink = $pdo->prepare("INSERT INTO PRICING_MODELE (ID_PRICING_PLAN, IDMOD) VALUES (:idPlan, :idMod)");
                foreach ($pricingPlansData as $plan) {
                    $planName = cleanString($plan['name'] ?? '');
                    if ($planName === '')
                        continue;
                    $stmtPlan->execute([
                        'name' => $planName,
                        'price' => (float) ($plan['price'] ?? 0),
                        'currency' => cleanString($plan['currency'] ?? 'USD'),
                        'period' => cleanString($plan['period'] ?? 'month'),
                        'type' => cleanString($plan['type'] ?? 'paid'),
                        'description' => cleanString($plan['description'] ?? ''),
                    ]);
                    $planId = $pdo->lastInsertId();
                    $stmtLink->execute(['idPlan' => $planId, 'idMod' => $id]);

                    // Gérer les limites si présentes (PRICING_MODELE_LIMITE)
                    if (!empty($plan['limits']) && is_array($plan['limits'])) {
                        $stmtLimit = $pdo->prepare("
                        INSERT INTO PRICING_MODELE_LIMITE (ID_PRICING_MODELE, TYPE_LIMITE, VALEUR, PERIODE)
                        VALUES ((SELECT ID_PRICING_MODELE FROM PRICING_MODELE WHERE ID_PRICING_PLAN = :idPlan AND IDMOD = :idMod), :type, :value, :period)
                    ");
                        foreach ($plan['limits'] as $limit) {
                            $limitType = cleanString($limit['type'] ?? '');
                            $limitValue = (int) ($limit['value'] ?? 0);
                            $limitPeriod = cleanString($limit['period'] ?? '');
                            if ($limitType && $limitValue && $limitPeriod) {
                                $stmtLimit->execute([
                                    'idPlan' => $planId,
                                    'idMod' => $id,
                                    'type' => $limitType,
                                    'value' => $limitValue,
                                    'period' => $limitPeriod
                                ]);
                            }
                        }
                    }
                }
            }
        } catch (\Throwable $e) {
            // Les tables PRICING_MODELE ou PRICING_MODELE_LIMITE peuvent ne pas exister – ignorer silencieusement
        }

        // Gérer les prix input/output via MODEL_PRICING (si renseignés)
        if ($inputPrice !== null || $outputPrice !== null) {
            // Supprimer l'ancien prix si existant (ou on peut gérer l'historique avec DATE_EFFECTIVE)
            $pdo->prepare("DELETE FROM MODEL_PRICING WHERE IDMOD = :id")->execute(['id' => $id]);
            $stmtPrice = $pdo->prepare("
            INSERT INTO MODEL_PRICING (IDMOD, PRIX_ENTREE, PRIX_SORTIE, DEVISE, UNITE, DATE_EFFECTIVE)
            VALUES (:id, :input, :output, :currency, :unit, CURDATE())
        ");
            $stmtPrice->execute([
                'id' => $id,
                'input' => $inputPrice !== null ? (float) $inputPrice : null,
                'output' => $outputPrice !== null ? (float) $outputPrice : null,
                'currency' => cleanString($data['currency'] ?? 'USD'),
                'unit' => (int) ($data['priceUnit'] ?? 1000000)
            ]);
        }

        return $this->catalog->model($id);
    }

    private function fetchG2Ratings(string $toolName): ?array
    {
        $apifyToken = 'apify_api_ItJl4oVyDFnnfVqVyBa65RWMFqLvsY3yVRvI';
        $actorId = 'factden~g2-reviews-scraper';
        $encodedTool = urlencode($toolName);
        $g2Url = "https://www.g2.com/products/{$encodedTool}/reviews";

        // 1. Lancer l'acteur
        $ch = curl_init("https://api.apify.com/v2/acts/{$actorId}/runs?token={$apifyToken}");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        // 👉 FORMAT CORRIGÉ : utilisation de "startUrls"
        $postFields = json_encode([
            "mode" => "reviews",
            "startUrls" => [$g2Url],
            "maxReviewsPerProduct" => 20  // Récupérer plus d'avis pour une moyenne plus fiable
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 201) {
            error_log("G2 scraping run failed: HTTP $httpCode - $response");
            return null;
        }

        $runData = json_decode($response, true);
        $runId = $runData['data']['id'] ?? null;
        // 👉 Récupération de l'ID du dataset des avis (reviews)
        $reviewsDatasetId = $runData['data']['storageIds']['datasets']['reviews'] ?? null;

        if (!$runId || !$reviewsDatasetId) {
            error_log("Missing runId or reviewsDatasetId in Apify response");
            return null;
        }

        // 2. Attendre la fin du run (polling)
        $status = '';
        $maxAttempts = 30; // 30 * 2s = 60 secondes max d'attente
        for ($i = 0; $i < $maxAttempts; $i++) {
            sleep(2);
            $statusUrl = "https://api.apify.com/v2/acts/{$actorId}/runs/{$runId}?token={$apifyToken}";
            $statusResp = file_get_contents($statusUrl);
            $statusData = json_decode($statusResp, true);
            $status = $statusData['data']['status'] ?? '';
            if ($status === 'SUCCEEDED') {
                break;
            }
            if ($status === 'FAILED' || $status === 'TIMED-OUT') {
                error_log("Run $runId terminated with status $status");
                return null;
            }
        }

        if ($status !== 'SUCCEEDED') {
            error_log("Run $runId did not succeed after $maxAttempts attempts");
            return null;
        }

        // 3. Récupérer les avis depuis le dataset
        $itemsUrl = "https://api.apify.com/v2/datasets/{$reviewsDatasetId}/items?clean=1&token={$apifyToken}";
        $items = file_get_contents($itemsUrl);
        $reviews = json_decode($items, true);

        if (empty($reviews) || !is_array($reviews)) {
            error_log("No reviews found for $toolName");
            return null;
        }

        // 4. Calculer la note moyenne et le nombre d'avis valides
        $totalRating = 0;
        $validReviewCount = 0;
        foreach ($reviews as $review) {
            if (isset($review['overallRating']) && is_numeric($review['overallRating'])) {
                $totalRating += (float) $review['overallRating'];
                $validReviewCount++;
            }
        }

        if ($validReviewCount === 0) {
            error_log("No valid ratings found for $toolName");
            return null;
        }

        $averageRating = round($totalRating / $validReviewCount, 1);

        return [
            'rating' => $averageRating,
            'review_count' => $validReviewCount
        ];
    }

    public function categories(array $data)
    {
        $this->requireAdmin($data);
        ok(['categories' => $this->catalog->categories()]);
    }

    public function createCategory(array $data)
    {
        //$this->requireAdmin($data);

        $name = cleanString($data['name'] ?? $data['nom_Cat'] ?? '');
        if ($name === '') {
            fail('Le nom de la categorie est obligatoire');
        }

        $category = $this->saveCategory([
            'name' => $name,
            'slug' => $data['slug'] ?? null,
            'icon' => $data['icon'] ?? $data['icone'] ?? null,
            'description' => $data['description'] ?? null,
        ]);

        ok(['category' => $category], 'Categorie creee avec succes');
    }

    public function updateCategory(array $data)
    {
        $this->requireAdmin($data);

        $id = $data['id'] ?? $data['id_Cat'] ?? null;
        if (!$id || !ctype_digit((string) $id)) {
            fail('Categorie invalide');
        }

        $name = cleanString($data['name'] ?? $data['nom_Cat'] ?? '');
        if ($name === '') {
            fail('Le nom de la categorie est obligatoire');
        }

        $category = $this->saveCategory([
            'id' => (int) $id,
            'name' => $name,
            'slug' => $data['slug'] ?? null,
            'icon' => $data['icon'] ?? $data['icone'] ?? null,
            'description' => $data['description'] ?? null,
        ]);

        ok(['category' => $category], 'Categorie mise a jour avec succes');
    }

    public function deleteCategory(array $data)
    {
        $this->requireAdmin($data);

        $id = $data['id'] ?? $data['id_Cat'] ?? null;
        if (!$id || !ctype_digit((string) $id)) {
            fail('Categorie invalide');
        }

        $pdo = require __DIR__ . '/../config/database.php';

        // Vérifier si la catégorie est utilisée par des outils
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM OUTIL_CATEGORIE WHERE ID_CATEGORIE = :id');
        $stmt->execute(['id' => (int) $id]);
        if ($stmt->fetchColumn() > 0) {
            fail('Impossible de supprimer cette catégorie car elle est utilisée par des outils', 400);
        }

        $stmt = $pdo->prepare('DELETE FROM CATEGORIES WHERE ID_CATEGORIE = :id');
        $stmt->execute(['id' => (int) $id]);

        if ($stmt->rowCount() === 0) {
            fail('Categorie introuvable', 404);
        }

        ok(['id' => (string) $id], 'Categorie supprimee avec succes');
    }

    /* public function notifications(array $data)
    {
        $this->requireAdmin($data);
        $pdo = require __DIR__ . '/../config/database.php';

        // Group by title, message and created_at to show "broadcasts" as single entries
        $stmt = $pdo->query("
            SELECT titre AS title, message, type, cible, created_at AS createdAt, COUNT(*) AS recipientCount
            FROM notification
            GROUP BY titre, message, type, cible, created_at
            ORDER BY created_at DESC
        ");

        ok(['notifications' => $stmt->fetchAll()]);
    }
 */

    public function notifications(array $data)
    {
        $this->requireAdmin($data);
        $pdo = require __DIR__ . '/../config/database.php';

        $stmt = $pdo->query("
        SELECT 
            n.ID_NOTIF AS id,
            n.MESSAGE AS title,
            n.MESSAGE,
            n.TYPE,
            n.CIBLE,
            n.DATE_MISE_A_JOUR AS createdAt,
            COUNT(DISTINCT nu.IDU) AS recipientCount
        FROM NOTIFICATION n
        LEFT JOIN NOTIFICATION_UTILISATEUR nu ON nu.ID_NOTIF = n.ID_NOTIF
        GROUP BY n.ID_NOTIF, n.MESSAGE, n.TYPE, n.CIBLE, n.DATE_MISE_A_JOUR
        ORDER BY n.DATE_MISE_A_JOUR DESC
    ");

        ok(['notifications' => $stmt->fetchAll()]);
    }
    /*  public function sendNotification(array $data)
     {
         $this->requireAdmin($data);

         $title = cleanString($data['title'] ?? '');
         $message = cleanString($data['message'] ?? '');
         $type = cleanString($data['type'] ?? 'info');
         $cible = cleanString($data['recipients'] ?? 'all');

         if (!$title || !$message) {
             fail('Titre et message requis');
         }

         $pdo = require __DIR__ . '/../config/database.php';

         // Get recipients
         $userIds = [];
         if ($cible === 'all') {
             $stmt = $pdo->query("SELECT idU FROM utilisateur");
             $userIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
         } else if ($cible === 'active') {
             // Placeholder for active users logic, let's say anyone with a favori or review
             $stmt = $pdo->query("SELECT DISTINCT idU FROM utilisateur WHERE idU IN (SELECT idU FROM favori UNION SELECT idU FROM avis)");
             $userIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
         } else {
             // Default to all if unknown
             $stmt = $pdo->query("SELECT idU FROM utilisateur");
             $userIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
         }

         if (empty($userIds)) {
             fail('Aucun destinataire trouve');
         }

         $pdo->beginTransaction();
         try {
             $stmt = $pdo->prepare("
                 INSERT INTO notification (cible, type, titre, message, created_at, idU)
                 VALUES (:cible, :type, :title, :message, CURRENT_DATE, :user_id)
             ");

             foreach ($userIds as $userId) {
                 $stmt->execute([
                     'cible' => $cible,
                     'type' => $type,
                     'title' => $title,
                     'message' => $message,
                     'user_id' => $userId
                 ]);
             }
             $pdo->commit();
         } catch (Throwable $e) {
             $pdo->rollBack();
             fail('Erreur lors de l\'envoi : ' . $e->getMessage());
         }

         ok([], 'Notification envoyee a ' . count($userIds) . ' utilisateurs');
     } */

    public function sendNotification(array $data)
    {
        $this->requireAdmin($data);

        $title = cleanString($data['title'] ?? '');
        $message = cleanString($data['message'] ?? '');
        $type = cleanString($data['type'] ?? 'info');
        $cible = cleanString($data['recipients'] ?? 'all');

        if (!$title || !$message) {
            fail('Titre et message requis');
        }

        // On combine titre et message dans le champ MESSAGE
        $fullMessage = "[$title] " . $message;

        $pdo = require __DIR__ . '/../config/database.php';

        // Récupération des destinataires
        $userIds = [];
        if ($cible === 'all') {
            $stmt = $pdo->query("SELECT IDU FROM UTILISATEUR");
            $userIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
        } elseif ($cible === 'active') {
            // Utilisateurs actifs : ceux qui ont au moins un favori ou un commentaire
            $stmt = $pdo->query("
            SELECT DISTINCT IDU FROM UTILISATEUR 
            WHERE IDU IN (SELECT IDU FROM FAVORI UNION SELECT IDU FROM COMMENTAIRES)
        ");
            $userIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
        } else {
            // Par défaut, tous les utilisateurs
            $stmt = $pdo->query("SELECT IDU FROM UTILISATEUR");
            $userIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
        }

        if (empty($userIds)) {
            fail('Aucun destinataire trouvé');
        }

        $pdo->beginTransaction();
        try {
            // Insertion de la notification unique dans NOTIFICATION
            $stmtNotif = $pdo->prepare("
            INSERT INTO NOTIFICATION (CIBLE, TYPE, MESSAGE, DATE_MISE_A_JOUR)
            VALUES (:cible, :type, :message, CURRENT_DATE)
        ");
            $stmtNotif->execute([
                'cible' => $cible,
                'type' => $type,
                'message' => $fullMessage
            ]);
            $notifId = $pdo->lastInsertId();

            // Insertion des liens dans NOTIFICATION_UTILISATEUR pour chaque destinataire
            $stmtLink = $pdo->prepare("
            INSERT INTO NOTIFICATION_UTILISATEUR (ID_NOTIF, IDU)
            VALUES (:notif_id, :user_id)
        ");
            foreach ($userIds as $userId) {
                $stmtLink->execute([
                    'notif_id' => $notifId,
                    'user_id' => $userId
                ]);
            }

            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            fail('Erreur lors de l\'envoi : ' . $e->getMessage());
        }

        ok([], 'Notification envoyée à ' . count($userIds) . ' utilisateurs');
    }

    /* public function deleteNotification(array $data)
    {
        $this->requireAdmin($data);

        $title = $data['title'] ?? null;
        $message = $data['message'] ?? null;
        $createdAt = $data['createdAt'] ?? null;

        if (!$title || !$message || !$createdAt) {
            fail('Informations de notification manquantes');
        }

        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->prepare("
            DELETE FROM notification 
            WHERE titre = :title AND message = :message AND created_at = :createdAt
        ");
        $stmt->execute([
            'title' => $title,
            'message' => $message,
            'createdAt' => $createdAt
        ]);

        ok([], 'Campagne de notification supprimee');
    } */

    public function deleteNotification(array $data)
    {
        $this->requireAdmin($data);

        $id = $data['id'] ?? $data['notificationId'] ?? null;
        if (!$id) {
            fail('Identifiant de notification requis');
        }

        $pdo = require __DIR__ . '/../config/database.php';

        // Vérifier que la notification existe
        $stmt = $pdo->prepare("SELECT ID_NOTIF FROM NOTIFICATION WHERE ID_NOTIF = :id");
        $stmt->execute(['id' => $id]);
        if (!$stmt->fetch()) {
            fail('Notification introuvable', 404);
        }

        $pdo->beginTransaction();
        try {
            // Supprimer d'abord les liens dans NOTIFICATION_UTILISATEUR
            $stmt = $pdo->prepare("DELETE FROM NOTIFICATION_UTILISATEUR WHERE ID_NOTIF = :id");
            $stmt->execute(['id' => $id]);

            // Supprimer la notification elle‑même
            $stmt = $pdo->prepare("DELETE FROM NOTIFICATION WHERE ID_NOTIF = :id");
            $stmt->execute(['id' => $id]);

            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            fail('Erreur lors de la suppression : ' . $e->getMessage());
        }

        ok([], 'Campagne de notification supprimée');
    }

    /* public function reports(array $data)
    {
        $this->requireAdmin($data);
        $pdo = require __DIR__ . '/../config/database.php';

        $stmt = $pdo->query("
            SELECT s.id_Sig AS id, s.motif AS reason, s.statut AS status, s.date AS createdAt, s.description AS details,
                   u.nom AS reporterName, u.prenom AS reporterFirstName,
                   o.nom AS toolName, o.idOut AS toolId,
                   a.contenu AS commentContent, a.id_avis AS commentId
            FROM signalements s
            JOIN utilisateur u ON u.idU = s.idU
            LEFT JOIN outils o ON o.idOut = s.idOut
            LEFT JOIN avis a ON a.id_avis = s.id_com
            ORDER BY s.date DESC, s.id_Sig DESC
        ");

        $reports = array_map(function ($row) {
            $type = $row['commentId'] ? 'comment' : 'tool';
            $targetName = $type === 'tool' ? $row['toolName'] : 'Commentaire';
            return [
                'id' => (string) $row['id'],
                'reason' => $row['reason'],
                'status' => $row['status'] === 'en_attente' ? 'pending' : ($row['status'] === 'resolu' ? 'resolved' : 'rejected'),
                'createdAt' => $row['createdAt'],
                'details' => $row['details'],
                'reporterName' => trim($row['reporterFirstName'] . ' ' . $row['reporterName']),
                'type' => $type,
                'targetName' => $targetName,
                'toolId' => $row['toolId'],
                'commentId' => $row['commentId'],
                'commentContent' => $row['commentContent']
            ];
        }, $stmt->fetchAll());

        ok(['reports' => $reports]);
    }
 */

    public function reports(array $data)
    {
        $this->requireAdmin($data);
        $pdo = require __DIR__ . '/../config/database.php';

        $stmt = $pdo->query("
        SELECT 
            s.ID_SIGNALEMENT AS id,
            s.MOTIF AS reason,
            s.STATUT AS status,
            s.DATE_MISE_A_JOUR AS createdAt,
            s.DESCRIPTION AS details,
            u.NOM AS reporterName,
            u.PRENOM AS reporterFirstName,
            o.NOM AS toolName,
            o.IDOUT AS toolId,
            c.CONTENU AS commentContent,
            c.ID_COMMENTAIRE AS commentId
        FROM SIGNALEMENTS s
        JOIN UTILISATEUR u ON u.IDU = s.IDU
        LEFT JOIN OUTILS o ON o.IDOUT = s.IDOUT
        LEFT JOIN COMMENTAIRES c ON c.ID_COMMENTAIRE = s.ID_COMMENTAIRE
        ORDER BY s.DATE_MISE_A_JOUR DESC, s.ID_SIGNALEMENT DESC
    ");

        $reports = array_map(function ($row) {
            $type = $row['commentId'] ? 'comment' : 'tool';
            $targetName = $type === 'tool' ? $row['toolName'] : 'Commentaire';
            return [
                'id' => (string) $row['id'],
                'reason' => $row['reason'],
                'status' => $row['status'] === 'en_attente' ? 'pending' : ($row['status'] === 'resolu' ? 'resolved' : 'rejected'),
                'createdAt' => $row['createdAt'],
                'details' => $row['details'],
                'reporterName' => trim($row['reporterFirstName'] . ' ' . $row['reporterName']),
                'type' => $type,
                'targetName' => $targetName,
                'toolId' => $row['toolId'],
                'commentId' => $row['commentId'],
                'commentContent' => $row['commentContent']
            ];
        }, $stmt->fetchAll());

        ok(['reports' => $reports]);
    }
    /* public function updateReportStatus(array $data)
    {
        $this->requireAdmin($data);

        $id = $data['id'] ?? null;
        $status = $data['status'] ?? null; // 'resolved' or 'rejected'

        if (!$id || !$status) {
            fail('ID et statut requis');
        }

        $dbStatus = $status === 'resolved' ? 'resolu' : 'rejete';

        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->prepare("UPDATE signalements SET statut = :status WHERE id_Sig = :id");
        $stmt->execute(['status' => $dbStatus, 'id' => $id]);

        if ($stmt->rowCount() === 0) {
            fail('Signalement introuvable', 404);
        }

        ok([], 'Statut du signalement mis a jour');
    }
 */

    public function updateReportStatus(array $data)
    {
        $this->requireAdmin($data);

        $id = $data['id'] ?? null;
        $status = $data['status'] ?? null; // 'resolved' or 'rejected'

        if (!$id || !$status) {
            fail('ID et statut requis');
        }

        // Conversion des statuts frontend vers les valeurs en base
        $dbStatus = $status === 'resolved' ? 'resolu' : 'rejete';

        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->prepare("UPDATE SIGNALEMENTS SET STATUT = :status WHERE ID_SIGNALEMENT = :id");
        $stmt->execute(['status' => $dbStatus, 'id' => $id]);

        if ($stmt->rowCount() === 0) {
            fail('Signalement introuvable', 404);
        }

        ok([], 'Statut du signalement mis à jour');
    }
    /* public function submissions(array $data)
    {
        $this->requireAdmin($data);
        $pdo = require __DIR__ . '/../config/database.php';

        $status = $data['status'] ?? null;
        $where = $status ? 'WHERE s.statut = :status' : '';
        $params = $status ? ['status' => $status] : [];

        $stmt = $pdo->prepare("
            SELECT s.id_soum AS id, s.statut, s.note_admin AS adminNote, s.created_at AS createdAt,
                   s.idU AS userId,
                   u.nom AS userName, u.prenom AS userFirstName, u.email AS userEmail,
                   o.idOut AS toolId, o.nom AS toolName, o.slug AS toolSlug,
                   o.statut AS toolStatus, o.description_courte AS toolDescription,
                   o.pricing_type AS toolPricing, o.site_url AS toolUrl, o.logo_url AS toolLogo
            FROM soumission_outil s
            JOIN utilisateur u ON u.idU = s.idU
            LEFT JOIN outils o ON o.idOut = s.idOut
            $where
            ORDER BY s.created_at DESC
        ");
        $stmt->execute($params);

        $submissions = array_map(function ($row) {
            $dbStatus = $row['statut'];
            return [
                'id' => (string) $row['id'],
                'status' => $dbStatus === 'en_attente' ? 'pending' : ($dbStatus === 'approuve' ? 'approved' : 'rejected'),
                'adminNote' => $row['adminNote'],
                'createdAt' => $row['createdAt'],
                'userId' => (string) $row['userId'],
                'userName' => trim($row['userFirstName'] . ' ' . $row['userName']),
                'userEmail' => $row['userEmail'],
                'toolId' => (string) $row['toolId'],
                'toolName' => $row['toolName'],
                'toolSlug' => $row['toolSlug'],
                'toolStatus' => $row['toolStatus'],
                'toolDescription' => $row['toolDescription'],
                'toolPricing' => $row['toolPricing'],
                'toolUrl' => $row['toolUrl'],
                'toolLogo' => $row['toolLogo'],
            ];
        }, $stmt->fetchAll());

        ok(['submissions' => $submissions]);
    } */

    public function submissions(array $data)
    {
        $this->requireAdmin($data);
        $pdo = require __DIR__ . '/../config/database.php';

        $status = $data['status'] ?? null;
        $where = $status ? 'WHERE s.STATUT = :status' : '';
        $params = $status ? ['status' => $status] : [];

        $stmt = $pdo->prepare("
        SELECT s.ID_SOUMISSION AS id, s.STATUT, s.NOTE_ADMIN AS adminNote, s.DATE_MISE_A_JOUR AS createdAt,
               s.IDU AS userId,
               u.NOM AS userName, u.PRENOM AS userFirstName, u.EMAIL AS userEmail,
               o.IDOUT AS toolId, o.NOM AS toolName, o.SLUG AS toolSlug,
               o.STATUT AS toolStatus, o.DESCRIPTION_COURTE AS toolDescription,
               o.TYPE_TARIF AS toolPricing, o.SITE_URL AS toolUrl, o.LOGO_URL AS toolLogo
        FROM SOUMISSION_OUTIL s
        JOIN UTILISATEUR u ON u.IDU = s.IDU
        LEFT JOIN OUTILS o ON o.IDOUT = s.IDOUT
        $where
        ORDER BY s.DATE_MISE_A_JOUR DESC
    ");
        $stmt->execute($params);

        $submissions = array_map(function ($row) {
            $dbStatus = $row['STATUT'];
            return [
                'id' => (string) $row['id'],
                'status' => $dbStatus === 'en_attente' ? 'pending' : (($dbStatus === 'approuve' || $dbStatus === 'validé') ? 'approved' : 'rejected'),
                'adminNote' => $row['adminNote'],
                'createdAt' => $row['createdAt'],
                'userId' => (string) $row['userId'],
                'userName' => trim($row['userFirstName'] . ' ' . $row['userName']),
                'userEmail' => $row['userEmail'],
                'toolId' => (string) $row['toolId'],
                'toolName' => $row['toolName'],
                'toolSlug' => $row['toolSlug'],
                'toolStatus' => $row['toolStatus'],
                'toolDescription' => $row['toolDescription'],
                'toolPricing' => $row['toolPricing'],
                'toolUrl' => $row['toolUrl'],
                'toolLogo' => $row['toolLogo'],
            ];
        }, $stmt->fetchAll());

        ok(['submissions' => $submissions]);
    }

    /* public function approveTool(array $data)
    {
        $this->requireAdmin($data);

        $toolId = $data['id'] ?? $data['toolId'] ?? null;
        if (!$toolId)
            fail('ID de l\'outil requis', 422);

        $pdo = require __DIR__ . '/../config/database.php';

        $stmt = $pdo->prepare("UPDATE outils SET statut = 'actif' WHERE idOut = :id");
        $stmt->execute(['id' => $toolId]);
        if ($stmt->rowCount() === 0)
            fail('Outil introuvable', 404);

        $note = cleanString($data['note'] ?? '');
        $pdo->prepare("UPDATE soumission_outil SET statut = 'approuve', note_admin = :note WHERE idOut = :tool_id")
            ->execute(['note' => $note ?: null, 'tool_id' => $toolId]);

        // Notify submitter
        $stmt = $pdo->prepare("
            SELECT s.idU, o.nom AS toolName
            FROM soumission_outil s JOIN outils o ON o.idOut = s.idOut
            WHERE s.idOut = :tool_id LIMIT 1
        ");
        $stmt->execute(['tool_id' => $toolId]);
        $info = $stmt->fetch();
        if ($info) {
            $pdo->prepare("
                INSERT INTO notification (cible, type, titre, message, created_at, idU)
                VALUES ('user', 'success', :title, :message, CURRENT_DATE, :user_id)
            ")->execute([
                        'title' => 'Outil approuvé',
                        'message' => 'Votre outil "' . $info['toolName'] . '" a été approuvé et est maintenant publié dans le catalogue.',
                        'user_id' => $info['idU'],
                    ]);
        }

        ok(['id' => (string) $toolId], 'Outil approuvé avec succès');
    } */

    public function approveTool(array $data)
    {
        $this->requireAdmin($data);

        $toolId = $data['id'] ?? $data['toolId'] ?? null;
        if (!$toolId)
            fail('ID de l\'outil requis', 422);

        $pdo = require __DIR__ . '/../config/database.php';

        // Mettre à jour le statut de l'outil dans OUTILS
        $stmt = $pdo->prepare("UPDATE OUTILS SET STATUT = 'actif' WHERE IDOUT = :id");
        $stmt->execute(['id' => $toolId]);
        if ($stmt->rowCount() === 0)
            fail('Outil introuvable', 404);

        // Mettre à jour la soumission
        $note = cleanString($data['note'] ?? '');
        $pdo->prepare("UPDATE SOUMISSION_OUTIL SET STATUT = 'approuve', NOTE_ADMIN = :note WHERE IDOUT = :tool_id")
            ->execute(['note' => $note ?: null, 'tool_id' => $toolId]);

        // Récupérer l'utilisateur qui a soumis l'outil pour notification
        $stmt = $pdo->prepare("
        SELECT s.IDU, o.NOM AS toolName
        FROM SOUMISSION_OUTIL s
        JOIN OUTILS o ON o.IDOUT = s.IDOUT
        WHERE s.IDOUT = :tool_id LIMIT 1
    ");
        $stmt->execute(['tool_id' => $toolId]);
        $info = $stmt->fetch();

        if ($info) {
            // --- Récupération des notes G2 ---
            $toolName = $info['toolName'];
            $g2Ratings = $this->fetchG2Ratings($toolName);

            if ($g2Ratings !== null) {
                // Vérifier si une ligne STATISTIQUES_EXTERNES existe déjà pour cet outil
                $stmtCheck = $pdo->prepare("SELECT ID_STAT FROM STATISTIQUES_EXTERNES WHERE IDOUT = :toolId");
                $stmtCheck->execute(['toolId' => $toolId]);
                $existingStatId = $stmtCheck->fetchColumn();

                if ($existingStatId) {
                    // Mise à jour des statistiques existantes
                    $stmtUpdate = $pdo->prepare("
                    UPDATE STATISTIQUES_EXTERNES
                    SET NOTE_MOYENNE = :note, NB_NOTATIONS = :nb, DATE_MISE_A_JOUR = CURDATE()
                    WHERE ID_STAT = :id
                ");
                    $stmtUpdate->execute([
                        'note' => $g2Ratings['rating'],
                        'nb' => $g2Ratings['review_count'],
                        'id' => $existingStatId
                    ]);
                } else {
                    // Insertion d'une nouvelle ligne de statistiques
                    $stmtInsert = $pdo->prepare("
                    INSERT INTO STATISTIQUES_EXTERNES (IDOUT, NOTE_MOYENNE, NB_NOTATIONS, DATE_MISE_A_JOUR)
                    VALUES (:toolId, :note, :nb, CURDATE())
                ");
                    $stmtInsert->execute([
                        'toolId' => $toolId,
                        'note' => $g2Ratings['rating'],
                        'nb' => $g2Ratings['review_count']
                    ]);
                    $newStatId = $pdo->lastInsertId();

                    // Lier les nouvelles statistiques à l'outil
                    $stmtUpdateTool = $pdo->prepare("UPDATE OUTILS SET ID_STAT = :statId WHERE IDOUT = :toolId");
                    $stmtUpdateTool->execute(['statId' => $newStatId, 'toolId' => $toolId]);
                }
            }

            // --- Envoi de la notification ---
            $title = 'Outil approuvé';
            $fullMessage = "[$title] Votre outil \"" . $info['toolName'] . "\" a été approuvé et est maintenant publié dans le catalogue.";

            $stmtNotif = $pdo->prepare("
            INSERT INTO NOTIFICATION (CIBLE, TYPE, MESSAGE, DATE_MISE_A_JOUR)
            VALUES ('user', 'success', :message, CURRENT_DATE)
        ");
            $stmtNotif->execute(['message' => $fullMessage]);
            $notifId = $pdo->lastInsertId();

            $stmtLink = $pdo->prepare("INSERT INTO NOTIFICATION_UTILISATEUR (ID_NOTIF, IDU) VALUES (:notif_id, :user_id)");
            $stmtLink->execute(['notif_id' => $notifId, 'user_id' => $info['IDU']]);
        }

        ok(['id' => (string) $toolId], 'Outil approuvé avec succès');
    }

    /* public function rejectTool(array $data)
    {
        $this->requireAdmin($data);

        $toolId = $data['id'] ?? $data['toolId'] ?? null;
        if (!$toolId)
            fail('ID de l\'outil requis', 422);

        $pdo = require __DIR__ . '/../config/database.php';

        $stmt = $pdo->prepare("UPDATE outils SET statut = 'refusé' WHERE idOut = :id");
        $stmt->execute(['id' => $toolId]);
        if ($stmt->rowCount() === 0)
            fail('Outil introuvable', 404);

        $reason = cleanString($data['reason'] ?? $data['note'] ?? '');
        $pdo->prepare("UPDATE soumission_outil SET statut = 'rejete', note_admin = :reason WHERE idOut = :tool_id")
            ->execute(['reason' => $reason ?: null, 'tool_id' => $toolId]);

        // Notify submitter
        $stmt = $pdo->prepare("
            SELECT s.idU, o.nom AS toolName
            FROM soumission_outil s JOIN outils o ON o.idOut = s.idOut
            WHERE s.idOut = :tool_id LIMIT 1
        ");
        $stmt->execute(['tool_id' => $toolId]);
        $info = $stmt->fetch();
        if ($info) {
            $message = 'Votre outil "' . $info['toolName'] . '" n\'a pas été retenu.';
            if ($reason)
                $message .= ' Motif : ' . $reason;
            $pdo->prepare("
                INSERT INTO notification (cible, type, titre, message, created_at, idU)
                VALUES ('user', 'error', :title, :message, CURRENT_DATE, :user_id)
            ")->execute([
                        'title' => 'Outil refusé',
                        'message' => $message,
                        'user_id' => $info['idU'],
                    ]);
        }

        ok(['id' => (string) $toolId], 'Outil refusé');
    }
 */

    public function rejectTool(array $data)
    {
        $this->requireAdmin($data);

        $toolId = $data['id'] ?? $data['toolId'] ?? null;
        if (!$toolId)
            fail('ID de l\'outil requis', 422);

        $pdo = require __DIR__ . '/../config/database.php';

        // Mettre à jour le statut de l'outil dans OUTILS
        $stmt = $pdo->prepare("UPDATE OUTILS SET STATUT = 'refusé' WHERE IDOUT = :id");
        $stmt->execute(['id' => $toolId]);
        if ($stmt->rowCount() === 0)
            fail('Outil introuvable', 404);

        // Mettre à jour la soumission
        $reason = cleanString($data['reason'] ?? $data['note'] ?? '');
        $pdo->prepare("UPDATE SOUMISSION_OUTIL SET STATUT = 'rejete', NOTE_ADMIN = :reason WHERE IDOUT = :tool_id")
            ->execute(['reason' => $reason ?: null, 'tool_id' => $toolId]);

        // Récupérer l'utilisateur qui a soumis l'outil pour notification
        $stmt = $pdo->prepare("
        SELECT s.IDU, o.NOM AS toolName
        FROM SOUMISSION_OUTIL s
        JOIN OUTILS o ON o.IDOUT = s.IDOUT
        WHERE s.IDOUT = :tool_id LIMIT 1
    ");
        $stmt->execute(['tool_id' => $toolId]);
        $info = $stmt->fetch();

        if ($info) {
            // Construire le message complet (titre + contenu)
            $title = 'Outil refusé';
            $messageBody = 'Votre outil "' . $info['toolName'] . '" n\'a pas été retenu.';
            if ($reason)
                $messageBody .= ' Motif : ' . $reason;
            $fullMessage = "[$title] " . $messageBody;

            // Insérer la notification dans NOTIFICATION
            $stmtNotif = $pdo->prepare("
            INSERT INTO NOTIFICATION (CIBLE, TYPE, MESSAGE, DATE_MISE_A_JOUR)
            VALUES ('user', 'error', :message, CURRENT_DATE)
        ");
            $stmtNotif->execute(['message' => $fullMessage]);
            $notifId = $pdo->lastInsertId();

            // Lier la notification à l'utilisateur dans NOTIFICATION_UTILISATEUR
            $stmtLink = $pdo->prepare("INSERT INTO NOTIFICATION_UTILISATEUR (ID_NOTIF, IDU) VALUES (:notif_id, :user_id)");
            $stmtLink->execute(['notif_id' => $notifId, 'user_id' => $info['IDU']]);
        }

        ok(['id' => (string) $toolId], 'Outil refusé');
    }
    /* public function deleteTool(array $data)
    {
        $this->requireAdmin($data);

        $id = $data['id'] ?? $data['idOut'] ?? null;
        if (!$id)
            fail('ID de l\'outil requis', 422);

        $pdo = require __DIR__ . '/../config/database.php';
        $pdo->beginTransaction();
        try {
            foreach ([
                'pricing_plans',
                'signalements',
                'soumission_outil',
                'outil_categorie',
                'outil_tag',
                'outil_plateforme',
                'outil_model',
                'outil_feature',
                'outil_performance',
                'favori',
                'avis'
            ] as $table) {
                $pdo->prepare("DELETE FROM {$table} WHERE idOut = :id")->execute(['id' => $id]);
            }
            $stmt = $pdo->prepare("DELETE FROM outils WHERE idOut = :id");
            $stmt->execute(['id' => $id]);
            if ($stmt->rowCount() === 0) {
                $pdo->rollBack();
                fail('Outil introuvable', 404);
            }
            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }

        ok(['id' => (string) $id], 'Outil supprimé');
    } */

    public function deleteTool(array $data)
    {
        $this->requireAdmin($data);

        $id = $data['id'] ?? $data['idOut'] ?? null;
        if (!$id)
            fail('ID de l\'outil requis', 422);

        $pdo = require __DIR__ . '/../config/database.php';
        $pdo->beginTransaction();
        try {
            // Liste des tables de liaison / dépendances avec la colonne IDOUT
            $tables = [
                'PRICING_PLANS',
                'SIGNALEMENTS',
                'SOUMISSION_OUTIL',
                'OUTIL_CATEGORIE',
                'OUTIL_PLATEFORME',
                'OUTIL_MODELE',
                'OUTIL_FEATURE',
                'OUTIL_PERFORMANCE',
                'FAVORI',
                'COMMENTAIRES',
            ];

            foreach ($tables as $table) {
                $pdo->prepare("DELETE FROM {$table} WHERE IDOUT = :id")->execute(['id' => $id]);
            }

            // Supprimer l'outil lui‑même
            $stmt = $pdo->prepare("DELETE FROM OUTILS WHERE IDOUT = :id");
            $stmt->execute(['id' => $id]);
            if ($stmt->rowCount() === 0) {
                $pdo->rollBack();
                fail('Outil introuvable', 404);
            }

            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }

        ok(['id' => (string) $id], 'Outil supprimé');
    }

    /* public function createTool(array $data)
    {
        $adminPayload = $this->requireAdmin($data);
        $missing = requireFields($data, ['name', 'provider', 'shortDescription', 'longDescription', 'url', 'pricingType']);
        if ($missing)
            fail('Champs obligatoires manquants : ' . implode(', ', $missing), 422);

        $tool = $this->users->submitTool($adminPayload['id'], $data, 'actif');
        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->prepare("SELECT * FROM outils WHERE idOut = :id LIMIT 1");
        $stmt->execute(['id' => $tool['toolId']]);

        ok(['tool' => $this->catalog->tool($tool['toolId'])], 'Outil créé avec succès');
    }

    private function saveCategory(array $data)
    {
        $pdo = require __DIR__ . '/../config/database.php';
        $id = $data['id'] ?? null;
        $name = cleanString($data['name']);
        $slug = slugify($data['slug'] ?? $name);
        $icon = cleanString($data['icon'] ?? '') ?: 'Layers';
        $description = cleanString($data['description'] ?? '');

        if ($id) {
            $exists = $pdo->prepare('SELECT id_Cat FROM categories WHERE id_Cat = :id LIMIT 1');
            $exists->execute(['id' => $id]);
            if (!$exists->fetch()) {
                fail('Categorie introuvable', 404);
            }

            $duplicate = $pdo->prepare('SELECT id_Cat FROM categories WHERE slug = :slug AND id_Cat <> :id LIMIT 1');
            $duplicate->execute(['slug' => $slug, 'id' => $id]);
            if ($duplicate->fetch()) {
                fail('Ce slug est deja utilise');
            }

            $stmt = $pdo->prepare("
                UPDATE categories
                SET nom_Cat = :name, slug = :slug, icone = :icon, description = :description
                WHERE id_Cat = :id
            ");
            $stmt->execute([
                'name' => $name,
                'slug' => $slug,
                'icon' => $icon,
                'description' => $description ?: null,
                'id' => $id,
            ]);
        } else {
            $duplicate = $pdo->prepare('SELECT id_Cat FROM categories WHERE slug = :slug LIMIT 1');
            $duplicate->execute(['slug' => $slug]);
            if ($duplicate->fetch()) {
                fail('Ce slug est deja utilise');
            }

            $stmt = $pdo->prepare("
                INSERT INTO categories (nom_Cat, slug, icone, description)
                VALUES (:name, :slug, :icon, :description)
            ");
            $stmt->execute([
                'name' => $name,
                'slug' => $slug,
                'icon' => $icon,
                'description' => $description ?: null,
            ]);
            $id = (int) $pdo->lastInsertId();
        }

        foreach ($this->catalog->categories() as $category) {
            if ((string) $category['id'] === (string) $id) {
                return $category;
            }
        }

        fail('Categorie introuvable apres sauvegarde', 500);
    }
 */

    public function createTool(array $data)
    {
        $adminPayload = $this->requireAdmin($data);
        $missing = requireFields($data, ['name', 'provider', 'shortDescription', 'longDescription', 'url', 'pricingType']);
        if ($missing)
            fail('Champs obligatoires manquants : ' . implode(', ', $missing), 422);

        $tool = $this->users->submitTool($adminPayload['id'], $data, 'actif');

        // Vérifier que l'outil a bien été créé
        if (empty($tool['toolId'])) {
            fail('Erreur lors de la création de l\'outil', 500);
        }

        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->prepare("SELECT * FROM OUTILS WHERE IDOUT = :id LIMIT 1");
        $stmt->execute(['id' => $tool['toolId']]);
        $outilRow = $stmt->fetch();
        if (!$outilRow) {
            fail('Outil introuvable après création', 404);
        }

        // Utiliser le catalogue pour formater l'outil (retourne déjà les détails complets)
        ok(['tool' => $this->catalog->tool($tool['toolId'])], 'Outil créé avec succès');
    }

    private function saveCategory(array $data)
    {
        $pdo = require __DIR__ . '/../config/database.php';
        $id = $data['id'] ?? null;
        $name = cleanString($data['name']);
        $slug = slugify($data['slug'] ?? $name);
        $icon = cleanString($data['icon'] ?? '') ?: 'Layers';
        $description = cleanString($data['description'] ?? '');

        if ($id) {
            // Vérifier l'existence de la catégorie
            $exists = $pdo->prepare('SELECT ID_CATEGORIE FROM CATEGORIES WHERE ID_CATEGORIE = :id LIMIT 1');
            $exists->execute(['id' => $id]);
            if (!$exists->fetch()) {
                fail('Catégorie introuvable', 404);
            }

            // Vérifier l'unicité du slug
            $duplicate = $pdo->prepare('SELECT ID_CATEGORIE FROM CATEGORIES WHERE SLUG = :slug AND ID_CATEGORIE <> :id LIMIT 1');
            $duplicate->execute(['slug' => $slug, 'id' => $id]);
            if ($duplicate->fetch()) {
                fail('Ce slug est déjà utilisé');
            }

            $stmt = $pdo->prepare("
            UPDATE CATEGORIES
            SET NOM = :name, SLUG = :slug, ICONE = :icon, DESCRIPTION = :description
            WHERE ID_CATEGORIE = :id
        ");
            $stmt->execute([
                'name' => $name,
                'slug' => $slug,
                'icon' => $icon,
                'description' => $description ?: null,
                'id' => $id,
            ]);
        } else {
            // Vérifier l'unicité du slug
            $duplicate = $pdo->prepare('SELECT ID_CATEGORIE FROM CATEGORIES WHERE SLUG = :slug LIMIT 1');
            $duplicate->execute(['slug' => $slug]);
            if ($duplicate->fetch()) {
                fail('Ce slug est déjà utilisé');
            }

            $stmt = $pdo->prepare("
            INSERT INTO CATEGORIES (NOM, SLUG, ICONE, DESCRIPTION)
            VALUES (:name, :slug, :icon, :description)
        ");
            $stmt->execute([
                'name' => $name,
                'slug' => $slug,
                'icon' => $icon,
                'description' => $description ?: null,
            ]);
            $id = (int) $pdo->lastInsertId();
        }

        // Récupérer la catégorie fraîchement créée/mise à jour via le catalogue
        foreach ($this->catalog->categories() as $category) {
            if ((string) $category['id'] === (string) $id) {
                return $category;
            }
        }

        fail('Catégorie introuvable après sauvegarde', 500);
    }
    private function requireAdmin(array $data)
    {
        $payload = decodeToken($data['token'] ?? bearerToken());
        if (!$payload || ($payload['role'] ?? null) !== 'admin') {
            fail('Acces admin requis', 403);
        }

        return $payload;
    }

    public function userSubmissions(array $data)
    {
        $this->requireAdmin($data);
        $userId = $data['userId'] ?? null;
        if (!$userId) {
            fail('ID utilisateur requis');
        }

        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->prepare("
        SELECT 
            s.ID_SOUMISSION AS id,
            o.IDOUT AS toolId,
            o.NOM AS toolName,
            o.SLUG AS toolSlug,
            o.STATUT AS toolStatus,
            o.DESCRIPTION_COURTE AS toolDescription,
            o.DATE_MISE_A_JOUR AS createdAt,
            s.STATUT AS submissionStatus,
            s.NOTE_ADMIN AS adminNote,
            s.DATE_MISE_A_JOUR AS submissionDate
        FROM OUTILS o
        JOIN SOUMISSION_OUTIL s ON s.IDOUT = o.IDOUT
        WHERE o.IDU = :user_id
        ORDER BY o.DATE_MISE_A_JOUR DESC
    ");
        $stmt->execute(['user_id' => $userId]);
        $tools = $stmt->fetchAll();

        // Uniformisation des données pour le frontend
        $result = array_map(function ($tool) {
            return [
                'id' => (string) $tool['id'],
                'toolId' => (string) $tool['toolId'],
                'toolName' => $tool['toolName'],
                'toolSlug' => $tool['toolSlug'],
                'toolStatus' => $tool['toolStatus'],
                'description' => $tool['toolDescription'],
                'createdAt' => $tool['createdAt'],
                // Priorité au statut de soumission s’il existe, sinon statut de l’outil
                'status' => $tool['submissionStatus'] ?? $tool['toolStatus'],
                'adminNote' => $tool['adminNote'] ?? null,
            ];
        }, $tools);

        ok(['submissions' => $result]);
    }

    public function userReviews(array $data)
    {
        $this->requireAdmin($data);
        $userId = $data['userId'] ?? null;
        if (!$userId)
            fail('ID utilisateur requis');

        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->prepare("
        SELECT c.ID_COMMENTAIRE AS id, c.CONTENU AS comment, c.DATE_MISE_A_JOUR AS createdAt,
               o.NOM AS toolName, o.SLUG AS toolSlug, o.IDOUT AS toolId
        FROM COMMENTAIRES c
        JOIN OUTILS o ON o.IDOUT = c.IDOUT
        WHERE c.IDU = :user_id AND c.STATUT = 'actif'
        ORDER BY c.DATE_MISE_A_JOUR DESC
    ");
        $stmt->execute(['user_id' => $userId]);
        ok(['reviews' => $stmt->fetchAll()]);
    }

    public function updateTool(array $data)
    {
        // Temporairement, on n'exige pas le rôle admin pour permettre aux propriétaires de modifier leur outil rejeté.
        // $this->requireAdmin($data);
        $id = $data['id'] ?? null;
        if (!$id)
            fail('ID outil requis', 422);

        $pdo = require __DIR__ . '/../config/database.php';
        $pdo->beginTransaction();

        try {
            // 1. Mettre à jour les champs principaux de l'outil
            $stmt = $pdo->prepare("
            UPDATE OUTILS 
            SET NOM = :name,
                DESCRIPTION_COURTE = :description,
                DESCRIPTION_LONGUE = :longDescription,
                SITE_URL = :url,
                TYPE_TARIF = :pricing,
                EST_OPEN_SOURCE = :openSource,
                LOGO_URL = :logoUrl,
                STATUT = 'en_attente', -- Remettre en attente après modification
                DATE_SORTIE = :releaseDate,
                DATE_MISE_A_JOUR = CURDATE()
            WHERE IDOUT = :id
        ");
            $stmt->execute([
                'name' => $data['name'],
                'description' => $data['shortDescription'] ?? $data['description'],
                'longDescription' => $data['longDescription'],
                'url' => $data['url'],
                'pricing' => $data['pricingType'] ?? $data['pricing'],
                'openSource' => (int) ($data['isOpenSource'] ?? $data['openSource'] ?? 0),
                'logoUrl' => $data['logoUrl'] ?? null,
                'releaseDate' => !empty($data['releaseDate']) ? $data['releaseDate'] : null,
                'id' => $id
            ]);

            // Récupérer le nombre actuel de tentatives
            $stmtAttempt = $pdo->prepare("SELECT TENTATIVES_EFFECTUEES FROM SOUMISSION_OUTIL WHERE IDOUT = :id");
            $stmtAttempt->execute(['id' => $id]);
            $currentAttempts = (int) $stmtAttempt->fetchColumn();

            // Incrémenter
            $newAttempts = $currentAttempts < 3 ? $currentAttempts + 1 : $currentAttempts;

            // Mettre à jour le statut et les tentatives
            $stmtUpdateSoumission = $pdo->prepare("
    UPDATE SOUMISSION_OUTIL 
    SET STATUT = 'en_attente', 
        TENTATIVES_EFFECTUEES = :tentatives,
        DATE_MISE_A_JOUR = CURDATE()
    WHERE IDOUT = :id
");
            $stmtUpdateSoumission->execute([
                'tentatives' => $newAttempts,
                'id' => $id
            ]);


            // 2. Fournisseur
            if (!empty($data['provider'])) {
                $providerName = cleanString($data['provider']);
                $stmt = $pdo->prepare("SELECT ID_FOURNISSEUR FROM FOURNISSEUR WHERE NOM = :name LIMIT 1");
                $stmt->execute(['name' => $providerName]);
                $providerId = $stmt->fetchColumn();
                if (!$providerId) {
                    $stmt = $pdo->prepare("INSERT INTO FOURNISSEUR (NOM) VALUES (:name)");
                    $stmt->execute(['name' => $providerName]);
                    $providerId = $pdo->lastInsertId();
                }
                $stmt = $pdo->prepare("UPDATE OUTILS SET ID_FOURNISSEUR = :pid WHERE IDOUT = :id");
                $stmt->execute(['pid' => $providerId, 'id' => $id]);
            }

            // 3. Catégories
            if (isset($data['categoryIds']) && is_array($data['categoryIds'])) {
                $pdo->prepare("DELETE FROM OUTIL_CATEGORIE WHERE IDOUT = :id")->execute(['id' => $id]);
                if (!empty($data['categoryIds'])) {
                    $stmt = $pdo->prepare("INSERT INTO OUTIL_CATEGORIE (IDOUT, ID_CATEGORIE) VALUES (:id, :cat)");
                    foreach ($data['categoryIds'] as $catId) {
                        $stmt->execute(['id' => $id, 'cat' => $catId]);
                    }
                }
            }




            // 5. Plateformes
            if (isset($data['platforms']) && is_array($data['platforms'])) {
                $pdo->prepare("DELETE FROM OUTIL_PLATEFORME WHERE IDOUT = :id")->execute(['id' => $id]);
                if (!empty($data['platforms'])) {
                    $stmt = $pdo->prepare("INSERT INTO OUTIL_PLATEFORME (IDOUT, ID_PLATEFORME) VALUES (:id, :plat)");
                    foreach ($data['platforms'] as $platName) {
                        $platName = cleanString($platName);
                        $stmtPlat = $pdo->prepare("SELECT ID_PLATEFORME FROM PLATEFORME WHERE NOM = :name LIMIT 1");
                        $stmtPlat->execute(['name' => $platName]);
                        $platId = $stmtPlat->fetchColumn();
                        if (!$platId) {
                            $pdo->prepare("INSERT INTO PLATEFORME (NOM) VALUES (:name)")->execute(['name' => $platName]);
                            $platId = $pdo->lastInsertId();
                        }
                        $stmt->execute(['id' => $id, 'plat' => $platId]);
                    }
                }
            }

            // 6. Fonctionnalités propres (features)
            if (isset($data['features']) && is_array($data['features'])) {
                $pdo->prepare("DELETE FROM OUTIL_FEATURE WHERE IDOUT = :id")->execute(['id' => $id]);
                if (!empty($data['features'])) {
                    $stmt = $pdo->prepare("INSERT INTO OUTIL_FEATURE (IDOUT, ID_FEATURE) VALUES (:id, :feat)");
                    foreach ($data['features'] as $featName) {
                        $featName = cleanString($featName);
                        $stmtFeat = $pdo->prepare("SELECT ID_FEATURE FROM FEATURES WHERE NOM = :name LIMIT 1");
                        $stmtFeat->execute(['name' => $featName]);
                        $featId = $stmtFeat->fetchColumn();
                        if (!$featId) {
                            $pdo->prepare("INSERT INTO FEATURES (NOM) VALUES (:name)")->execute(['name' => $featName]);
                            $featId = $pdo->lastInsertId();
                        }
                        $stmt->execute(['id' => $id, 'feat' => $featId]);
                    }
                }
            }

            // 7. Performances (benchmarks)
            if (isset($data['performances']) && is_array($data['performances'])) {
                $pdo->prepare("DELETE FROM OUTIL_PERFORMANCE WHERE IDOUT = :id")->execute(['id' => $id]);
                if (!empty($data['performances'])) {
                    $stmt = $pdo->prepare("INSERT INTO OUTIL_PERFORMANCE (IDOUT, ID_PERFORMANCE, SCORE) VALUES (:id, :perf, :score)");
                    foreach ($data['performances'] as $perf) {
                        $domain = cleanString($perf['domain'] ?? $perf['domaine'] ?? '');
                        $score = (int) ($perf['score'] ?? 0);
                        if ($domain !== '') {
                            $stmtPerf = $pdo->prepare("SELECT ID_PERFORMANCE FROM PERFORMANCE WHERE DOMAINE = :domain LIMIT 1");
                            $stmtPerf->execute(['domain' => $domain]);
                            $perfId = $stmtPerf->fetchColumn();
                            if (!$perfId) {
                                $pdo->prepare("INSERT INTO PERFORMANCE (DOMAINE) VALUES (:domain)")->execute(['domain' => $domain]);
                                $perfId = $pdo->lastInsertId();
                            }
                            $stmt->execute(['id' => $id, 'perf' => $perfId, 'score' => $score]);
                        }
                    }
                }
            }

            // 8. Modèles IA (OUTIL_MODELE)
            if (isset($data['models']) && is_array($data['models'])) {
                $pdo->prepare("DELETE FROM OUTIL_MODELE WHERE IDOUT = :id")->execute(['id' => $id]);
                if (!empty($data['models'])) {
                    $stmt = $pdo->prepare("INSERT INTO OUTIL_MODELE (IDOUT, IDMOD) VALUES (:id, :mod)");
                    foreach ($data['models'] as $model) {
                        $modelId = $model['id'] ?? null;
                        if ($modelId) {
                            $stmt->execute(['id' => $id, 'mod' => $modelId]);
                        }
                    }
                }
            }

            // 9. Plans tarifaires (remplacement complet avec suppression des dépendances)
            if (isset($data['pricingPlans']) && is_array($data['pricingPlans'])) {
                // Récupérer les IDs des anciens plans de l'outil
                $oldPlansStmt = $pdo->prepare("SELECT ID_PRICING_PLAN FROM PRICING_PLANS WHERE IDOUT = :id");
                $oldPlansStmt->execute(['id' => $id]);
                $oldPlanIds = $oldPlansStmt->fetchAll(PDO::FETCH_COLUMN);

                if (!empty($oldPlanIds)) {
                    // Supprimer les dépendances dans l'ordre inverse des contraintes
                    $placeholders = implode(',', array_fill(0, count($oldPlanIds), '?'));
                    // a) feature_pricing
                    $delFeatPricing = $pdo->prepare("DELETE FROM FEATURE_PRICING WHERE ID_PRICING_PLAN IN ($placeholders)");
                    $delFeatPricing->execute($oldPlanIds);
                    // b) pricing_modele_limite (via pricing_modele)
                    $delModeleLimite = $pdo->prepare("
                    DELETE FROM PRICING_MODELE_LIMITE 
                    WHERE ID_PRICING_MODELE IN (
                        SELECT ID_PRICING_MODELE FROM PRICING_MODELE WHERE ID_PRICING_PLAN IN ($placeholders)
                    )
                ");
                    $delModeleLimite->execute($oldPlanIds);
                    // c) pricing_modele
                    $delModele = $pdo->prepare("DELETE FROM PRICING_MODELE WHERE ID_PRICING_PLAN IN ($placeholders)");
                    $delModele->execute($oldPlanIds);
                    // d) finalement, supprimer les plans
                    $delPlans = $pdo->prepare("DELETE FROM PRICING_PLANS WHERE IDOUT = :id");
                    $delPlans->execute(['id' => $id]);
                }

                // Insérer les nouveaux plans
                if (!empty($data['pricingPlans'])) {
                    $stmtPlan = $pdo->prepare("
                    INSERT INTO PRICING_PLANS (NOM, PRIX, DEVISE, PERIODE, TYPE, DESCRIPTION, IDOUT)
                    VALUES (:name, :price, :currency, :period, :type, :description, :toolId)
                ");
                    foreach ($data['pricingPlans'] as $plan) {
                        $planName = cleanString($plan['name'] ?? '');
                        if ($planName === '')
                            continue;
                        $stmtPlan->execute([
                            'name' => $planName,
                            'price' => (float) ($plan['price'] ?? 0),
                            'currency' => cleanString($plan['currency'] ?? '€'),
                            'period' => cleanString($plan['period'] ?? 'month'),
                            'type' => cleanString($plan['type'] ?? 'paid'),
                            'description' => cleanString($plan['description'] ?? ''),
                            'toolId' => $id
                        ]);
                        $planId = $pdo->lastInsertId();

                        // Fonctionnalités du plan (FEATURE_PRICING)
                        if (!empty($plan['features']) && is_array($plan['features'])) {
                            $stmtFeatPlan = $pdo->prepare("INSERT INTO FEATURE_PRICING (ID_FEATURE, ID_PRICING_PLAN) VALUES (:feat, :plan)");
                            foreach ($plan['features'] as $featName) {
                                $featName = cleanString($featName);
                                if ($featName === '')
                                    continue;
                                $stmtFind = $pdo->prepare("SELECT ID_FEATURE FROM FEATURES WHERE NOM = :name LIMIT 1");
                                $stmtFind->execute(['name' => $featName]);
                                $fid = $stmtFind->fetchColumn();
                                if (!$fid) {
                                    $pdo->prepare("INSERT INTO FEATURES (NOM) VALUES (:name)")->execute(['name' => $featName]);
                                    $fid = $pdo->lastInsertId();
                                }
                                $stmtFeatPlan->execute(['feat' => $fid, 'plan' => $planId]);
                            }
                        }

                        // Modèles accessibles dans ce plan (PRICING_MODELE)
                        if (!empty($plan['availableModels']) && is_array($plan['availableModels'])) {
                            $stmtModelPlan = $pdo->prepare("INSERT INTO PRICING_MODELE (ID_PRICING_PLAN, IDMOD) VALUES (:plan, :mod)");
                            foreach ($plan['availableModels'] as $modelRef) {
                                $modelId = $modelRef['modelId'] ?? null;
                                if (!$modelId)
                                    continue;
                                $stmtModelPlan->execute(['plan' => $planId, 'mod' => $modelId]);
                                $pricingModeleId = $pdo->lastInsertId();

                                // Limites du modèle dans ce plan (PRICING_MODELE_LIMITE)
                                if (!empty($modelRef['limits']) && is_array($modelRef['limits'])) {
                                    $stmtLimit = $pdo->prepare("
                                    INSERT INTO PRICING_MODELE_LIMITE (ID_PRICING_MODELE, TYPE_LIMITE, VALEUR, PERIODE)
                                    VALUES (:pmId, :type, :value, :period)
                                ");
                                    foreach ($modelRef['limits'] as $limit) {
                                        $limitType = cleanString($limit['type'] ?? '');
                                        $limitValue = (int) ($limit['value'] ?? 0);
                                        $limitPeriod = cleanString($limit['period'] ?? '');
                                        if ($limitType && $limitValue > 0 && $limitPeriod) {
                                            $stmtLimit->execute([
                                                'pmId' => $pricingModeleId,
                                                'type' => $limitType,
                                                'value' => $limitValue,
                                                'period' => $limitPeriod
                                            ]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            $pdo->commit();
            ok(['id' => (string) $id], 'Outil mis à jour avec succès');
        } catch (Throwable $e) {
            $pdo->rollBack();
            fail('Erreur lors de la mise à jour : ' . $e->getMessage(), 500, ['trace' => $e->getTraceAsString()]);
        }
    }

    public function addToolToCategory(array $data)
    {
        $this->requireAdmin($data);
        $toolId = $data['toolId'] ?? null;
        $categoryId = $data['categoryId'] ?? null;
        if (!$toolId || !$categoryId)
            fail('ID outil et catégorie requis');
        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->prepare("INSERT IGNORE INTO OUTIL_CATEGORIE (IDOUT, ID_CATEGORIE) VALUES (:tool, :cat)");
        $stmt->execute(['tool' => $toolId, 'cat' => $categoryId]);
        ok([], 'Outil ajouté à la catégorie');
    }

    public function removeToolFromCategory(array $data)
    {
        $this->requireAdmin($data);
        $toolId = $data['toolId'] ?? null;
        $categoryId = $data['categoryId'] ?? null;
        if (!$toolId || !$categoryId)
            fail('ID outil et catégorie requis');
        $pdo = require __DIR__ . '/../config/database.php';
        $stmt = $pdo->prepare("DELETE FROM OUTIL_CATEGORIE WHERE IDOUT = :tool AND ID_CATEGORIE = :cat");
        $stmt->execute(['tool' => $toolId, 'cat' => $categoryId]);
        ok([], 'Outil retiré de la catégorie');
    }
}
