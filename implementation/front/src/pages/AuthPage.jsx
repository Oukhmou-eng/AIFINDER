import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import "../styles/AuthPage.css";

export default function AuthPage() {
  const navigate = useNavigate();
  const { mode } = useParams();
  const isRegister = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmValue, setConfirmValue] = useState("");

  function passwordLevel() {
    if (passwordValue.length >= 8) return "fort";
    if (passwordValue.length >= 6) return "moyen";
    if (passwordValue.length > 0) return "faible";
    return "";
  }

  function handleLogin(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = form.get("email");
    const password = form.get("password");

    if (!email || !password) {
      setMessageType("error");
      setMessage("Veuillez remplir email et mot de passe.");
      return;
    }

    if (password.length < 4) {
      setMessageType("error");
      setMessage("Le mot de passe doit contenir au moins 4 caracteres.");
      return;
    }

    // PHP/FETCH: remplacer cette simulation par un POST vers login.php.
    // Envoyer email et password. PHP decide ensuite la session et peut renvoyer la route de destination.
    console.log("Login simule", { email, password });
    setLoading(true);
    setMessageType("success");
    setMessage("Connexion acceptee. Redirection vers votre espace...");
    setTimeout(() => navigate("/user"), 700);
  }

  function handleRegister(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const user = {
      nom: form.get("nom"),
      prenom: form.get("prenom"),
      email: form.get("email"),
      password: form.get("password"),
      passwordConfirm: form.get("password_confirm")
    };

    if (!user.nom || !user.prenom || !user.email || !user.password) {
      setMessageType("error");
      setMessage("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (user.password.length < 4) {
      setMessageType("error");
      setMessage("Le mot de passe doit contenir au moins 4 caracteres.");
      return;
    }

    if (user.password !== user.passwordConfirm) {
      setMessageType("error");
      setMessage("Les deux mots de passe ne sont pas identiques.");
      return;
    }

    // PHP/FETCH: remplacer cette simulation par un POST vers register.php.
    // Apres inscription, PHP peut connecter l'utilisateur ou le renvoyer vers /login.
    console.log("Register simule", user);
    setLoading(true);
    setMessageType("success");
    setMessage("Compte cree. Redirection vers le dashboard utilisateur...");
    setTimeout(() => navigate("/user"), 700);
  }

  function handleSocialLogin(provider) {
    // PHP/FETCH: remplacer par une redirection OAuth ou un endpoint PHP selon le fournisseur choisi.
    setMessageType("success");
    setMessage("Connexion " + provider + " a brancher avec le backend.");
  }

  return (
    <>
      <Navbar />
      <main className="auth-page">
        <section className="auth-simple">
          <form className="auth-form" onSubmit={isRegister ? handleRegister : handleLogin}>
            <div className="auth-head">
              <Link className="auth-home-link" to="/">{"<"} Accueil</Link>
              <div className="auth-brand-mark">AI</div>
              <h1>{isRegister ? "Creer un compte" : "Connexion"}</h1>
              <p>{isRegister ? "Inscrivez-vous pour proposer et suivre vos outils IA." : "Connectez-vous pour acceder a votre espace utilisateur."}</p>
            </div>

            <div className="auth-tabs">
              <Link className={!isRegister ? "active" : ""} to="/login">Connexion</Link>
              <Link className={isRegister ? "active" : ""} to="/register">Inscription</Link>
            </div>

            <div className="social-auth">
              <button type="button" onClick={() => handleSocialLogin("Google")}>Google</button>
              <button type="button" onClick={() => handleSocialLogin("GitHub")}>GitHub</button>
            </div>

            <div className="auth-divider"><span>ou avec email</span></div>

            {isRegister && (
              <div className="form-grid auth-name-grid">
                <div className="field">
                  <label>Nom</label>
                  <input name="nom" required placeholder="Amine" autoComplete="family-name" />
                </div>
                <div className="field">
                  <label>Prenom</label>
                  <input name="prenom" required placeholder="Maker" autoComplete="given-name" />
                </div>
              </div>
            )}

            <div className="field">
              <label>Email</label>
              <input name="email" type="email" required placeholder="amine@aifinder.dev" autoComplete="email" onChange={() => setMessage("")} />
            </div>

            <div className="field">
              <label>Mot de passe</label>
              <div className="password-field">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="mot de passe"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  onChange={(event) => {
                    setMessage("");
                    setPasswordValue(event.target.value);
                  }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Masquer" : "Voir"}
                </button>
              </div>
              {isRegister && passwordValue && (
                <div className={"password-meter " + passwordLevel()}>
                  <span></span>
                  <small>Mot de passe {passwordLevel()}</small>
                </div>
              )}
            </div>

            {isRegister && (
              <div className="field">
                <label>Confirmer mot de passe</label>
                <input
                  name="password_confirm"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="confirmer"
                  autoComplete="new-password"
                  onChange={(event) => {
                    setMessage("");
                    setConfirmValue(event.target.value);
                  }}
                />
                {confirmValue && passwordValue !== confirmValue && <small className="input-error">Les mots de passe ne correspondent pas.</small>}
              </div>
            )}

            {message && <div className={"auth-message " + messageType}>{message}</div>}

            <button className="btn primary full" type="submit" disabled={loading}>
              {loading ? "Veuillez patienter..." : isRegister ? "S'inscrire" : "Se connecter"}
            </button>

            {!isRegister && (
              <div className="auth-row">
                <label className="remember"><input type="checkbox" /> Se souvenir de moi</label>
                <button className="link-btn" type="button" onClick={() => setMessage("Recuperation de mot de passe a brancher avec PHP.")}>Mot de passe oublie ?</button>
              </div>
            )}

            {isRegister && (
              <label className="terms-check"><input type="checkbox" defaultChecked /> J'accepte les conditions d'utilisation</label>
            )}

            <p className="auth-help">
              {isRegister ? "Deja un compte ?" : "Pas encore de compte ?"}{" "}
              <Link to={isRegister ? "/login" : "/register"}>
                {isRegister ? "Se connecter" : "Creer un compte"}
              </Link>
            </p>
          </form>
        </section>
      </main>
    </>
  );
}
