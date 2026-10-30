import { LISTING_KINDS, LISTING_STATUSES, type ListingKind, type ListingStatus } from "@/lib/constants";
import { requireAuth } from "@/server/guard";
import { handle, okList, parsePaging } from "@/server/http";
import { myListings } from "@/server/services/listings";

/** GET /api/v1/me/listings (user) ?kind&status&page&limit → own listings, all statuses. */
export const GET = handle(async (req) => {
  const user = await requireAuth(req, { roles: ["buyer", "seller"] });
  const sp = req.nextUrl.searchParams;
  const kind = sp.get("kind") as ListingKind;
  const status = sp.get("status") as ListingStatus;
  const r = await myListings(user, {
    kind: LISTING_KINDS.includes(kind) ? kind : undefined,
    status: LISTING_STATUSES.includes(status) ? status : undefined,
    ...parsePaging(sp),
  });
  return okList(r.items, r);
});
