/**
 * Full-flow API test. Bearer tokens only, no cookies: this proves the mobile app can use the API.
 *
 *   npm run dev            (in another terminal; or npm run build && npm start)
 *   npm run smoke
 *
 * It creates real records, so it refuses to run unless MONGODB_URI points at a dev or test database.
 * Secrets stay in .env.local and are never printed. Uses the seeded super admin to log in, so it fails at
 * the admin step if that password has been changed.
 */

const BASE = "http://localhost:3000/api/v1";
const run = Date.now().toString().slice(-7);
const IMAGE = "https://smoke.public.blob.vercel-storage.com/listings/smoke.jpg";

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Res = { status: number; json: Json };

async function call(method: string, path: string, opts: { token?: string; body?: unknown; form?: FormData } = {}): Promise<Res> {
  const headers: Record<string, string> = {};
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(`${BASE}${path}`, { method, headers, body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined) });
  return { status: res.status, json: (await res.json().catch(() => ({}))) as Json };
}
const get = (path: string, token?: string) => call("GET", path, { token });
const post = (path: string, token: string | undefined, body: unknown) => call("POST", path, { token, body });
const patch = (path: string, token: string | undefined, body: unknown) => call("PATCH", path, { token, body });

function expectStatus(r: Res, status: number) {
  if (r.status !== status) throw new Error(`expected ${status}, got ${r.status}: ${JSON.stringify(r.json).slice(0, 200)}`);
}
function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}
function assertEq(actual: unknown, expected: unknown, what: string) {
  if (actual !== expected) throw new Error(`${what}: expected ${String(expected)}, got ${String(actual)}`);
}

/** Fails if a party-facing response has a forbidden key, or contains any of the other side's private values. */
function assertPrivate(value: unknown, secrets: string[], where: string) {
  const text = JSON.stringify(value);
  for (const key of ["commissionPercent", "commissionAmount", "commissionStatus", "adminNotes", "passwordHash", "resetTokenHash", "notes"]) {
    assert(!text.includes(`"${key}"`), `${where} leaks the field "${key}"`);
  }
  for (const s of secrets) assert(!text.toLowerCase().includes(s.toLowerCase()), `${where} leaks a private value of the other party`);
}

/** Notifications are written just after the response is sent, so give them a moment. */
async function waitForNotification(token: string, type: string) {
  for (let i = 0; i < 10; i++) {
    const r = await get("/notifications?limit=20", token);
    if (r.json.data?.some((n: Json) => n.type === type)) return;
    await new Promise((done) => setTimeout(done, 500));
  }
  throw new Error(`no ${type} notification arrived`);
}

let passed = 0;
const failures: string[] = [];
async function step(name: string, fn: () => Promise<void>) {
  const n = passed + failures.length + 1;
  try {
    await fn();
    passed += 1;
    console.log(`PASS  ${String(n).padStart(2)}. ${name}`);
  } catch (e) {
    failures.push(name);
    console.log(`FAIL  ${String(n).padStart(2)}. ${name}\n        ${(e as Error).message}`);
  }
}

function person(role: string, n: number, roles: string[]) {
  const mobile = `9${run}${String(n).padStart(2, "0")}`;
  return {
    roles,
    name: `Smoke ${role} ${run}`,
    email: `smoke.${role}.${run}@example.com`,
    mobile,
    password: "smoke-pass-123",
    business: {
      name: `Smoke ${role} Traders ${run}`, type: "trader", categories: ["pulses"], address: `${run} Smoke Road`,
      city: "Karnal", state: "Haryana", pincode: "132001", gstNumber: "06ABCDE1234F1Z5",
    },
  };
}
const privateOf = (p: ReturnType<typeof person>) => [p.name, p.email, p.mobile, p.business.name, p.business.address];

