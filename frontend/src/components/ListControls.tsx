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
  onPrevPage: () => void;
  onNextPage: () => void;
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
  onPrevPage,
  onNextPage,
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
          <button type="button" onClick={onPrevPage} disabled={page <= 1}>
            Previous
          </button>
          <span className="pagination-status">
            Page {page} of {totalPages}
          </span>
          <button type="button" onClick={onNextPage} disabled={page >= totalPages}>
            Next
          </button>
        </div>
      )}
    </>
  );
}
