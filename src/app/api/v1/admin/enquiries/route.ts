import { ENQUIRY_STATUSES, type EnquiryStatus } from "@/lib/constants";
import { requireAuth } from "@/server/guard";
import { handle, okList, parsePaging } from "@/server/http";
import { adminListEnquiries } from "@/server/services/enquiries";

/** GET /api/v1/admin/enquiries (admin) ?status&q&page&limit → with both parties' full contact + counts per status. */
export const GET = handle(async (req) => {
  await requireAuth(req, { roles: ["admin"] });
  const sp = req.nextUrl.searchParams;
  const status = sp.get("status") as EnquiryStatus;
  const r = await adminListEnquiries({
    status: ENQUIRY_STATUSES.includes(status) ? status : undefined,
    q: sp.get("q") || undefined,
    ...parsePaging(sp),
  });
  return okList(r.items, r, { counts: r.counts });
});
