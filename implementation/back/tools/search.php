<?php
header('Content-Type: application/json');
require_once '../../config/database'; // adaptez le chemin vers votre connexion PDO

// Récupération des paramètres
$query = $_GET['q'] ?? '';
$category = $_GET['category'] ?? null;
$pricing = isset($_GET['pricing']) ? explode(',', $_GET['pricing']) : null;
$platforms = isset($_GET['platforms']) ? explode(',', $_GET['platforms']) : null;
$functions = isset($_GET['functions']) ? explode(',', $_GET['functions']) : null;
$models = isset($_GET['models']) ? explode(',', $_GET['models']) : null;
$sortBy = $_GET['sortBy'] ?? 'trending';

// Construction de la requête SQL avec priorité
$sql = "
    SELECT 
        o.idOut,
        o.nom,
        o.slug,
        o.description_courte,
        o.description_longue,
        o.logo_url,
        o.site_url,
        o.pricing_type,
        o.created_at,
        COALESCE(AVG(a.note), 0) AS note_moyenne,
        COUNT(DISTINCT a.id_avis) AS nombre_avis,
        -- Priorité de recherche
        CASE
            WHEN o.nom = :query THEN 1
            WHEN o.nom LIKE CONCAT('%', :query, '%') THEN 2
            WHEN MATCH(o.recherche_texte) AGAINST(:query IN NATURAL LANGUAGE MODE) THEN 3
            ELSE 4
        END AS priority
    FROM outils o
    LEFT JOIN avis a ON o.idOut = a.idOut
    LEFT JOIN outil_categorie oc ON o.idOut = oc.idOut
    LEFT JOIN categories c ON oc.id_Cat = c.id_Cat
    LEFT JOIN outil_plateforme op ON o.idOut = op.idOut
    LEFT JOIN plateforme p ON op.id = p.id
    LEFT JOIN outil_feature ofe ON o.idOut = ofe.idOut
    LEFT JOIN features f ON ofe.id_features = f.id_features
    LEFT JOIN outil_model om ON o.idOut = om.idOut
    LEFT JOIN models m ON om.idMod = m.idMod
    WHERE 1=1
";

// Ajout des conditions
if (!empty($query)) {
    $sql .= " AND (o.nom = :query OR o.nom LIKE :like_query OR MATCH(o.recherche_texte) AGAINST(:match_query IN NATURAL LANGUAGE MODE))";
}
if ($category) {
    $sql .= " AND c.slug = :category";
}
if ($pricing) {
    $placeholders = implode(',', array_fill(0, count($pricing), '?'));
    $sql .= " AND o.pricing_type IN ($placeholders)";
}
if ($platforms) {
    $placeholders = implode(',', array_fill(0, count($platforms), '?'));
    $sql .= " AND p.nom IN ($placeholders)";
}
if ($functions) {
    $placeholders = implode(',', array_fill(0, count($functions), '?'));
    $sql .= " AND f.name IN ($placeholders)";
}
if ($models) {
    $placeholders = implode(',', array_fill(0, count($models), '?'));
    $sql .= " AND m.idMod IN ($placeholders)";
}

$sql .= " GROUP BY o.idOut ORDER BY priority ASC, ";

switch ($sortBy) {
    case 'rating':
        $sql .= "note_moyenne DESC";
        break;
    case 'usage':
        $sql .= "nombre_avis DESC";
        break;
    case 'recent':
        $sql .= "o.created_at DESC";
        break;
    default:
        $sql .= "priority ASC"; // trending = priorité puis note
        break;
}

// Préparation et exécution
$stmt = $pdo->prepare($sql);

// Liaison des paramètres
$paramIndex = 1;
if (!empty($query)) {
    $stmt->bindParam(':query', $query);
    $likeQuery = "%$query%";
    $stmt->bindParam(':like_query', $likeQuery);
    $stmt->bindParam(':match_query', $query);
}
if ($category) {
    $stmt->bindParam(':category', $category);
}
if ($pricing) {
    foreach ($pricing as $p) {
        $stmt->bindValue($paramIndex++, $p);
    }
}
if ($platforms) {
    foreach ($platforms as $plat) {
        $stmt->bindValue($paramIndex++, $plat);
    }
}
if ($functions) {
    foreach ($functions as $func) {
        $stmt->bindValue($paramIndex++, $func);
    }
}
if ($models) {
    foreach ($models as $mod) {
        $stmt->bindValue($paramIndex++, $mod);
    }
}

$stmt->execute();
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'total' => count($results),
    'tools' => $results
]);