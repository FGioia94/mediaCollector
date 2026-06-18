import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import * as tvshows from "../api/tvshows";
import { useAuth } from "../auth/AuthContext";
import { MediaHoverLink } from "../components/MediaHoverLink";
import {
  EmptyMsg,
  ErrorMsg,
  SkeletonTable,
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
      {items === null && !error && <SkeletonTable rows={6} cols={5} />}
      {items && items.length === 0 && <EmptyMsg>No shows yet.</EmptyMsg>}
      {items && items.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Network</th>
              <th>Seasons</th>
              <th>Episodes</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((tv) => (
              <tr key={tv.id}>
                <td data-label="Title">
                  <MediaHoverLink
                    mediaId={tv.id}
                    previewHint={{
                      title: tv.title,
                      posterUrl: tv.posterUrl,
                      releaseDate: tv.releaseDate,
                      kind: "TV Show",
                    }}
                  >
                    {tv.title}
                  </MediaHoverLink>
                </td>
                <td data-label="Network">{tv.network}</td>
                <td data-label="Seasons">{tv.seasons}</td>
                <td data-label="Episodes">{tv.episodes}</td>
                <td data-label="Actions" className="row-actions">
                  {isAuthenticated && (
                    <>
                      <Link to={`/tvshows/${tv.id}/edit`}>Edit</Link>
                      <button type="button" onClick={() => handleDelete(tv.id)}>
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
