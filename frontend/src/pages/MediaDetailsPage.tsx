import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "react-router-dom";

import * as media from "../api/media";
import * as movies from "../api/movies";
import * as tvshows from "../api/tvshows";
import * as reviews from "../api/reviews";
import * as watchlist from "../api/watchlist";
import { useAuth } from "../auth/AuthContext";
import { ListControls } from "../components/ListControls";
import {
  EmptyMsg,
  ErrorMsg,
  SkeletonDetails,
  errorMessage,
} from "../components/StatusViews";
import type {
  MovieResponse,
  ReviewResponse,
  TVShowResponse,
} from "../types";
import { validateIntRange, validateReviewText } from "../utils/validation";

type DetailKind = "movie" | "tv" | "media" | "unknown";

interface Loaded {
  kind: DetailKind;
  data: MovieResponse | TVShowResponse | null;
  reviews: ReviewResponse[];
  avgRating: number | null;
}

async function loadMediaDetails(id: number): Promise<Loaded> {
  // Try as movie, then tv show; if neither succeeds use shared search fallback.
  try {
    const m = await movies.getMovie(id);
    return await enrich({ kind: "movie", data: m });
  } catch {
    /* try tv */
  }
  try {
    const tv = await tvshows.getTVShow(id);
    return await enrich({ kind: "tv", data: tv });
  } catch {
    /* fall back */
  }
  return await enrich({ kind: "unknown", data: null });

  async function enrich(base: { kind: DetailKind; data: Loaded["data"] }) {
    const all = await reviews.listReviews().catch(() => [] as ReviewResponse[]);
    const itemReviews = all.filter((r) => r.mediaItemId === id);
    let avg: number | null = null;
    try {
      avg = await media.averageRating(id);
    } catch {
      avg = null;
    }
    return { ...base, reviews: itemReviews, avgRating: avg };
  }
}

