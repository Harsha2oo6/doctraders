"use client";

import { useCallback, useEffect, useState, type DependencyList } from "react";

/**
 * The only way the website talks to the backend. Every call goes to /api/v1/*,
 * exactly like the mobile app will (the web sends the httpOnly cookie, the app a Bearer token).
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiList<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

type Options = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /** JSON body. */
  body?: unknown;
  /** multipart/form-data body (uploads). */
  form?: FormData;
  /** Query string values; empty values are skipped. */
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
};

function buildUrl(path: string, query?: Options["query"]) {
  const url = `/api/v1${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${url}${url.includes("?") ? "&" : "?"}${qs}` : url;
}

async function send(path: string, opts: Options = {}) {
  const { method = opts.body !== undefined || opts.form ? "POST" : "GET", body, form, query, signal } = opts;
  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      credentials: "include",
      headers: form ? undefined : body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal,
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ApiError("Could not reach the server. Check your connection and try again.", 0);
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = json?.error;
    throw new ApiError(err?.message ?? `Request failed (${res.status})`, res.status, err?.fields ?? {});
  }
  return json;
}

/** Returns the `data` of a `{ data }` response. */
export async function apiFetch<T>(path: string, opts?: Options): Promise<T> {
  const json = await send(path, opts);
  return json?.data as T;
}

/** Returns the full `{ data, page, limit, total }` of a list response. */
export async function apiList<T>(path: string, opts?: Options): Promise<ApiList<T> & Record<string, unknown>> {
  return send(path, opts);
}

export interface QueryState<T> {
  data: T | undefined;
  loading: boolean;
  error: ApiError | undefined;
  refetch: () => void;
}

/** Minimal data hook: loading / error / data. Re-runs when `deps` change or on refetch(). */
export function useApi<T>(fetcher: () => Promise<T>, deps: DependencyList = []): QueryState<T> {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError>();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetcher()
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setError(undefined);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof ApiError ? e : new ApiError((e as Error)?.message ?? "Something went wrong", 0));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, refetch };
}
