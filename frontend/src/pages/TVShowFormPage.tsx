import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import * as genres from "../api/genres";
import * as tvshows from "../api/tvshows";
import { ErrorMsg, Loading, errorMessage } from "../components/StatusViews";
import type { Genre, TVShowRequest } from "../types";
import { parseIntInput } from "../utils/formNumbers";
import {
  validateIntRange,
  validateOptionalHttpUrl,
} from "../utils/validation";

const EMPTY: TVShowRequest = {
  title: "",
  description: "",
  releaseDate: "",
  posterUrl: "",
  genreIds: [],
  seasons: 1,
  episodes: 1,
  network: "",
};

export function TVShowFormPage() {
  const { id } = useParams<{ id: string }>();
  const editingId = id ? Number(id) : null;
  const navigate = useNavigate();

  const [form, setForm] = useState<TVShowRequest>(EMPTY);
  const [genreList, setGenreList] = useState<Genre[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(editingId !== null);

  useEffect(() => {
    let isActive = true;

    genres.listGenres().then(setGenreList).catch(() => setGenreList([]));
    if (editingId === null) {
      setInitializing(false);
      return () => {
        isActive = false;
      };
    }

    setInitializing(true);
    tvshows
      .getTVShow(editingId)
      .then((tv) => {
        if (!isActive) return;
        setForm({
          title: tv.title ?? "",
          description: tv.description ?? "",
          releaseDate: tv.releaseDate ?? "",
          posterUrl: tv.posterUrl ?? "",
          genreIds: tv.genreIds ?? [],
          seasons: tv.seasons ?? 1,
          episodes: tv.episodes ?? 1,
          network: tv.network ?? "",
        });
      })
      .catch((err) => {
        if (!isActive) return;
        setError(errorMessage(err));
      })
      .finally(() => {
        if (isActive) {
          setInitializing(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [editingId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedTitle = form.title.trim();
    const trimmedNetwork = form.network.trim();

    if (trimmedTitle.length < 1 || trimmedTitle.length > 120) {
      setError("Title must be between 1 and 120 characters.");
      return;
    }
    if (form.description && form.description.trim().length > 2000) {
      setError("Description must be at most 2000 characters.");
      return;
    }
    const posterError = validateOptionalHttpUrl(form.posterUrl ?? "");
    if (posterError) {
      setError(posterError);
      return;
    }
    if (form.genreIds.length === 0) {
      setError("Select at least one genre.");
      return;
    }
    if (trimmedNetwork.length < 2 || trimmedNetwork.length > 80) {
      setError("Network must be between 2 and 80 characters.");
      return;
    }
    const seasonsError = validateIntRange("Seasons", form.seasons, 1, 100);
    if (seasonsError) {
      setError(seasonsError);
      return;
    }
    const episodesError = validateIntRange("Episodes", form.episodes, 1, 5000);
    if (episodesError) {
      setError(episodesError);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload: TVShowRequest = {
        ...form,
        title: trimmedTitle,
        network: trimmedNetwork,
        description: form.description?.trim() || undefined,
        releaseDate: form.releaseDate || undefined,
        posterUrl: form.posterUrl?.trim() || undefined,
      };
      const saved =
        editingId !== null
          ? await tvshows.updateTVShow(editingId, payload)
          : await tvshows.createTVShow(payload);
      navigate(`/media/${saved.id}`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (gid: number) => {
    setForm((prev) => ({
      ...prev,
      genreIds: prev.genreIds.includes(gid)
        ? prev.genreIds.filter((x) => x !== gid)
        : [...prev.genreIds, gid],
    }));
  };

  if (initializing && !error) return <Loading />;

  return (
    <section className="form-page">
      <h1>{editingId !== null ? "Edit TV show" : "New TV show"}</h1>
      <form onSubmit={handleSubmit} className="vstack">
        <div className="form-grid">
          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>
          <label>
            Network
            <input
              value={form.network}
              onChange={(e) => setForm({ ...form, network: e.target.value })}
              required
            />
          </label>
          <label className="full-width">
            Description
            <textarea
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
            />
          </label>
          <label>
            Release date
            <input
              type="date"
              value={form.releaseDate ?? ""}
              onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
            />
          </label>
          <label>
            Poster URL
            <input
              type="url"
              value={form.posterUrl ?? ""}
              onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
            />
          </label>
          <label>
            Seasons
            <input
              type="number"
              min={1}
              value={form.seasons}
              onChange={(e) =>
                setForm({ ...form, seasons: parseIntInput(e.target.value, 1) })
              }
              required
            />
          </label>
          <label>
            Episodes
            <input
              type="number"
              min={1}
              value={form.episodes}
              onChange={(e) =>
                setForm({ ...form, episodes: parseIntInput(e.target.value, 1) })
              }
              required
            />
          </label>
          <fieldset className="full-width genre-checkboxes">
            <legend>Genres</legend>
            {genreList.map((g) => (
              <label key={g.id} className="inline">
                <input
                  type="checkbox"
                  checked={form.genreIds.includes(g.id)}
                  onChange={() => toggleGenre(g.id)}
                />
                {g.name}
              </label>
            ))}
          </fieldset>
        </div>
        <ErrorMsg>{error}</ErrorMsg>
        <button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </button>
      </form>
    </section>
  );
}
