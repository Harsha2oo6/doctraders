import type { MetadataRoute } from "next";
import { connectDB } from "@/server/db";
import { env } from "@/server/env";
import { ListingModel } from "@/server/models";
import { blockedUserIds } from "@/server/services/listings";

// Needs the database and APP_URL, so it is built per request instead of at deploy time.
export const dynamic = "force-dynamic";

const STATIC_PATHS = [
  "", "/listings", "/categories", "/buyers", "/sellers", "/how-it-works", "/about", "/faq", "/contact",
  "/terms", "/privacy", "/commission-policy", "/disclaimer", "/register", "/login",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env().APP_URL;
  await connectDB();
  const listings = await ListingModel.find({ status: "active", ownerId: { $nin: await blockedUserIds() } }, { updatedAt: 1 })
    .sort({ createdAt: -1 })
    .limit(5000)
    .lean();
  return [
    ...STATIC_PATHS.map((p) => ({ url: `${base}${p}` })),
    ...listings.map((l) => ({ url: `${base}/listings/${l._id}`, lastModified: l.updatedAt })),
  ];
}
