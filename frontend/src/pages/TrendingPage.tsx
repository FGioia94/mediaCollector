import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import * as external from "../api/external";
import { useAuth } from "../auth/AuthContext";
import {
  EmptyMsg,
  ErrorMsg,
  SkeletonCardGrid,
  errorMessage,
} from "../components/StatusViews";
import type { TrendingMediaResponse } from "../types";

export function TrendingPage() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<TrendingMediaResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const load = () => {
    external
      .trending()
      .then(setItems)
      .catch((err) => setError(errorMessage(err)));
  };

  useEffect(load, []);

  const handleSave = async (id: number) => {
    setSavingId(id);
    setActionMsg(null);
    try {
      const saved = await external.saveExternalMovie(id);
      setActionMsg(`Saved as local movie #${saved.id}`);
      load();
    } catch (err) {
      setActionMsg(errorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section>
      <h1>Trending (TMDB)</h1>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {actionMsg && <p className="status">{actionMsg}</p>}
      {items === null && !error && <SkeletonCardGrid count={8} />}
      {items && items.length === 0 && <EmptyMsg>No trending data.</EmptyMsg>}
      {items && items.length > 0 && (
        <div className="media-grid">
          {items.map((item) => (
            <article key={item.externalId} className="media-card">
              {item.posterUrl ? (
                <img
                  src={item.posterUrl}
                  alt={item.title}
                  className="media-card-poster"
                />
              ) : (
                <div className="media-card-poster placeholder">No image</div>
              )}
              <div className="media-card-body">
                <h3>{item.title}</h3>
                <p className="muted">{item.overview?.slice(0, 120)}…</p>
                <Link to={`/external/movie/${item.externalId}`}>See more</Link>
                {item.savedLocally && item.localMovieId !== null ? (
                  <Link to={`/media/${item.localMovieId}`}>View local</Link>
                ) : isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => handleSave(item.externalId)}
                    disabled={savingId === item.externalId}
                  >
                    {savingId === item.externalId
                      ? "Saving…"
                      : "Save to library"}
                  </button>
                ) : (
                  <small className="muted">Login to import.</small>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
