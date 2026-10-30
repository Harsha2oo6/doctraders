import "server-only";
import { put } from "@vercel/blob";
import { randomBytes } from "node:crypto";
import { UPLOAD_LIMITS } from "@/lib/constants";
import { env } from "./env";
import { HttpError } from "./http";

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Stores one image on Vercel Blob at listings/<userId>/<random>.<ext> and returns its public URL. */
export async function uploadImage(file: File, userId: string): Promise<string> {
  const token = env().BLOB_READ_WRITE_TOKEN;
  if (!token) throw new HttpError(503, "Image uploads are not set up yet (BLOB_READ_WRITE_TOKEN is missing). Please try again later.");
  if (!(UPLOAD_LIMITS.mimeTypes as readonly string[]).includes(file.type)) {
    throw new HttpError(400, "Upload a JPG, PNG or WebP image.", { file: "Upload a JPG, PNG or WebP image" });
  }
  if (file.size > UPLOAD_LIMITS.maxBytes) throw new HttpError(413, "The image must be 4 MB or smaller.", { file: "Max 4 MB" });
  if (file.size === 0) throw new HttpError(400, "The file is empty.", { file: "Empty file" });

  const path = `listings/${userId}/${randomBytes(12).toString("hex")}.${EXT[file.type]}`;
  const blob = await put(path, file, { access: "public", token, contentType: file.type, addRandomSuffix: false });
  return blob.url;
}
