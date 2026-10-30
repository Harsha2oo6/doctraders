"use client";

import { createSession } from "@doctraders/machines";

/** One session for the user app. The admin app has its own with role "admin". */
export const { SessionProvider, useSession } = createSession("user");
