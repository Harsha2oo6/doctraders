import "server-only";
import { after } from "next/server";

/**
 * Runs work after the response is sent (emails, notifications) without delaying the request.
 * Outside a request (scripts) it just runs it. Errors are logged, never thrown.
 */
export function later(fn: () => Promise<unknown>): void {
  const run = () => fn().catch((e) => console.error("[later] failed:", (e as Error)?.message ?? e));
  try {
    after(run);
  } catch {
    void run();
  }
}
