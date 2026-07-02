import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import * as tvshows from "../api/tvshows";
import { useAuth } from "../auth/AuthContext";
import { MediaCardHoverWrap } from "../components/MediaCardHoverWrap";
import {
  EmptyMsg,
  ErrorMsg,
  SkeletonCardGrid,
  errorMessage,
} from "../components/StatusViews";
import type { TVShowResponse } from "../types";

export function TVShowsPage() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<TVShowResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const load = () => {
    tvshows
      .listTVShows()
      .then(setItems)
      .catch((err) => setError(errorMessage(err)));
  };

  useEffect(load, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this TV show? (admin only)")) return;
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
        {isAuthenticated && (
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
        <div className="media-grid">
          {items.map((tv) => {
            const cardActions = (
              <>
                <Link to={`/media/${tv.id}`} className="button-link ghost">
                  See details
                </Link>
                {isAuthenticated && (
                  <>
                    <Link to={`/tvshows/${tv.id}/edit`} className="button-link ghost">
                      Edit
                    </Link>
                    <button type="button" className="button-link ghost" onClick={() => handleDelete(tv.id)}>
                      Delete
                    </button>
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
      )}
    </section>
  );
}
