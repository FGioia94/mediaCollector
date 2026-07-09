import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface Crumb {
  label: string;
  to: string;
}

const STATIC_LABELS: Record<string, string> = {
  "/discover": "Discover",
  "/movies": "Movies",
  "/tvshows": "TV Shows",
  "/genres": "Genres",
  "/reviews": "Reviews",
  "/trending": "Trending",
  "/external": "Search",
  "/watchlist": "Watchlist",
  "/profile": "Profile",
  "/admin": "Admin",
  "/admin/users": "Users",
  "/admin/roles": "Roles",
  "/login": "Login",
  "/forgot-password": "Forgot Password",
  "/reset-password": "Reset Password",
  "/register": "Register",
};

function labelForPath(path: string, segment: string, isLast: boolean): string {
  if (STATIC_LABELS[path]) return STATIC_LABELS[path];

  if (path === "/movies/new") return "New Movie";
  if (path === "/tvshows/new") return "New TV Show";

  if (/^\/media\/[^/]+$/.test(path)) return "Details";
  if (/^\/movies\/[^/]+\/edit$/.test(path)) return "Edit Movie";
  if (/^\/tvshows\/[^/]+\/edit$/.test(path)) return "Edit TV Show";
  if (/^\/external\/movie\/[^/]+$/.test(path)) return "External Details";

  if (/^[0-9]+$/.test(segment)) {
    return isLast ? "Details" : "Item";
  }

  const normalized = segment.replace(/[-_]+/g, " ").trim();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function Breadcrumbs() {
  const location = useLocation();
  const pathname = location.pathname;
  const [kindVersion, setKindVersion] = useState(0);

  useEffect(() => {
    const onKindUpdate = () => setKindVersion((value) => value + 1);
    window.addEventListener("media-kind-updated", onKindUpdate as EventListener);
    return () => window.removeEventListener("media-kind-updated", onKindUpdate as EventListener);
  }, []);

  if (pathname === "/") return null;

  const mediaDetailsMatch = pathname.match(/^\/media\/([^/]+)$/);
  if (mediaDetailsMatch) {
    const mediaId = mediaDetailsMatch[1];
    const cachedKind = sessionStorage.getItem(`media.kind.${mediaId}`);
    const detailsCrumbs: Crumb[] = [{ label: "Home", to: "/" }];

    if (cachedKind === "movie") {
      detailsCrumbs.push({ label: "Movies", to: "/movies" });
    } else if (cachedKind === "tv") {
      detailsCrumbs.push({ label: "TV Shows", to: "/tvshows" });
    }

    detailsCrumbs.push({ label: "Details", to: pathname });

    return (
      <nav className="breadcrumbs" aria-label="Breadcrumb" data-kind-version={kindVersion}>
        <ol>
          {detailsCrumbs.map((crumb, index) => {
            const isLast = index === detailsCrumbs.length - 1;

            return (
              <li key={crumb.to}>
                {isLast ? (
                  <span aria-current="page">{crumb.label}</span>
                ) : (
                  <Link to={crumb.to}>{crumb.label}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ label: "Home", to: "/" }];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    if (/^[0-9]+$/.test(segment) && index !== segments.length - 1) {
      return;
    }

    crumbs.push({
      label: labelForPath(currentPath, segment, index === segments.length - 1),
      to: currentPath,
    });
  });

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <li key={crumb.to}>
              {isLast ? (
                <span aria-current="page">{crumb.label}</span>
              ) : (
                <Link to={crumb.to}>{crumb.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
