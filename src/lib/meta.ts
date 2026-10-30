"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./api-client";

export type Option = { key: string; label: string };
export type MetaCategory = { id: string; name: string; slug: string; order: number; examples: string | null };

/** Shape of GET /api/v1/meta (see docs/API.md). */
export interface Meta {
  roles: Option[]; accountStatuses: Option[]; businessTypes: Option[]; units: Option[]; states: string[];
  listingKinds: Option[]; listingStatuses: Option[]; enquiryStatuses: Option[]; enquiryPartyStatuses: Option[];
  dealStatuses: Option[]; commissionStatuses: Option[]; shipmentStatuses: Option[]; paymentMethods: Option[];
  categories: MetaCategory[];
  uploads: { maxBytes: number; mimeTypes: string[]; maxImagesPerListing: number };
  minAppVersion: string;
}

let cache: Promise<Meta> | null = null;

/** GET /api/v1/meta once per page load. */
export function loadMeta(): Promise<Meta> {
  cache ??= apiFetch<Meta>("/meta").catch((e) => {
    cache = null;
    throw e;
  });
  return cache;
}

export function useMeta() {
  const [meta, setMeta] = useState<Meta>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    loadMeta().then(setMeta, (e: Error) => setError(e.message));
  }, []);
  return { meta, error };
}
