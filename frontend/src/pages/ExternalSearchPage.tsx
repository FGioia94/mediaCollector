import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

import * as external from "../api/external";
import * as movies from "../api/movies";
import { useAuth } from "../auth/AuthContext";
import { ExternalHoverCardWrap } from "../components/ExternalHoverCardWrap";
import { ListControls } from "../components/ListControls";
import {
  EmptyMsg,
  ErrorMsg,
  SkeletonCardGrid,
  errorMessage,
} from "../components/StatusViews";
import type { MovieResponse, TmdbSearchResponse } from "../types";

function normalizeTitle(value?: string): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function yearFromDate(value?: string): string {
  return (value ?? "").slice(0, 4);
}

function buildImportMap(
  searchResults: TmdbSearchResponse["results"],
  localMovies: MovieResponse[],
): Record<number, number> {
  const byTitleAndYear = new Map<string, number>();
  const byTitle = new Map<string, number>();

  for (const movie of localMovies) {
    const normalizedTitle = normalizeTitle(movie.title);
    if (!normalizedTitle) continue;

    const year = yearFromDate(movie.releaseDate);
    if (year) {
      byTitleAndYear.set(`${normalizedTitle}|${year}`, movie.id);
    }
    if (!byTitle.has(normalizedTitle)) {
      byTitle.set(normalizedTitle, movie.id);
    }
  }

  const mapped: Record<number, number> = {};
  for (const result of searchResults) {
    const normalizedTitle = normalizeTitle(result.title);
    if (!normalizedTitle) continue;

    const resultYear = yearFromDate(result.releaseDate ?? result.release_date);
    const titleAndYearKey = `${normalizedTitle}|${resultYear}`;

    const localId =
      (resultYear ? byTitleAndYear.get(titleAndYearKey) : undefined)
      ?? byTitle.get(normalizedTitle)
      ?? localMovies.find((movie) => {
        const localTitle = normalizeTitle(movie.title);
        if (!localTitle) return false;
        if (!localTitle.includes(normalizedTitle) && !normalizedTitle.includes(localTitle)) {
          return false;
        }

        const localYear = yearFromDate(movie.releaseDate);
        if (!resultYear || !localYear) return true;
        return localYear === resultYear;
      })?.id;
    if (localId) {
      mapped[result.id] = localId;
    }
  }

  return mapped;
}

