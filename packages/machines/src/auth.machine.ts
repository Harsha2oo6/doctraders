import { assign, fromPromise, setup } from "xstate";
import type { AccountStatus, LoginInput } from "@doctraders/schemas";

/**
 * Session machine.   loggedOut -> authenticating -> loggedIn | loggedOut(error)
 * An account that is not "approved" can sign in but only sees a status screen
 * (nobody can post or view contacts until approved).
 */
export interface SessionUser {
  id: string;
  name: string;
  companyName: string;
  email: string;
  role: "user" | "admin";
  status: AccountStatus;
  rejectionReason?: string;
}

export interface AuthContext {
  user?: SessionUser;
  error?: string;
}

export type AuthEvent =
  | { type: "LOGIN"; credentials: LoginInput }
  | { type: "RESTORE"; user: SessionUser }
  | { type: "LOGOUT" };

export function createAuthMachine(role: "user" | "admin") {
  return setup({
    types: { context: {} as AuthContext, events: {} as AuthEvent },
    actors: {
      login: fromPromise<SessionUser, LoginInput>(async ({ input }) => {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...input, role }),
        });
        if (!res.ok) throw new Error("Wrong email or password");
        return res.json();
      }),
    },
  }).createMachine({
    id: `auth-${role}`,
    initial: "loggedOut",
    context: {},
    states: {
      loggedOut: {
        on: {
          LOGIN: "authenticating",
          // Used on page load to bring back a session saved in localStorage.
          RESTORE: { target: "loggedIn", actions: assign({ user: ({ event }) => event.user }) },
        },
      },
      authenticating: {
        invoke: {
          src: "login",
          input: ({ event }) => (event as Extract<AuthEvent, { type: "LOGIN" }>).credentials,
          onDone: { target: "loggedIn", actions: assign({ user: ({ event }) => event.output, error: undefined }) },
          onError: { target: "loggedOut", actions: assign({ error: ({ event }) => (event.error as Error).message }) },
        },
      },
      loggedIn: { on: { LOGOUT: { target: "loggedOut", actions: assign({ user: undefined }) } } },
    },
  });
}
