import { Link } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <header className="app-header">
      <Link to="/explore" className="app-header-title-link">
        <h1 className="app-header-title">PokeFolio</h1>
      </Link>
      <p className="app-header-tagline">Your digital Pokémon TCG binder.</p>

      <nav className="app-header-nav">
        <Link to="/explore">Explore</Link>
        <Link to="/binder">Binder</Link>
      </nav>
    </header>
  );
}

export default Header;
