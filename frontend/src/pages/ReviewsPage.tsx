import { useEffect, useMemo, useState } from "react";

import * as reviewsApi from "../api/reviews";
import { useAuth } from "../auth/AuthContext";
import { ListControls } from "../components/ListControls";
import { MediaHoverLink } from "../components/MediaHoverLink";
import {
  EmptyMsg,
  ErrorMsg,
  SkeletonTable,
  errorMessage,
} from "../components/StatusViews";
import type { ReviewResponse } from "../types";

export function ReviewsPage() {
  const { isAuthenticated, isAdmin, userId } = useAuth();
  const [items, setItems] = useState<ReviewResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(8);
  const [query, setQuery] = useState("");
  const [minRating, setMinRating] = useState<number | "">("");
  const [onlyMine, setOnlyMine] = useState(false);
  const [sortBy, setSortBy] = useState<"createdAt" | "rating" | "mediaTitle" | "author">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);

  const load = () => {
    reviewsApi
      .listReviews()
      .then((rows) => {
        if (Array.isArray(rows)) {
          setItems(rows);
          return;
        }
        setItems([]);
        setError("Unexpected reviews response format from server.");
      })
      .catch((err) => setError(errorMessage(err)));
  };

  useEffect(load, []);

  const filteredSortedItems = useMemo(() => {
    if (!items) return [];

    const q = query.trim().toLowerCase();
    const filtered = items.filter((review) => {
      if (onlyMine && userId !== review.authorId) {
        return false;
      }
      if (minRating !== "" && review.rating < minRating) {
        return false;
      }
      if (!q) {
        return true;
      }

      const haystack = [
        review.text,
        review.mediaTitle,
        review.authorUsername,
        String(review.mediaItemId),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });

    const sorted = [...filtered];
    sorted.sort((left, right) => {
      const direction = sortDir === "asc" ? 1 : -1;

      if (sortBy === "rating") {
        return (left.rating - right.rating) * direction;
      }

      if (sortBy === "createdAt") {
        return (new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()) * direction;
      }

      if (sortBy === "mediaTitle") {
        return (left.mediaTitle || "").localeCompare(right.mediaTitle || "") * direction;
      }

      return (left.authorUsername || "").localeCompare(right.authorUsername || "") * direction;
    });

    return sorted;
  }, [items, minRating, onlyMine, query, sortBy, sortDir, userId]);

  useEffect(() => {
    setPage(1);
  }, [items, query, minRating, onlyMine, sortBy, sortDir, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredSortedItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = filteredSortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSave = async (id: number) => {
    try {
      await reviewsApi.updateReview(id, { text: editText, rating: editRating });
      setEditingId(null);
      load();
    } catch (err) {
      setActionMsg(errorMessage(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this review? (admin only)")) return;
    try {
      await reviewsApi.deleteReview(id);
      load();
    } catch (err) {
      setActionMsg(errorMessage(err));
    }
  };

  return (
    <section>
      <h1>Reviews</h1>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {actionMsg && <p className="status">{actionMsg}</p>}
      {items === null && !error && <SkeletonTable rows={5} cols={3} />}
      {items && items.length === 0 && <EmptyMsg>No reviews yet.</EmptyMsg>}
      {items && items.length > 0 && (
        <>
          <div className="filters" role="group" aria-label="Review filters">
            <label>
              Search
              <input
                type="search"
                placeholder="Text, author, media title"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>

            <label>
              Min rating
              <input
                type="number"
                min={1}
                max={10}
                value={minRating}
                onChange={(e) => {
                  const value = e.target.value;
                  setMinRating(value === "" ? "" : Number(value));
                }}
                placeholder="Any"
              />
            </label>

            {isAuthenticated && (
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={onlyMine}
                  onChange={(e) => setOnlyMine(e.target.checked)}
                />
                Only my reviews
              </label>
            )}
          </div>

          <ListControls
            sortBy={sortBy}
            sortDir={sortDir}
            sortOptions={[
              { value: "createdAt", label: "Date" },
              { value: "rating", label: "Rating" },
              { value: "mediaTitle", label: "Media title" },
              { value: "author", label: "Author" },
            ]}
            onSortByChange={(value) => {
              if (value === "createdAt" || value === "rating" || value === "mediaTitle" || value === "author") {
                setSortBy(value);
              } else {
                setSortBy("createdAt");
              }
            }}
            onSortDirChange={setSortDir}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            page={currentPage}
            totalPages={totalPages}
            totalItems={filteredSortedItems.length}
            visibleItems={paginatedItems.length}
            onPageChange={(nextPage) => setPage(Math.min(totalPages, Math.max(1, nextPage)))}
          />

          {filteredSortedItems.length === 0 && (
            <EmptyMsg>No reviews match these filters.</EmptyMsg>
          )}

        <ul className="reviews">
          {paginatedItems.map((review) => (
            <li key={review.id}>
              {editingId === review.id ? (
                <div className="vstack">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editRating}
                    onChange={(e) => setEditRating(Number(e.target.value))}
                  />
                  <textarea
                    rows={3}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <div>
                    <button
                      type="button"
                      onClick={() => handleSave(review.id)}
                    >
                      Save
                    </button>
                    <button type="button" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="review-card-top">
                    <div className="review-author-avatar-wrap">
                      {review.authorProfileImage ? (
                        <img
                          src={review.authorProfileImage}
                          alt={review.authorUsername || `author#${review.authorId}`}
                          className="review-author-avatar"
                          loading="lazy"
                        />
                      ) : (
                        <div className="review-author-avatar placeholder" aria-hidden="true">
                          {(review.authorUsername || "U").slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="review-head">
                      {review.mediaPosterUrl ? (
                        <img
                          src={review.mediaPosterUrl}
                          alt={review.mediaTitle || `Media #${review.mediaItemId}`}
                          className="review-poster"
                          loading="lazy"
                        />
                      ) : (
                        <div className="review-poster placeholder">No image</div>
                      )}
                      <div className="review-head-meta">
                        <div className="review-rating">
                          <strong>Rating {review.rating}/10</strong>
                        </div>
                        <span className="muted review-author-name">
                          {review.authorUsername || `author#${review.authorId}`}
                        </span>
                        <MediaHoverLink mediaId={review.mediaItemId}>
                          {review.mediaTitle || `media #${review.mediaItemId}`}
                        </MediaHoverLink>
                      </div>
                    </div>
                  </div>

                  <p className="review-body">{review.text}</p>

                  <div className="review-footer">
                    <small>{new Date(review.createdAt).toLocaleString()}</small>
                  {isAuthenticated && (
                    <div className="row-actions review-actions">
                      {userId === review.authorId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(review.id);
                            setEditText(review.text);
                            setEditRating(review.rating);
                          }}
                        >
                          Edit
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDelete(review.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
        </>
      )}
    </section>
  );
}
