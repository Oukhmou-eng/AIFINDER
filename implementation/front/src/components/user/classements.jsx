import '../../styles/classements.css'

const topTools = [
  { place: 'second', medal: '🥈', icon: '🧠', name: 'GPT-4o', maker: 'OpenAI', score: '9.4' },
  { place: 'first', medal: '🥇', icon: '💻', name: 'Claude 3.5 Sonnet', maker: 'Anthropic', score: '9.5' },
  { place: 'third', medal: '🥉', icon: '🎨', name: 'Midjourney v6', maker: 'MJ Labs', score: '9.2' },
]

const ranking = [
  ['1', '💻', 'Claude 3.5 Sonnet', 'Anthropic', 'Langage', 'Gratuit+', 'badge-freeplus', '9.5', '★★★★★'],
  ['2', '🧠', 'GPT-4o', 'OpenAI', 'Langage', 'Gratuit+', 'badge-freeplus', '9.4', '★★★★★'],
  ['3', '🎨', 'Midjourney v6', 'MJ Labs', 'Image', 'Payant', 'badge-paid', '9.2', '★★★★★'],
  ['4', '🔊', 'ElevenLabs v2', 'ElevenLabs', 'Audio', 'Freemium', 'badge-freemium', '8.8', '★★★★☆'],
  ['5', '⭐', 'Gemini 1.5 Pro', 'Google', 'Langage', 'Gratuit+', 'badge-freeplus', '9.1', '★★★★★'],
  ['6', '🦙', 'Llama 3.1 405B', 'Meta', 'Langage', 'Gratuit', 'badge-free', '8.8', '★★★★☆'],
  ['7', '🎬', 'Runway Gen-3', 'Runway', 'Vidéo', 'Payant', 'badge-paid', '8.6', '★★★★☆'],
  ['8', '💡', 'Perplexity Pro', 'Perplexity', 'Recherche', 'Freemium', 'badge-freemium', '8.9', '★★★★☆'],
  ['9', '🔥', 'Mistral Large 2', 'Mistral AI', 'Langage', 'Freemium', 'badge-freemium', '8.7', '★★★★☆'],
  ['10', '🖼️', 'DALL-E 3', 'OpenAI', 'Image', 'Payant', 'badge-paid', '8.5', '★★★★☆'],
]

function Classements() {
  return (
    <div className="classements-page">
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

      <main id="page-classement">
        <div className="classement-header">
          <h1>Classement des meilleures IA</h1>
          <p>Basé sur les notes communautaires et l'utilisation réelle</p>
        </div>

        <div className="podium">
          {topTools.map((tool) => (
            <div className={`podium-card ${tool.place}`} key={tool.name}>
              <div className="podium-medal">{tool.medal}</div>
              <div className="podium-icon">{tool.icon}</div>
              <div className="podium-name">{tool.name}</div>
              <div className="podium-maker">{tool.maker}</div>
              <div className="podium-score">{tool.score}</div>
              <div className="stars">★★★★★</div>
            </div>
          ))}
        </div>

        <div className="filter-tabs">
          <button className="filter-tab active">Toutes</button>
          <button className="filter-tab">Langage</button>
          <button className="filter-tab">Image</button>
          <button className="filter-tab">Gratuit</button>
        </div>

        <div className="rank-list">
          {ranking.map(([num, icon, name, maker, tag, badge, badgeClass, score, stars]) => (
            <div className="rank-item" key={num}>
              <div className="rank-num">{num}</div>
              <div className="rank-icon">{icon}</div>
              <div className="rank-info">
                <div className="rank-name">{name} <span>{maker}</span></div>
                <div className="rank-tags"><span className="tag">{tag}</span><span className={`badge ${badgeClass}`}>{badge}</span></div>
              </div>
              <div className="rank-score-col">
                <div className="rank-score">{score}</div>
                <div className="stars">{stars}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Classements
