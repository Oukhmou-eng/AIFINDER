import { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import KpiCard from "../components/KpiCard.jsx";
import Table from "../components/Table.jsx";
import {
  adminProposalsData,
  categoriesData,
  notificationsData,
  reportsData,
  requestsData,
  toolsData,
  usersData
} from "../database.js";
import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [active, setActive] = useState("overview");

  // PHP/FETCH: remplacer ces donnees simulees par des fetch GET depuis les fichiers PHP admin.
  // Exemple: fetch("http://localhost/aifinder/api/admin/outils.php").then(res => res.json()).then(data => setTools(data));
  const [tools, setTools] = useState(toolsData);
  const [proposals, setProposals] = useState(adminProposalsData);
  const [reports, setReports] = useState(reportsData);
  const [users, setUsers] = useState(usersData);
  const [requests, setRequests] = useState(requestsData);
  const [categories, setCategories] = useState(categoriesData);
  const [notifications, setNotifications] = useState(notificationsData);
  const [audit, setAudit] = useState(["Connexion admin", "Verification file validation", "Controle signalements"]);

  const menu = [
    { id: "overview", label: "⌘ Vue globale", badge: "live", badgeClass: "badge ok" },
    { id: "validation", label: "✓ Validation outils", badge: proposals.length, badgeClass: "badge warn" },
    { id: "tools", label: "▦ Gestion outils", badge: tools.length },
    { id: "reports", label: "⚠ Signalements", badge: reports.filter((r) => r.status !== "Resolu").length, badgeClass: "badge danger" },
    { id: "users", label: "◉ Utilisateurs", badge: users.length },
    { id: "taxonomy", label: "# Categories" },
    { id: "requests", label: "? Demandes", badge: requests.length, badgeClass: "badge warn" },
    { id: "notifications", label: "● Notifications" },
    { id: "analytics", label: "↗ Analytics" }
  ];

  function addAudit(text) {
    setAudit([new Date().toLocaleTimeString("fr-FR") + " - " + text, ...audit]);
  }

  function approveProposal(proposal) {
    // PHP/FETCH: remplacer cette action locale par fetch POST vers validation_outil.php avec action="approve".
    setTools([...tools, {
      id: Date.now(),
      name: proposal.name,
      icon: proposal.name[0],
      category: proposal.category,
      description: proposal.description,
      pricing: "Freemium",
      score: proposal.score,
      rating: 4,
      reviews: 0,
      status: "Publie",
      tags: ["community", "verified"],
      api: "A verifier",
      fav: false
    }]);
    setProposals(proposals.filter((item) => item.id !== proposal.id));
    addAudit(proposal.name + " approuve");
  }

  function rejectProposal(proposal) {
    // PHP/FETCH: remplacer cette action locale par fetch POST vers validation_outil.php avec action="reject" et note_admin.
    setProposals(proposals.filter((item) => item.id !== proposal.id));
    addAudit(proposal.name + " rejete avec motif");
  }

  return (
    <main className="dashboard-shell">
      <Sidebar type="admin" active={active} setActive={setActive} items={menu} />
      <section className="main">
        <header className="dash-topbar">
          <div className="dash-search"><span>⌕</span><input placeholder="Rechercher outil, utilisateur, signalement, commentaire..." /><kbd className="kbd">Ctrl K</kbd></div>
          <div className="actions"><button className="btn" onClick={() => addAudit("Actualisation admin")}>Actualiser</button><button className="btn primary" onClick={() => setActive("notifications")}>Envoyer notification</button></div>
        </header>

        {active === "overview" && (
          <>
            <div className="dash-hero">
              <article className="card hero-card admin">
                <span className="pill admin"><span className="dot"></span> Console de moderation AIFinder</span>
                <h1>Controler la qualite du catalogue, accepter ou refuser avec motif.</h1>
                <p className="lead">Dashboard aligne avec les cas admin : utilisateurs, outils IA, categories, tableau de bord global, statistiques, signalements, demandes, notifications et validation des outils proposes.</p>
                <div className="actions"><button className="btn primary" onClick={() => setActive("validation")}>Traiter la file</button><button className="btn" onClick={() => setActive("reports")}>Voir signalements</button><button className="btn" onClick={() => setActive("requests")}>Voir demandes</button></div>
              </article>
              <div className="side-stack">
                <KpiCard title="Sante plateforme" value="96%" text="audit actif" />
                <KpiCard title="Temps traitement" value="38m" text="moyenne validation" />
              </div>
            </div>
            <div className="grid-kpi">
              <KpiCard title="Outils publies" value={tools.length} text="catalogue actif" />
              <KpiCard title="En validation" value={proposals.length} text="actions requises" />
              <KpiCard title="Signalements ouverts" value={reports.filter((r) => r.status !== "Resolu").length} text="priorisation auto" />
              <KpiCard title="Utilisateurs actifs" value={users.filter((u) => u.status === "Actif").length} text="+12% / 30 jours" />
            </div>
            <div className="layout-2">
              <div className="card"><div className="card-head"><h2>Priorites</h2><button className="btn" onClick={() => setActive("validation")}>Ouvrir</button></div><div className="card-body queue">{proposals.slice(0, 3).map((p) => <div className="queue-card" key={p.id}><div className="queue-head"><strong>{p.name}</strong><span className="badge warn">{p.score}%</span></div><p>{p.description}</p></div>)}</div></div>
              <aside className="card"><div className="card-head"><h2>Audit recent</h2></div><div className="card-body list">{audit.map((item) => <div className="item" key={item}><strong>Audit</strong><small>{item}</small></div>)}</div></aside>
            </div>
          </>
        )}

        {active === "validation" && (
          <div className="card">
            <div className="card-head"><div><h2>Validation des propositions</h2><p className="muted">Approuver publie l'outil, rejeter exige une note_admin envoyee a l'utilisateur.</p></div></div>
            <div className="card-body queue">
              {proposals.map((proposal) => (
                <div className="queue-card" key={proposal.id}>
                  <div className="queue-head"><strong>{proposal.name} - {proposal.category}</strong><span className="badge warn">{proposal.score}% complet</span></div>
                  <p>{proposal.description}</p>
                  <div className="chips">{proposal.flags.map((flag) => <span className="badge danger" key={flag}>{flag}</span>)}</div>
                  <div className="actions"><button className="btn success" onClick={() => approveProposal(proposal)}>Approuver</button><button className="btn" onClick={() => addAudit("Correction demandee pour " + proposal.name)}>Demander correction</button><button className="btn danger" onClick={() => rejectProposal(proposal)}>Rejeter</button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === "tools" && (
          <AdminTable title="Gestion des outils" headers={["Outil", "Categorie", "Statut", "avis.note", "Actions"]}>
            {tools.map((tool) => <tr key={tool.id}><td>{tool.name}</td><td>{tool.category}</td><td><span className="badge ok">{tool.status}</span></td><td>{tool.score}%</td><td><button className="btn small" onClick={() => addAudit("Outil modifie")}>Modifier</button></td></tr>)}
          </AdminTable>
        )}

        {active === "reports" && (
          <AdminTable title="Signalements utilisateurs" headers={["ID", "Outil", "Motif", "Priorite", "Statut", "Actions"]}>
            {reports.map((report) => <tr key={report.id}><td>{report.id}</td><td>{report.tool}</td><td>{report.issue}</td><td>{report.priority}</td><td>{report.status}</td><td><button className="btn small success" onClick={() => setReports(reports.map((r) => r.id === report.id ? { ...r, status: "Resolu" } : r))}>Resoudre</button></td></tr>)}
          </AdminTable>
        )}

        {active === "users" && (
          <AdminTable title="Utilisateurs" headers={["Nom", "Email", "Role", "Statut", "Derniere connexion", "Actions"]}>
            {users.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>{user.role}</td><td>{user.status}</td><td>{user.lastLogin}</td><td><button className="btn small" onClick={() => addAudit("Utilisateur modifie")}>Role</button></td></tr>)}
          </AdminTable>
        )}

        {active === "taxonomy" && <Taxonomy categories={categories} setCategories={setCategories} />}
        {active === "requests" && <Requests requests={requests} setRequests={setRequests} />}
        {active === "notifications" && <Notifications notifications={notifications} setNotifications={setNotifications} />}
        {active === "analytics" && <Analytics reports={reports} notifications={notifications} />}
      </section>
    </main>
  );
}

function AdminTable({ title, headers, children }) {
  return <div className="card"><div className="card-head"><h2>{title}</h2></div><Table headers={headers}>{children}</Table></div>;
}

function Taxonomy({ categories, setCategories }) {
  function addCategory(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    // PHP/FETCH: envoyer nom_Cat, slug, icone et description vers categories.php.
    setCategories([...categories, form.get("name")]);
    event.currentTarget.reset();
  }
  return (
    <div className="layout-2">
      <div className="card">
        <div className="card-head"><h2>Categories d'outils</h2></div>
        <form className="card-body form-grid" onSubmit={addCategory}>
          <div className="field"><label>nom_Cat</label><input name="name" defaultValue="Agents IA" /></div>
          <div className="field"><label>slug</label><input defaultValue="agents-ia" /></div>
          <div className="field"><label>icone</label><input defaultValue="#" /></div>
          <div className="field full"><label>description</label><textarea defaultValue="Outils capables d'executer des taches multi-etapes."></textarea></div>
          <button className="btn primary full">Ajouter categorie</button>
        </form>
      </div>
      <div className="card"><div className="card-head"><h2>Metadonnees categorie</h2></div><div className="card-body list">{categories.map((cat, index) => <div className="item" key={cat + "-" + index}><strong>{cat}</strong><small>id_Cat {index + 1} - slug renseigne - icone renseignee</small></div>)}</div></div>
    </div>
  );
}

function Requests({ requests, setRequests }) {
  return (
    <div className="card">
      <div className="card-head"><h2>Gestion des demandes</h2></div>
      <div className="card-body queue">
        {requests.map((request) => <div className="queue-card" key={request.id}><div className="queue-head"><strong>{request.title}</strong><span className="badge warn">{request.status}</span></div><p>{request.message}</p><button className="btn success" onClick={() => setRequests(requests.map((r) => r.id === request.id ? { ...r, status: "Resolu" } : r))}>Resoudre</button></div>)}
      </div>
    </div>
  );
}

function Notifications({ notifications, setNotifications }) {
  function sendNotification(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    // PHP/FETCH: envoyer cible, type, titre et message vers notifications.php.
    setNotifications([{ id: Date.now(), target: form.get("target"), type: form.get("type"), title: form.get("title"), message: form.get("message"), created_at: "2026-05-04" }, ...notifications]);
    event.currentTarget.reset();
  }
  return (
    <div className="card">
      <div className="card-head"><h2>Envoyer notification</h2></div>
      <form className="card-body form-grid" onSubmit={sendNotification}>
        <div className="field"><label>cible</label><select name="target"><option>utilisateur</option><option>admin</option><option>tous</option></select></div>
        <div className="field"><label>type</label><select name="type"><option>soumission</option><option>signalement</option><option>demande</option><option>systeme</option></select></div>
        <div className="field full"><label>titre</label><input name="title" defaultValue="Mise a jour AIFinder" /></div>
        <div className="field full"><label>message</label><textarea name="message" defaultValue="Votre demande a ete traitee."></textarea></div>
        <button className="btn primary full">Envoyer</button>
      </form>
      <div className="card-body list">{notifications.map((n) => <div className="item" key={n.id}><strong>{n.title}</strong><small>{n.message}<br />cible {n.target} - type {n.type}</small></div>)}</div>
    </div>
  );
}

function Analytics({ reports, notifications }) {
  return (
    <div className="card">
      <div className="card-head"><h2>Statistiques plateforme</h2></div>
      <div className="card-body">
        <div className="grid-kpi">
          <KpiCard title="Recherches" value="18" text="historique_recherches" />
          <KpiCard title="Taux validation" value="71%" text="soumission_outil" />
          <KpiCard title="Signalements" value={reports.length} text="ouverts et resolus" />
          <KpiCard title="Notifications" value={notifications.length} text="envoyees" />
        </div>
        <div className="chart">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day, index) => <div className="chart-bar" style={{ height: 45 + index * 12 }} key={day}><span>{day}</span></div>)}
        </div>
      </div>
    </div>
  );
}
