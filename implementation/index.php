<?php
session_start();

require_once "back/controllers/UserController.php";
$controller = new UserController();

// -----------------------------------------------
// ACTIONS (quand un formulaire est soumis)
// -----------------------------------------------

// Action login
if (isset($_POST['action']) && $_POST['action'] === 'login') {
    $controller->login($_POST['email'], $_POST['password']);
}

// Action register
if (isset($_POST['action']) && $_POST['action'] === 'register') {
    $controller->register(
        $_POST['prenom'],
        $_POST['nom'],
        $_POST['email'],
        $_POST['password'],
        $_POST['confirm_password']
    );
}

// Action logout
if (isset($_POST['action']) && $_POST['action'] === 'logout') {
    $controller->logout();
}


$page = $_GET['page'] ?? 'login';

// Si l'utilisateur est connecté et essaie d'aller sur login/register
// → on le redirige vers home automatiquement
if (isset($_SESSION['user_id']) && ($page === 'login' || $page === 'register')) {
    header("Location: index.php?page=home");
    exit();
}

// Si l'utilisateur n'est PAS connecté et essaie d'aller sur home
// → on le redirige vers login
if (!isset($_SESSION['user_id']) && $page === 'home') {
    header("Location: index.php?page=login");
    exit();
}

// Afficher la bonne page
switch ($page) {
    case 'register':
        include "back/views/Register.php";
        break;
    case 'home':
        include "back/views/home.php";
        break;
    case 'login':
    default:
        include "back/views/Login.php";
        break;
}
