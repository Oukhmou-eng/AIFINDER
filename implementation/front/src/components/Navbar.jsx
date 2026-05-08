import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="topnav">
      <Link className="brand" to="/">
        <span className="logo">AI</span>
        <strong>AI<em>Finder</em></strong>
      </Link>

      <div className="navlinks">
        <NavLink to="/">Accueil</NavLink>
        <NavLink to="/catalogue">Catalogue</NavLink>
        <NavLink to="/detail">Fiche outil</NavLink>
      </div>

      <div className="auth">
        <Link className="btn ghost" to="/user">Se connecter</Link>
        <Link className="btn" to="/user">S'inscrire</Link>
        <Link className="btn primary" to="/user">Proposer un outil</Link>
      </div>
    </nav>
  );
}
