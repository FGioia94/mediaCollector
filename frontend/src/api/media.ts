// Search, filter and discovery endpoints exposed under /media.

import { request } from "./client";
import type { MediaItemResponse } from "../types";

export const searchByTitle = (title: string): Promise<MediaItemResponse[]> =>
  request("/media/search", { params: { title } });

export const byGenre = (genreId: number): Promise<MediaItemResponse[]> =>
  request(`/media/by-genre/${genreId}`);

export const byYear = (year: number): Promise<MediaItemResponse[]> =>
  request(`/media/by-year/${year}`);

export const topReviewed = (limit = 10): Promise<MediaItemResponse[]> =>
  request("/media/top-reviewed", { params: { limit } });

export const advancedSearch = (params: {
  title?: string;
  genreId?: number;
  year?: number;
}): Promise<MediaItemResponse[]> => request("/media/advanced-search", { params });

export const byType = (type: string): Promise<MediaItemResponse[]> =>
  request(`/media/by-type/${type}`);

export const bestRatedAbove = (
  minRating: number,
): Promise<MediaItemResponse[]> =>
  request("/media/best-rated-above", { params: { minRating } });

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
  request("/media/discover", { params: { ...params } });

// Backend returns Object[] rows like [genreName, count].
export const statsByGenre = (): Promise<Array<[string, number]>> =>
  request("/media/stats/by-genre");

export const averageRating = (id: number): Promise<number> =>
  request(`/media/${id}/average-rating`);
