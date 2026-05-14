import '../../styles/demandes.css'

const stats = [
  { color: 'orange', icon: '◷', value: '1', label: 'En attente' },
  { color: 'green', icon: '✓', value: '1', label: 'Traitées' },
  { color: 'red', icon: '×', value: '0', label: 'Refusées' },
]

const demandes = [
  {
    type: 'delete',
    icon: '🗑',
    title: 'Suppression – FakeAI Tool',
    date: 'hier',
    desc: "Cet outil n'existe plus, le site est fermé",
    tag: 'Traité',
    tagClass: 'tag-green',
  },
  {
    type: 'edit',
    icon: '✎',
    title: 'Modification – Claude 3.5 Sonnet',
    date: 'il y a 2h',
    desc: 'Le lien vers le site officiel est incorrect',
    tag: 'En attente',
    tagClass: 'tag-yellow',
  },
]

function Demandes() {
  return (
    <div className="demandes-page">
      <h1 className="page-title">Mes demandes</h1>
      <p className="page-sub">Suivez l'état de vos demandes de modification, signalements et suppressions</p>

      <div className="demande-stats">
        {stats.map((stat) => (
          <div className="dem-stat" key={stat.label}>
            <div className={`dem-stat-icon ${stat.color}`}>{stat.icon}</div>
            <div>
              <div className={`dem-stat-num ${stat.color}`}>{stat.value}</div>
              <div className="dem-stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {demandes.map((demande) => (
        <div className="demande-card" key={demande.title}>
          <div className={`dem-icon ${demande.type}`}>{demande.icon}</div>
          <div className="dem-body">
            <div className="dem-title">{demande.title}</div>
            <div className="dem-date">{demande.date}</div>
            <div className="dem-desc">{demande.desc}</div>
          </div>
          <div className="dem-status">
            <span className={`tag ${demande.tagClass}`}>{demande.tag}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Demandes
