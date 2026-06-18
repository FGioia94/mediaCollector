import { request } from "./client";
import type { MovieRequest, MovieResponse } from "../types";

export const listMovies = (): Promise<MovieResponse[]> => request("/movies/all");

export const getMovie = (id: number): Promise<MovieResponse> =>
  request(`/movies/${id}`);

export const createMovie = (body: MovieRequest): Promise<MovieResponse> =>
  request("/movies", { method: "POST", body });

export const updateMovie = (
  id: number,
  body: MovieRequest,
): Promise<MovieResponse> =>
  request(`/movies/${id}`, { method: "PUT", body });

export const deleteMovie = (id: number): Promise<void> =>
  request(`/movies/${id}`, { method: "DELETE" });
