import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import * as movies from "../api/movies";
import { useAuth } from "../auth/AuthContext";
import { MediaCardHoverWrap } from "../components/MediaCardHoverWrap";
import {
  EmptyMsg,
  ErrorMsg,
  SkeletonCardGrid,
  errorMessage,
} from "../components/StatusViews";
import type { MovieResponse } from "../types";

export function MoviesPage() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<MovieResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const load = () => {
    movies
      .listMovies()
      .then(setItems)
      .catch((err) => setError(errorMessage(err)));
  };

  useEffect(load, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this movie? (admin only)")) return;
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
        {isAuthenticated && (
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
        <div className="media-grid">
          {items.map((movie) => {
            const cardActions = (
              <>
                <Link to={`/media/${movie.id}`} className="button-link ghost">
                  See details
                </Link>
                {isAuthenticated && (
                  <>
                    <Link to={`/movies/${movie.id}/edit`} className="button-link ghost">
                      Edit
                    </Link>
                    <button type="button" onClick={() => handleDelete(movie.id)}>
                      Delete
                    </button>
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
      )}
    </section>
  );
}
