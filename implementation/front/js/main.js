// AIFinder - main.js
// Vérifications simples côté client (sans logique serveur)

document.addEventListener('DOMContentLoaded', function () {

    // --- Formulaire Inscription ---
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            const prenom   = document.getElementById('prenom').value.trim();
            const nom      = document.getElementById('nom').value.trim();
            const email    = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirm  = document.getElementById('confirm_password').value;

            if (!prenom || !nom || !email || !password || !confirm) {
                e.preventDefault();
                alert('Veuillez remplir tous les champs.');
                return;
            }
            if (password !== confirm) {
                e.preventDefault();
                alert('Les mots de passe ne correspondent pas.');
                return;
            }
            if (password.length < 8) {
                e.preventDefault();
                alert('Le mot de passe doit contenir au moins 8 caractères.');
                return;
            }
        });
    }

    // --- Formulaire Connexion ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            const email    = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            if (!email || !password) {
                e.preventDefault();
                alert('Veuillez remplir tous les champs.');
                return;
            }
        });
    }

});
