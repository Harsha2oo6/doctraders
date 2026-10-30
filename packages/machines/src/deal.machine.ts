import { assign, setup } from "xstate";
import type { Deal } from "@doctraders/schemas";

/**
 * Deal lifecycle with a nested commission lifecycle.
 *
 *   enquiry -> negotiation -> agreement -> shipped -> completed
 *                                                        |
 *                                  commission:  due -> paid
 *
 * Guard: "agreement" -> "shipped" is blocked until both parties accepted the digital
 * commission agreement. Contact details are only released after acceptance (anti-bypass).
 */
export type DealEvent =
  | { type: "ADVANCE" }
  | { type: "ACCEPT_AGREEMENT" }
  | { type: "CANCEL" }
  | { type: "MARK_PAID" };

type DealSeed = Pick<Deal, "stage" | "agreementAccepted" | "commissionStatus">;

export function createDealMachine(deal: DealSeed) {
  return setup({
    types: { context: {} as { agreementAccepted: boolean }, events: {} as DealEvent },
    guards: { agreementAccepted: ({ context }) => context.agreementAccepted },
  }).createMachine({
    id: "deal",
    // Start from the persisted stage so the same machine can resume any deal.
    initial: deal.stage,
    context: { agreementAccepted: deal.agreementAccepted },
    on: { ACCEPT_AGREEMENT: { actions: assign({ agreementAccepted: true }) } },
    states: {
      enquiry: { on: { ADVANCE: "negotiation", CANCEL: "cancelled" } },
      negotiation: { on: { ADVANCE: "agreement", CANCEL: "cancelled" } },
      agreement: { on: { ADVANCE: { guard: "agreementAccepted", target: "shipped" }, CANCEL: "cancelled" } },
      shipped: { on: { ADVANCE: "completed" } },
      completed: {
        initial: deal.commissionStatus === "paid" ? "paid" : "due",
        states: {
          due: { on: { MARK_PAID: "paid" } },
          paid: {},
        },
      },
      cancelled: {},
    },
  });
}
