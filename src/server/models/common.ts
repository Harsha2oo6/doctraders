import "server-only";
import type { ToObjectOptions } from "mongoose";

const SECRET_FIELDS = ["passwordHash", "resetTokenHash", "resetTokenExpires"];

/** toJSON for every model: _id → id (string), drop __v and secrets, nested _id → id too. */
export const toJSON: ToObjectOptions = {
  virtuals: false,
  versionKey: false,
  transform(_doc, ret: Record<string, unknown>) {
    return clean(ret);
  },
};

function clean(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const v = value as Record<string, unknown>;
    if (typeof (v as { toHexString?: unknown }).toHexString === "function") return String(v);
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) {
      if (k === "__v" || SECRET_FIELDS.includes(k)) continue;
      if (k === "_id") out.id = String(val);
      else out[k] = clean(val);
    }
    return out;
  }
  return value;
}
