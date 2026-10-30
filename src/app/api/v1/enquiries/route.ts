import { enquirySchema } from "@/lib/validation";
import { requireAuth } from "@/server/guard";
import { handle, ok, readJson } from "@/server/http";
import { rateLimit } from "@/server/rate-limit";
import { createEnquiry } from "@/server/services/enquiries";

/** POST /api/v1/enquiries (buyer on offers / seller on requirements) { listingId, quantity, message? } → 201. */
export const POST = handle(async (req) => {
  rateLimit(req, "enquiry");
  const user = await requireAuth(req, { roles: ["buyer", "seller"] });
  const input = enquirySchema.parse(await readJson(req));
  return ok(await createEnquiry(user, input), 201);
});
