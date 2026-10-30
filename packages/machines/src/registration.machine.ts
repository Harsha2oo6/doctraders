import { assign, fromPromise, setup } from "xstate";
import type {
  AccountStep, CompanyStep, ConsentStep, UploadedFiles,
} from "@doctraders/schemas";

/**
 * Multi-step registration flow.
 *
 *   account -> company -> documents -> review -> submitting -> submitted
 *                 ^____ BACK works from every step ____|          |
 *                                                  (error) -> review
 *
 * The UI only sends events; this machine decides what is allowed.
 */
export interface RegistrationContext {
  account?: AccountStep;
  company?: CompanyStep;
  files: UploadedFiles;
  consent?: ConsentStep;
  error?: string;
  referenceId?: string;
}

export type RegistrationEvent =
  | { type: "NEXT_ACCOUNT"; data: AccountStep }
  | { type: "NEXT_COMPANY"; data: CompanyStep }
  | { type: "NEXT_DOCUMENTS"; files: UploadedFiles }
  | { type: "SUBMIT"; consent: ConsentStep }
  | { type: "BACK" };

export const registrationMachine = setup({
  types: {
    context: {} as RegistrationContext,
    events: {} as RegistrationEvent,
  },
  actors: {
    submitRegistration: fromPromise<{ referenceId: string }, RegistrationContext>(
      async ({ input }) => {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error("Could not submit registration. Please try again.");
        return res.json();
      },
    ),
  },
}).createMachine({
  id: "registration",
  initial: "account",
  context: { files: {} },
  states: {
    account: {
      on: { NEXT_ACCOUNT: { target: "company", actions: assign({ account: ({ event }) => event.data }) } },
    },
    company: {
      on: {
        NEXT_COMPANY: {
          target: "documents",
          // A different company type needs a different document list, so clear old uploads.
          actions: assign({
            files: ({ context, event }) =>
              context.company?.companyType === event.data.companyType ? context.files : {},
            company: ({ event }) => event.data,
          }),
        },
        BACK: "account",
      },
    },
    documents: {
      on: {
        NEXT_DOCUMENTS: { target: "review", actions: assign({ files: ({ event }) => event.files }) },
        BACK: "company",
      },
    },
    review: {
      on: {
        SUBMIT: { target: "submitting", actions: assign({ consent: ({ event }) => event.consent, error: undefined }) },
        BACK: "documents",
      },
    },
    submitting: {
      invoke: {
        src: "submitRegistration",
        input: ({ context }) => context,
        onDone: { target: "submitted", actions: assign({ referenceId: ({ event }) => event.output.referenceId }) },
        onError: { target: "review", actions: assign({ error: ({ event }) => (event.error as Error).message }) },
      },
    },
    submitted: { type: "final" },
  },
});

export const REGISTRATION_STEPS = ["account", "company", "documents", "review"] as const;
