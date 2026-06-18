import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import * as movies from "../api/movies";
import { useAuth } from "../auth/AuthContext";
import { MediaHoverLink } from "../components/MediaHoverLink";
import {
  EmptyMsg,
  ErrorMsg,
  SkeletonTable,
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
      {items === null && !error && <SkeletonTable rows={6} cols={5} />}
      {items && items.length === 0 && <EmptyMsg>No movies yet.</EmptyMsg>}
      {items && items.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Director</th>
              <th>Year</th>
              <th>Duration</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((movie) => (
              <tr key={movie.id}>
                <td data-label="Title">
                  <MediaHoverLink
                    mediaId={movie.id}
                    previewHint={{
                      title: movie.title,
                      posterUrl: movie.posterUrl,
                      releaseDate: movie.releaseDate,
                      kind: "Movie",
                    }}
                  >
                    {movie.title}
                  </MediaHoverLink>
                </td>
                <td data-label="Director">{movie.director}</td>
                <td data-label="Year">{movie.releaseDate}</td>
                <td data-label="Duration">{movie.duration} min</td>
                <td data-label="Actions" className="row-actions">
                  {isAuthenticated && (
                    <>
                      <Link to={`/movies/${movie.id}/edit`}>Edit</Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(movie.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
