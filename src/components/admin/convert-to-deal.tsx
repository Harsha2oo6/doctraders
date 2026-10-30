"use client";

import { Handshake } from "lucide-react";
import type { AdminEnquiry } from "@/lib/types";
import { Button } from "@/components/ui";

// TEMPORARY (Prompt 5): the deal form arrives with the deals API in Prompt 6.
export function ConvertToDealButton({ enquiry }: { enquiry: AdminEnquiry }) {
  return (
    <Button disabled={enquiry.status === "dropped"} title="Available with deals (next step)">
      <Handshake className="size-4" />Convert to deal
    </Button>
  );
}
