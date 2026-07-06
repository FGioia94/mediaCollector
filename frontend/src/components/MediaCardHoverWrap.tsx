import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import * as external from "../api/external";
import * as movies from "../api/movies";
import * as tvshows from "../api/tvshows";
import type { ExternalTrailerResponse, TmdbMovieSearchResult } from "../types";

interface Preview {
  title: string;
  posterUrl?: string;
  releaseDate?: string;
  kind: "Movie" | "TV Show";
}

interface MediaCardHoverWrapProps {
  mediaId: number;
  children: ReactNode;
  popupActions?: ReactNode;
  previewHint?: Partial<Preview>;
}

const previewCache = new Map<number, Preview | null>();
const trailerCache = new Map<number, ExternalTrailerResponse | null>();

function normalizeTitle(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function pickBestTmdbMatch(preview: Preview, results: TmdbMovieSearchResult[]): TmdbMovieSearchResult | null {
  if (!results.length) return null;

  const wantedTitle = normalizeTitle(preview.title);
  const wantedYear = preview.releaseDate?.slice(0, 4);

  const exactTitleMatch = results.find((result) => {
    const resultTitle = normalizeTitle(result.title);
    const resultDate = result.releaseDate ?? result.release_date;
    const resultYear = resultDate?.slice(0, 4);
    if (resultTitle !== wantedTitle) return false;
    if (!wantedYear || !resultYear) return true;
    return wantedYear === resultYear;
  });

  return exactTitleMatch ?? results[0] ?? null;
}

async function resolvePreview(mediaId: number): Promise<Preview | null> {
  if (previewCache.has(mediaId)) {
    return previewCache.get(mediaId) ?? null;
  }

  try {
    const movie = await movies.getMovie(mediaId);
    const preview: Preview = {
      title: movie.title,
      posterUrl: movie.posterUrl,
      releaseDate: movie.releaseDate,
      kind: "Movie",
    };
    previewCache.set(mediaId, preview);
    return preview;
  } catch {
    // try TV fallback
  }

  try {
    const tvShow = await tvshows.getTVShow(mediaId);
    const preview: Preview = {
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

export function MediaCardHoverWrap({ mediaId, children, popupActions, previewHint }: MediaCardHoverWrapProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [desktopHoverEnabled, setDesktopHoverEnabled] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(() => {
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
  const [trailer, setTrailer] = useState<ExternalTrailerResponse | null>(() => {
    return trailerCache.get(mediaId) ?? null;
  });

  const requestRef = useRef(0);
  const trailerRequestRef = useRef(0);
  const hoverDelayRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

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

    resolvePreview(mediaId)
      .then((result) => {
        if (!cancelled && requestRef.current === requestId) {
          setPreview(result);
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

  useEffect(() => {
    if (!open || trailer || !preview?.title) return;

    let cancelled = false;
    const requestId = ++trailerRequestRef.current;
    setLoadingTrailer(true);

    external
      .externalSearch(preview.title)
      .then((search) => {
        const match = pickBestTmdbMatch(preview, search.results ?? []);
        if (!match) {
          throw new Error("No TMDB match");
        }
        return external.externalTrailer(match.id);
      })
      .then((data) => {
        if (!cancelled && trailerRequestRef.current === requestId) {
          trailerCache.set(mediaId, data);
          setTrailer(data);
        }
      })
      .catch(() => {
        if (!cancelled && trailerRequestRef.current === requestId) {
          trailerCache.set(mediaId, null);
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
  }, [mediaId, open, preview, trailer]);

  const trailerSrc = trailer?.embedUrl
    ? `${trailer.embedUrl}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&playsinline=1`
    : null;

  const isInteractiveTarget = (target: EventTarget | null): boolean => {
    if (!(target instanceof HTMLElement)) return false;
    return !!target.closest("button, a, .card-actions");
  };

  const clearHoverDelay = () => {
    if (hoverDelayRef.current !== null) {
      window.clearTimeout(hoverDelayRef.current);
      hoverDelayRef.current = null;
    }
  };

  const scheduleOpen = () => {
    clearHoverDelay();
    hoverDelayRef.current = window.setTimeout(() => {
      setOpen(true);
      hoverDelayRef.current = null;
    }, 1000);
  };

  useEffect(() => {
    return () => clearHoverDelay();
  }, []);

  return (
    <div
      className="media-hover-trigger-wrap"
      onMouseEnter={(event) => {
        if (!desktopHoverEnabled || isInteractiveTarget(event.target)) return;
        scheduleOpen();
      }}
      onMouseMove={(event) => {
        if (!desktopHoverEnabled) return;
        if (isInteractiveTarget(event.target)) {
          clearHoverDelay();
          if (open) setOpen(false);
          return;
        }
        if (!open && hoverDelayRef.current === null) scheduleOpen();
      }}
      onMouseLeave={() => {
        clearHoverDelay();
        setOpen(false);
      }}
      onFocus={(event) => {
        if (!desktopHoverEnabled || isInteractiveTarget(event.target)) return;
        setOpen(true);
      }}
      onBlur={() => setOpen(false)}
    >
      {children}

      {desktopHoverEnabled && open && (
        <span className="media-card-hover-modal" role="tooltip" aria-live="polite">
          {loading ? (
            <>
              <span className="media-card-hover-poster shimmer" />
              <span className="media-card-hover-meta">
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
                <img src={preview.posterUrl} alt={preview.title} className="media-card-hover-poster" loading="lazy" />
              ) : (
                <span className="media-card-hover-poster placeholder">No image</span>
              )}
              <span className="media-card-hover-meta">
                <strong>{preview.title}</strong>
                <small>
                  {preview.kind}
                  {preview.releaseDate ? ` · ${preview.releaseDate.slice(0, 4)}` : ""}
                </small>
                {loadingTrailer ? <small className="muted">Loading trailer...</small> : null}
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
