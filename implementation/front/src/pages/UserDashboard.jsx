import { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import KpiCard from "../components/KpiCard.jsx";
import ToolCard from "../components/ToolCard.jsx";
import Table from "../components/Table.jsx";
import {
  commentsData,
  historyData,
  notificationsData,
  reportsData,
  requestsData,
  toolsData,
  userProposalsData
} from "../database.js";
import "../styles/UserDashboard.css";

export default function UserDashboard() {
  const [active, setActive] = useState("overview");

  // PHP/FETCH: remplacer ces useState initialises par database.js avec des donnees recues depuis PHP.
  // Exemple pour les outils: fetch("http://localhost/aifinder/api/outils.php").then(res => res.json()).then(data => setTools(data));
  const [tools, setTools] = useState(toolsData);
  const [proposals, setProposals] = useState(userProposalsData);
  const [reports, setReports] = useState(reportsData);
  const [comments] = useState(commentsData);
  const [requests, setRequests] = useState(requestsData);
  const [history, setHistory] = useState(historyData);
  const [modelFields, setModelFields] = useState([{ id: 1 }]);

  const favoriteTools = tools.filter((tool) => tool.fav);
  const openReports = reports.filter((report) => report.status !== "Resolu");

  const menu = [
    { id: "overview", label: "⌘ Vue globale", badge: "live", badgeClass: "badge ok" },
    { id: "submit", label: "+ Proposer outil", badge: "principal", badgeClass: "badge ok" },
    { id: "proposals", label: "▣ Mes propositions", badge: proposals.length },
    { id: "favorites", label: "★ Favoris", badge: favoriteTools.length },
    { id: "requests", label: "? Demandes", badge: requests.length },
    { id: "reports", label: "⚠ Signalements", badge: openReports.length, badgeClass: "badge danger" },
    { id: "notifications", label: "● Notifications", badge: notificationsData.length, badgeClass: "badge warn" },
    { id: "history", label: "↺ Historique", badge: history.length },
    { id: "settings", label: "⚙ Parametres" }
  ];

  function addHistory(text) {
    setHistory([new Date().toLocaleTimeString("fr-FR") + " - " + text, ...history]);
  }

  function toggleFavorite(id) {
    // PHP/FETCH: ici remplacer setTools par un fetch POST vers favoris.php avec id_outil et id_utilisateur.
    setTools(tools.map((tool) => tool.id === id ? { ...tool, fav: !tool.fav } : tool));
    addHistory("Favori modifie");
  }

  function reportTool(tool) {
    // PHP/FETCH: ici remplacer setReports par un fetch POST vers signalements.php.
    const newReport = {
      id: "SIG-" + Math.floor(1000 + Math.random() * 9000),
      tool: tool.name,
      issue: "Probleme signale par utilisateur",
      priority: "Moyenne",
      status: "Ouvert"
    };
    setReports([newReport, ...reports]);
    addHistory("Signalement cree: " + tool.name);
  }

  function submitProposal(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    // PHP/FETCH: envoyer ces champs vers soumission_outil.php avec fetch(..., { method: "POST", body: form }).
    // PHP/FETCH: les champs modelName[], modelType[], modelLicence[] et modelApi[] doivent etre enregistres dans la table Models.
    const models = modelFields.map((model) => ({
      nom: form.get("modelName-" + model.id),
      type: form.get("modelType-" + model.id),
      licence: form.get("modelLicence-" + model.id),
      api_url: form.get("modelApi-" + model.id)
    }));
    const newProposal = {
      id: Date.now(),
      name: form.get("name"),
      category: form.get("category"),
      pricing: form.get("pricing"),
      score: 64,
      status: "En attente",
      adminNote: "Nouvelle proposition a verifier par admin.",
      description: form.get("description"),
      tags: String(form.get("tags") || "ai,tool").split(","),
      models: models,
      fav: false
    };
    setProposals([newProposal, ...proposals]);
    addHistory("Proposition envoyee: " + newProposal.name);
    event.currentTarget.reset();
    setActive("proposals");
  }

  return (
    <main className="dashboard-shell">
      <Sidebar type="user" active={active} setActive={setActive} items={menu} />
      <section className="main">
        <header className="dash-topbar">
          <div className="dash-search"><span>⌕</span><input placeholder="Rechercher propositions, favoris, tickets, commentaires..." /><kbd className="kbd">Ctrl K</kbd></div>
          <div className="actions"><button className="btn" onClick={() => addHistory("Dashboard actualise")}>Actualiser</button><button className="btn primary" onClick={() => setActive("submit")}>+ Proposer</button></div>
        </header>

        {active === "overview" && (
          <>
            <div className="dash-hero">
              <article className="card hero-card">
                <span className="pill"><span className="dot"></span> Dashboard utilisateur AIFinder</span>
                <h1>Proposer et suivre vos <em>contributions</em> d'outils IA.</h1>
                <p className="lead">Espace connecte limite aux cas d'utilisation : profil, avis/commentaires, favoris, collections, demandes, notifications, signalements, historique de recherche et proposition d'outil.</p>
                <div className="actions"><button className="btn primary" onClick={() => setActive("submit")}>Proposer un outil</button><button className="btn" onClick={() => setActive("proposals")}>Voir mes propositions</button><button className="btn" onClick={() => setActive("reports")}>Suivre mes tickets</button></div>
              </article>
              <div className="side-stack">
                <KpiCard title="nombre_soum" value={proposals.length} text="soumission_outil" />
                <KpiCard title="limite_soum" value="10" text="soumissions / mois" />
              </div>
            </div>
            <div className="grid-kpi">
              <KpiCard title="Fiches proposees" value={proposals.length} text="publiees et en validation" />
              <KpiCard title="Favoris actifs" value={favoriteTools.length} text="date_ajouter enregistree" />
              <KpiCard title="Signalements ouverts" value={openReports.length} text="suivi statut/date" />
              <KpiCard title="Avis & commentaires" value={comments.length} text="note, contenu, created_at" />
            </div>
            <div className="layout-2">
              <div className="card"><div className="card-head"><h2>Recommandes pour vous</h2></div><div className="card-body tools-grid">{tools.slice(0, 4).map((tool) => <ToolCard key={tool.id} tool={tool} mode="user" onFavorite={toggleFavorite} onReport={reportTool} />)}</div></div>
              <aside className="card"><div className="card-head"><h2>Activite recente</h2></div><div className="card-body list">{history.slice(0, 5).map((item) => <div className="item" key={item}><strong>Session</strong><small>{item}</small></div>)}</div></aside>
            </div>
          </>
        )}

        {active === "submit" && (
          <div className="card">
            <div className="card-head"><div><h2>Proposer un outil IA</h2><p className="muted">Formulaire selon outils, categories, tags, Models, caracteristique, plateforme, fournisseur et soumission_outil.</p></div><span className="badge info">Workflow admin</span></div>
            <form className="card-body form-grid" onSubmit={submitProposal}>
              <div className="field"><label>outils.nom</label><input name="name" required placeholder="Ex : Synthesia" /></div>
              <div className="field"><label>outils.slug</label><input name="slug" required placeholder="synthesia" /></div>
              <div className="field"><label>Categorie</label><select name="category"><option>Video</option><option>Code & DevOps</option><option>Redaction & SEO</option><option>Donnees</option><option>Audio & Voix</option></select></div>
              <div className="field"><label>type_tarification</label><select name="pricing"><option>Freemium</option><option>Gratuit</option><option>Payant</option><option>Open source</option><option>API</option></select></div>
              <div className="field"><label>site_url</label><input name="url" required placeholder="https://..." /></div>
              <div className="field"><label>logo_url</label><input name="logoUrl" placeholder="https://.../logo.png" /></div>
              <div className="field full"><label>description_longue</label><textarea name="description" required placeholder="Description neutre selon le champ description_longue."></textarea></div>
              <div className="field full models-box">
                <div className="models-head">
                  <div>
                    <label>Models</label>
                    <p className="mini">Un outil peut avoir plusieurs modeles.</p>
                  </div>
                  <button
                    className="btn"
                    type="button"
                    onClick={() => setModelFields([...modelFields, { id: Date.now() }])}
                  >
                    + Ajouter modele
                  </button>
                </div>
                {modelFields.map((model, index) => (
                  <div className="model-row" key={model.id}>
                    <div className="field">
                      <label>Models.nom {index + 1}</label>
                      <input name={"modelName-" + model.id} required placeholder="Ex : GPT-4o, Claude, SDXL" />
                    </div>
                    <div className="field">
                      <label>Models.type</label>
                      <select name={"modelType-" + model.id}>
                        <option>Freemium</option>
                        <option>Gratuit</option>
                        <option>Payant</option>
                        <option>Open source</option>
                        <option>API</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>licence</label>
                      <input name={"modelLicence-" + model.id} placeholder="Proprietaire, MIT, Apache-2.0" />
                    </div>
                    <div className="field">
                      <label>api_url</label>
                      <input name={"modelApi-" + model.id} placeholder="https://.../api" />
                    </div>
                    {modelFields.length > 1 && (
                      <button
                        className="btn danger"
                        type="button"
                        onClick={() => setModelFields(modelFields.filter((item) => item.id !== model.id))}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="field"><label>tags.nom</label><input name="tags" placeholder="video, avatar, marketing" /></div>
              <div className="field"><label>caracteristique.cle</label><input name="featureKey" placeholder="api_url" /></div>
              <div className="field"><label>caracteristique.valeur</label><input name="featureValue" placeholder="https://.../api" /></div>
              <div className="field"><label>fournisseur.nom</label><input name="provider" placeholder="Fournisseur" /></div>
              <div className="field"><label>plateforme.nom</label><input name="platform" placeholder="Web, API, Desktop" /></div>
              <button className="btn primary full">Envoyer a la moderation</button>
            </form>
          </div>
        )}

        {active === "proposals" && (
          <div className="card">
            <div className="card-head"><h2>Mes propositions</h2><span className="badge">{proposals.length}</span></div>
            <div className="card-body tools-grid">{proposals.map((item) => <ToolCard key={item.id} tool={{ ...item, icon: item.name[0], api: "A verifier" }} mode="user" onFavorite={() => {}} onReport={reportTool} />)}</div>
            <Table headers={["Outil", "Categorie", "Statut", "Score", "note_admin"]}>
              {proposals.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.category}</td><td><span className="badge warn">{item.status}</span></td><td>{item.score}%</td><td>{item.adminNote}</td></tr>)}
            </Table>
          </div>
        )}

        {active === "favorites" && <div className="card"><div className="card-head"><h2>Mes favoris</h2><button className="btn" onClick={() => setTools(tools.map((t) => ({ ...t, fav: false })))}>Vider les favoris</button></div><div className="card-body tools-grid">{favoriteTools.map((tool) => <ToolCard key={tool.id} tool={tool} mode="user" onFavorite={toggleFavorite} onReport={reportTool} />)}</div></div>}
        {active === "requests" && <SimpleList title="Mes demandes" items={requests} button="Nouvelle demande" onClick={() => setRequests([{ id: Date.now(), title: "Demande utilisateur", message: "Demande liee a une fiche outil IA.", status: "Ouvert", created_at: "2026-05-04" }, ...requests])} />}
        {active === "reports" && <ReportsTable reports={reports} setReports={setReports} />}
        {active === "notifications" && <ItemList title="Notifications" items={notificationsData.map((n) => n.title + " - " + n.message)} />}
        {active === "history" && <ItemList title="Historique" items={history} />}
        {active === "settings" && <Settings />}
      </section>
    </main>
  );
}

function SimpleList({ title, items, button, onClick }) {
  return (
    <div className="card">
      <div className="card-head"><h2>{title}</h2><button className="btn primary" onClick={onClick}>{button}</button></div>
      <div className="card-body list">
        {items.map((item) => <div className="item" key={item.id}><strong>{item.name || item.title}</strong><small>{item.description || item.message}<br />created_at {item.created_at} - statut {item.status || "collection"}</small></div>)}
      </div>
    </div>
  );
}

function ReportsTable({ reports, setReports }) {
  function closeReport(id) {
    setReports(reports.map((report) => report.id === id ? { ...report, status: "Resolu" } : report));
  }
  return (
    <div className="card">
      <div className="card-head"><h2>Mes signalements</h2><span className="badge danger">{reports.length}</span></div>
      <Table headers={["ID", "Outil", "Motif", "Priorite", "Statut", "Actions"]}>
        {reports.map((report) => <tr key={report.id}><td>{report.id}</td><td>{report.tool}</td><td>{report.issue}</td><td>{report.priority}</td><td>{report.status}</td><td><button className="btn small" onClick={() => closeReport(report.id)}>Marquer resolu</button></td></tr>)}
      </Table>
    </div>
  );
}

function ItemList({ title, items }) {
  return <div className="card"><div className="card-head"><h2>{title}</h2></div><div className="card-body list">{items.map((item) => <div className="item" key={item}><strong>Session</strong><small>{item}</small></div>)}</div></div>;
}

function Settings() {
  return (
    <div className="card">
      <div className="card-head"><h2>Modifier son profil</h2><button className="btn primary">Enregistrer</button></div>
      <div className="card-body form-grid">
        <div className="field"><label>nom</label><input defaultValue="Amine" /></div>
        <div className="field"><label>Prenom</label><input defaultValue="Maker" /></div>
        <div className="field"><label>email</label><input defaultValue="amine@example.com" /></div>
        <div className="field"><label>mot de passe</label><input type="password" defaultValue="password-demo" /></div>
        <div className="field"><label>avatar_url</label><input defaultValue="https://example.com/avatar.png" /></div>
        <div className="field"><label>statut</label><select><option>Actif</option><option>Suspendu</option></select></div>
      </div>
    </div>
  );
}
