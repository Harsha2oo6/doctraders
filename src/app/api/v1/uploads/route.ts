import { uploadImage } from "@/server/blob";
import { requireAuth } from "@/server/guard";
import { HttpError, handle, ok } from "@/server/http";

/** POST /api/v1/uploads (user/admin) multipart/form-data field "file" → 201 { data: { url } }. One file per call. */
export const POST = handle(async (req) => {
  const user = await requireAuth(req);
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw new HttpError(400, "Send the image as multipart/form-data with the field name \"file\".", { file: "Missing file" });
  }
  const file = form.get("file");
  if (!(file instanceof File)) throw new HttpError(400, "Send the image in the \"file\" field.", { file: "Missing file" });
  const url = await uploadImage(file, String(user._id));
  return ok({ url }, 201);
});