export function MediaDetailsPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const id = Number(idParam);
  const { isAuthenticated, userId } = useAuth();

  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState<number>(8);
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);
  const [reviewQuery, setReviewQuery] = useState("");
  const [reviewMinRating, setReviewMinRating] = useState<number | "">("");
  const [reviewSortBy, setReviewSortBy] = useState<"createdAt" | "rating" | "author">("createdAt");
  const [reviewSortDir, setReviewSortDir] = useState<"asc" | "desc">("desc");
  const [reviewPageSize, setReviewPageSize] = useState(6);
  const [reviewPage, setReviewPage] = useState(1);

  const [watchlistMsg, setWatchlistMsg] = useState<string | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  const refresh = () => {
    loadMediaDetails(id)
      .then(setLoaded)
      .catch((err) => setError(errorMessage(err)));
  };

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setError("Invalid id");
      return;
    }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!Number.isFinite(id) || !loaded) return;
    if (loaded.kind !== "movie" && loaded.kind !== "tv") return;

    sessionStorage.setItem(`media.kind.${id}`, loaded.kind);
    window.dispatchEvent(new Event("media-kind-updated"));
  }, [id, loaded]);

  useEffect(() => {
    setWatchlistMsg(null);
    if (!isAuthenticated || !userId || !Number.isFinite(id)) {
      setIsInWatchlist(false);
      return;
    }

    watchlist
      .watchlistExists(userId, id)
      .then((exists) => setIsInWatchlist(Boolean(exists)))
      .catch(() => setIsInWatchlist(false));
  }, [isAuthenticated, userId, id]);

  const kind = loaded?.kind ?? "unknown";
  const data = loaded?.data ?? null;
  const itemReviews = loaded?.reviews ?? [];
  const avgRating = loaded?.avgRating ?? null;

  const filteredSortedReviews = useMemo(() => {
    const q = reviewQuery.trim().toLowerCase();

    const filtered = itemReviews.filter((review) => {
      if (reviewMinRating !== "" && review.rating < reviewMinRating) {
        return false;
      }

      if (!q) {
        return true;
      }

      const haystack = [
        review.text,
        review.authorUsername,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });

    const sorted = [...filtered];
    sorted.sort((left, right) => {
      const direction = reviewSortDir === "asc" ? 1 : -1;

      if (reviewSortBy === "rating") {
        return (left.rating - right.rating) * direction;
      }

      if (reviewSortBy === "author") {
        return (left.authorUsername || "").localeCompare(right.authorUsername || "") * direction;
      }

      return (new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()) * direction;
    });

    return sorted;
  }, [itemReviews, reviewMinRating, reviewQuery, reviewSortBy, reviewSortDir]);

  useEffect(() => {
    setReviewPage(1);
  }, [itemReviews, reviewQuery, reviewMinRating, reviewSortBy, reviewSortDir, reviewPageSize]);

  const reviewTotalPages = Math.max(1, Math.ceil(filteredSortedReviews.length / reviewPageSize));
  const currentReviewPage = Math.min(reviewPage, reviewTotalPages);
  const paginatedReviews = filteredSortedReviews.slice(
    (currentReviewPage - 1) * reviewPageSize,
    currentReviewPage * reviewPageSize,
  );

  if (error) return <ErrorMsg>{error}</ErrorMsg>;
  if (!loaded) return <SkeletonDetails />;

  const handleReview = async (event: FormEvent) => {
    event.preventDefault();
    setReviewMsg(null);
    if (!userId) {
      setReviewMsg("Session account id not available. Please log out and sign in again.");
      return;
    }
    const ratingError = validateIntRange("Rating", reviewRating, 1, 10);
    if (ratingError) {
      setReviewMsg(ratingError);
      return;
    }
    const textError = validateReviewText(reviewText);
    if (textError) {
      setReviewMsg(textError);
      return;
    }
    try {
      await reviews.createReview({
        authorId: userId,
        text: reviewText.trim(),
        mediaItemId: id,
        rating: reviewRating,
      });
      setReviewText("");
      setReviewMsg("Review posted.");
      refresh();
    } catch (err) {
      setReviewMsg(errorMessage(err));
    }
  };

  const handleWatchlist = async () => {
    setWatchlistMsg(null);
    if (!userId) {
      setWatchlistMsg("Session account id not available. Please log out and sign in again.");
      return;
    }
    if (isInWatchlist) {
      setWatchlistMsg("Already in your watchlist.");
      return;
    }
    try {
      await watchlist.addToWatchlist({ userId, mediaItemId: id });
      setIsInWatchlist(true);
      setWatchlistMsg("Added to your watchlist.");
    } catch (err) {
      setWatchlistMsg(errorMessage(err));
    }
  };

  return (
    <section className="details">
      {data === null ? (
        <EmptyMsg>Could not load this item.</EmptyMsg>
      ) : (
        <>
          <header className="details-header">
            {data.posterUrl && (
              <img src={data.posterUrl} alt={data.title} className="poster" />
            )}
            <div>
              <h1>{data.title}</h1>
              <p className="muted">
                {kind === "movie" ? "Movie" : "TV Show"} · {data.releaseDate}
              </p>
              {avgRating !== null && (
                <p>Average rating: {avgRating.toFixed(1)} / 10</p>
              )}
              <p>{data.description}</p>
              {kind === "movie" && (
                <ul className="meta">
                  <li>Director: {(data as MovieResponse).director}</li>
                  <li>Duration: {(data as MovieResponse).duration} min</li>
                  <li>
                    Budget: {(data as MovieResponse).budget && (data as MovieResponse).budget > 0
                      ? `$${(data as MovieResponse).budget.toLocaleString()}`
                      : "Unknown"}
                  </li>
                </ul>
              )}
              {kind === "tv" && (
                <ul className="meta">
                  <li>Seasons: {(data as TVShowResponse).seasons}</li>
                  <li>Episodes: {(data as TVShowResponse).episodes}</li>
                  <li>Network: {(data as TVShowResponse).network}</li>
                </ul>
              )}
              {isAuthenticated && (
                <div className="actions">
                  {isInWatchlist ? (
                    <button type="button" disabled>
                      Already in watchlist
                    </button>
                  ) : (
                    <button type="button" onClick={handleWatchlist}>
                      Add to watchlist
                    </button>
                  )}
                  {watchlistMsg && <p className="status">{watchlistMsg}</p>}
                </div>
              )}
            </div>
          </header>

          <h2>Reviews ({itemReviews.length})</h2>
          {itemReviews.length === 0 && (
            <EmptyMsg>
              {isAuthenticated ? "No reviews yet." : "No reviews yet, log in to add a review"}
            </EmptyMsg>
          )}
          {itemReviews.length > 0 && (
            <>
              <div className="filters" role="group" aria-label="Media review filters">
                <label>
                  Search
                  <input
                    type="search"
                    placeholder="Review text or author"
                    value={reviewQuery}
                    onChange={(e) => setReviewQuery(e.target.value)}
                  />
                </label>

                <label>
                  Min rating
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={reviewMinRating}
                    onChange={(e) => {
                      const value = e.target.value;
                      setReviewMinRating(value === "" ? "" : Number(value));
                    }}
                    placeholder="Any"
                  />
                </label>
              </div>

              <ListControls
                sortBy={reviewSortBy}
                sortDir={reviewSortDir}
                sortOptions={[
                  { value: "createdAt", label: "Date" },
                  { value: "rating", label: "Rating" },
                  { value: "author", label: "Author" },
                ]}
                onSortByChange={(value) => {
                  if (value === "createdAt" || value === "rating" || value === "author") {
                    setReviewSortBy(value);
                  } else {
                    setReviewSortBy("createdAt");
                  }
                }}
                onSortDirChange={setReviewSortDir}
                pageSize={reviewPageSize}
                onPageSizeChange={setReviewPageSize}
                page={currentReviewPage}
                totalPages={reviewTotalPages}
                totalItems={filteredSortedReviews.length}
                visibleItems={paginatedReviews.length}
                onPageChange={(nextPage) => setReviewPage(Math.min(reviewTotalPages, Math.max(1, nextPage)))}
              />

              {filteredSortedReviews.length === 0 && (
                <EmptyMsg>No reviews match these filters.</EmptyMsg>
              )}

              <ul className="reviews">
                {paginatedReviews.map((review) => (
                  <li key={review.id}>
                    <strong>Rating {review.rating}/10</strong> · {review.authorUsername || `author#${review.authorId}`}
                    <p>{review.text}</p>
                    <small>{new Date(review.createdAt).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
            </>
          )}

          {isAuthenticated && (
            <form onSubmit={handleReview} className="vstack">
              <h3>Write a review</h3>
              <label>
                Rating (1-10)
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  required
                />
              </label>
              <label>
                Text
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                  minLength={5}
                  maxLength={1000}
                  rows={4}
                />
              </label>
              <button type="submit">Post review</button>
              {reviewMsg && <p className="status">{reviewMsg}</p>}
            </form>
          )}
        </>
      )}
    </section>
  );
}
