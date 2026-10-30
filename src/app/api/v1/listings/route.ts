import { LISTING_KINDS, type ListingKind } from "@/lib/constants";
import { listingSchema } from "@/lib/validation";
import { requireAuth } from "@/server/guard";
import { handle, ok, okList, parsePaging, readJson } from "@/server/http";
import { createListing, searchPublicListings } from "@/server/services/listings";

/** GET /api/v1/listings (public) ?kind&category&q&state&city&page&limit → active listings, owner as alias. */
export const GET = handle(async (req) => {
  const sp = req.nextUrl.searchParams;
  const kind = sp.get("kind");
  const { page, limit } = parsePaging(sp);
  const r = await searchPublicListings({
    kind: LISTING_KINDS.includes(kind as ListingKind) ? (kind as ListingKind) : undefined,
    category: sp.get("category") || undefined,
    q: sp.get("q") || undefined,
    state: sp.get("state") || undefined,
    city: sp.get("city") || undefined,
    page,
    limit,
  });
  return okList(r.items, r);
});

/** POST /api/v1/listings (seller for offers, buyer for requirements) → 201, live immediately. */
export const POST = handle(async (req) => {
  const user = await requireAuth(req, { roles: ["buyer", "seller"] });
  const input = listingSchema.parse(await readJson(req));
  return ok(await createListing(user, input), 201);
});
