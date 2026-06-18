import type { ReactNode } from "react";

export function Loading({
  label = "Loading...",
  inline = false,
}: {
  label?: string;
  inline?: boolean;
}) {
  return (
    <p className={`status loading ${inline ? "inline" : ""}`}>
      <span className="spinner" aria-hidden="true" />
      {label}
    </p>
  );
}

export function ErrorMsg({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p className="status error">{children}</p>;
}

export function EmptyMsg({ children }: { children: ReactNode }) {
  return <p className="status empty">{children}</p>;
}

export function SkeletonCardGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="media-grid skeleton-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton-card-poster shimmer" />
          <div className="skeleton-card-body">
            <div className="skeleton-line shimmer" />
            <div className="skeleton-line short shimmer" />
            <div className="skeleton-line mid shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="skeleton-table" aria-hidden="true">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table-row">
          {Array.from({ length: cols }).map((__, colIndex) => (
            <div key={`${rowIndex}-${colIndex}`} className="skeleton-cell shimmer" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonDetails() {
  return (
    <div className="skeleton-details" aria-hidden="true">
      <div className="skeleton-details-poster shimmer" />
      <div className="skeleton-details-copy">
        <div className="skeleton-line shimmer" />
        <div className="skeleton-line mid shimmer" />
        <div className="skeleton-line short shimmer" />
        <div className="skeleton-line shimmer" />
        <div className="skeleton-line mid shimmer" />
      </div>
    </div>
  );
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unexpected error";
}
