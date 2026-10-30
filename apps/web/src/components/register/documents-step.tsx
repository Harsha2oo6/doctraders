"use client";

import { useState } from "react";
import { DOCUMENT_REQUIREMENTS, type CompanyType, type UploadedFiles } from "@doctraders/schemas";
import { Button, FileUpload } from "@doctraders/ui";

/** The list of documents comes from DOCUMENT_REQUIREMENTS, per company type. */
export function DocumentsStepForm({ companyType, initial, onNext, onBack }: {
  companyType: CompanyType; initial: UploadedFiles; onNext: (f: UploadedFiles) => void; onBack: () => void;
}) {
  const reqs = DOCUMENT_REQUIREMENTS[companyType];
  const [files, setFiles] = useState<UploadedFiles>(initial);
  const [showErrors, setShowErrors] = useState(false);
  const missing = reqs.filter((r) => r.required && !files[r.key]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-ink-900">Verification documents</h2>
        <p className="text-sm text-ink-600">Stored privately. Only Doctraders admins can view them. PDF, JPG or PNG.</p>
      </div>
      {reqs.map((r) => (
        <FileUpload
          key={r.key} label={r.label} hint={r.hint} required={r.required} fileName={files[r.key]}
          onChange={(name) => setFiles((f) => { const next = { ...f }; if (name) next[r.key] = name; else delete next[r.key]; return next; })}
        />
      ))}
      {showErrors && missing.length > 0 && (
        <p role="alert" className="text-sm text-danger">Please upload: {missing.map((m) => m.label).join(", ")}</p>
      )}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button type="button" onClick={() => (missing.length ? setShowErrors(true) : onNext(files))}>Continue</Button>
      </div>
    </div>
  );
}
