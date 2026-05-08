function badgeClass(value) {
  if (value === "Gratuit" || value === "Open source" || value === "Verifie" || value === "Publie") {
    return "ok";
  }
  if (value === "Payant" || value === "Signale" || value === "Refuse") {
    return "danger";
  }
  if (value === "A revalider" || value === "En attente") {
    return "warn";
  }
  return "";
}

export default function ToolCard({ tool, mode, onFavorite, onReport }) {
  return (
    <article className="tool-card">
      <div className="tool-top">
        <div className="tool-icon">{tool.icon || tool.name[0]}</div>
        <div>
          <h3>{tool.name}</h3>
          <p className="mini">{tool.category} - {tool.reviews || "outil propose"} avis</p>
        </div>
        <span className={"badge " + badgeClass(tool.status || tool.pricing)}>{tool.status || tool.pricing}</span>
      </div>

      <p className="tool-desc">{tool.description}</p>

      <div className="meta-grid">
        <div className="meta">Models.type<b>{tool.pricing}</b></div>
        <div className="meta">api_url<b>{tool.api || "A verifier"}</b></div>
        <div className="meta">avis.note<b>{tool.rating || Math.round(tool.score / 20)}/5</b></div>
        <div className="meta">tags.nom<b>{(tool.tags || []).slice(0, 2).join(", ")}</b></div>
      </div>

      <div className="tool-actions">
        <div className="chips">
          {(tool.tags || []).map((tag) => <span className="badge" key={tag}>{tag}</span>)}
        </div>
        {mode === "user" && (
          <>
            <button className={tool.fav ? "btn fav-btn primary" : "btn fav-btn"} onClick={() => onFavorite(tool.id)}>
              <span className="fav-heart">{tool.fav ? "♥" : "♡"}</span>{tool.fav ? "Favori" : "Ajouter"}
            </button>
            <button className="btn" onClick={() => onReport(tool)}>Signaler</button>
          </>
        )}
      </div>
    </article>
  );
}
