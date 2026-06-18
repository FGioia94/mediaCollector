import { request } from "./client";
import type {
  EnrichedMediaDetails,
  MovieResponse,
  TmdbSearchResponse,
  TrendingMediaResponse,
} from "../types";

export const externalMovie = (id: number): Promise<EnrichedMediaDetails> =>
  request(`/external/movie/${id}`);

export const externalSearch = (query: string): Promise<TmdbSearchResponse> =>
  request("/external/search", { params: { query } });

export const trending = (): Promise<TrendingMediaResponse[]> =>
  request("/external/trending");

export const saveExternalMovie = (id: number): Promise<MovieResponse> =>
  request(`/external/movie/${id}/save`, { method: "POST" });
