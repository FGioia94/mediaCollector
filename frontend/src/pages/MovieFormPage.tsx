import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import * as genres from "../api/genres";
import * as movies from "../api/movies";
import { ErrorMsg, Loading, errorMessage } from "../components/StatusViews";
import type { Genre, MovieRequest } from "../types";
import {
  validateIntRange,
  validateNumberRange,
  validateOptionalHttpUrl,
} from "../utils/validation";

const EMPTY: MovieRequest = {
  title: "",
  description: "",
  releaseDate: "",
  posterUrl: "",
  genreIds: [],
  duration: 0,
  director: "",
  budget: 0,
};

export function MovieFormPage() {
  const { id } = useParams<{ id: string }>();
  const editingId = id ? Number(id) : null;
  const navigate = useNavigate();

  const [form, setForm] = useState<MovieRequest>(EMPTY);
  const [genreList, setGenreList] = useState<Genre[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    genres.listGenres().then(setGenreList).catch(() => setGenreList([]));
    if (editingId !== null) {
      movies
        .getMovie(editingId)
        .then((movie) =>
          setForm({
            title: movie.title ?? "",
            description: movie.description ?? "",
            releaseDate: movie.releaseDate ?? "",
            posterUrl: movie.posterUrl ?? "",
            genreIds: movie.genreIds ?? [],
            duration: movie.duration ?? 0,
            director: movie.director ?? "",
            budget: movie.budget ?? 0,
          }),
        )
        .catch((err) => setError(errorMessage(err)));
    }
  }, [editingId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedTitle = form.title.trim();
    const trimmedDirector = form.director.trim();
    const titleLen = trimmedTitle.length;

    if (titleLen < 1 || titleLen > 120) {
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
    if (trimmedDirector.length < 2 || trimmedDirector.length > 80) {
      setError("Director must be between 2 and 80 characters.");
      return;
    }
    const durationError = validateIntRange("Duration", form.duration, 1, 600);
    if (durationError) {
      setError(durationError);
      return;
    }
    const budgetError = validateNumberRange("Budget", form.budget, 0, 1000000000000);
    if (budgetError) {
      setError(budgetError);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload: MovieRequest = {
        ...form,
        title: trimmedTitle,
        director: trimmedDirector,
        description: form.description?.trim() || undefined,
        releaseDate: form.releaseDate || undefined,
        posterUrl: form.posterUrl?.trim() || undefined,
      };
      const saved =
        editingId !== null
          ? await movies.updateMovie(editingId, payload)
          : await movies.createMovie(payload);
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

  if (editingId !== null && form === EMPTY && !error) return <Loading />;

  return (
    <section className="form-page">
      <h1>{editingId !== null ? "Edit movie" : "New movie"}</h1>
      <form onSubmit={handleSubmit} className="vstack">
        <label>
          Title
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </label>
        <label>
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
        <fieldset>
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
        <label>
          Director
          <input
            value={form.director}
            onChange={(e) => setForm({ ...form, director: e.target.value })}
            required
          />
        </label>
        <label>
          Duration (minutes)
          <input
            type="number"
            min={1}
            value={form.duration}
            onChange={(e) =>
              setForm({ ...form, duration: Number(e.target.value) })
            }
            required
          />
        </label>
        <label>
          Budget
          <input
            type="number"
            min={0}
            value={form.budget}
            onChange={(e) =>
              setForm({ ...form, budget: Number(e.target.value) })
            }
            required
          />
        </label>
        <ErrorMsg>{error}</ErrorMsg>
        <button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </button>
      </form>
    </section>
  );
}
