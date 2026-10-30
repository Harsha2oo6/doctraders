"use client";

import { CheckCircle2, FileText, UploadCloud } from "lucide-react";
import { useId } from "react";
import { cn } from "../cn";

/**
 * Document picker row. For now it only stores the file NAME (no upload happens).
 * When the backend exists, upload the File to private storage here.
 */
export function FileUpload({ label, hint, required, fileName, onChange }: {
  label: string; hint: string; required: boolean; fileName?: string; onChange: (name: string | undefined) => void;
}) {
  const id = useId();
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-3", fileName ? "border-green-300 bg-green-50" : "border-ink-200 bg-white")}>
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-ink-50 text-ink-600">
        {fileName ? <CheckCircle2 className="size-5 text-success" /> : <FileText className="size-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink-900">
          {label} {required ? <span className="text-danger">*</span> : <span className="text-xs text-ink-400">(optional)</span>}
        </p>
        <p className="truncate text-xs text-ink-500">{fileName ?? hint}</p>
      </div>
      <label htmlFor={id} className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-900 hover:bg-ink-50">
        <UploadCloud className="size-4" /> {fileName ? "Replace" : "Upload"}
      </label>
      <input id={id} type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only" onChange={(e) => onChange(e.target.files?.[0]?.name)} />
    </div>
  );
}
