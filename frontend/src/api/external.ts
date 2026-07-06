import { ensureArray, ensureObject, request, requestArray } from "./client";
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
  request<unknown>("/external/search", { params: { query } }).then((payload) => {
    const body = ensureObject<{ results?: unknown }>(payload, "external search");
    return {
      ...(body as object),
      results: ensureArray<TmdbSearchResponse["results"][number]>(body.results, "external search results"),
    } as TmdbSearchResponse;
  });

export const trending = (): Promise<TrendingMediaResponse[]> =>
  requestArray("/external/trending", {}, "external trending");

export const saveExternalMovie = (id: number): Promise<MovieResponse> =>
  request(`/external/movie/${id}/save`, { method: "POST" });
