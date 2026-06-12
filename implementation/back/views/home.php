<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AIFinder - Accueil</title>
    <link rel="stylesheet" href="front/css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
    <style>
        .home-page {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: calc(100vh - 65px);
            text-align: center;
            padding: 40px 20px;
        }
        .home-page h1 {
            font-family: 'Sora', sans-serif;
            font-size: 2rem;
            font-weight: 800;
            color: var(--texte-noir);
            margin-bottom: 12px;
        }
        .home-page p {
            color: var(--texte-gris);
            font-size: 1rem;
            margin-bottom: 32px;
        }
        .btn-logout {
            padding: 10px 28px;
            background-color: var(--texte-noir);
            color: white;
            border: none;
            border-radius: 7px;
            font-family: 'Sora', sans-serif;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .btn-logout:hover { background-color: var(--violet); }
    </style>
</head>
<body>

    <header class="site-header">
        <div class="logo">AI<span>Finder</span></div>
        <form action="index.php" method="POST" style="margin:0">
            <input type="hidden" name="action" value="logout">
            <button class="btn-logout">Se déconnecter</button>
        </form>
    </header>

    <div class="home-page">
        <h1>Bienvenue, <?= htmlspecialchars($_SESSION['user_prenom']); ?> 👋</h1>
        <p>Vous êtes connecté avec : <?= htmlspecialchars($_SESSION['user_email']); ?></p>
        <p style="color: #9ca3af; font-size:0.85rem;">Cette page est vide pour l'instant.</p>
    </div>

</body>
</html>
