/**
 * npm run seed — creates the first super admin (from SEED_SUPERADMIN_*) if missing and
 * upserts the default categories. Safe to run any number of times.
 */
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { hashPassword } from "@/server/auth";
import { connectDB, disconnectDB } from "@/server/db";
import { env, seedEnv } from "@/server/env";
import { CategoryModel, CounterModel, DealModel, EnquiryModel, ListingModel, NotificationModel, UserModel } from "@/server/models";

async function main() {
  env(); // fail fast with a clear message if MONGODB_URI / JWT_SECRET / APP_URL are missing
  const seed = seedEnv();
  await connectDB();

  for (const m of [UserModel, CategoryModel, ListingModel, EnquiryModel, DealModel, NotificationModel, CounterModel]) {
    await m.init(); // builds indexes
  }

  const existing = await UserModel.findOne({ $or: [{ email: seed.SEED_SUPERADMIN_EMAIL }, { mobile: seed.SEED_SUPERADMIN_MOBILE }] });
  if (existing) {
    console.log(`Super admin: already exists (${existing.roles.join(", ")}), left unchanged.`);
  } else {
    await UserModel.create({
      name: seed.SEED_SUPERADMIN_NAME,
      email: seed.SEED_SUPERADMIN_EMAIL,
      mobile: seed.SEED_SUPERADMIN_MOBILE,
      passwordHash: await hashPassword(seed.SEED_SUPERADMIN_PASSWORD),
      roles: ["admin", "superadmin"],
      status: "active",
    });
    console.log("Super admin: created.");
  }

  let added = 0;
  for (const [order, c] of DEFAULT_CATEGORIES.entries()) {
    const r = await CategoryModel.updateOne(
      { slug: c.slug },
      { $setOnInsert: { name: c.name, slug: c.slug, active: true, order } },
      { upsert: true },
    );
    added += r.upsertedCount;
  }
  console.log(`Categories: ${added} added, ${DEFAULT_CATEGORIES.length - added} already present.`);
}

main()
  .then(() => disconnectDB())
  .catch(async (e) => {
    console.error(`Seed failed: ${(e as Error).message}`);
    await disconnectDB();
    process.exit(1);
  });
