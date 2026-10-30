"use client";

import { useCallback, useEffect, useState } from "react";
import type { Deal, Enquiry, Listing, ReportData, UserAccount } from "@doctraders/schemas";

/** Tiny typed fetch wrapper. The base URL becomes the real backend later. */
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json() as Promise<T>;
}

export const api = {
  listings: () => request<Listing[]>("/api/listings"),
  enquiries: () => request<Enquiry[]>("/api/enquiries"),
  deals: () => request<Deal[]>("/api/deals"),
  users: () => request<UserAccount[]>("/api/users"),
  user: (id: string) => request<UserAccount>(`/api/users/${id}`),
  reports: () => request<ReportData>("/api/reports"),
  post: <T = { ok: boolean }>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
};

export interface QueryState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | undefined;
  refetch: () => void;
}

/** Minimal data hook: loading / error / data. Swap for TanStack Query when needed. */
export function useApi<T>(fetcher: () => Promise<T>): QueryState<T> {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetcher()
      .then((d) => !cancelled && (setData(d), setError(undefined)))
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, refetch };
}
