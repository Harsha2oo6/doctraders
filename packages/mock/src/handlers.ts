import { delay, http, HttpResponse } from "msw";
import { deals, enquiries, listings, report, users } from "./data";

/**
 * Every endpoint the frontend calls. When the real backend is ready, build the same
 * routes and shapes there and simply stop starting this worker.
 */
const wait = () => delay(400);

export const handlers = [
  http.post("/api/login", async ({ request }) => {
    await wait();
    const { email, role } = (await request.json()) as { email: string; role: "user" | "admin" };
    if (role === "admin") {
      return HttpResponse.json({
        id: "admin1", name: "Doctraders Admin", companyName: "Doctraders", email,
        role: "admin", status: "approved",
      });
    }
    // Demo logins: pending@ -> pending, rejected@ -> rejected, anything else -> approved.
    const status = email.startsWith("pending") ? "pending" : email.startsWith("rejected") ? "rejected" : "approved";
    return HttpResponse.json({
      id: "u2", name: "Omar Al Farsi", companyName: "Gulf Foods Trading LLC", email, role: "user", status,
      rejectionReason: status === "rejected" ? "Bank proof was unreadable. Please upload a clear copy." : undefined,
    });
  }),

  http.post("/api/register", async () => {
    await wait();
    return HttpResponse.json({ referenceId: `DT-${Math.floor(10000 + Math.random() * 90000)}` });
  }),

  http.post("/api/contact", async () => {
    await wait();
    return HttpResponse.json({ ok: true });
  }),

  http.get("/api/listings", async () => {
    await wait();
    return HttpResponse.json(listings);
  }),
  http.post("/api/listings", async () => {
    await wait();
    return HttpResponse.json({ id: `l${Date.now()}` });
  }),

  http.get("/api/enquiries", async () => {
    await wait();
    return HttpResponse.json(enquiries);
  }),
  http.post("/api/enquiries", async () => {
    await wait();
    return HttpResponse.json({ ok: true });
  }),

  http.get("/api/deals", async () => {
    await wait();
    return HttpResponse.json(deals);
  }),

  http.get("/api/users", async () => {
    await wait();
    return HttpResponse.json(users);
  }),
  http.get("/api/users/:id", async ({ params }) => {
    await wait();
    const user = users.find((u) => u.id === params.id);
    return user ? HttpResponse.json(user) : new HttpResponse(null, { status: 404 });
  }),
  http.post("/api/users/:id/review", async () => {
    await wait();
    return HttpResponse.json({ ok: true });
  }),

  http.get("/api/reports", async () => {
    await wait();
    return HttpResponse.json(report);
  }),
];
