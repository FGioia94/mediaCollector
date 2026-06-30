import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import * as external from "../api/external";
import type { EnrichedMediaDetails, ExternalTrailerResponse } from "../types";

interface ExternalHoverCardWrapProps {
  externalId: number;
  titleHint?: string;
  posterHint?: string;
  releaseHint?: string;
  children: ReactNode;
  popupActions?: ReactNode;
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
const trailerCache = new Map<number, ExternalTrailerResponse | null>();

function normalizePosterUrl(candidate?: string | null): string | undefined {
  if (!candidate) return undefined;
  const trimmed = candidate.trim();
  if (!trimmed || trimmed.toLowerCase() === "n/a" || trimmed.toLowerCase() === "null") {
    return undefined;
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

function toPreview(
  data: EnrichedMediaDetails,
  hints: Pick<ExternalHoverCardWrapProps, "titleHint" | "posterHint" | "releaseHint">,
): ExternalHoverPreview {
  return {
    title: data.title || hints.titleHint || "Unknown title",
    overview: data.overview || "No overview available.",
    posterUrl: normalizePosterUrl(data.posterUrl) ?? normalizePosterUrl(hints.posterHint),
    imdbRating: data.imdbRating,
    metascore: data.metascore,
    releaseYear: hints.releaseHint?.slice(0, 4),
  };
}

async function resolvePreview(
  externalId: number,
  hints: Pick<ExternalHoverCardWrapProps, "titleHint" | "posterHint" | "releaseHint">,
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
    const fallback: ExternalHoverPreview = {
      title: hints.titleHint || "Unknown title",
      overview: "Preview unavailable right now.",
      posterUrl: normalizePosterUrl(hints.posterHint),
      releaseYear: hints.releaseHint?.slice(0, 4),
    };
    previewCache.set(externalId, fallback);
    return fallback;
  }
}

export function ExternalHoverCardWrap({
  externalId,
  titleHint,
  posterHint,
  releaseHint,
  children,
  popupActions,
}: ExternalHoverCardWrapProps) {
  const [open, setOpen] = useState(false);
  const [desktopHoverEnabled, setDesktopHoverEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [preview, setPreview] = useState<ExternalHoverPreview | null>(() => {
    return previewCache.get(externalId) ?? null;
  });
  const [trailer, setTrailer] = useState<ExternalTrailerResponse | null>(() => {
    return trailerCache.get(externalId) ?? null;
  });
  const requestRef = useRef(0);
  const trailerRequestRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
    const sync = () => setDesktopHoverEnabled(mediaQuery.matches);
    sync();

    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

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

  useEffect(() => {
    if (!open || trailer) return;

    let cancelled = false;
    const requestId = ++trailerRequestRef.current;

    setLoadingTrailer(true);
    external
      .externalTrailer(externalId)
      .then((data) => {
        if (!cancelled && trailerRequestRef.current === requestId) {
          trailerCache.set(externalId, data);
          setTrailer(data);
        }
      })
      .catch(() => {
        if (!cancelled && trailerRequestRef.current === requestId) {
          trailerCache.set(externalId, null);
          setTrailer(null);
        }
      })
      .finally(() => {
        if (!cancelled && trailerRequestRef.current === requestId) {
          setLoadingTrailer(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [externalId, open, trailer]);

  const trailerSrc = trailer?.embedUrl
    ? `${trailer.embedUrl}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&playsinline=1`
    : null;

  const isInteractiveTarget = (target: EventTarget | null): boolean => {
    if (!(target instanceof HTMLElement)) return false;
    return !!target.closest("button, a, .card-actions");
  };

  return (
    <div
      className="external-hover-trigger-wrap"
      onMouseEnter={(event) => {
        if (!desktopHoverEnabled || isInteractiveTarget(event.target)) return;
        setOpen(true);
      }}
      onMouseMove={(event) => {
        if (!desktopHoverEnabled) return;
        if (isInteractiveTarget(event.target)) {
          if (open) setOpen(false);
          return;
        }
        if (!open) setOpen(true);
      }}
      onMouseLeave={() => setOpen(false)}
      onFocus={(event) => {
        if (!desktopHoverEnabled || isInteractiveTarget(event.target)) return;
        setOpen(true);
      }}
      onBlur={() => setOpen(false)}
    >
      {children}

      {desktopHoverEnabled && open && (
        <span className="external-hover-card" role="tooltip" aria-live="polite">
          {loading ? (
            <>
              <span className="external-hover-video shimmer" />
              <span className="external-hover-meta">
                <span className="skeleton-line shimmer" />
                <span className="skeleton-line short shimmer" />
              </span>
            </>
          ) : preview ? (
            <>
              {trailerSrc ? (
                <iframe
                  src={trailerSrc}
                  title={`${preview.title} trailer`}
                  className="external-hover-video"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : preview.posterUrl ? (
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
                <span className="external-hover-actions">
                  {loadingTrailer ? (
                    <small className="muted">Loading trailer...</small>
                  ) : !trailerSrc ? (
                    <small className="muted">Trailer unavailable</small>
                  ) : null}
                </span>
                {popupActions && <span className="card-actions external-popup-actions">{popupActions}</span>}
              </span>
            </>
          ) : (
            <span className="media-hover-empty">Preview unavailable</span>
          )}
        </span>
      )}
    </div>
  );
}
