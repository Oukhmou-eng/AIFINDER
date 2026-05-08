import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import ToolCard from "../components/ToolCard.jsx";
import { categoriesData, commentsData, reportsData, toolsData } from "../database.js";
import "../styles/HomePage.css";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="container hero">
          <div>
            <span className="badge info">Catalogue base sur outils, categories, tags, avis et signalements</span>
            <h1>Trouvez <span>l'outil IA</span> fiable pour votre prochain workflow.</h1>
            <p>AIFinder organise les outils IA selon le MCDD fourni : outils, categories, tags, modeles, caracteristiques, plateformes, fournisseurs, avis et signalements.</p>
            <div className="search-hero">
              <span>⌕</span>
              <input placeholder="Ex : transcription reunion, agent code, generateur video, API OCR" />
              <Link className="btn primary" to="/catalogue">Rechercher</Link>
            </div>
            <div className="hero-tags">
              {categoriesData.slice(1, 7).map((cat) => <button className="pill-btn" key={cat}>{cat}</button>)}
            </div>
          </div>

        </section>

        <section className="container metrics">
          <div className="metric"><strong>{toolsData.length}</strong><span className="muted">outils publies</span></div>
          <div className="metric"><strong>{categoriesData.length}</strong><span className="muted">categories</span></div>
          <div className="metric"><strong>{commentsData.length}</strong><span className="muted">avis</span></div>
          <div className="metric"><strong>{reportsData.length}</strong><span className="muted">signalements</span></div>
        </section>

        <section className="container section">
          <div className="section-head">
            <div>
              <h2>Categories principales</h2>
              <p className="muted">Categories d'outils presentes dans le MCDD.</p>
            </div>
            <Link className="btn" to="/catalogue">Voir tout</Link>
          </div>
          <div className="grid cols-4">
            {categoriesData.map((cat) => (
              <div className="cat-card" key={cat}>
                <div className="cat-ico">#</div>
                <div><h3>{cat}</h3><p className="mini">Recherche, detail, avis et classement.</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="container section">
          <div className="section-head">
            <div>
              <h2>Outils publies</h2>
              <p className="muted">Chaque carte affiche uniquement des metadonnees du schema fourni.</p>
            </div>
            <Link className="btn" to="/catalogue">Voir catalogue</Link>
          </div>
          <div className="grid cols-3">
            {toolsData.slice(0, 3).map((tool) => <ToolCard key={tool.id} tool={tool} />)}
          </div>
        </section>
      </main>
    </>
  );
}
