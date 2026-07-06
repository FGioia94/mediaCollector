// Thin fetch wrapper that injects the JWT bearer token and parses errors.

import type { ApiError } from "../types";

const RAW_BASE_URL = import.meta.env.VITE_MEDIA_HUB_BACKEND as string | undefined;
const BASE_URL =
  typeof RAW_BASE_URL === "string" && RAW_BASE_URL.trim().length > 0
    ? RAW_BASE_URL.trim()
    : "/api";

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

export function ensureArray<T>(payload: unknown, context: string): T[] {
  if (Array.isArray(payload)) return payload as T[];
  throw new Error(`Unexpected ${context} response format`);
}

export function ensureObject<T extends object>(payload: unknown, context: string): T {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload as T;
  }
  throw new Error(`Unexpected ${context} response format`);
}

export function requestArray<T>(
  path: string,
  options: RequestOptions = {},
  context = path,
): Promise<T[]> {
  return request<unknown>(path, options).then((payload) => ensureArray<T>(payload, context));
}

function buildUrl(
  path: string,
  params?: RequestOptions["params"],
): string {
  const normalizedBase = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const target = path.startsWith("http") ? path : `${normalizedBase}${normalizedPath}`;
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
      if (response.ok) {
        throw new HttpError(response.status, "Unexpected non-JSON response", text);
      }
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

    if (/^No static resource api\//i.test(message)) {
      message =
        "API proxy misconfiguration: /api requests are reaching backend without URL rewrite. " +
        "Configure reverse proxy to strip /api before forwarding.";
    }

    throw new HttpError(
      response.status,
      message,
      parsed as ApiError | string | null,
    );
  }

  return parsed as T;
}
