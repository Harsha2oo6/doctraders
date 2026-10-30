"use client";

import { ArrowLeft, ArrowRight, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { apiUpload, ApiError } from "@/lib/api-client";
import { UPLOAD_LIMITS } from "@/lib/constants";
import { Badge } from "@/components/ui";

const MAX_SIDE = 1600;

/** Resizes to max 1600px on the longest side and re-encodes as JPEG (keeps uploads small for mobile data too). */
async function resizeToJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.fillStyle = "#fff"; // PNG transparency → white instead of black (canvas fill, not a UI colour)
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.85));
}

type Pending = { id: number; preview: string; progress: number };

/** DESIGN.md 6.10. `value` = uploaded photo URLs in order; the first is the cover. */
export function ImageUploader({ value, onChange, error }: { value: string[]; onChange: (urls: string[]) => void; error?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [uploadError, setUploadError] = useState<string>();
  const latest = useRef(value);
  latest.current = value;

  const max = UPLOAD_LIMITS.maxImagesPerListing;
  const room = max - value.length - pending.length;

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploadError(undefined);
    const picked = Array.from(files).slice(0, Math.max(0, room));
    for (const file of picked) {
      if (!(UPLOAD_LIMITS.mimeTypes as readonly string[]).includes(file.type)) {
        setUploadError(`${file.name}: use a JPG, PNG or WebP photo.`);
        continue;
      }
      const id = Date.now() + Math.random();
      const preview = URL.createObjectURL(file);
      setPending((p) => [...p, { id, preview, progress: 0 }]);
      try {
        const blob = await resizeToJpeg(file);
        if (blob.size > UPLOAD_LIMITS.maxBytes) throw new ApiError("Photo is larger than 4 MB even after resizing.", 413);
        const form = new FormData();
        form.append("file", blob, file.name.replace(/\.\w+$/, "") + ".jpg");
        const { url } = await apiUpload<{ url: string }>("/uploads", form, (pct) =>
          setPending((p) => p.map((x) => (x.id === id ? { ...x, progress: pct } : x))),
        );
        onChange([...latest.current, url]);
      } catch (e) {
        setUploadError(e instanceof ApiError ? e.message : "Upload failed. Please try again.");
      } finally {
        setPending((p) => p.filter((x) => x.id !== id));
        URL.revokeObjectURL(preview);
      }
    }
    if (input.current) input.current.value = "";
  }

  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {value.map((url, i) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-ink-200 bg-ink-50">
            {/* eslint-disable-next-line @next/next/no-img-element -- small editor thumbnail */}
            <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            {i === 0 && <Badge tone="brand" className="absolute left-1 top-1">Cover</Badge>}
            <div className="absolute right-1 top-1 flex gap-1">
              {i > 0 && (
                <button type="button" onClick={() => move(i, -1)} aria-label="Move left" className="grid size-7 cursor-pointer place-items-center rounded-md bg-white/90 text-ink-700 shadow-card"><ArrowLeft className="size-4" /></button>
              )}
              {i < value.length - 1 && (
                <button type="button" onClick={() => move(i, 1)} aria-label="Move right" className="grid size-7 cursor-pointer place-items-center rounded-md bg-white/90 text-ink-700 shadow-card"><ArrowRight className="size-4" /></button>
              )}
              <button type="button" onClick={() => onChange(value.filter((u) => u !== url))} aria-label="Remove photo" className="grid size-7 cursor-pointer place-items-center rounded-md bg-white/90 text-ink-700 shadow-card"><Trash2 className="size-4" /></button>
            </div>
          </div>
        ))}
        {pending.map((p) => (
          <div key={p.id} className="relative grid aspect-square place-items-center overflow-hidden rounded-lg border border-ink-200 bg-ink-50">
            {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
            <img src={p.preview} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
            <span className="relative flex flex-col items-center gap-1" role="status">
              <span className="size-4 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" />
              <span className="text-xs text-ink-500">{p.progress}%</span>
            </span>
          </div>
        ))}
        {room > 0 && (
          <label className="grid aspect-square cursor-pointer place-items-center rounded-lg border-2 border-dashed border-ink-300 bg-white text-ink-500 hover:border-brand-500 hover:text-brand-600">
            <span className="flex flex-col items-center gap-1">
              <UploadCloud className="size-6" />
              <span className="text-xs font-semibold">Add photo</span>
            </span>
            <input ref={input} type="file" accept={UPLOAD_LIMITS.mimeTypes.join(",")} multiple className="sr-only" onChange={(e) => addFiles(e.target.files)} />
          </label>
        )}
      </div>
      <p className="mt-2 text-xs text-ink-400">Up to 6 photos. JPG, PNG or WebP. First photo is the cover.</p>
      {(uploadError || error) && <p role="alert" className="mt-1 text-xs text-danger">{uploadError ?? error}</p>}
    </div>
  );
}
