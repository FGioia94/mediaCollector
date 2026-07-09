import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import * as movies from "../api/movies";
import { useAuth } from "../auth/AuthContext";
import { ListControls } from "../components/ListControls";
import { MediaCardHoverWrap } from "../components/MediaCardHoverWrap";
import {
  EmptyMsg,
  ErrorMsg,
  SkeletonCardGrid,
  errorMessage,
} from "../components/StatusViews";
import type { MovieResponse } from "../types";

export function MoviesPage() {
  const { isAuthenticated, canEditContent } = useAuth();
  const [items, setItems] = useState<MovieResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"title" | "releaseDate" | "duration">("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);

  const load = () => {
    movies
      .listMovies()
      .then(setItems)
      .catch((err) => setError(errorMessage(err)));
  };

  useEffect(load, []);

  const sortedItems = useMemo(() => {
    if (!items) return [];

    const copy = [...items];
    copy.sort((left, right) => {
      const direction = sortDir === "asc" ? 1 : -1;

      if (sortBy === "duration") {
        return (left.duration - right.duration) * direction;
      }

      if (sortBy === "releaseDate") {
        const leftTime = left.releaseDate ? Date.parse(left.releaseDate) : 0;
        const rightTime = right.releaseDate ? Date.parse(right.releaseDate) : 0;
        return (leftTime - rightTime) * direction;
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
    if (!confirm("Delete this movie? (editor/admin only)")) return;
    try {
      await movies.deleteMovie(id);
      setActionMsg("Movie deleted.");
      load();
    } catch (err) {
      setActionMsg(errorMessage(err));
    }
  };

  return (
    <section>
      <header className="page-header">
        <h1>Movies</h1>
        {canEditContent && (
          <Link to="/movies/new" className="button-link">
            + New movie
          </Link>
        )}
      </header>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {actionMsg && <p className="status">{actionMsg}</p>}
      {items === null && !error && <SkeletonCardGrid count={8} />}
      {items && items.length === 0 && <EmptyMsg>No movies yet.</EmptyMsg>}
      {items && items.length > 0 && (
        <>
          <ListControls
            sortBy={sortBy}
            sortDir={sortDir}
            sortOptions={[
              { value: "title", label: "Title" },
              { value: "releaseDate", label: "Release date" },
              { value: "duration", label: "Duration" },
            ]}
            onSortByChange={(value) => {
              if (value === "releaseDate" || value === "duration") {
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
          {paginatedItems.map((movie) => {
            const cardActions = (
              <>
                <Link to={`/media/${movie.id}`} className="button-link ghost">
                  See details
                </Link>
                {canEditContent && (
                  <>
                    <Link to={`/movies/${movie.id}/edit`} className="button-link ghost">
                      Edit
                    </Link>
                    {isAuthenticated && (
                      <button type="button" className="button-link ghost" onClick={() => handleDelete(movie.id)}>
                        Delete
                      </button>
                    )}
                  </>
                )}
              </>
            );

            return (
              <MediaCardHoverWrap
                key={movie.id}
                mediaId={movie.id}
                previewHint={{
                  title: movie.title,
                  posterUrl: movie.posterUrl,
                  releaseDate: movie.releaseDate,
                  kind: "Movie",
                }}
                popupActions={cardActions}
              >
              <article className="media-card">
              {movie.posterUrl ? (
                <img src={movie.posterUrl} alt={movie.title} className="media-card-poster" />
              ) : (
                <div className="media-card-poster placeholder">No image</div>
              )}
              <div className="media-card-body">
                <h3>{movie.title}</h3>
                <div className="media-card-meta">
                  <span>{movie.releaseDate?.slice(0, 4) || "N/A"}</span>
                  <span>{movie.duration} min</span>
                </div>
                <p className="muted">{movie.director ? `Director: ${movie.director}` : "Director unavailable"}</p>
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
