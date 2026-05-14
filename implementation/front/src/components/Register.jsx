import { Link } from 'react-router-dom'
import { useState } from 'react'
import '../styles/register.css'

export default function Register() {
  const [formData, setFormData] = useState({
    prenom: '', nom: '', email: '', password: '', confirm_password: ''
  })
  const [error, setError] = useState(null)

  const update = field => e => setFormData({ ...formData, [field]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    const { prenom, nom, email, password, confirm_password } = formData

    // Validations du main.js
    if (!prenom.trim() || !nom.trim() || !email.trim() || !password || !confirm_password) {
      setError('Veuillez remplir tous les champs.')
      return
    }

    if (password !== confirm_password) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    // backend ici plus tard
    console.log('Register:', formData)
  }

  return (
    <>
      <header className="site-header">
        <div className="logo">AI<span>Finder</span></div>
        <Link to="/" className="back-link">← Retour à l'accueil</Link>
      </header>

      <div className="auth-page">

        <div className="auth-left">
          <h1>Rejoignez AIFinder</h1>
          <p className="auth-left-subtitle">
            Accédez à toutes les fonctionnalités pour<br/>
            trouver, noter et tester les meilleurs outils IA.
          </p>
          <ul className="features-list">
            <li>
              <span className="feature-icon">★</span>
              <div>
                <strong>Sauvegardez vos favoris</strong>
                <p>Retrouvez vos outils préférés à tout moment</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">✏</span>
              <div>
                <strong>Notez et commentez</strong>
                <p>Partagez votre expérience avec la communauté</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">▶</span>
              <div>
                <strong>Testez via l'API</strong>
                <p>Lancez des prompts directement depuis l'application</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">+</span>
              <div>
                <strong>Proposez un outil IA</strong>
                <p>Soumettez un outil pour validation par l'équipe</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="auth-right">
          <div className="auth-tabs">
            <Link to="/register" className="tab active">Créer un compte</Link>
            <Link to="/login" className="tab">Se connecter</Link>
          </div>

          <h2>Inscription</h2>
          <p className="form-subtitle">Créez votre compte gratuit en quelques secondes</p>

          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prenom">Prénom</label>
                <input
                  type="text" id="prenom" placeholder="Karim" required
                  value={formData.prenom} onChange={update('prenom')}
                />
              </div>
              <div className="form-group">
                <label htmlFor="nom">Nom</label>
                <input
                  type="text" id="nom" placeholder="Benali" required
                  value={formData.nom} onChange={update('nom')}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <input
                type="email" id="email" placeholder="karim@exemple.com" required
                value={formData.email} onChange={update('email')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password" id="password" placeholder="8 caractères minimum" required
                value={formData.password} onChange={update('password')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password">Confirmer le mot de passe</label>
              <input
                type="password" id="confirm_password" placeholder="Répétez votre mot de passe" required
                value={formData.confirm_password} onChange={update('confirm_password')}
              />
            </div>

            <button type="submit" className="btn-primary">Créer mon compte →</button>
          </form>

          <p className="switch-link">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>

      </div>
    </>
  )
}