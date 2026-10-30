import "server-only";
import type { FilterQuery } from "mongoose";
import { NotificationModel, type NotificationDoc, type User } from "../models";
import { notificationOut } from "../serializers";

export async function listNotifications(user: User, opts: { unread?: boolean; page: number; limit: number }) {
  const filter: FilterQuery<NotificationDoc> = { userId: user._id };
  if (opts.unread) filter.read = false;
  const [rows, total, unreadCount] = await Promise.all([
    NotificationModel.find(filter).sort({ createdAt: -1 }).skip((opts.page - 1) * opts.limit).limit(opts.limit).lean(),
    NotificationModel.countDocuments(filter),
    NotificationModel.countDocuments({ userId: user._id, read: false }),
  ]);
  return { items: rows.map(notificationOut), page: opts.page, limit: opts.limit, total, unreadCount };
}

/** Marks the given ids (or all) as read. Only touches the caller's own notifications. */
export async function markRead(user: User, ids?: string[]) {
  const filter: FilterQuery<NotificationDoc> = { userId: user._id, read: false };
  if (ids?.length) filter._id = { $in: ids };
  const r = await NotificationModel.updateMany(filter, { $set: { read: true } });
  const unreadCount = await NotificationModel.countDocuments({ userId: user._id, read: false });
  return { updated: r.modifiedCount, unreadCount };
}
