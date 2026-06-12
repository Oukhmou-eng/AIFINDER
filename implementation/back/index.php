<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
// ... le reste

session_start();

// Le reste de ton code (require, routes, etc.)

require_once __DIR__ . '/utils/validator.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    $input = [];
}

$data = array_merge($_GET, $_POST, $input);
$action = $data['action'] ?? 'home';

$routes = [
    'home' => ['HomeController', 'index', ['GET']],
    'tools' => ['HomeController', 'tools', ['GET']],
    'featured_tools' => ['HomeController', 'featuredTools', ['GET']],
    'tool' => ['HomeController', 'tool', ['GET']],
    'categories' => ['HomeController', 'categories', ['GET']],
    'models' => ['HomeController', 'models', ['GET']],
    'model' => ['HomeController', 'model', ['GET']],
    'reviews' => ['HomeController', 'reviews', ['GET']],
    'create_review' => ['HomeController', 'createReview', ['POST']],
    'report' => ['HomeController', 'report', ['POST']],
    'stats' => ['HomeController', 'stats', ['GET']],
    'searchTools' => ['HomeController', 'searchTools', ['GET']],
    
    'resource' => ['ResourceController', 'list', ['GET']],
    'resource_item' => ['ResourceController', 'item', ['GET']],
    

    'login' => ['AuthController', 'login', ['POST']],
    'register' => ['AuthController', 'register', ['POST']],
    'google_auth' => ['AuthController', 'googleAuth', ['POST']],
    'logout' => ['UserController', 'logout', ['POST']],
    'me' => ['UserController', 'me', ['GET']],
    'users' => ['UserController', 'listUsers', ['GET']],
    'user' => ['UserController', 'getUser', ['GET']],
    'update_user' => ['UserController', 'updateUser', ['PUT', 'PATCH', 'POST']],
    'delete_user' => ['UserController', 'deleteUser', ['DELETE', 'POST']],
    'favorite' => ['UserController', 'favorite', ['POST']],
    'notifications' => ['UserController', 'notifications', ['GET']],
    'collections' => ['UserController', 'collections', ['GET']],
    'create_collection' => ['UserController', 'createCollection', ['POST']],
    'submit_tool' => ['UserController', 'submitTool', ['POST']],
    'change_password' => ['UserController', 'changePassword', ['POST']],

    'admin_dashboard' => ['AdminController', 'dashboard', ['GET']],
    'admin_users' => ['AdminController', 'users', ['GET']],
    'admin_tools' => ['AdminController', 'tools', ['GET']],
    'admin_categories' => ['AdminController', 'categories', ['GET']],
    'admin_create_category' => ['AdminController', 'createCategory', ['POST']],
    'admin_update_category' => ['AdminController', 'updateCategory', ['PUT', 'PATCH', 'POST']],
    'admin_delete_category' => ['AdminController', 'deleteCategory', ['DELETE', 'POST']],
    
    'admin_models' => ['AdminController', 'models', ['GET']],
    'admin_create_model' => ['AdminController', 'createModel', ['POST']],
    'admin_update_model' => ['AdminController', 'updateModel', ['PUT', 'PATCH', 'POST']],
    'admin_delete_model' => ['AdminController', 'deleteModel', ['DELETE', 'POST']],
    
    'admin_notifications' => ['AdminController', 'notifications', ['GET']],
    'admin_send_notification' => ['AdminController', 'sendNotification', ['POST']],
    'admin_delete_notification' => ['AdminController', 'deleteNotification', ['DELETE', 'POST']],
    
    'admin_reports' => ['AdminController', 'reports', ['GET']],
    'admin_update_report_status' => ['AdminController', 'updateReportStatus', ['POST', 'PUT']],

    'admin_submissions'   => ['AdminController', 'submissions',   ['GET']],
    'admin_approve_tool'  => ['AdminController', 'approveTool',   ['POST']],
    'admin_reject_tool'   => ['AdminController', 'rejectTool',    ['POST']],
    'admin_delete_tool'   => ['AdminController', 'deleteTool',    ['DELETE', 'POST']],
    'admin_create_tool'   => ['AdminController', 'createTool',    ['POST']],
    'admin_validate_tool' => ['ValidationController', 'validateTool', ['POST']],
];

if (!isset($routes[$action])) {
    fail('Action inconnue: ' . $action, 404);
}

[$controllerName, $methodName, $allowedMethods] = $routes[$action];

if (!in_array($method, $allowedMethods, true)) {
    fail('Methode non autorisee', 405, ['allowed' => $allowedMethods]);
}

$controllerFile = __DIR__ . "/controllers/{$controllerName}.php";
if (!file_exists($controllerFile)) {
    fail('Controleur introuvable', 500);
}

require_once $controllerFile;

if (!class_exists($controllerName)) {
    fail('Classe controleur introuvable', 500);
}

try {
    $controller = new $controllerName();
    $controller->$methodName($data);
} catch (Throwable $e) {
    fail('Erreur serveur : ' . $e->getMessage(), 500, ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
}
