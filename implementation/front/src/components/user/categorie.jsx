import '../../styles/categorie.css'

const categories = [
  ['🧠', 'Langage & Texte', '128 outils', 'Top : Claude 3.5, GPT-4o'],
  ['🎨', 'Image & Visuel', '64 outils', 'Top : Midjourney, DALL-E'],
  ['💻', 'Code & Dev', '42 outils', 'Top : Copilot, Cursor'],
  ['🔊', 'Audio & Voix', '31 outils', 'Top : ElevenLabs, Whisper'],
  ['🎬', 'Vidéo', '18 outils', 'Top : Runway, Sora'],
  ['🤖', 'Agents IA', '27 outils', 'Top : AutoGPT, CrewAI'],
]

const podium = [
  ['🥈', '🧠', 'GPT-4o', '9.4', ''],
  ['🥇', '💻', 'Claude 3.5 Sonnet', '9.5', 'first'],
  ['🥉', '🎨', 'Midjourney v6', '9.2', ''],
]

const ranking = [
  ['4', '🔊', 'ElevenLabs v2', 'ElevenLabs', 'Freemium', 'badge-freemium', '8.8'],
  ['5', '⭐', 'Gemini 1.5 Pro', 'Google', 'Gratuit+', 'badge-freeplus', '9.1'],
  ['6', '🦙', 'Llama 3.1 405B', 'Meta', 'Gratuit', 'badge-free', '8.8'],
  ['7', '🎬', 'Runway Gen-3', 'Runway', 'Payant', 'badge-paid', '8.6'],
]

function Categorie() {
  return (
    <div className="categorie-page">
      <nav className="home-nav">
        <a className="nav-logo"><div className="nav-logo-icon">✦</div>AIFinder</a>
        <ul className="nav-links">
          <li><a>Explorer</a></li>
          <li><a>Catégories</a></li>
          <li><a>Classement</a></li>
          <li><a>Comparer</a></li>
        </ul>
        <div className="nav-actions">
          <button className="btn btn-outline">Connexion</button>
          <button className="btn btn-dark">S'inscrire</button>
        </div>
      </nav>

      <main id="page-categories" className="page">
        <section className="categories-section">
          <h2>Explorer par catégorie</h2>
          <p>28 catégories disponibles</p>
          <div className="cat-grid-2">
            {categories.map(([icon, name, count, top]) => (
              <div className="cat-card-lg" key={name}>
                <span className="cat-icon">{icon}</span>
                <div className="cat-name">{name}</div>
                <div className="cat-count">{count}</div>
                <div className="cat-top">{top}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="ranking-section">
          <h2>Classement des meilleures IA</h2>
          <div className="rank-filters">
            <button className="filter-tab active">Toutes</button>
            <button className="filter-tab">Langage</button>
            <button className="filter-tab">Image</button>
            <button className="filter-tab">Gratuit</button>
          </div>

          <div className="podium-mini">
            {podium.map(([medal, icon, name, score, className]) => (
              <div className={`podium-mini-card ${className}`} key={name}>
                <span className="podium-medal">{medal}</span>
                <div className="podium-icon">{icon}</div>
                <div className="podium-name">{name}</div>
                <div className="podium-score">{score}</div>
              </div>
            ))}
          </div>

          <div className="rank-list-mini">
            {ranking.map(([num, icon, name, maker, badge, badgeClass, score]) => (
              <div className="rank-item-mini" key={num}>
                <span className="rank-num">{num}</span>
                <div className="rank-icon">{icon}</div>
                <div className="rank-info">
                  <div className="rank-name">{name} <span>{maker}</span></div>
                </div>
                <span className={`badge ${badgeClass}`}>{badge}</span>
                <div className="rank-score">{score}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Categorie
