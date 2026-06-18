import { request } from "./client";
import type { TVShowRequest, TVShowResponse } from "../types";

export const listTVShows = (): Promise<TVShowResponse[]> =>
  request("/tvshows/all");

export const getTVShow = (id: number): Promise<TVShowResponse> =>
  request(`/tvshows/${id}`);

export const createTVShow = (body: TVShowRequest): Promise<TVShowResponse> =>
  request("/tvshows", { method: "POST", body });

export const updateTVShow = (
  id: number,
  body: TVShowRequest,
): Promise<TVShowResponse> =>
  request(`/tvshows/${id}`, { method: "PUT", body });

export const deleteTVShow = (id: number): Promise<void> =>
  request(`/tvshows/${id}`, { method: "DELETE" });
