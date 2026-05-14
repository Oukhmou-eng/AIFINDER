import '../../styles/dashboard.css'

const stats = [
  { icon: '♥', value: '12', label: 'Favoris' },
  { icon: '▣', value: '3', label: 'Collections' },
  { icon: '☷', value: '7', label: 'Avis postés' },
  { icon: '◷', value: '2', label: 'Demandes' },
]

const favorites = [
  { icon: '💻', name: 'Claude 3.5 Sonnet', maker: 'Anthropic', score: '9.5' },
  { icon: '🧠', name: 'GPT-4o', maker: 'OpenAI', score: '9.4' },
  { icon: '🎨', name: 'Midjourney v6', maker: 'MJ Labs', score: '9.2' },
]

const collections = [
  { icon: '💻', name: 'Mes outils de code', count: '3 outils', tools: '💻 🧠 🦙' },
  { icon: '🎨', name: 'IA créatives', count: '3 outils', tools: '🎨 🎬 🖼️' },
  { icon: '⭐', name: 'Essentiels quotidiens', count: '3 outils', tools: '💻 🧠 💡' },
]

function Dashboard() {
  return (
    <div className="user-page">
      <h1 className="page-title">Bonjour, Karim !</h1>
      <p className="page-sub">Voici un résumé de votre activité sur AIFinder.</p>

      <div className="stat-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-num">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="section-header">
        <div className="section-title">Mes favoris</div>
        <a className="voir-tout">Voir tout →</a>
      </div>

      <div className="tool-grid">
        {favorites.map((tool) => (
          <div className="tool-card" key={tool.name}>
            <div className="tool-header">
              <div className="tool-logo">{tool.icon}</div>
              <div>
                <div className="tool-name">{tool.name}</div>
                <div className="tool-dev">{tool.maker}</div>
              </div>
            </div>
            <div className="stars">
              <span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span>
              <span className="star-score">{tool.score}</span>
            </div>
            <button className="btn btn-light btn-full">▶ Tester</button>
          </div>
        ))}
      </div>

      <div className="section-header">
        <div className="section-title">Mes collections</div>
        <a className="voir-tout">Voir tout →</a>
      </div>

      <div className="collection-grid">
        {collections.map((collection) => (
          <div className="collection-card compact" key={collection.name}>
            <div className="col-header">
              <div className="col-icon">{collection.icon}</div>
              <div>
                <div className="col-name">{collection.name}</div>
                <div className="col-count">{collection.count}</div>
              </div>
            </div>
            <div className="collection-tools-line">{collection.tools}</div>
          </div>
        ))}
      </div>

      <div className="section-header">
        <div className="section-title">Notifications</div>
      </div>
      <div className="card">
        <div className="notif-list">
          <div className="notif-item">
            <div className="notif-dot"></div>
            <div>Votre demande de modification pour <strong>"GPT-4o"</strong> a été traitée.</div>
          </div>
          <div className="notif-item">
            <div className="notif-dot"></div>
            <div>Un nouvel outil IA dans la catégorie <strong>Code</strong> correspond à vos favoris.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
