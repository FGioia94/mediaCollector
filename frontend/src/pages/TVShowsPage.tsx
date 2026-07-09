import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import * as tvshows from "../api/tvshows";
import { useAuth } from "../auth/AuthContext";
import { ListControls } from "../components/ListControls";
import { MediaCardHoverWrap } from "../components/MediaCardHoverWrap";
import {
  EmptyMsg,
  ErrorMsg,
  SkeletonCardGrid,
  errorMessage,
} from "../components/StatusViews";
import type { TVShowResponse } from "../types";

export function TVShowsPage() {
  const { isAuthenticated, canEditContent } = useAuth();
  const [items, setItems] = useState<TVShowResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"title" | "releaseDate" | "seasons" | "episodes" | "network">("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);

  const load = () => {
    tvshows
      .listTVShows()
      .then(setItems)
      .catch((err) => setError(errorMessage(err)));
  };

  useEffect(load, []);

  const sortedItems = useMemo(() => {
    if (!items) return [];

    const copy = [...items];
    copy.sort((left, right) => {
      const direction = sortDir === "asc" ? 1 : -1;

      if (sortBy === "seasons") {
        return (left.seasons - right.seasons) * direction;
      }

      if (sortBy === "episodes") {
        return (left.episodes - right.episodes) * direction;
      }

      if (sortBy === "releaseDate") {
        const leftTime = left.releaseDate ? Date.parse(left.releaseDate) : 0;
        const rightTime = right.releaseDate ? Date.parse(right.releaseDate) : 0;
        return (leftTime - rightTime) * direction;
      }

      if (sortBy === "network") {
        return (left.network ?? "").localeCompare(right.network ?? "", undefined, { sensitivity: "base" }) * direction;
      }

      return left.title.localeCompare(right.title, undefined, { sensitivity: "base" }) * direction;
    });

    return copy;
  }, [items, sortBy, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [sortBy, sortDir, pageSize, items]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this TV show? (editor/admin only)")) return;
    try {
      await tvshows.deleteTVShow(id);
      setActionMsg("Deleted.");
      load();
    } catch (err) {
      setActionMsg(errorMessage(err));
    }
  };

  return (
    <section>
      <header className="page-header">
        <h1>TV Shows</h1>
        {canEditContent && (
          <Link to="/tvshows/new" className="button-link">
            + New TV show
          </Link>
        )}
      </header>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {actionMsg && <p className="status">{actionMsg}</p>}
      {items === null && !error && <SkeletonCardGrid count={8} />}
      {items && items.length === 0 && <EmptyMsg>No shows yet.</EmptyMsg>}
      {items && items.length > 0 && (
        <>
          <ListControls
            sortBy={sortBy}
            sortDir={sortDir}
            sortOptions={[
              { value: "title", label: "Title" },
              { value: "releaseDate", label: "Release date" },
              { value: "network", label: "Network" },
              { value: "seasons", label: "Seasons" },
              { value: "episodes", label: "Episodes" },
            ]}
            onSortByChange={(value) => {
              if (value === "releaseDate" || value === "network" || value === "seasons" || value === "episodes") {
                setSortBy(value);
              } else {
                setSortBy("title");
              }
            }}
            onSortDirChange={setSortDir}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            page={currentPage}
            totalPages={totalPages}
            totalItems={sortedItems.length}
            visibleItems={paginatedItems.length}
            onPageChange={(nextPage) => setPage(Math.min(totalPages, Math.max(1, nextPage)))}
          />
          <div className="media-grid">
          {paginatedItems.map((tv) => {
            const cardActions = (
              <>
                <Link to={`/media/${tv.id}`} className="button-link ghost">
                  See details
                </Link>
                {canEditContent && (
                  <>
                    <Link to={`/tvshows/${tv.id}/edit`} className="button-link ghost">
                      Edit
                    </Link>
                    {isAuthenticated && (
                      <button type="button" className="button-link ghost" onClick={() => handleDelete(tv.id)}>
                        Delete
                      </button>
                    )}
                  </>
                )}
              </>
            );

            return (
              <MediaCardHoverWrap
                key={tv.id}
                mediaId={tv.id}
                previewHint={{
                  title: tv.title,
                  posterUrl: tv.posterUrl,
                  releaseDate: tv.releaseDate,
                  kind: "TV Show",
                }}
                popupActions={cardActions}
              >
              <article className="media-card">
              {tv.posterUrl ? (
                <img src={tv.posterUrl} alt={tv.title} className="media-card-poster" />
              ) : (
                <div className="media-card-poster placeholder">No image</div>
              )}
              <div className="media-card-body">
                <h3>{tv.title}</h3>
                <div className="media-card-meta">
                  <span>{tv.network || "Network n/a"}</span>
                  <span>{tv.seasons} season(s)</span>
                  <span>{tv.episodes} episodes</span>
                </div>
                <p className="muted">{tv.releaseDate || "Release date unavailable"}</p>
                <div className="card-actions">{cardActions}</div>
              </div>
            </article>
              </MediaCardHoverWrap>
            );
          })}
          </div>
        </>
      )}
    </section>
  );
}
