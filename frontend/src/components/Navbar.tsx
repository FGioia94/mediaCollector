import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

const THEME_STORAGE_KEY = "mediahub.theme";
type ThemeMode = "light" | "dark";

export function Navbar() {
  const { isAuthenticated, username, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme: ThemeMode = stored === "dark" || stored === "light"
      ? stored
      : preferredDark
        ? "dark"
        : "light";

    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand-wrap">
        <div className="navbar-brand-mark" aria-hidden="true">
          MH
        </div>
        <div className="navbar-brand">
          <NavLink to="/">MediaHub</NavLink>
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
          {isAdmin && (
            <li>
              <NavLink to="/genres">Genres</NavLink>
            </li>
          )}
          <li>
            <NavLink to="/reviews">Reviews</NavLink>
          </li>
          <li>
            <NavLink to="/trending">Trending</NavLink>
          </li>
          <li>
            <NavLink to="/external">Search</NavLink>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <NavLink to="/watchlist">Watchlist</NavLink>
              </li>
              <li>
                <NavLink to="/profile">Profile</NavLink>
              </li>
              {isAdmin && (
                <>
                  <li>
                    <NavLink to="/admin/users">Admin: Users</NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/roles">Admin: Roles</NavLink>
                  </li>
                </>
              )}
            </>
          )}
        </ul>

        <div className="navbar-auth">
        <button type="button" className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? "Light" : "Dark"}
        </button>
        {isAuthenticated ? (
          <>
            <span className="navbar-email">{username}</span>
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