export function ExternalSearchPage() {
  const { isAuthenticated, canEditContent } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbSearchResponse | null>(null);
  const [importedLocalIds, setImportedLocalIds] = useState<Record<number, number>>({});
  const [suggestions, setSuggestions] = useState<TmdbSearchResponse["results"]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"title" | "releaseDate" | "externalId">("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);
  const autocompleteRequestId = useRef(0);

  const sortedResults = useMemo(() => {
    const baseResults = results?.results ?? [];
    const copy = [...baseResults];

    copy.sort((left, right) => {
      const direction = sortDir === "asc" ? 1 : -1;

      if (sortBy === "externalId") {
        return (left.id - right.id) * direction;
      }

      if (sortBy === "releaseDate") {
        const leftTime = Date.parse(left.releaseDate ?? left.release_date ?? "");
        const rightTime = Date.parse(right.releaseDate ?? right.release_date ?? "");
        return ((Number.isNaN(leftTime) ? 0 : leftTime) - (Number.isNaN(rightTime) ? 0 : rightTime)) * direction;
      }

      return left.title.localeCompare(right.title, undefined, { sensitivity: "base" }) * direction;
    });

    return copy;
  }, [results, sortBy, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [sortBy, sortDir, pageSize, results]);

  const totalPages = Math.max(1, Math.ceil(sortedResults.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedResults = sortedResults.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const hydrateImportedState = async (searchResults: TmdbSearchResponse["results"]) => {
    if (!isAuthenticated || searchResults.length === 0) {
      setImportedLocalIds({});
      return;
    }

    try {
      const localMovies = await movies.listMovies();
      setImportedLocalIds(buildImportMap(searchResults, localMovies));
    } catch {
      // Keep current UI state if backend hydration fails temporarily.
    }
  };

  const performSearch = async (searchText: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await external.externalSearch(searchText);
      setResults(response);
      await hydrateImportedState(response.results);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      setShowAutocomplete(false);
      setActiveSuggestionIndex(-1);
      return;
    }

    const requestId = ++autocompleteRequestId.current;
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await external.externalSearch(trimmedQuery);
        if (requestId !== autocompleteRequestId.current) return;

        const nextSuggestions = response.results.slice(0, 6);
        setSuggestions(nextSuggestions);
        setShowAutocomplete(nextSuggestions.length > 0);
        setActiveSuggestionIndex(-1);
      } catch {
        if (requestId !== autocompleteRequestId.current) return;
        setSuggestions([]);
        setShowAutocomplete(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const selectSuggestion = (title: string) => {
    setQuery(title);
    setShowAutocomplete(false);
    setActiveSuggestionIndex(-1);
    void performSearch(title);
  };

  const posterUrl = (item: TmdbSearchResponse["results"][number]) => {
    const path = item.posterPath ?? item.poster_path;
    return path ? `https://image.tmdb.org/t/p/w92${path}` : null;
  };

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setError("Search text must be at least 2 characters.");
      return;
    }
    if (trimmed.length > 120) {
      setError("Search text must be at most 120 characters.");
      return;
    }

    setShowAutocomplete(false);
    setActiveSuggestionIndex(-1);
    await performSearch(trimmed);
  };

  const handleSave = async (id: number) => {
    setActionMsg(null);
    setSavingId(id);
    try {
      const saved = await external.saveExternalMovie(id);
      setImportedLocalIds((prev) => ({
        ...prev,
        [id]: saved.id,
      }));
      setActionMsg(`Saved as local movie #${saved.id}`);
    } catch (err) {
      setActionMsg(errorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section>
      <h1>Search</h1>
      <form onSubmit={handleSearch} className="hstack search-form">
        <div className="autocomplete">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowAutocomplete(true);
            }}
            onBlur={() => {
              window.setTimeout(() => setShowAutocomplete(false), 100);
            }}
            onKeyDown={(e) => {
              if (!showAutocomplete || suggestions.length === 0) return;

              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveSuggestionIndex((prev) =>
                  prev < suggestions.length - 1 ? prev + 1 : 0,
                );
              }

              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveSuggestionIndex((prev) =>
                  prev > 0 ? prev - 1 : suggestions.length - 1,
                );
              }

              if (e.key === "Enter" && activeSuggestionIndex >= 0) {
                e.preventDefault();
                selectSuggestion(suggestions[activeSuggestionIndex].title);
              }

              if (e.key === "Escape") {
                setShowAutocomplete(false);
                setActiveSuggestionIndex(-1);
              }
            }}
            placeholder="Search TMDB"
            required
            aria-label="Search TMDB"
            aria-autocomplete="list"
            aria-expanded={showAutocomplete}
            aria-controls="tmdb-autocomplete-list"
          />
          {showAutocomplete && suggestions.length > 0 && (
            <ul id="tmdb-autocomplete-list" className="autocomplete-list" role="listbox">
              {suggestions.map((suggestion, index) => {
                const suggestionPosterUrl = posterUrl(suggestion);

                return (
                  <li key={suggestion.id} role="option" aria-selected={index === activeSuggestionIndex}>
                    <button
                      type="button"
                      className={`autocomplete-item ${index === activeSuggestionIndex ? "active" : ""}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectSuggestion(suggestion.title);
                      }}
                    >
                      {suggestionPosterUrl ? (
                        <img
                          src={suggestionPosterUrl}
                          alt={suggestion.title}
                          className="autocomplete-poster"
                        />
                      ) : (
                        <div className="autocomplete-poster placeholder" aria-hidden="true">
                          N/A
                        </div>
                      )}
                      <span className="autocomplete-content">
                        <span>{suggestion.title}</span>
                        <span className="muted">{suggestion.releaseDate ?? suggestion.release_date}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {actionMsg && <p className="status">{actionMsg}</p>}
      {loading && <SkeletonCardGrid count={8} />}
      {results && results.results.length === 0 && (
        <EmptyMsg>No matches.</EmptyMsg>
      )}
      {results && results.results.length > 0 && (
        <>
          <ListControls
            sortBy={sortBy}
            sortDir={sortDir}
            sortOptions={[
              { value: "title", label: "Title" },
              { value: "releaseDate", label: "Release date" },
              { value: "externalId", label: "TMDB ID" },
            ]}
            onSortByChange={(value) => {
              if (value === "releaseDate" || value === "externalId") {
                setSortBy(value);
              } else {
                setSortBy("title");
              }
            }}
            onSortDirChange={setSortDir}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            page={currentPage}
            totalPages={totalPages}
            totalItems={sortedResults.length}
            visibleItems={paginatedResults.length}
            onPageChange={(nextPage) => setPage(Math.min(totalPages, Math.max(1, nextPage)))}
          />
          <div className="media-grid">
          {paginatedResults.map((item) => {
            const importedLocalId = importedLocalIds[item.id];
            const cardActions = (
              <>
                <Link to={`/external/movie/${item.id}`} className="button-link ghost">
                  See more
                </Link>
                {isAuthenticated ? importedLocalId ? (
                  <Link to={`/media/${importedLocalId}`} className="button-link ghost">
                    View local
                  </Link>
                ) : canEditContent ? (
                  <button type="button" onClick={() => handleSave(item.id)} disabled={savingId === item.id}>
                    {savingId === item.id ? "Importing..." : "Import"}
                  </button>
                ) : null : null}
              </>
            );

            return (
              <ExternalHoverCardWrap
                key={item.id}
                externalId={item.id}
                titleHint={item.title}
                releaseHint={item.releaseDate ?? item.release_date}
                posterHint={
                  (item.posterPath ?? item.poster_path)
                    ? `https://image.tmdb.org/t/p/w300${item.posterPath ?? item.poster_path}`
                    : undefined
                }
                popupActions={cardActions}
              >
              <article className="media-card external-media-card">
                {(item.posterPath ?? item.poster_path) ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${item.posterPath ?? item.poster_path}`}
                    alt={item.title}
                    className="media-card-poster"
                  />
                ) : (
                  <div className="media-card-poster placeholder">No image</div>
                )}
                <div className="media-card-body">
                  <h3>{item.title}</h3>
                  <p className="muted">{item.releaseDate ?? item.release_date}</p>
                  <p className="muted">{item.overview?.slice(0, 120)}…</p>
                  <div className="card-actions">{cardActions}</div>
                </div>
              </article>
              </ExternalHoverCardWrap>
            );
          })}
          </div>
        </>
      )}
    </section>
  );
}
