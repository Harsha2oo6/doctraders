import "server-only";
import { z } from "zod";

/**
 * The ONLY place that reads process.env. Validated lazily on first use, so `next build`
 * works without secrets. Values are never logged.
 */

const blankToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);
const optional = z.preprocess(blankToUndefined, z.string().trim().optional());

const schema = z.object({
  MONGODB_URI: z.preprocess(blankToUndefined, z.string({ required_error: "is required" }).trim()),
  JWT_SECRET: z.preprocess(
    blankToUndefined,
    z.string({ required_error: "is required" }).min(32, "must be at least 32 characters"),
  ),
  APP_URL: z.preprocess(
    blankToUndefined,
    z.string({ required_error: "is required" }).trim().url("must be a URL like https://yourdomain.com").transform((s) => s.replace(/\/+$/, "")),
  ),
  RESEND_API_KEY: optional,
  EMAIL_FROM: optional,
  ADMIN_NOTIFY_EMAILS: z.preprocess(
    blankToUndefined,
    z
      .string()
      .optional()
      .transform((s) => (s ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)),
  ),
  BLOB_READ_WRITE_TOKEN: optional,
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof schema>;

const OPTIONAL_HINTS: Partial<Record<keyof Env, string>> = {
  RESEND_API_KEY: "emails will be printed to the terminal instead of sent",
  EMAIL_FROM: 'emails will use "Doctraders <onboarding@resend.dev>"',
  BLOB_READ_WRITE_TOKEN: "image uploads will return 503",
};

let cached: Env | undefined;

export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    APP_URL: process.env.APP_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    ADMIN_NOTIFY_EMAILS: process.env.ADMIN_NOTIFY_EMAILS,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  });
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ");
    throw new Error(
      `Missing or invalid environment variables: ${problems}. Set them in .env.local (local) or Vercel → Settings → Environment Variables. See README §8.`,
    );
  }
  for (const [key, hint] of Object.entries(OPTIONAL_HINTS)) {
    if (!parsed.data[key as keyof Env]) console.warn(`[env] ${key} is not set: ${hint}.`);
  }
  cached = parsed.data;
  return cached;
}

export const isProd = () => process.env.NODE_ENV === "production";

/** Only for scripts/seed.ts. */
export function seedEnv() {
  const parsed = z
    .object({
      SEED_SUPERADMIN_NAME: z.preprocess(blankToUndefined, z.string({ required_error: "is required" }).trim().min(2)),
      SEED_SUPERADMIN_EMAIL: z.preprocess(blankToUndefined, z.string({ required_error: "is required" }).trim().toLowerCase().email("must be an email")),
      SEED_SUPERADMIN_MOBILE: z.preprocess(blankToUndefined, z.string({ required_error: "is required" }).trim().regex(/^[6-9]\d{9}$/, "must be a 10-digit Indian mobile")),
      SEED_SUPERADMIN_PASSWORD: z.preprocess(blankToUndefined, z.string({ required_error: "is required" }).min(8, "must be at least 8 characters")),
    })
    .safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ");
    throw new Error(`Missing or invalid seed variables: ${problems}. Set them in .env.local. See README §8.`);
  }
  return parsed.data;
}

/** Only the JWT secret, for middleware (Edge) which must not load the rest of the server code. */
export function jwtSecret(): Uint8Array {
  return new TextEncoder().encode(env().JWT_SECRET);
}
