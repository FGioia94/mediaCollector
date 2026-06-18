import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

export function Navbar() {
  const { isAuthenticated, email, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand-wrap">
        <div className="navbar-brand-mark" aria-hidden="true">
          MH
        </div>
        <div className="navbar-brand">
          <NavLink to="/">MediaHub</NavLink>
          <small>Cinematic Intelligence Workspace</small>
        </div>
      </div>

      <button
        type="button"
        className="navbar-menu-toggle"
        aria-expanded={menuOpen}
        aria-controls="navbar-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? "Close" : "Menu"}
      </button>

      <div id="navbar-menu" className={`navbar-menu ${menuOpen ? "open" : ""}`}>
        <ul className="navbar-links">
          <li>
            <NavLink to="/discover">Discover</NavLink>
          </li>
          <li>
            <NavLink to="/movies">Movies</NavLink>
          </li>
          <li>
            <NavLink to="/tvshows">TV Shows</NavLink>
          </li>
          <li>
            <NavLink to="/genres">Genres</NavLink>
          </li>
          <li>
            <NavLink to="/reviews">Reviews</NavLink>
          </li>
          <li>
            <NavLink to="/trending">Trending</NavLink>
          </li>
          <li>
            <NavLink to="/external">TMDB Search</NavLink>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <NavLink to="/watchlist">Watchlist</NavLink>
              </li>
              <li>
                <NavLink to="/profile">Profile</NavLink>
              </li>
              <li>
                <NavLink to="/admin/users">Admin: Users</NavLink>
              </li>
              <li>
                <NavLink to="/admin/roles">Admin: Roles</NavLink>
              </li>
            </>
          )}
        </ul>

        <div className="navbar-auth">
        {isAuthenticated ? (
          <>
            <span className="navbar-email">{email}</span>
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink className="navbar-cta" to="/login">
              Login
            </NavLink>
            <NavLink className="navbar-cta ghost" to="/register">
              Register
            </NavLink>
          </>
        )}
        </div>
      </div>
    </nav>
  );
}
