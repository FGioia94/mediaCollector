import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import * as genres from "../api/genres";
import { useAuth } from "../auth/AuthContext";
import {
  EmptyMsg,
  ErrorMsg,
  SkeletonTable,
  errorMessage,
} from "../components/StatusViews";
import type { Genre } from "../types";
import { validateGenreName } from "../utils/validation";

export function GenresPage() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<Genre[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const load = () => {
    genres
      .listGenres()
      .then(setItems)
      .catch((err) => setError(errorMessage(err)));
  };

  useEffect(load, []);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setActionMsg(null);
    const nameError = validateGenreName(newName);
    if (nameError) {
      setActionMsg(nameError);
      return;
    }
    try {
      await genres.createGenre(newName.trim());
      setNewName("");
      load();
    } catch (err) {
      setActionMsg(errorMessage(err));
    }
  };

  const handleUpdate = async (id: number) => {
    const nameError = validateGenreName(editingName);
    if (nameError) {
      setActionMsg(nameError);
      return;
    }
    try {
      await genres.updateGenre(id, editingName.trim());
      setEditingId(null);
      load();
    } catch (err) {
      setActionMsg(errorMessage(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this genre?")) return;
    try {
      await genres.deleteGenre(id);
      load();
    } catch (err) {
      setActionMsg(errorMessage(err));
    }
  };

  return (
    <section>
      <h1>Genres</h1>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {actionMsg && <p className="status">{actionMsg}</p>}

      {isAuthenticated && (
        <form onSubmit={handleCreate} className="hstack">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New genre name"
            required
          />
          <button type="submit">Add genre</button>
        </form>
      )}

      {items === null && !error && <SkeletonTable rows={5} cols={2} />}
      {items && items.length === 0 && <EmptyMsg>No genres.</EmptyMsg>}
      {items && items.length > 0 && (
        <ul className="list">
          {items.map((genre) => (
            <li key={genre.id}>
              {editingId === genre.id ? (
                <>
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdate(genre.id)}
                  >
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span>{genre.name}</span>
                  {isAuthenticated && (
                    <span className="row-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(genre.id);
                          setEditingName(genre.name);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(genre.id)}
                      >
                        Delete
                      </button>
                    </span>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
