import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import * as external from "../api/external";
import * as media from "../api/media";
import { MediaCard } from "../components/MediaCard";
import { MediaCardHoverWrap } from "../components/MediaCardHoverWrap";
import {
  EmptyMsg,
  ErrorMsg,
  Loading,
  errorMessage,
} from "../components/StatusViews";
import type { MediaItemResponse, TrendingMediaResponse } from "../types";

export function HomePage() {
  const [items, setItems] = useState<MediaItemResponse[] | null>(null);
  const [trending, setTrending] = useState<TrendingMediaResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trendingError, setTrendingError] = useState<string | null>(null);

  useEffect(() => {
    media
      .topReviewed(12)
      .then((rows) => setItems(Array.isArray(rows) ? rows : []))
      .catch((err) => setError(errorMessage(err)));

    external
      .trending()
      .then((rows) => setTrending(rows.slice(0, 3)))
      .catch((err) => setTrendingError(errorMessage(err)));
  }, []);

  const safeItems = Array.isArray(items) ? items : [];

  const totalItems = safeItems.length;
  const withPoster = safeItems.filter((item) => !!item.posterUrl).length;
  const oldestYear = safeItems
    ?.map((item) => Number(item.releaseDate?.slice(0, 4)))
    .filter((year) => Number.isFinite(year) && year > 0)
    .sort((a, b) => a - b)[0];
  const heroItem = safeItems[0] ?? null;

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

      <div className="home-quick-nav" aria-label="Home shortcuts">
        <Link to="/discover" className="home-quick-card">
          <h3>Discover</h3>
          <p>Filter by genre, year, type and rating to explore the local catalog.</p>
        </Link>
        <Link to="/trending" className="home-quick-card">
          <h3>Trending Anticipation</h3>
          <p>Track TMDB buzz and import promising titles into your workspace.</p>
        </Link>
        <Link to="/reviews" className="home-quick-card">
          <h3>Top Rated Workflow</h3>
          <p>Audit quality signals, compare scores and keep curation standards high.</p>
        </Link>
      </div>

      <div className="home-trending-strip">
        <div className="home-section-head">
          <h2>Anticipation Radar</h2>
          <Link to="/trending">Open full trending board</Link>
        </div>
        {trendingError && <ErrorMsg>{trendingError}</ErrorMsg>}
        {!trendingError && trending === null && <Loading label="Loading anticipation picks..." />}
        {trending && trending.length > 0 && (
          <div className="home-trending-list">
            {trending.map((entry) => (
              <article key={entry.externalId} className="home-trending-item">
                <h3>{entry.title}</h3>
                <p>{entry.overview || "No overview available yet."}</p>
                <div className="home-trending-meta">
                  <span>{entry.savedLocally ? "Already imported" : "Awaiting import"}</span>
                  <Link to={`/external/movie/${entry.externalId}`}>View source</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {error && <ErrorMsg>{error}</ErrorMsg>}
      {!error && items === null && <Loading />}
      {items && safeItems.length === 0 && <EmptyMsg>Nothing here yet.</EmptyMsg>}
      {items && safeItems.length > 0 && (
        <div className="media-grid home-grid">
          {safeItems.map((item) => (
            <MediaCardHoverWrap
              key={item.id}
              mediaId={item.id}
              previewHint={{
                title: item.title,
                posterUrl: item.posterUrl,
                releaseDate: item.releaseDate,
              }}
              popupActions={
                <Link to={`/media/${item.id}`} className="button-link ghost">
                  Open details
                </Link>
              }
            >
              <MediaCard media={item} />
            </MediaCardHoverWrap>
          ))}
        </div>
      )}
    </section>
  );
}
