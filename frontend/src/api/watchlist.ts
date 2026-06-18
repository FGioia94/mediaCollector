import { request } from "./client";
import type { WatchListRequest, WatchListResponse } from "../types";

export const listWatchlist = (): Promise<WatchListResponse[]> =>
  request("/watchlist/all");

export const getWatchlistEntry = (id: number): Promise<WatchListResponse> =>
  request(`/watchlist/${id}`);

export const listByUser = (userId: number): Promise<WatchListResponse[]> =>
  request(`/watchlist/user/${userId}`);

export const listByMediaItem = (
  mediaItemId: number,
): Promise<WatchListResponse[]> => request(`/watchlist/media/${mediaItemId}`);

export const watchlistExists = (
  userId: number,
  mediaItemId: number,
): Promise<boolean> =>
  request(`/watchlist/exists`, { params: { userId, mediaItemId } });

export const addToWatchlist = (
  body: WatchListRequest,
): Promise<WatchListResponse> =>
  request("/watchlist", { method: "POST", body });

export const deleteWatchlist = (id: number): Promise<void> =>
  request(`/watchlist/${id}`, { method: "DELETE" });
