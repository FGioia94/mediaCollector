import { request } from "./client";
import type {
  EnrichedMediaDetails,
  ExternalTrailerResponse,
  MovieResponse,
  TmdbSearchResponse,
  TrendingMediaResponse,
} from "../types";

export const externalMovie = (id: number): Promise<EnrichedMediaDetails> =>
  request(`/external/movie/${id}`);

export const externalTrailer = (
  id: number,
): Promise<ExternalTrailerResponse | null> => request(`/external/movie/${id}/trailer`);

export const externalSearch = (query: string): Promise<TmdbSearchResponse> =>
  request("/external/search", { params: { query } });

export const trending = (): Promise<TrendingMediaResponse[]> =>
  request("/external/trending");

export const saveExternalMovie = (id: number): Promise<MovieResponse> =>
  request(`/external/movie/${id}/save`, { method: "POST" });
