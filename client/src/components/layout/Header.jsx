import { NavLink } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <header className="app-header">
      <NavLink to="/explore" className="app-header-brand" aria-label="PokeFolio Home">
        <div className="app-header-logo" aria-hidden="true">
          <svg
            className="app-header-logo-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="4"
              className="logo-card-back"
            />
            <path
              d="M3 12H21"
              className="logo-card-line"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
              className="logo-card-core"
            />
          </svg>
        </div>
        <span className="app-header-title">
          <span className="brand-poke">Poke</span>
          <span className="brand-folio">Folio</span>
        </span>
      </NavLink>

      <nav className="app-header-nav" aria-label="Primary Navigation">
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
