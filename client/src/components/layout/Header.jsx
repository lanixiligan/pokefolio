import { NavLink } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <header className="app-header">
      <NavLink to="/explore" className="app-header-brand">
        <span className="app-header-title">PokeFolio</span>
      </NavLink>

      <nav className="app-header-nav">
        <NavLink
          to="/explore"
          className={({ isActive }) =>
            isActive ? "app-header-link is-active" : "app-header-link"
          }
        >
          Explore
        </NavLink>
        <NavLink
          to="/binder"
          className={({ isActive }) =>
            isActive ? "app-header-link is-active" : "app-header-link"
          }
        >
          Binder
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;
