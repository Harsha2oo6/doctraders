import "server-only";
import type { Types } from "mongoose";
import type { NotificationType } from "@/lib/constants";
import { env } from "./env";
import { sendEmail } from "./email";
import { NotificationModel, UserModel } from "./models";

export type NotifyPayload = { type: NotificationType; title: string; body?: string; link?: string };
type IdLike = Types.ObjectId | string;

/** In-app bell notifications for the given users. Never throws. */
export async function notify(userIds: IdLike[], payload: NotifyPayload): Promise<void> {
  const ids = [...new Set(userIds.map(String))];
  if (!ids.length) return;
  try {
    await NotificationModel.insertMany(ids.map((userId) => ({ userId, ...payload })));
  } catch (e) {
    console.error("[notify] failed:", (e as Error).message);
  }
}

/**
 * Bell for every active admin; with `email`, also emails them (+ ADMIN_NOTIFY_EMAILS).
 * Never throws.
 */
export async function notifyAdmins(
  payload: NotifyPayload,
  opts: { email?: { subject: string; html: string; text: string } } = {},
): Promise<void> {
  try {
    const admins = await UserModel.find({ roles: { $in: ["admin", "superadmin"] }, status: "active" }, { _id: 1, email: 1 }).lean();
    await notify(admins.map((a) => a._id), payload);
    if (opts.email) {
      const to = [...new Set([...admins.map((a) => a.email.toLowerCase()), ...env().ADMIN_NOTIFY_EMAILS])];
      await sendEmail({ to, ...opts.email });
    }
  } catch (e) {
    console.error("[notifyAdmins] failed:", (e as Error).message);
  }
}
