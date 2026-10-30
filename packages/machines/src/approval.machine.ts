import { assign, setup } from "xstate";
import type { AccountStatus } from "@doctraders/schemas";

/**
 * Admin review of one registration.   pending -> approved | rejected(reason) -> pending (resubmit)
 * A rejection MUST carry a reason, because it is shown to the user.
 */
export interface ApprovalContext {
  reason?: string;
}

export type ApprovalEvent =
  | { type: "APPROVE" }
  | { type: "REJECT"; reason: string }
  | { type: "REOPEN" };

export function createApprovalMachine(initial: AccountStatus, reason?: string) {
  return setup({
    types: { context: {} as ApprovalContext, events: {} as ApprovalEvent },
    guards: { hasReason: ({ event }) => event.type === "REJECT" && event.reason.trim().length >= 5 },
  }).createMachine({
    id: "approval",
    initial,
    context: { reason },
    states: {
      pending: {
        on: {
          APPROVE: "approved",
          REJECT: {
            guard: "hasReason",
            target: "rejected",
            actions: assign({ reason: ({ event }) => event.reason }),
          },
        },
      },
      approved: { on: { REOPEN: "pending" } },
      rejected: { on: { REOPEN: { target: "pending", actions: assign({ reason: undefined }) } } },
    },
  });
}
