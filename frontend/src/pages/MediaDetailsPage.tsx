import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "react-router-dom";

import * as media from "../api/media";
import * as movies from "../api/movies";
import * as tvshows from "../api/tvshows";
import * as reviews from "../api/reviews";
import * as watchlist from "../api/watchlist";
import { useAuth } from "../auth/AuthContext";
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

  const [watchlistMsg, setWatchlistMsg] = useState<string | null>(null);

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

  if (error) return <ErrorMsg>{error}</ErrorMsg>;
  if (!loaded) return <SkeletonDetails />;

  const { kind, data, reviews: itemReviews, avgRating } = loaded;

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
    try {
      await watchlist.addToWatchlist({ userId, mediaItemId: id });
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
                  <li>Budget: ${(data as MovieResponse).budget?.toLocaleString()}</li>
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
                  <button type="button" onClick={handleWatchlist}>
                    Add to watchlist
                  </button>
                  {watchlistMsg && <p className="status">{watchlistMsg}</p>}
                </div>
              )}
            </div>
          </header>

          <h2>Reviews ({itemReviews.length})</h2>
          {itemReviews.length === 0 && (
            <EmptyMsg>No reviews yet.</EmptyMsg>
          )}
          <ul className="reviews">
            {itemReviews.map((review) => (
              <li key={review.id}>
                <strong>Rating {review.rating}/10</strong> · author#{
                  review.authorId
                }
                <p>{review.text}</p>
                <small>{new Date(review.createdAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>

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
