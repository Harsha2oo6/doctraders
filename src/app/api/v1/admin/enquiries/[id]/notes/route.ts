import { noteSchema } from "@/lib/validation";
import { requireAuth } from "@/server/guard";
import { handle, ok, readJson } from "@/server/http";
import { adminAddNote } from "@/server/services/enquiries";

/** POST /api/v1/admin/enquiries/:id/notes (admin) { text } → 201 updated enquiry. */
export const POST = handle<{ id: string }>(async (req, { id }) => {
  const admin = await requireAuth(req, { roles: ["admin"] });
  const { text } = noteSchema.parse(await readJson(req));
  return ok(await adminAddNote(admin, id, text), 201);
});
