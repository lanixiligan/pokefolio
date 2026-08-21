import { NavLink } from "react-router-dom";
import "./Header.css";

// The mark below is a temporary placeholder for the PokeFolio brand:
// a plain initial badge + wordmark. It is intentionally simple so the
// final logo/wordmark asset can drop in without any header restructuring.
function Header() {
  return (
    <header className="app-header">
      <NavLink to="/explore" className="app-header-brand">
        <span className="app-header-logo" aria-hidden="true">
          P
        </span>
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
