// Search, filter and discovery endpoints exposed under /media.

import { request } from "./client";
import { requestArray } from "./client";
import type { MediaItemResponse } from "../types";

export const searchByTitle = (title: string): Promise<MediaItemResponse[]> =>
  requestArray("/media/search", { params: { title } }, "media search");

export const byGenre = (genreId: number): Promise<MediaItemResponse[]> =>
  requestArray(`/media/by-genre/${genreId}`, {}, "media by genre");

export const byYear = (year: number): Promise<MediaItemResponse[]> =>
  requestArray(`/media/by-year/${year}`, {}, "media by year");

export const topReviewed = (limit = 10): Promise<MediaItemResponse[]> =>
  requestArray("/media/top-reviewed", { params: { limit } }, "top reviewed media");

export const advancedSearch = (params: {
  title?: string;
  genreId?: number;
  year?: number;
}): Promise<MediaItemResponse[]> =>
  requestArray("/media/advanced-search", { params }, "advanced media search");

export const byType = (type: string): Promise<MediaItemResponse[]> =>
  requestArray(`/media/by-type/${type}`, {}, "media by type");

export const bestRatedAbove = (
  minRating: number,
): Promise<MediaItemResponse[]> =>
  requestArray("/media/best-rated-above", { params: { minRating } }, "best rated media");

export interface DiscoverParams {
  title?: string;
  genreId?: number;
  year?: number;
  type?: string;
  minRating?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export const discover = (
  params: DiscoverParams,
): Promise<MediaItemResponse[]> =>
  requestArray("/media/discover", { params: { ...params } }, "discover media");

// Backend returns Object[] rows like [genreName, count].
export const statsByGenre = (): Promise<Array<[string, number]>> =>
  requestArray("/media/stats/by-genre", {}, "media stats by genre");

export const averageRating = (id: number): Promise<number> =>
  request(`/media/${id}/average-rating`);
