<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AIFinder - Inscription</title>
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
            <h1>Rejoignez AIFinder</h1>
            <p class="auth-left-subtitle">
                Accédez à toutes les fonctionnalités pour<br>
                trouver, noter et tester les meilleurs outils IA.
            </p>
            <ul class="features-list">
                <li>
                    <span class="feature-icon">★</span>
                    <div>
                        <strong>Sauvegardez vos favoris</strong>
                        <p>Retrouvez vos outils préférés à tout moment</p>
                    </div>
                </li>
                <li>
                    <span class="feature-icon">✏</span>
                    <div>
                        <strong>Notez et commentez</strong>
                        <p>Partagez votre expérience avec la communauté</p>
                    </div>
                </li>
                <li>
                    <span class="feature-icon">▶</span>
                    <div>
                        <strong>Testez via l'API</strong>
                        <p>Lancez des prompts directement depuis l'application</p>
                    </div>
                </li>
                <li>
                    <span class="feature-icon">+</span>
                    <div>
                        <strong>Proposez un outil IA</strong>
                        <p>Soumettez un outil pour validation par l'équipe</p>
                    </div>
                </li>
            </ul>
        </div>

        <!-- COLONNE DROITE -->
        <div class="auth-right">

            <div class="auth-tabs">
                <a href="?page=register" class="tab active">Créer un compte</a>
                <a href="?page=login" class="tab">Se connecter</a>
            </div>

            <h2>Inscription</h2>
            <p class="form-subtitle">Créez votre compte gratuit en quelques secondes</p>

            <?php if (isset($_SESSION['error'])): ?>
                <div class="alert-error">
                    <?= $_SESSION['error']; ?>
                    <?php unset($_SESSION['error']); ?>
                </div>
            <?php endif; ?>

            <form action="index.php" method="POST" id="registerForm">

                <!-- Dit au controller quelle action faire -->
                <input type="hidden" name="action" value="register">

                <div class="form-row">
                    <div class="form-group">
                        <label for="prenom">Prénom</label>
                        <input type="text" id="prenom" name="prenom" placeholder="name" required>
                    </div>
                    <div class="form-group">
                        <label for="nom">Nom</label>
                        <input type="text" id="nom" name="nom" placeholder="lastname" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="email">Adresse email</label>
                    <input type="email" id="email" name="email" placeholder="test@exemple.com" required>
                </div>

                <div class="form-group">
                    <label for="password">Mot de passe</label>
                    <input type="password" id="password" name="password" placeholder="8 caractères minimum" required>
                </div>

                <div class="form-group">
                    <label for="confirm_password">Confirmer le mot de passe</label>
                    <input type="password" id="confirm_password" name="confirm_password" placeholder="Répétez votre mot de passe" required>
                </div>

                <button type="submit" class="btn-primary">Créer mon compte →</button>

            </form>

            <p class="switch-link">
                Déjà un compte ? <a href="?page=login">Se connecter</a>
            </p>

            

        </div>
    </div>

    <script src="front/js/main.js"></script>
</body>
</html>
