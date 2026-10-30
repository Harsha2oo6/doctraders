import { LISTING_KINDS, LISTING_STATUSES, type ListingKind, type ListingStatus } from "@/lib/constants";
import { requireAuth } from "@/server/guard";
import { handle, okList, parsePaging } from "@/server/http";
import { adminListListings } from "@/server/services/admin";

/** GET /api/v1/admin/listings (admin) ?status&kind&q&page&limit → with owner contact + counts per status. */
export const GET = handle(async (req) => {
  await requireAuth(req, { roles: ["admin"] });
  const sp = req.nextUrl.searchParams;
  const status = sp.get("status") as ListingStatus;
  const kind = sp.get("kind") as ListingKind;
  const r = await adminListListings({
    status: LISTING_STATUSES.includes(status) ? status : undefined,
    kind: LISTING_KINDS.includes(kind) ? kind : undefined,
    q: sp.get("q") || undefined,
    ...parsePaging(sp),
  });
  return okList(r.items, r, { counts: r.counts });
});
