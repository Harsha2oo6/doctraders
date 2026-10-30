import { contactSchema } from "@/lib/validation";
import { layout, sendEmail } from "@/server/email";
import { env } from "@/server/env";
import { handle, ok, readJson } from "@/server/http";
import { later } from "@/server/later";
import { UserModel } from "@/server/models";

/** POST /api/v1/contact (public) { name, email, message } → emails the Doctraders team. */
export const POST = handle(async (req) => {
  const { name, email, message } = contactSchema.parse(await readJson(req));
  const admins = await UserModel.find({ roles: { $in: ["admin", "superadmin"] }, status: "active" }, { email: 1 }).lean();
  const to = [...new Set([...admins.map((a) => a.email), ...env().ADMIN_NOTIFY_EMAILS])];
  const mail = layout({ title: `Contact form: ${name}`, rows: [["Name", name], ["Email", email]], paragraphs: [message] });
  later(() => sendEmail({ to, subject: `Contact form: ${name}`, ...mail }));
  return ok({ ok: true }, 201);
});
