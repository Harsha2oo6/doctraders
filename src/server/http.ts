import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectDB } from "./db";

/**
 * One response shape for every API:
 *   success  { data }                     lists  { data: [...], page, limit, total }
 *   error    { error: { message, fields? } }
 */

export type Fields = Record<string, string>;

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields?: Fields,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function okList<T>(items: T[], paging: { page: number; limit: number; total: number }, extra?: Record<string, unknown>) {
  return NextResponse.json({ data: items, page: paging.page, limit: paging.limit, total: paging.total, ...extra });
}

export function fail(status: number, message: string, fields?: Fields) {
  return NextResponse.json({ error: fields ? { message, fields } : { message } }, { status });
}

export function parsePaging(sp: URLSearchParams, defaults = { limit: 20, max: 50 }) {
  const page = Math.max(1, Number.parseInt(sp.get("page") ?? "1", 10) || 1);
  const limit = Math.min(defaults.max, Math.max(1, Number.parseInt(sp.get("limit") ?? String(defaults.limit), 10) || defaults.limit));
  return { page, limit, skip: (page - 1) * limit };
}

/** Parses a JSON body; a missing or broken body is a 400, not a 500. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.");
  }
}

function zodFields(err: ZodError): Fields {
  const fields: Fields = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    fields[key] ??= issue.message;
  }
  return fields;
}

type MongoDupError = { code?: number; keyPattern?: Record<string, unknown> };

type RouteContext<P> = { params: Promise<P> };
type Handler<P> = (req: NextRequest, params: P) => Promise<Response>;

/**
 * Wraps every route handler: connects the DB, then maps errors to the standard shape.
 * ZodError → 400 with fields, HttpError → its status, duplicate key → 409, bad ObjectId → 404, else 500.
 */
export function handle<P = Record<string, never>>(fn: Handler<P>, opts: { db?: boolean } = {}) {
  return async (req: NextRequest, ctx: RouteContext<P>): Promise<Response> => {
    try {
      if (opts.db !== false) await connectDB();
      const params = ((await ctx?.params) ?? {}) as P;
      return await fn(req, params);
    } catch (err) {
      if (err instanceof ZodError) {
        const fields = zodFields(err);
        return fail(400, Object.values(fields)[0] ?? "Please check the highlighted fields.", fields);
      }
      if (err instanceof HttpError) return fail(err.status, err.message, err.fields);
      const dup = err as MongoDupError;
      if (dup?.code === 11000) {
        const key = Object.keys(dup.keyPattern ?? {})[0] ?? "value";
        return fail(409, `This ${key} is already in use.`, { [key]: "Already registered" });
      }
      if ((err as Error)?.name === "CastError") return fail(404, "Not found.");
      console.error(`[api] ${req.method} ${req.nextUrl.pathname} failed:`, err);
      return fail(500, "Something went wrong. Please try again.");
    }
  };
}
