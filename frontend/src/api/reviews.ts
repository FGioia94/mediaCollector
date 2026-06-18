import { request } from "./client";
import type {
  ReviewRequest,
  ReviewResponse,
  ReviewUpdateRequest,
} from "../types";

export const listReviews = (): Promise<ReviewResponse[]> =>
  request("/reviews/all");

export const getReview = (id: number): Promise<ReviewResponse> =>
  request(`/reviews/${id}`);

export const createReview = (body: ReviewRequest): Promise<ReviewResponse> =>
  request("/reviews", { method: "POST", body });

export const updateReview = (
  id: number,
  body: ReviewUpdateRequest,
): Promise<ReviewResponse> =>
  request(`/reviews/${id}`, { method: "PUT", body });

export const deleteReview = (id: number): Promise<void> =>
  request(`/reviews/${id}`, { method: "DELETE" });
