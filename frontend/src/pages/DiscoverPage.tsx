import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import * as genres from "../api/genres";
import * as media from "../api/media";
import { MediaCard } from "../components/MediaCard";
import {
  EmptyMsg,
  ErrorMsg,
  SkeletonCardGrid,
  errorMessage,
} from "../components/StatusViews";
import type { Genre, MediaItemResponse } from "../types";
import { validateIntRange, validateNumberRange } from "../utils/validation";

export function DiscoverPage() {
  const [genreList, setGenreList] = useState<Genre[]>([]);
  const [title, setTitle] = useState("");
  const [genreId, setGenreId] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [minRating, setMinRating] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [items, setItems] = useState<MediaItemResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    genres
      .listGenres()
      .then(setGenreList)
      .catch(() => setGenreList([]));
  }, []);

  const runDiscover = async (event?: FormEvent) => {
    event?.preventDefault();
    const trimmedTitle = title.trim();
    if (year) {
      const parsedYear = Number(year);
      const yearError = validateIntRange("Year", parsedYear, 1888, 2100);
      if (yearError) {
        setError(yearError);
        return;
      }
    }
    if (minRating) {
      const parsedRating = Number(minRating);
      const ratingError = validateNumberRange("Min rating", parsedRating, 0, 10);
      if (ratingError) {
        setError(ratingError);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const result = await media.discover({
        title: trimmedTitle || undefined,
        genreId: genreId ? Number(genreId) : undefined,
        year: year ? Number(year) : undefined,
        type: type || undefined,
        minRating: minRating ? Number(minRating) : undefined,
        sortBy,
        sortDir,
      });
      setItems(result);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h1>Discover</h1>
      <form onSubmit={runDiscover} className="filters">
        <label>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Matrix"
          />
        </label>
        <label>
          Genre
          <select value={genreId} onChange={(e) => setGenreId(e.target.value)}>
            <option value="">Any</option>
            {genreList.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Year
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g. 1999"
          />
        </label>
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Any</option>
            <option value="movie">Movie</option>
            <option value="tvshow">TV Show</option>
          </select>
        </label>
        <label>
          Min rating
          <input
            type="number"
            step="0.1"
            min={0}
            max={10}
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
          />
        </label>
        <label>
          Sort by
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="title">Title</option>
            <option value="releaseDate">Release date</option>
            <option value="rating">Rating</option>
          </select>
        </label>
        <label>
          Direction
          <select
            value={sortDir}
            onChange={(e) =>
              setSortDir(e.target.value === "desc" ? "desc" : "asc")
            }
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error && <ErrorMsg>{error}</ErrorMsg>}
      {loading && <SkeletonCardGrid count={8} />}
      {items && items.length === 0 && (
        <EmptyMsg>No results match those filters.</EmptyMsg>
      )}
      {items && items.length > 0 && (
        <div className="media-grid">
          {items.map((item) => (
            <MediaCard key={item.id} media={item} />
          ))}
        </div>
      )}
    </section>
  );
}
