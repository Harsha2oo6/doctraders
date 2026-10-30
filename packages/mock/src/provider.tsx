"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Starts the MSW service worker in the browser before rendering the app, so every
 * fetch("/api/...") is answered with mock data. Set NEXT_PUBLIC_API_MOCKING=disabled
 * to turn it off once the real backend is connected.
 */
export function MockProvider({ children }: { children: ReactNode }) {
  const enabled = process.env.NEXT_PUBLIC_API_MOCKING !== "disabled";
  const [ready, setReady] = useState(!enabled);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    import("msw/browser")
      .then(async ({ setupWorker }) => {
        const { handlers } = await import("./handlers");
        await setupWorker(...handlers).start({ onUnhandledRequest: "bypass", quiet: true });
      })
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return ready ? <>{children}</> : null;
}
