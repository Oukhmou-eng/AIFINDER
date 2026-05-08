import { Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import ToolCard from "../components/ToolCard.jsx";
import { categoriesData, toolsData } from "../database.js";
import "../styles/CataloguePage.css";

export default function CataloguePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Toutes");

  const filteredTools = toolsData.filter((tool) => {
    const matchCategory = category === "Toutes" || tool.category === category;
    const text = `${tool.name} ${tool.category} ${tool.description} ${tool.tags.join(" ")}`.toLowerCase();
    return matchCategory && text.includes(search.toLowerCase());
  });

  return (
    <>
      <Navbar />
      <main className="container catalog-layout">
        <aside className="card filters">
          <h2>Filtres</h2>
          <p className="mini">Accessible aux visiteurs sans connexion.</p>
          <div className="field">
            <label>Categorie</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Toutes</option>
              {categoriesData.map((cat) => <option key={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="field"><label>Models.type</label><select><option>Tous</option><option>Gratuit</option><option>Freemium</option><option>Payant</option></select></div>
          <div className="field"><label>Plateforme</label><select><option>Web app</option><option>API</option><option>Desktop</option><option>Mobile</option></select></div>
          <div className="check-row"><span>api_url renseigne</span><input type="checkbox" defaultChecked /></div>
          <div className="check-row"><span>est_open_source</span><input type="checkbox" /></div>
          <button className="btn primary full">Appliquer les filtres</button>
        </aside>

        <section>
          <div className="section-head">
            <div>
              <h1>Catalogue IA</h1>
              <p className="muted">Resultats selon outils, categories, tags, Models, plateforme, favori, avis et signalements.</p>
            </div>
            <span className="badge info">{filteredTools.length} resultats</span>
          </div>
          <div className="catalog-toolbar">
            <div className="wide-search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par nom, tag, cas d'usage ou modele" /></div>
            <Link className="btn" to="/detail">Voir detail</Link>
          </div>
          <div className="grid cols-3">
            {filteredTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
          </div>
        </section>
      </main>
    </>
  );
}
