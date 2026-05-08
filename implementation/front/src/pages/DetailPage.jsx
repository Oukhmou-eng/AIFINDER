import Navbar from "../components/Navbar.jsx";
import { toolsData } from "../database.js";
import "../styles/DetailPage.css";

export default function DetailPage() {
  const tool = toolsData.find((item) => item.name === "Cursor") || toolsData[0];

  return (
    <>
      <Navbar />
      <main className="container detail-layout">
        <article className="card detail-hero">
          <div className="detail-title">
            <div className="big-icon">{tool.icon}</div>
            <div>
              <div className="chips">
                <span className="badge ok">{tool.status}</span>
                <span className="badge info">{tool.category}</span>
                <span className="badge">api_url</span>
                <span className="badge">plateforme</span>
              </div>
              <h1>{tool.name}</h1>
              <p className="muted">{tool.description}</p>
            </div>
            <button className="btn primary">Visiter le site</button>
          </div>

          <div className="tabs">
            <button className="active">Vue d'ensemble</button>
            <button>Metadonnees</button>
            <button>Avis</button>
            <button>Commentaires</button>
            <button>Signalements</button>
          </div>

          <div className="grid cols-2">
            <div className="feature"><h3>description_courte</h3><p className="mini">{tool.description}</p></div>
            <div className="feature"><h3>Models</h3><p className="mini">nom, type, licence, api_url, est_open_source, release_date.</p></div>
            <div className="feature"><h3>caracteristique</h3><p className="mini">cle, valeur et type_valeur associes a l'outil.</p></div>
            <div className="feature"><h3>plateforme / fournisseur</h3><p className="mini">{tool.platform} - {tool.provider}</p></div>
          </div>
        </article>

        <aside className="side-stack">
          <div className="card side-card"><h3>Score</h3><div className="price">{tool.score / 10}<span className="mini"> / 10</span></div><p className="mini">Base sur avis.note, commentaires, favoris et signalements.</p></div>
          <div className="card side-card">
            <h3>Metadonnees</h3>
            <div className="meta-grid">
              <div className="meta">type<b>{tool.pricing}</b></div>
              <div className="meta">licence<b>{tool.licence}</b></div>
              <div className="meta">api_url<b>{tool.api}</b></div>
              <div className="meta">created_at<b>{tool.created_at}</b></div>
            </div>
          </div>
          <div className="card side-card"><h3>Tags</h3><div className="chips">{tool.tags.map((tag) => <span className="badge" key={tag}>{tag}</span>)}</div></div>
          <div className="card side-card"><button className="btn">Ajouter aux favoris</button><button className="btn">Commenter</button><button className="btn danger">Signaler</button></div>
        </aside>
      </main>
    </>
  );
}
