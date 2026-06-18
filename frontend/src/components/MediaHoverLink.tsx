import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import * as movies from "../api/movies";
import * as tvshows from "../api/tvshows";

interface MediaHoverPreview {
  title: string;
  posterUrl?: string;
  releaseDate?: string;
  kind: "Movie" | "TV Show";
}

interface MediaHoverLinkProps {
  mediaId: number;
  children: ReactNode;
  className?: string;
  previewHint?: Partial<MediaHoverPreview>;
}

const previewCache = new Map<number, MediaHoverPreview | null>();

async function resolvePreview(mediaId: number): Promise<MediaHoverPreview | null> {
  if (previewCache.has(mediaId)) {
    return previewCache.get(mediaId) ?? null;
  }

  try {
    const movie = await movies.getMovie(mediaId);
    const preview: MediaHoverPreview = {
      title: movie.title,
      posterUrl: movie.posterUrl,
      releaseDate: movie.releaseDate,
      kind: "Movie",
    };
    previewCache.set(mediaId, preview);
    return preview;
  } catch {
    // Try TV show fallback.
  }

  try {
    const tvShow = await tvshows.getTVShow(mediaId);
    const preview: MediaHoverPreview = {
      title: tvShow.title,
      posterUrl: tvShow.posterUrl,
      releaseDate: tvShow.releaseDate,
      kind: "TV Show",
    };
    previewCache.set(mediaId, preview);
    return preview;
  } catch {
    previewCache.set(mediaId, null);
    return null;
  }
}

export function MediaHoverLink({
  mediaId,
  children,
  className,
  previewHint,
}: MediaHoverLinkProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<MediaHoverPreview | null>(() => {
    if (previewHint?.title) {
      return {
        title: previewHint.title,
        posterUrl: previewHint.posterUrl,
        releaseDate: previewHint.releaseDate,
        kind: previewHint.kind ?? "Movie",
      };
    }
    return previewCache.get(mediaId) ?? null;
  });

  const requestRef = useRef(0);

  useEffect(() => {
    if (!open || preview) return;

    let cancelled = false;
    const requestId = ++requestRef.current;

    setLoading(true);
    resolvePreview(mediaId)
      .then((data) => {
        if (!cancelled && requestRef.current === requestId) {
          setPreview(data);
        }
      })
      .finally(() => {
        if (!cancelled && requestRef.current === requestId) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mediaId, open, preview]);

  return (
    <span
      className="media-hover-link-wrap"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <Link to={`/media/${mediaId}`} className={className}>
        {children}
      </Link>

      {open && (
        <span className="media-hover-card" role="tooltip" aria-live="polite">
          {loading ? (
            <>
              <span className="media-hover-poster shimmer" />
              <span className="media-hover-meta">
                <span className="skeleton-line shimmer" />
                <span className="skeleton-line short shimmer" />
              </span>
            </>
          ) : preview ? (
            <>
              {preview.posterUrl ? (
                <img
                  src={preview.posterUrl}
                  alt={preview.title}
                  className="media-hover-poster"
                  loading="lazy"
                />
              ) : (
                <span className="media-hover-poster placeholder">No image</span>
              )}
              <span className="media-hover-meta">
                <strong>{preview.title}</strong>
                <small>
                  {preview.kind}
                  {preview.releaseDate ? ` · ${preview.releaseDate.slice(0, 4)}` : ""}
                </small>
              </span>
            </>
          ) : (
            <span className="media-hover-empty">Preview unavailable</span>
          )}
        </span>
      )}
    </span>
  );
}
