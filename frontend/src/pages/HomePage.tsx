import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import * as media from "../api/media";
import { MediaCard } from "../components/MediaCard";
import {
  EmptyMsg,
  ErrorMsg,
  Loading,
  errorMessage,
} from "../components/StatusViews";
import type { MediaItemResponse } from "../types";

export function HomePage() {
  const [items, setItems] = useState<MediaItemResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    media
      .topReviewed(12)
      .then(setItems)
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const totalItems = items?.length ?? 0;
  const withPoster = items?.filter((item) => !!item.posterUrl).length ?? 0;
  const oldestYear = items
    ?.map((item) => Number(item.releaseDate?.slice(0, 4)))
    .filter((year) => Number.isFinite(year) && year > 0)
    .sort((a, b) => a - b)[0];
  const heroItem = items?.[0] ?? null;

  return (
    <section className="home-page">
      <div className="home-hero">
        <div>
          <p className="eyebrow">Media discovery platform</p>
          <h1>Build and curate your cinematic catalog with confidence.</h1>
          <p className="home-hero-copy">
            Explore trends, manage movies and TV shows, and keep review quality high
            from a single professional workspace.
          </p>

          <div className="home-hero-actions">
            <Link className="button-link" to="/discover">
              Explore Catalog
            </Link>
            <Link className="button-link ghost" to="/trending">
              View Trending
            </Link>
          </div>

          <ul className="home-kpis" aria-label="Catalog highlights">
            <li>
              <strong>{totalItems}</strong>
              <span>Top reviewed picks</span>
            </li>
            <li>
              <strong>{withPoster}</strong>
              <span>Curated visual cards</span>
            </li>
            <li>
              <strong>{oldestYear ?? "-"}</strong>
              <span>Oldest highlighted release</span>
            </li>
          </ul>
        </div>

        <aside className="home-highlight" aria-live="polite">
          <p className="home-highlight-label">Featured today</p>
          {heroItem ? (
            <>
              {heroItem.posterUrl ? (
                <img src={heroItem.posterUrl} alt={heroItem.title} />
              ) : (
                <div className="home-highlight-poster-placeholder">No image</div>
              )}
              <h2>{heroItem.title}</h2>
              <p>{heroItem.description || "No description available yet."}</p>
              <Link className="home-highlight-link" to={`/media/${heroItem.id}`}>
                Open details
              </Link>
            </>
          ) : (
            <Loading label="Loading featured title..." />
          )}
        </aside>
      </div>

      <div className="home-section-head">
        <h2>Top reviewed</h2>
        <Link to="/reviews">Go to reviews</Link>
      </div>

      {error && <ErrorMsg>{error}</ErrorMsg>}
      {!error && items === null && <Loading />}
      {items && items.length === 0 && <EmptyMsg>Nothing here yet.</EmptyMsg>}
      {items && items.length > 0 && (
        <div className="media-grid home-grid">
          {items.map((item) => (
            <MediaCard key={item.id} media={item} />
          ))}
        </div>
      )}
    </section>
  );
}
