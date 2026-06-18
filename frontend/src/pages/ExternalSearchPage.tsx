import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

import * as external from "../api/external";
import { useAuth } from "../auth/AuthContext";
import {
  EmptyMsg,
  ErrorMsg,
  SkeletonCardGrid,
  errorMessage,
} from "../components/StatusViews";
import type { TmdbSearchResponse } from "../types";

export function ExternalSearchPage() {
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbSearchResponse | null>(null);
  const [suggestions, setSuggestions] = useState<TmdbSearchResponse["results"]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const autocompleteRequestId = useRef(0);

  const performSearch = async (searchText: string) => {
    setLoading(true);
    setError(null);
    try {
      setResults(await external.externalSearch(searchText));
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
    try {
      const saved = await external.saveExternalMovie(id);
      setActionMsg(`Saved as local movie #${saved.id}`);
    } catch (err) {
      setActionMsg(errorMessage(err));
    }
  };

  return (
    <section>
      <h1>TMDB search</h1>
      <form onSubmit={handleSearch} className="hstack">
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
        <div className="media-grid">
          {results.results.map((item) => (
            <article key={item.id} className="media-card">
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
                <Link to={`/external/movie/${item.id}`}>See more</Link>
                {isAuthenticated && (
                  <button type="button" onClick={() => handleSave(item.id)}>
                    Save to library
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
