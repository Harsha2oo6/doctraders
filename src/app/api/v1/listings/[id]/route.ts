import { listingUpdateSchema } from "@/lib/validation";
import { optionalAuth, requireAuth } from "@/server/guard";
import { handle, ok, readJson } from "@/server/http";
import { deleteListing, getListing, updateListing } from "@/server/services/listings";

type P = { id: string };

/** GET /api/v1/listings/:id (public) → one active listing; the owner also gets their own closed/blocked one. */
export const GET = handle<P>(async (req, { id }) => {
  const viewer = await optionalAuth(req);
  const { data } = await getListing(id, viewer);
  return ok(data);
});

/** PATCH /api/v1/listings/:id (owner) → edit fields, or status active/closed (never un-block). */
export const PATCH = handle<P>(async (req, { id }) => {
  const user = await requireAuth(req, { roles: ["buyer", "seller"] });
  const input = listingUpdateSchema.parse(await readJson(req));
  return ok(await updateListing(user, id, input));
});

/** DELETE /api/v1/listings/:id (owner) → hard delete if 0 enquiries, else closed. */
export const DELETE = handle<P>(async (req, { id }) => {
  const user = await requireAuth(req, { roles: ["buyer", "seller"] });
  return ok(await deleteListing(user, id));
});
