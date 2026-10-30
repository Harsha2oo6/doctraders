import "server-only";
import type { NextRequest } from "next/server";
import { HttpError } from "./http";

const TEN_MINUTES = 10 * 60 * 1000;

/** Generous on purpose: many Indian mobile users share one IP (carrier NAT). */
const RULES = {
  login: { max: 30, windowMs: TEN_MINUTES },
  register: { max: 20, windowMs: TEN_MINUTES },
  forgotPassword: { max: 10, windowMs: TEN_MINUTES },
  enquiry: { max: 60, windowMs: TEN_MINUTES },
  contact: { max: 10, windowMs: TEN_MINUTES },
} as const;

type Bucket = { count: number; resetAt: number };

// Per server instance. On serverless each instance counts separately, so this slows abuse rather than stopping it exactly.
const g = globalThis as unknown as { _rateLimits?: Map<string, Bucket> };
const buckets: Map<string, Bucket> = (g._rateLimits ??= new Map());

function clientIp(req: NextRequest): string {
  return req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/** Throws 429 once this IP has used up the rule's allowance for the current window. */
export function rateLimit(req: NextRequest, rule: keyof typeof RULES): void {
  const { max, windowMs } = RULES[rule];
  const now = Date.now();
  if (buckets.size > 10_000) {
    for (const [key, b] of buckets) if (b.resetAt <= now) buckets.delete(key);
  }
  const key = `${rule}:${clientIp(req)}`;
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  b.count += 1;
  if (b.count > max) throw new HttpError(429, "Too many attempts. Please wait a few minutes and try again.");
}
