"use client";

import { useMemo, useState } from "react";
import { api } from "@doctraders/api-client";
import { createApprovalMachine, useMachine } from "@doctraders/machines";
import type { UserAccount } from "@doctraders/schemas";
import { Button, Card, CardBody, CardHeader, CardTitle, StatusBadge, Textarea } from "@doctraders/ui";

/** Approve / reject decision. The approval machine enforces "a rejection needs a reason". */
export function ReviewPanel({ user }: { user: UserAccount }) {
  const machine = useMemo(() => createApprovalMachine(user.status, user.rejectionReason), [user]);
  const [state, send] = useMachine(machine);
  const [reason, setReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const status = state.value as UserAccount["status"];

  async function decide(event: Parameters<typeof send>[0], payload: object) {
    send(event);
    await api.post(`/api/users/${user.id}/review`, payload); // fake call for now
  }

  return (
    <Card className="h-fit">
      <CardHeader className="flex items-center justify-between"><CardTitle>Decision</CardTitle><StatusBadge status={status} /></CardHeader>
      <CardBody className="space-y-3">
        {status === "pending" && !rejecting && (
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => decide({ type: "APPROVE" }, { status: "approved" })}>Approve</Button>
            <Button className="flex-1" variant="danger" onClick={() => setRejecting(true)}>Reject</Button>
          </div>
        )}
        {status === "pending" && rejecting && (
          <>
            <Textarea placeholder="Reason shown to the user (min 5 characters)" value={reason} onChange={(e) => setReason(e.target.value)} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setRejecting(false)}>Cancel</Button>
              <Button variant="danger" disabled={reason.trim().length < 5} onClick={() => decide({ type: "REJECT", reason }, { status: "rejected", reason })}>Confirm rejection</Button>
            </div>
          </>
        )}
        {status === "approved" && <p className="text-sm text-ink-600">Approved. The user now has the Verified badge and a confirmation email is sent.</p>}
        {status === "rejected" && <p className="text-sm text-ink-600">Reason shown to user: <strong>{state.context.reason}</strong></p>}
        {status !== "pending" && <Button variant="outline" onClick={() => send({ type: "REOPEN" })}>Reopen review</Button>}
        <p className="text-xs text-ink-400">An email is sent to the user at every status change.</p>
      </CardBody>
    </Card>
  );
}
