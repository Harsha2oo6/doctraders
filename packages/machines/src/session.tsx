"use client";

import { createActorContext } from "@xstate/react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { LoginInput } from "@doctraders/schemas";
import { createAuthMachine, type SessionUser } from "./auth.machine";

/**
 * Builds a Provider + hook around the auth machine for one role ("user" or "admin").
 * The session is saved in localStorage so a page refresh keeps you signed in.
 * (Temporary: real auth will use secure httpOnly cookies from the backend.)
 */
export function createSession(role: "user" | "admin") {
  const Ctx = createActorContext(createAuthMachine(role));
  const HydratedCtx = createContext(false);
  const KEY = `doctraders-session-${role}`;

  function Hydrator({ children }: { children: ReactNode }) {
    const actor = Ctx.useActorRef();
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
      const sub = actor.subscribe((snap) => {
        try {
          if (snap.matches("loggedIn")) localStorage.setItem(KEY, JSON.stringify(snap.context.user));
          else if (snap.matches("loggedOut")) localStorage.removeItem(KEY);
        } catch {}
      });
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) actor.send({ type: "RESTORE", user: JSON.parse(raw) as SessionUser });
      } catch {}
      setHydrated(true);
      return () => sub.unsubscribe();
    }, [actor]);

    return <HydratedCtx.Provider value={hydrated}>{children}</HydratedCtx.Provider>;
  }

  function SessionProvider({ children }: { children: ReactNode }) {
    return (
      <Ctx.Provider>
        <Hydrator>{children}</Hydrator>
      </Ctx.Provider>
    );
  }

  function useSession() {
    const actor = Ctx.useActorRef();
    const snapshot = Ctx.useSelector((s) => s);
    const hydrated = useContext(HydratedCtx);
    return {
      user: snapshot.context.user,
      error: snapshot.context.error,
      hydrated,
      isLoggingIn: snapshot.matches("authenticating"),
      isLoggedIn: snapshot.matches("loggedIn"),
      login: (credentials: LoginInput) => actor.send({ type: "LOGIN", credentials }),
      logout: () => actor.send({ type: "LOGOUT" }),
    };
  }

  return { SessionProvider, useSession };
}
