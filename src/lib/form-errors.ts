"use client";

import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "./api-client";

/**
 * Puts server field errors (`{ error: { fields } }`) under the matching inputs and returns the
 * form-level message to show above the submit button.
 */
export function applyApiError<T extends FieldValues>(e: unknown, setError: UseFormSetError<T>): string {
  if (!(e instanceof ApiError)) return "Something went wrong. Please try again.";
  for (const [key, message] of Object.entries(e.fields)) setError(key as Path<T>, { type: "server", message });
  return e.message;
}
