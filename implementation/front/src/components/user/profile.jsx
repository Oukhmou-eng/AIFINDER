import '../../styles/profile.css'

const stats = [
  ['12', 'Favoris'],
  ['3', 'Collections'],
  ['7', 'Avis postés'],
  ['2', 'Demandes'],
]

const preferences = [
  ['Notifications par email', true],
  ['Alertes nouveaux outils', true],
  ['Newsletter mensuelle', false],
  ['Profil public', false],
  ['Mode sombre', false],
]

const activity = [
  ['♥', '#dcfce7', 'Ajouté GPT-4o aux favoris', 'il y a 2 heures'],
  ['✎', '#dbeafe', 'Demande de modification soumise', 'il y a 2 heures'],
  ['▣', '#fff7ed', 'Collection "IA créatives" créée', 'hier'],
  ['★', '#fef9c3', 'Avis posté sur Midjourney v6', 'il y a 3 jours'],
]

function Profile() {
  return (
    <div className="profile-page">
      <h1 className="page-title">Mon profil</h1>
      <p className="page-sub">Gérez vos informations personnelles et préférences</p>

      <div className="profile-hero">
        <div className="profile-avatar">KB</div>
        <div className="profile-user-main">
          <div className="profile-name">Karim B.</div>
          <div className="profile-email">karim.b@email.com</div>
          <span className="tag tag-green">Compte actif</span>
        </div>
        <button className="btn btn-light">✎ Modifier le profil</button>
      </div>

      <div className="profile-stats">
        {stats.map(([value, label]) => (
          <div className="pstat" key={label}>
            <div className="pstat-num">{value}</div>
            <div className="pstat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="profile-sections">
        <div className="profile-section-card">
          <div className="psc-title">◉ Informations personnelles</div>
          <div className="profile-field"><label>Prénom et Nom</label><div className="val">Karim B.</div></div>
          <div className="profile-field"><label>Email</label><div className="val">karim.b@email.com</div></div>
          <div className="profile-field"><label>Membre depuis</label><div className="val">Janvier 2024</div></div>
          <div className="profile-field"><label>Langue préférée</label><div className="val">Français</div></div>
          <button className="btn btn-dark btn-full">✎ Modifier mes informations</button>
        </div>

        <div className="profile-section-card">
          <div className="psc-title">☰ Préférences & Notifications</div>
          {preferences.map(([label, enabled]) => (
            <div className="pref-row" key={label}>
              <span>{label}</span>
              <div className={`toggle ${enabled ? '' : 'off'}`}></div>
            </div>
          ))}
          <button className="btn btn-light btn-full save-btn">Sauvegarder les préférences</button>
        </div>

        <div className="profile-section-card">
          <div className="psc-title">▣ Sécurité</div>
          <div className="profile-field"><label>Mot de passe</label><div className="val">••••••••••••</div></div>
          <div className="profile-field"><label>Dernière connexion</label><div className="val">Aujourd'hui à 09:42</div></div>
          <div className="profile-field"><label>Authentification 2FA</label><div className="val val-red">Non activée</div></div>
          <button className="btn btn-light btn-full">⚿ Changer le mot de passe</button>
          <button className="btn btn-light btn-full second-btn">▦ Activer la 2FA</button>
        </div>

        <div className="profile-section-card">
          <div className="psc-title">⌁ Mon activité récente</div>
          <div className="activity-list">
            {activity.map(([icon, bg, title, time]) => (
              <div className="activity-row" key={title}>
                <div className="activity-icon" style={{ background: bg }}>{icon}</div>
                <div>
                  <div className="activity-title">{title}</div>
                  <div className="activity-time">{time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
