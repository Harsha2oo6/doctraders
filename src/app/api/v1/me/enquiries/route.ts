import { ENQUIRY_PARTY_STATUSES, type EnquiryPartyStatus } from "@/lib/constants";
import { objectId } from "@/lib/validation";
import { requireAuth } from "@/server/guard";
import { handle, okList, parsePaging } from "@/server/http";
import { myEnquiries } from "@/server/services/enquiries";

/** GET /api/v1/me/enquiries (user) ?status (party key)&listingId&page&limit → enquiries I sent. */
export const GET = handle(async (req) => {
  const user = await requireAuth(req, { roles: ["buyer", "seller"] });
  const sp = req.nextUrl.searchParams;
  const status = sp.get("status") as EnquiryPartyStatus;
  const listingId = sp.get("listingId");
  const r = await myEnquiries(user, {
    status: ENQUIRY_PARTY_STATUSES.includes(status) ? status : undefined,
    listingId: listingId ? objectId.parse(listingId) : undefined,
    ...parsePaging(sp),
  });
  return okList(r.items, r);
});
