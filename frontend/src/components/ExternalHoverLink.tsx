import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import * as external from "../api/external";
import type { EnrichedMediaDetails } from "../types";

interface ExternalHoverLinkProps {
  externalId: number;
  children: ReactNode;
  className?: string;
  titleHint?: string;
  posterHint?: string;
  releaseHint?: string;
}

interface ExternalHoverPreview {
  title: string;
  overview: string;
  posterUrl?: string;
  imdbRating?: string;
  metascore?: string;
  releaseYear?: string;
}

const previewCache = new Map<number, ExternalHoverPreview | null>();

function toPreview(
  data: EnrichedMediaDetails,
  hints: Pick<ExternalHoverLinkProps, "titleHint" | "posterHint" | "releaseHint">,
): ExternalHoverPreview {
  const releaseYear = hints.releaseHint?.slice(0, 4);
  return {
    title: data.title || hints.titleHint || "Unknown title",
    overview: data.overview || "No overview available.",
    posterUrl: data.posterUrl || hints.posterHint,
    imdbRating: data.imdbRating,
    metascore: data.metascore,
    releaseYear,
  };
}

async function resolvePreview(
  externalId: number,
  hints: Pick<ExternalHoverLinkProps, "titleHint" | "posterHint" | "releaseHint">,
): Promise<ExternalHoverPreview | null> {
  if (previewCache.has(externalId)) {
    return previewCache.get(externalId) ?? null;
  }

  try {
    const details = await external.externalMovie(externalId);
    const preview = toPreview(details, hints);
    previewCache.set(externalId, preview);
    return preview;
  } catch {
    // Keep UI resilient if external APIs are rate-limited or unavailable.
    const fallback: ExternalHoverPreview = {
      title: hints.titleHint || "Unknown title",
      overview: "Preview unavailable right now.",
      posterUrl: hints.posterHint,
      releaseYear: hints.releaseHint?.slice(0, 4),
    };
    previewCache.set(externalId, fallback);
    return fallback;
  }
}

export function ExternalHoverLink({
  externalId,
  children,
  className,
  titleHint,
  posterHint,
  releaseHint,
}: ExternalHoverLinkProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ExternalHoverPreview | null>(() => {
    return previewCache.get(externalId) ?? null;
  });
  const requestRef = useRef(0);

  useEffect(() => {
    if (!open || preview) return;

    let cancelled = false;
    const requestId = ++requestRef.current;

    setLoading(true);
    resolvePreview(externalId, { titleHint, posterHint, releaseHint })
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
  }, [externalId, open, preview, posterHint, releaseHint, titleHint]);

  const trailerQuery = encodeURIComponent(`${preview?.title ?? titleHint ?? "movie"} trailer`);

  return (
    <span
      className="external-hover-link-wrap"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <Link to={`/external/movie/${externalId}`} className={className}>
        {children}
      </Link>

      {open && (
        <span className="external-hover-card" role="tooltip" aria-live="polite">
          {loading ? (
            <>
              <span className="external-hover-poster shimmer" />
              <span className="external-hover-meta">
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
                  className="external-hover-poster"
                  loading="lazy"
                />
              ) : (
                <span className="external-hover-poster placeholder">No image</span>
              )}
              <span className="external-hover-meta">
                <strong>{preview.title}</strong>
                <small>
                  {preview.releaseYear ? `${preview.releaseYear} · ` : ""}
                  IMDb: {preview.imdbRating || "n/a"} · Metascore: {preview.metascore || "n/a"}
                </small>
                <span className="external-hover-overview">{preview.overview}</span>
                <a
                  href={`https://www.youtube.com/results?search_query=${trailerQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  className="external-hover-trailer"
                >
                  Watch trailer
                </a>
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
