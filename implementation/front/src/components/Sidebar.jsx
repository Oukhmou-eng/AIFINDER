export default function Sidebar({ type, active, setActive, items }) {
  return (
    <aside className="sidebar">
      <div className={type === "admin" ? "profile-card admin-profile" : "profile-card"}>
        <div className="avatar-row">
          <div className="avatar">{type === "admin" ? "AD" : "AM"}</div>
          <div>
            <h3>{type === "admin" ? "Admin Principal" : "Amine Maker"}</h3>
            <p className="mini">{type === "admin" ? "Acces total - audit actif" : "Utilisateur expert - profil 86%"}</p>
          </div>
        </div>
        {type !== "admin" && (
          <div className="progress">
            <i style={{ width: "86%" }}></i>
          </div>
        )}
      </div>

      <div className="nav-title">{type === "admin" ? "Pilotage" : "Espace personnel"}</div>
      <div className="side-nav">
        {items.map((item) => (
          <button
            key={item.id}
            className={active === item.id ? "active" : ""}
            onClick={() => setActive(item.id)}
          >
            <span>{item.label}</span>
            {item.badge !== undefined && <span className={item.badgeClass || "badge"}>{item.badge}</span>}
          </button>
        ))}
      </div>
    </aside>
  );
}
