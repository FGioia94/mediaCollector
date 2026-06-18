// Shared TypeScript types mirroring the Spring backend DTOs.

export interface AuthRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface MessageResponse {
  message: string;
  resetLink?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  userId: number;
}

export interface Role {
  id: number;
  name: string;
  createdAt?: string;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  systemAdmin: boolean;
  profileImage?: string;
  roles: Role[];
  createdAt: string;
}

export interface UserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profileImage?: string;
}

export interface ProfileImageUpdateRequest {
  profileImage: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Genre {
  id: number;
  name: string;
  createdAt?: string;
}

export interface MediaItemResponse {
  id: number;
  title: string;
  description: string;
  releaseDate: string;
  posterUrl: string;
  genreIds: number[];
  reviewIds: number[];
  watchListIds: number[];
}

export interface MovieResponse extends MediaItemResponse {
  duration: number;
  director: string;
  budget: number;
}

export interface MovieRequest {
  title: string;
  description?: string;
  releaseDate?: string;
  posterUrl?: string;
  genreIds: number[];
  duration: number;
  director: string;
  budget: number;
}

export interface TVShowResponse extends MediaItemResponse {
  seasons: number;
  episodes: number;
  network: string;
}

export interface TVShowRequest {
  title: string;
  description?: string;
  releaseDate?: string;
  posterUrl?: string;
  genreIds: number[];
  seasons: number;
  episodes: number;
  network: string;
}

export interface ReviewResponse {
  id: number;
  authorId: number;
  text: string;
  mediaItemId: number;
  createdAt: string;
  rating: number;
}

export interface ReviewRequest {
  authorId: number;
  text: string;
  mediaItemId: number;
  rating: number;
}

export interface ReviewUpdateRequest {
  text: string;
  rating: number;
}

export interface WatchListResponse {
  id: number;
  userId: number;
  mediaItemId: number;
  addedAt: string;
}

export interface WatchListRequest {
  userId: number;
  mediaItemId: number;
}

export interface EnrichedMediaDetails {
  title: string;
  overview: string;
  posterUrl: string;
  imdbRating: string;
  metascore: string;
}

export interface TrendingMediaResponse {
  externalId: number;
  localMovieId: number | null;
  title: string;
  overview: string;
  posterUrl: string;
  savedLocally: boolean;
}

export interface TmdbMovieSearchResult {
  id: number;
  title: string;
  overview: string;
  posterPath?: string;
  poster_path?: string;
  releaseDate?: string;
  release_date?: string;
}

export interface TmdbSearchResponse {
  page: number;
  totalResults?: number;
  total_results?: number;
  results: TmdbMovieSearchResult[];
}

export interface ApiError {
  timestamp?: string;
  status: number;
  error?: string;
  message: string;
  path?: string;
  details?: string[];
}
