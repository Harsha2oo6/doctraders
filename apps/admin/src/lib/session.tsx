"use client";

import { createSession } from "@doctraders/machines";

/** Admin session: same machine as the user app, but role "admin" and its own storage key. */
export const { SessionProvider, useSession } = createSession("admin");
