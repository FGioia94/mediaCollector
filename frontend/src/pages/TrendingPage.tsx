import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import * as external from "../api/external";
import { useAuth } from "../auth/AuthContext";
import { ExternalHoverCardWrap } from "../components/ExternalHoverCardWrap";
import { ListControls } from "../components/ListControls";
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
  const [sortBy, setSortBy] = useState<"title" | "savedLocally" | "externalId">("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);

  const load = () => {
    external
      .trending()
      .then(setItems)
      .catch((err) => setError(errorMessage(err)));
  };

  useEffect(load, []);

  const sortedItems = useMemo(() => {
    if (!items) return [];

    const copy = [...items];
    copy.sort((left, right) => {
      const direction = sortDir === "asc" ? 1 : -1;

      if (sortBy === "savedLocally") {
        return (Number(left.savedLocally) - Number(right.savedLocally)) * direction;
      }

      if (sortBy === "externalId") {
        return (left.externalId - right.externalId) * direction;
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
        <>
          <ListControls
            sortBy={sortBy}
            sortDir={sortDir}
            sortOptions={[
              { value: "title", label: "Title" },
              { value: "savedLocally", label: "Imported status" },
              { value: "externalId", label: "TMDB ID" },
            ]}
            onSortByChange={(value) => {
              if (value === "savedLocally" || value === "externalId") {
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
            onPrevPage={() => setPage((current) => Math.max(1, current - 1))}
            onNextPage={() => setPage((current) => Math.min(totalPages, current + 1))}
          />
          <div className="media-grid">
          {paginatedItems.map((item) => {
            const cardActions = (
              <>
                <Link to={`/external/movie/${item.externalId}`} className="button-link ghost">
                  See more
                </Link>
                {item.savedLocally && item.localMovieId !== null ? (
                  <Link to={`/media/${item.localMovieId}`} className="button-link ghost">
                    View local
                  </Link>
                ) : isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => handleSave(item.externalId)}
                    disabled={savingId === item.externalId}
                  >
                    {savingId === item.externalId ? "Saving..." : "Import"}
                  </button>
                ) : null}
              </>
            );

            return (
              <ExternalHoverCardWrap
                key={item.externalId}
                externalId={item.externalId}
                titleHint={item.title}
                posterHint={item.posterUrl}
                popupActions={cardActions}
              >
              <article className="media-card external-media-card">
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
                  <div className="card-actions">{cardActions}</div>
                </div>
              </article>
              </ExternalHoverCardWrap>
            );
          })}
          </div>
        </>
      )}
    </section>
  );
}