async function main() {
  const uri = process.env.MONGODB_URI ?? "";
  const dbName = uri.split("/")[3]?.split("?")[0] ?? "";
  if (!/dev|test/i.test(dbName)) {
    console.error("Refusing to run: MONGODB_URI in .env.local must point at a dev or test database, because this script creates records.");
    process.exit(2);
  }
  const adminEmail = process.env.SEED_SUPERADMIN_EMAIL ?? "";
  const adminPassword = process.env.SEED_SUPERADMIN_PASSWORD ?? "";

  const seller = person("seller", 1, ["seller"]);
  const buyer = person("buyer", 2, ["buyer"]);
  const both = person("both", 3, ["buyer", "seller"]);
  let sellerToken = "", buyerToken = "", bothToken = "", adminToken = "", newAdminToken = "";
  let offerId = "", requirementId = "", bothOfferId = "", enquiryId = "", sellerEnquiryId = "", dealId = "", lot1 = "", lot2 = "", newAdminId = "";

  await step("Health: server and database are up", async () => {
    const r = await get("/health");
    expectStatus(r, 200);
    assertEq(r.json.data.db, true, "db");
  });
  await step("Meta: enums, categories and upload limits", async () => {
    const r = await get("/meta");
    expectStatus(r, 200);
    assert(r.json.data.categories.some((c: Json) => c.slug === "pulses"), "seeded categories missing");
    assert(r.json.data.minAppVersion, "minAppVersion missing");
  });

  await step("Register seller", async () => {
    const r = await post("/auth/register", undefined, seller);
    expectStatus(r, 201);
    sellerToken = r.json.data.token;
    assertEq(r.json.data.user.status, "active", "status");
  });
  await step("Register buyer", async () => {
    const r = await post("/auth/register", undefined, buyer);
    expectStatus(r, 201);
    buyerToken = r.json.data.token;
  });
  await step("Register both", async () => {
    const r = await post("/auth/register", undefined, both);
    expectStatus(r, 201);
    bothToken = r.json.data.token;
    assertEq(r.json.data.user.roles.length, 2, "roles");
  });
  await step("Duplicate email and mobile are rejected (409)", async () => {
    expectStatus(await post("/auth/register", undefined, seller), 409);
  });
  await step("Login with mobile returns a token that works", async () => {
    const r = await post("/auth/login", undefined, { identifier: seller.mobile, password: seller.password });
    expectStatus(r, 200);
    expectStatus(await get("/auth/me", r.json.data.token), 200);
  });

  await step("Upload works, or says clearly that storage is not set up (503)", async () => {
    const form = new FormData();
    const jpeg = Uint8Array.from(Buffer.from("/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAAAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==", "base64"));
    form.append("file", new Blob([jpeg], { type: "image/jpeg" }), "smoke.jpg");
    const r = await call("POST", "/uploads", { token: sellerToken, form });
    assert(r.status === 201 || r.status === 503, `got ${r.status}`);
    expectStatus(await call("POST", "/uploads", { form }), 401);
  });
  await step("Seller posts an offer", async () => {
    const r = await post("/listings", sellerToken, {
      kind: "offer", title: `Smoke toor dal ${run}`, category: "pulses", description: "Smoke test offer, unpolished toor dal.",
      quantity: 500, unit: "bag", price: 1000, minOrderQuantity: 10, city: "Karnal", state: "Haryana", images: [IMAGE],
    });
    expectStatus(r, 201);
    offerId = r.json.data.id;
    assertPrivate(r.json, privateOf(seller), "new listing");
  });
  await step("Buyer posts a requirement", async () => {
    const r = await post("/listings", buyerToken, {
      kind: "requirement", title: `Smoke need chana ${run}`, category: "pulses", description: "Smoke test requirement for chana.",
      quantity: 20, unit: "tonne", city: "Mumbai", state: "Maharashtra",
    });
    expectStatus(r, 201);
    requirementId = r.json.data.id;
  });
  await step("Both posts an offer", async () => {
    const r = await post("/listings", bothToken, {
      kind: "offer", title: `Smoke moong ${run}`, category: "pulses", description: "Smoke test offer from a both-role account.",
      quantity: 5, unit: "tonne", city: "Unjha", state: "Gujarat", images: [IMAGE],
    });
    expectStatus(r, 201);
    bothOfferId = r.json.data.id;
  });
  await step("Public listing search shows the offer with an alias only", async () => {
    const r = await get(`/listings?q=${encodeURIComponent(`toor dal ${run}`)}`);
    expectStatus(r, 200);
    assertEq(r.json.total, 1, "total");
    assert(/^Seller #\d+$/.test(r.json.data[0].owner.alias), "alias");
    assertPrivate(r.json, privateOf(seller), "public listings");
  });

  await step("Interest: buyer on the offer", async () => {
    const r = await post("/enquiries", buyerToken, { listingId: offerId, quantity: 100, message: "Smoke interest" });
    expectStatus(r, 201);
    enquiryId = r.json.data.id;
    assertEq(r.json.data.status, "received", "party status");
    assertPrivate(r.json, privateOf(seller), "buyer enquiry");
  });
  await step("Interest: seller on the requirement", async () => {
    const r = await post("/enquiries", sellerToken, { listingId: requirementId, quantity: 20 });
    expectStatus(r, 201);
    sellerEnquiryId = r.json.data.id;
    assertPrivate(r.json, privateOf(buyer), "seller enquiry");
  });
  await step("Duplicate interest is rejected (409)", async () => {
    expectStatus(await post("/enquiries", buyerToken, { listingId: offerId, quantity: 5 }), 409);
  });
  await step("Interest with the wrong role is rejected (403)", async () => {
    expectStatus(await post("/enquiries", sellerToken, { listingId: bothOfferId, quantity: 1 }), 403);
  });
  await step("Interest in your own listing is rejected (403)", async () => {
    expectStatus(await post("/enquiries", sellerToken, { listingId: offerId, quantity: 1 }), 403);
  });

  await step("Non-admins cannot reach the admin API (401 and 403)", async () => {
    expectStatus(await get("/admin/enquiries"), 401);
    expectStatus(await get("/admin/enquiries", buyerToken), 403);
    expectStatus(await get("/admin/stats", sellerToken), 403);
  });
  await step("Admin logs in", async () => {
    const r = await post("/auth/login", undefined, { identifier: adminEmail, password: adminPassword });
    expectStatus(r, 200);
    adminToken = r.json.data.token;
    assert(r.json.data.user.roles.includes("superadmin"), "not a super admin");
  });
  await step("Admin was notified, and sees both parties' contact details", async () => {
    await waitForNotification(adminToken, "enquiry_new");
    const r = await get(`/admin/enquiries/${enquiryId}`, adminToken);
    expectStatus(r, 200);
    assertEq(r.json.data.buyer.mobile, buyer.mobile, "buyer mobile");
    assertEq(r.json.data.seller.mobile, seller.mobile, "seller mobile");
  });
  await step("Admin updates the status and adds a note", async () => {
    expectStatus(await patch(`/admin/enquiries/${enquiryId}`, adminToken, { status: "spoken" }), 200);
    const r = await post(`/admin/enquiries/${enquiryId}/notes`, adminToken, { text: "Smoke note" });
    expectStatus(r, 201);
    assertEq(r.json.data.notes[0].text, "Smoke note", "note");
  });
  await step("Buyer sees the party status, with no admin note", async () => {
    const r = await get("/me/enquiries", buyerToken);
    expectStatus(r, 200);
    assertEq(r.json.data[0].status, "in_discussion", "party status");
    assertPrivate(r.json, privateOf(seller), "me/enquiries");
    assert(!JSON.stringify(r.json).includes("Smoke note"), "note text leaked");
  });

  await step("Admin converts the enquiry to a deal", async () => {
    const r = await post("/admin/deals", adminToken, { enquiryId, quantity: 100, unit: "bag", pricePerUnit: 1000, commissionPercent: 2 });
    expectStatus(r, 201);
    dealId = r.json.data.id;
    assertEq(r.json.data.totalValue, 100000, "totalValue");
    assertEq(r.json.data.commissionAmount, 2000, "commissionAmount");
    assertEq(r.json.data.commissionStatus, "pending", "commissionStatus");
    assert(/^DT-\d{4}-\d{4}$/.test(r.json.data.code), "code");
    const e = await get(`/admin/enquiries/${enquiryId}`, adminToken);
    assertEq(e.json.data.status, "deal_closed", "enquiry status");
  });
  await step("A second deal on the same enquiry is rejected (409)", async () => {
    expectStatus(await post("/admin/deals", adminToken, { enquiryId, quantity: 1, unit: "bag", pricePerUnit: 1, commissionPercent: 1 }), 409);
  });
  await step("Admin records a 50% payment", async () => {
    const r = await post(`/admin/deals/${dealId}/payments`, adminToken, { amount: 50000, method: "bank", note: "Smoke advance" });
    expectStatus(r, 201);
    assertEq(r.json.data.paidPercent, 50, "paidPercent");
  });
  await step("Overpaying is rejected (400)", async () => {
    expectStatus(await post(`/admin/deals/${dealId}/payments`, adminToken, { amount: 60000 }), 400);
  });
  await step("Buyer cannot post shipments; an outsider cannot see the deal", async () => {
    expectStatus(await post(`/deals/${dealId}/shipments`, buyerToken, { quantity: 1 }), 403);
    expectStatus(await get(`/me/deals/${dealId}`, bothToken), 404);
  });
  await step("Seller adds a lot of 50 (packed)", async () => {
    const r = await post(`/deals/${dealId}/shipments`, sellerToken, { quantity: 50, note: "Smoke lot" });
    expectStatus(r, 201);
    lot1 = r.json.data.shipments[0].id;
    assertEq(r.json.data.shipments[0].status, "packed", "status");
    assertPrivate(r.json, privateOf(buyer), "seller deal");
  });
  await step("A lot larger than what remains is rejected (400)", async () => {
    expectStatus(await post(`/deals/${dealId}/shipments`, sellerToken, { quantity: 51 }), 400);
  });
  await step("Seller marks the lot shipped, then reached", async () => {
    expectStatus(await patch(`/deals/${dealId}/shipments/${lot1}`, sellerToken, { status: "shipped" }), 200);
    const r = await patch(`/deals/${dealId}/shipments/${lot1}`, sellerToken, { status: "reached" });
    expectStatus(r, 200);
    assertEq(r.json.data.reachedPercent, 50, "reachedPercent");
  });
  await step("Shipments cannot move backwards (409)", async () => {
    expectStatus(await patch(`/deals/${dealId}/shipments/${lot1}`, sellerToken, { status: "shipped" }), 409);
  });
  await step("Buyer sees 50% paid and 50% reached, with NO commission or seller contact", async () => {
    const r = await get(`/me/deals/${dealId}`, buyerToken);
    expectStatus(r, 200);
    assertEq(r.json.data.paidPercent, 50, "paidPercent");
    assertEq(r.json.data.reachedPercent, 50, "reachedPercent");
    assert(/^Seller #\d+$/.test(r.json.data.counterparty.alias), "alias");
    assertPrivate(r.json, privateOf(seller), "buyer deal");
    assert(!JSON.stringify(r.json).includes("Smoke advance"), "admin payment note leaked");
  });
  await step("Seller's deal view has NO commission or buyer contact", async () => {
    const r = await get("/me/deals", sellerToken);
    expectStatus(r, 200);
    assertPrivate(r.json, privateOf(buyer), "seller me/deals");
  });
  await step("Buyer was notified of the shipment", () => waitForNotification(buyerToken, "shipment_update"));
  await step("Seller was notified of the payment", () => waitForNotification(sellerToken, "payment_added"));
  await step("Commission cannot be marked paid before completion (409)", async () => {
    expectStatus(await patch(`/admin/deals/${dealId}`, adminToken, { commissionStatus: "paid" }), 409);
  });
  await step("Rest of the payment and shipping is finished", async () => {
    const p = await post(`/admin/deals/${dealId}/payments`, adminToken, { amount: 50000, method: "upi" });
    assertEq(p.json.data.paidPercent, 100, "paidPercent");
    const l = await post(`/deals/${dealId}/shipments`, sellerToken, { quantity: 50 });
    lot2 = l.json.data.shipments[1].id;
    const r = await patch(`/deals/${dealId}/shipments/${lot2}`, sellerToken, { status: "reached" });
    assertEq(r.json.data.reachedPercent, 100, "reachedPercent");
  });
  await step("Admin completes the deal: commission becomes due", async () => {
    const r = await patch(`/admin/deals/${dealId}`, adminToken, { status: "completed" });
    expectStatus(r, 200);
    assertEq(r.json.data.status, "completed", "status");
    assertEq(r.json.data.commissionStatus, "due", "commissionStatus");
    await waitForNotification(buyerToken, "deal_completed");
  });
  await step("Admin marks the commission paid", async () => {
    const r = await patch(`/admin/deals/${dealId}`, adminToken, { commissionStatus: "paid" });
    expectStatus(r, 200);
    assertEq(r.json.data.commissionStatus, "paid", "commissionStatus");
  });
  await step("Shipments are refused once the deal is completed (409)", async () => {
    expectStatus(await post(`/deals/${dealId}/shipments`, sellerToken, { quantity: 1 }), 409);
  });

  await step("Admin blocks the buyer: their next request gets 403", async () => {
    const me = await get("/auth/me", buyerToken);
    expectStatus(await patch(`/admin/users/${me.json.data.id}`, adminToken, { status: "blocked" }), 200);
    expectStatus(await get("/auth/me", buyerToken), 403);
    expectStatus(await post("/auth/login", undefined, { identifier: buyer.email, password: buyer.password }), 403);
  });
  await step("The blocked buyer's listing disappears from the public site", async () => {
    expectStatus(await get(`/listings/${requirementId}`), 404);
  });
  await step("Admin blocks a listing: it disappears, and the owner cannot reopen it", async () => {
    expectStatus(await patch(`/admin/listings/${bothOfferId}`, adminToken, { status: "blocked" }), 200);
    expectStatus(await get(`/listings/${bothOfferId}`), 404);
    expectStatus(await patch(`/listings/${bothOfferId}`, bothToken, { status: "active" }), 403);
  });
  await step("Super admin creates an admin", async () => {
    const r = await post("/admin/admins", adminToken, { name: `Smoke Admin ${run}`, email: `smoke.admin.${run}@example.com`, mobile: `8${run}04`, password: "smoke-admin-123" });
    expectStatus(r, 201);
    newAdminId = r.json.data.id;
    const login = await post("/auth/login", undefined, { identifier: `smoke.admin.${run}@example.com`, password: "smoke-admin-123" });
    expectStatus(login, 200);
    newAdminToken = login.json.data.token;
  });
  await step("The new admin works the panel but gets 403 on /admin/admins", async () => {
    expectStatus(await get("/admin/enquiries", newAdminToken), 200);
    expectStatus(await get("/admin/admins", newAdminToken), 403);
    expectStatus(await post("/admin/admins", newAdminToken, {}), 403);
  });
  await step("Clean up: remove the new admin and close the test listings", async () => {
    expectStatus(await call("DELETE", `/admin/admins/${newAdminId}`, { token: adminToken }), 200);
    expectStatus(await call("DELETE", `/listings/${offerId}`, { token: sellerToken }), 200);
    expectStatus(await patch(`/admin/enquiries/${sellerEnquiryId}`, adminToken, { status: "dropped" }), 200);
  });

  const total = passed + failures.length;
  console.log(`\n${passed}/${total} passed`);
  if (failures.length) {
    console.log(`Failed: ${failures.join(" | ")}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(`Smoke test could not run: ${(e as Error).message}. Is the server running on localhost:3000?`);
  process.exit(1);
});
