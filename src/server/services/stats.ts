import "server-only";
import { ENQUIRY_STATUSES, type EnquiryStatus } from "@/lib/constants";
import { DealModel, EnquiryModel, ListingModel, UserModel } from "../models";

/** Numbers for the admin overview (GET /admin/stats). */
export async function adminStats() {
  const [enquiryGroups, dealGroups, commission, users, listings] = await Promise.all([
    EnquiryModel.aggregate<{ _id: EnquiryStatus; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    DealModel.aggregate<{ _id: string; n: number; value: number }>([{ $group: { _id: "$status", n: { $sum: 1 }, value: { $sum: "$totalValue" } } }]),
    DealModel.aggregate<{ _id: string; n: number; amount: number }>([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: "$commissionStatus", n: { $sum: 1 }, amount: { $sum: "$commissionAmount" } } },
    ]),
    UserModel.aggregate<{ _id: null; total: number; buyers: number; sellers: number; blocked: number }>([
      { $match: { roles: { $in: ["buyer", "seller"] } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          buyers: { $sum: { $cond: [{ $in: ["buyer", "$roles"] }, 1, 0] } },
          sellers: { $sum: { $cond: [{ $in: ["seller", "$roles"] }, 1, 0] } },
          blocked: { $sum: { $cond: [{ $eq: ["$status", "blocked"] }, 1, 0] } },
        },
      },
    ]),
    ListingModel.aggregate<{ _id: { status: string; kind: string }; n: number }>([{ $group: { _id: { status: "$status", kind: "$kind" }, n: { $sum: 1 } } }]),
  ]);

  const byStatus = Object.fromEntries(ENQUIRY_STATUSES.map((s) => [s, enquiryGroups.find((g) => g._id === s)?.n ?? 0])) as Record<EnquiryStatus, number>;
  const deal = (s: string) => dealGroups.find((g) => g._id === s);
  const comm = (s: string) => commission.find((g) => g._id === s);
  const u = users[0] ?? { total: 0, buyers: 0, sellers: 0, blocked: 0 };
  const lc = (status?: string, kind?: string) =>
    listings.filter((l) => (!status || l._id.status === status) && (!kind || l._id.kind === kind)).reduce((a, l) => a + l.n, 0);

  return {
    enquiries: {
      new: byStatus.new,
      inDiscussion: byStatus.contacted + byStatus.spoken + byStatus.negotiating,
      byStatus,
      total: Object.values(byStatus).reduce((a, b) => a + b, 0),
    },
    deals: {
      active: deal("active")?.n ?? 0,
      completed: deal("completed")?.n ?? 0,
      cancelled: deal("cancelled")?.n ?? 0,
      activeValue: deal("active")?.value ?? 0,
    },
    commission: {
      pendingAmount: comm("pending")?.amount ?? 0,
      dueAmount: comm("due")?.amount ?? 0,
      dueCount: comm("due")?.n ?? 0,
      paidAmount: comm("paid")?.amount ?? 0,
      paidCount: comm("paid")?.n ?? 0,
    },
    users: { total: u.total, buyers: u.buyers, sellers: u.sellers, blocked: u.blocked },
    listings: {
      active: lc("active"),
      activeOffers: lc("active", "offer"),
      activeRequirements: lc("active", "requirement"),
      closed: lc("closed"),
      blocked: lc("blocked"),
      total: lc(),
    },
  };
}
