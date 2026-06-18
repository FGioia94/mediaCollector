import { request } from "./client";
import type { Genre } from "../types";

export const listGenres = (): Promise<Genre[]> => request("/genres");

export const getGenre = (id: number): Promise<Genre> => request(`/genres/${id}`);

export const createGenre = (name: string): Promise<Genre> =>
  request("/genres", { method: "POST", body: { name } });

export const updateGenre = (id: number, name: string): Promise<Genre> =>
  request(`/genres/${id}`, { method: "PUT", body: { name } });

export const deleteGenre = (id: number): Promise<void> =>
  request(`/genres/${id}`, { method: "DELETE" });
