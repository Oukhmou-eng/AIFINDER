import '../../styles/notifications.css'

const notifications = [
  { color: 'green', icon: '✎', unread: true, text: <>Votre demande de modification pour <strong>"GPT-4o"</strong> a été traitée avec succès.</>, time: 'il y a 2 heures' },
  { color: 'blue', icon: '🤖', unread: true, text: <>Un nouvel outil IA dans la catégorie <strong>Code</strong> correspond à vos favoris : <strong>DeepSeek Coder V2</strong>.</>, time: 'il y a 5 heures' },
  { color: 'orange', icon: '🗑', unread: true, text: <>Votre demande de suppression de <strong>"FakeAI Tool"</strong> a été approuvée et traitée.</>, time: 'hier' },
  { color: 'green', icon: '💬', unread: true, text: <>Votre avis sur <strong>Claude 3.5 Sonnet</strong> a été approuvé et publié.</>, time: 'il y a 2 jours' },
  { color: 'gray', icon: '☻', unread: false, text: <>Bienvenue sur <strong>AIFinder</strong> ! Commencez par explorer les meilleurs outils IA.</>, time: 'il y a 4 mois' },
]

function Notifications() {
  return (
    <div className="notifications-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-sub">4 nouvelles notifications</p>
        </div>
        <button className="btn btn-light">✓ Tout marquer comme lu</button>
      </div>

      <div className="notif-page-list">
        {notifications.map((notif, index) => (
          <div className={`notif-page-item ${notif.unread ? 'unread' : ''}`} key={index}>
            <div className={`notif-icon-wrap ${notif.color}`}>{notif.icon}</div>
            <div className="notif-content">
              <div className="notif-msg">{notif.text}</div>
              <div className="notif-time">{notif.time}</div>
            </div>
            {notif.unread && <div className="unread-dot"></div>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Notifications
