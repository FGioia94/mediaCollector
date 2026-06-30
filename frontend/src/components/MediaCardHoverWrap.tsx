import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import * as movies from "../api/movies";
import * as tvshows from "../api/tvshows";

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

  const requestRef = useRef(0);

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

  const isInteractiveTarget = (target: EventTarget | null): boolean => {
    if (!(target instanceof HTMLElement)) return false;
    return !!target.closest("button, a, .card-actions");
  };

  return (
    <div
      className="media-hover-trigger-wrap"
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
              {preview.posterUrl ? (
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
