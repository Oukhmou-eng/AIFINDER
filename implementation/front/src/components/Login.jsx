import { Link } from 'react-router-dom'
import { useState } from 'react'
import '../styles/login.css'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '', remember: false })
  const [error, setError]     = useState(null)
  const [success] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    const email    = formData.email.trim()
    const password = formData.password

    // Validations du main.js
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.')
      return
    }

    // backend ici plus tard
    console.log('Login:', formData)
  }

  return (
    <>
      <header className="site-header">
        <div className="logo">AI<span>Finder</span></div>
        <Link to="/" className="back-link">← Retour à l'accueil</Link>
      </header>

      <div className="auth-page">

        <div className="auth-left">
          <h1>Bon retour sur AIFinder</h1>
          <p className="auth-left-subtitle">
            Connectez-vous pour accéder à vos favoris,<br/>
            vos notes et tester vos outils IA préférés.
          </p>
          <ul className="features-list">
            <li>
              <span className="feature-icon">★</span>
              <div>
                <strong>Vos favoris vous attendent</strong>
                <p>Retrouvez tous vos outils sauvegardés</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">✏</span>
              <div>
                <strong>Vos avis et commentaires</strong>
                <p>Gérez vos contributions à la communauté</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">▶</span>
              <div>
                <strong>Reprenez vos tests API</strong>
                <p>Continuez là où vous vous étiez arrêté</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">+</span>
              <div>
                <strong>Suivez vos soumissions</strong>
                <p>Vérifiez le statut de vos outils proposés</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="auth-right">
          <div className="auth-tabs">
            <Link to="/register" className="tab">Créer un compte</Link>
            <Link to="/login" className="tab active">Se connecter</Link>
          </div>

          <h2>Connexion</h2>
          <p className="form-subtitle">Accédez à votre espace personnel</p>

          {error   && <div className="alert-error">{error}</div>}
          {success && <div className="alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <input
                type="email"
                id="email"
                placeholder="test@exemple.com"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                placeholder="Votre mot de passe"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={e => setFormData({ ...formData, remember: e.target.checked })}
                />
                Se souvenir de moi
              </label>
              <a href="#" className="forgot-link">Mot de passe oublié ?</a>
            </div>

            <button type="submit" className="btn-primary">Se connecter →</button>
          </form>

          <p className="switch-link">
            Pas encore de compte ? <Link to="/register">Créer un compte</Link>
          </p>
        </div>

      </div>
    </>
  )
}
