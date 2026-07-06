import { request, requestArray } from "./client";
import type { WatchListRequest, WatchListResponse } from "../types";

export const listWatchlist = (): Promise<WatchListResponse[]> =>
  requestArray("/watchlist/all", {}, "watchlist entries");

export const getWatchlistEntry = (id: number): Promise<WatchListResponse> =>
  request(`/watchlist/${id}`);

export const listByUser = (userId: number): Promise<WatchListResponse[]> =>
  requestArray(`/watchlist/user/${userId}`, {}, "user watchlist");

export const listByMediaItem = (
  mediaItemId: number,
): Promise<WatchListResponse[]> =>
  requestArray(`/watchlist/media/${mediaItemId}`, {}, "media watchlist entries");

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
