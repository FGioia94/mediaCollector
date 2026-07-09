import type { ChangeEvent } from "react";

export interface SortOption {
  value: string;
  label: string;
}

interface ListControlsProps {
  sortBy: string;
  sortDir: "asc" | "desc";
  sortOptions: SortOption[];
  onSortByChange: (value: string) => void;
  onSortDirChange: (value: "asc" | "desc") => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  page: number;
  totalPages: number;
  totalItems: number;
  visibleItems: number;
  onPageChange: (page: number) => void;
}

const PAGE_SIZE_OPTIONS = [6, 12, 18, 24];

export function ListControls({
  sortBy,
  sortDir,
  sortOptions,
  onSortByChange,
  onSortDirChange,
  pageSize,
  onPageSizeChange,
  page,
  totalPages,
  totalItems,
  visibleItems,
  onPageChange,
}: ListControlsProps) {
  const handleSortByChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onSortByChange(event.target.value);
  };

  const handleSortDirChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onSortDirChange(event.target.value === "desc" ? "desc" : "asc");
  };

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange(Number(event.target.value));
  };

  const visiblePageNumbers = (() => {
    const maxButtons = 5;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, page - half);
    let end = start + maxButtons - 1;

    if (end > totalPages) {
      end = totalPages;
      start = end - maxButtons + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  })();

  return (
    <>
      <div className="list-toolbar" role="group" aria-label="Sort and pagination controls">
        <label>
          Sort by
          <select value={sortBy} onChange={handleSortByChange}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Direction
          <select value={sortDir} onChange={handleSortDirChange}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>

        <label>
          Per page
          <select value={pageSize} onChange={handlePageSizeChange}>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <span className="muted list-toolbar-summary">Showing {visibleItems} of {totalItems}</span>
      </div>

      {totalItems > 0 && (
        <div className="pagination-controls" role="group" aria-label="Pagination controls">
          <button type="button" onClick={() => onPageChange(1)} disabled={page <= 1}>
            First
          </button>

          <div className="pagination-pages" aria-label="Page numbers">
            {visiblePageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={pageNumber === page ? "active" : ""}
                aria-current={pageNumber === page ? "page" : undefined}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <span className="pagination-status">
            Page {page} of {totalPages}
          </span>

          <button type="button" onClick={() => onPageChange(totalPages)} disabled={page >= totalPages}>
            Last
          </button>
        </div>
      )}
    </>
  );
}
