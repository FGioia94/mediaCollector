// Thin fetch wrapper that injects the JWT bearer token and parses errors.

import type { ApiError } from "../types";

const BASE_URL =
  (import.meta.env.VITE_MEDIA_HUB_BACKEND as string | undefined) ??
  "";

const TOKEN_KEY = "mediahub.jwt";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class HttpError extends Error {
  status: number;
  body: ApiError | string | null;

  constructor(status: number, message: string, body: ApiError | string | null) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  // Pass `false` to skip the Authorization header even if a token exists.
  auth?: boolean;
}

function buildUrl(
  path: string,
  params?: RequestOptions["params"],
): string {
  const target = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const base =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "http://localhost";
  const url = new URL(target, base);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, params, auth = true } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, params), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    let message: string = `Request failed (${response.status})`;
    if (
      parsed &&
      typeof parsed === "object" &&
      "message" in parsed &&
      typeof (parsed as { message: unknown }).message === "string"
    ) {
      message = (parsed as { message: string }).message;
    } else if (typeof parsed === "string" && parsed) {
      message = parsed;
    }
    throw new HttpError(
      response.status,
      message,
      parsed as ApiError | string | null,
    );
  }

  return parsed as T;
}
