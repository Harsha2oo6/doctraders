"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { REGISTRATION_STEPS, registrationMachine, useMachine } from "@doctraders/machines";
import { Button, Card, CardBody, Stepper } from "@doctraders/ui";
import { AccountStepForm } from "./account-step";
import { CompanyStepForm } from "./company-step";
import { DocumentsStepForm } from "./documents-step";
import { ReviewStep } from "./review-step";

/**
 * The wizard has NO step logic of its own. It asks the registration machine which
 * state it is in and renders that step. Steps send events (NEXT_*, BACK, SUBMIT) back.
 */
export function RegisterWizard() {
  const [state, send] = useMachine(registrationMachine);
  const { context } = state;

  if (state.matches("submitted")) {
    return (
      <Card>
        <CardBody className="space-y-3 p-8 text-center">
          <CheckCircle2 className="mx-auto size-12 text-success" />
          <h2 className="text-2xl font-semibold text-ink-900">Registration received</h2>
          <p className="text-ink-600">Reference <strong>{context.referenceId}</strong>. Your account is <strong>Pending</strong>. We will email you after our team reviews your documents.</p>
          <Button asChild className="mt-2"><Link href="/login">Go to login</Link></Button>
        </CardBody>
      </Card>
    );
  }

  const current = Math.max(REGISTRATION_STEPS.indexOf(state.value as (typeof REGISTRATION_STEPS)[number]), 0);

  return (
    <div className="space-y-6">
      <Stepper steps={REGISTRATION_STEPS} current={current === -1 ? 3 : current} />
      <Card>
        <CardBody className="p-6">
          {state.matches("account") && (
            <AccountStepForm defaults={context.account} onNext={(data) => send({ type: "NEXT_ACCOUNT", data })} />
          )}
          {state.matches("company") && (
            <CompanyStepForm defaults={context.company} onBack={() => send({ type: "BACK" })} onNext={(data) => send({ type: "NEXT_COMPANY", data })} />
          )}
          {state.matches("documents") && context.company && (
            <DocumentsStepForm
              companyType={context.company.companyType}
              initial={context.files}
              onBack={() => send({ type: "BACK" })}
              onNext={(files) => send({ type: "NEXT_DOCUMENTS", files })}
            />
          )}
          {(state.matches("review") || state.matches("submitting")) && (
            <ReviewStep
              context={context}
              submitting={state.matches("submitting")}
              onBack={() => send({ type: "BACK" })}
              onSubmit={(consent) => send({ type: "SUBMIT", consent })}
            />
          )}
        </CardBody>
      </Card>
      <p className="text-center text-sm text-ink-600">Already registered? <Link href="/login" className="font-semibold text-ink-900 underline">Log in</Link></p>
    </div>
  );
}
