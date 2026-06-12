<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AIFinder - Connexion</title>
    <link rel="stylesheet" href="front/css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>

    <header class="site-header">
        <div class="logo">AI<span>Finder</span></div>
        <a href="index.php" class="back-link">← Retour à l'accueil</a>
    </header>

    <div class="auth-page">

        <!-- COLONNE GAUCHE -->
        <div class="auth-left">
            <h1>Bon retour sur AIFinder</h1>
            <p class="auth-left-subtitle">
                Connectez-vous pour accéder à vos favoris,<br>
                vos notes et tester vos outils IA préférés.
            </p>
            <ul class="features-list">
                <li>
                    <span class="feature-icon">★</span>
                    <div>
                        <strong>Vos favoris vous attendent</strong>
                        <p>Retrouvez tous vos outils sauvegardés</p>
                    </div>
                </li>
                <li>
                    <span class="feature-icon">✏</span>
                    <div>
                        <strong>Vos avis et commentaires</strong>
                        <p>Gérez vos contributions à la communauté</p>
                    </div>
                </li>
                <li>
                    <span class="feature-icon">▶</span>
                    <div>
                        <strong>Reprenez vos tests API</strong>
                        <p>Continuez là où vous vous étiez arrêté</p>
                    </div>
                </li>
                <li>
                    <span class="feature-icon">+</span>
                    <div>
                        <strong>Suivez vos soumissions</strong>
                        <p>Vérifiez le statut de vos outils proposés</p>
                    </div>
                </li>
            </ul>
        </div>

        <!-- COLONNE DROITE -->
        <div class="auth-right">

            <div class="auth-tabs">
                <a href="?page=register" class="tab">Créer un compte</a>
                <a href="?page=login" class="tab active">Se connecter</a>
            </div>

            <h2>Connexion</h2>
            <p class="form-subtitle">Accédez à votre espace personnel</p>

            <?php if (isset($_SESSION['error'])): ?>
                <div class="alert-error">
                    <?= $_SESSION['error']; ?>
                    <?php unset($_SESSION['error']); ?>
                </div>
            <?php endif; ?>

            <?php if (isset($_SESSION['success'])): ?>
                <div class="alert-success">
                    <?= $_SESSION['success']; ?>
                    <?php unset($_SESSION['success']); ?>
                </div>
            <?php endif; ?>

            <form action="index.php" method="POST" id="loginForm">

                <!-- Dit au controller quelle action faire -->
                <input type="hidden" name="action" value="login">

                <div class="form-group">
                    <label for="email">Adresse email</label>
                    <input type="email" id="email" name="email" placeholder="test@exemple.com" required>
                </div>

                <div class="form-group">
                    <label for="password">Mot de passe</label>
                    <input type="password" id="password" name="password" placeholder="Votre mot de passe" required>
                </div>

                <div class="form-options">
                    <label class="checkbox-label">
                        <input type="checkbox" name="remember"> Se souvenir de moi
                    </label>
                    <a href="#" class="forgot-link">Mot de passe oublié ?</a>
                </div>

                <button type="submit" class="btn-primary">Se connecter →</button>

            </form>

            <p class="switch-link">
                Pas encore de compte ? <a href="?page=register">Créer un compte</a>
            </p>

      

        </div>
    </div>

    <script src="front/js/main.js"></script>
</body>
</html>
