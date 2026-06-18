import { useEffect, useState } from "react";

import * as watchlist from "../api/watchlist";
import { useAuth } from "../auth/AuthContext";
import { MediaHoverLink } from "../components/MediaHoverLink";
import {
  EmptyMsg,
  ErrorMsg,
  SkeletonTable,
  errorMessage,
} from "../components/StatusViews";
import type { WatchListResponse } from "../types";

export function WatchlistPage() {
  const { userId } = useAuth();
  const [items, setItems] = useState<WatchListResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const load = () => {
    if (userId === null) {
      setItems([]);
      return;
    }
    watchlist
      .listByUser(userId)
      .then(setItems)
      .catch((err) => setError(errorMessage(err)));
  };

  useEffect(load, [userId]);

  const handleRemove = async (id: number) => {
    try {
      await watchlist.deleteWatchlist(id);
      load();
    } catch (err) {
      setActionMsg(errorMessage(err));
    }
  };

  if (userId === null) {
    return (
      <section>
        <h1>Watchlist</h1>
        <p>
          We could not resolve your account id from this session. Please log
          out and sign in again.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1>Your watchlist</h1>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {actionMsg && <p className="status">{actionMsg}</p>}
      {items === null && !error && <SkeletonTable rows={4} cols={2} />}
      {items && items.length === 0 && <EmptyMsg>Your watchlist is empty.</EmptyMsg>}
      {items && items.length > 0 && (
        <ul className="list">
          {items.map((entry) => (
            <li key={entry.id}>
              <MediaHoverLink mediaId={entry.mediaItemId}>
                Media #{entry.mediaItemId}
              </MediaHoverLink>
              <small> added {new Date(entry.addedAt).toLocaleString()}</small>
              <span className="row-actions">
                <button type="button" onClick={() => handleRemove(entry.id)}>
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
