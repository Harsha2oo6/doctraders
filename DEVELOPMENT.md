# Doctraders — Development Plan (2–3 days)

**Starting point:** the frontend is ~60–70% done (all public pages, UI kit, dashboard + admin shells, most list screens) but runs on **mock data** inside a monorepo. The backend doesn't exist yet.
**Goal:** write the backend as a **versioned REST API (`/api/v1`)**, connect every screen to it, add the few missing screens, test, deploy — in **3 days** (or 2 long days, see the timeline).
**Rule that shapes everything:** the website is just the **first client** of the API. The Android/iOS app will use the **same endpoints** later, so every feature is built **API first, then the screen calls the API** — exactly like the app will.

Files the agent must follow: `README.md` (architecture, models, API list), `DESIGN.md` (UI), this file (what to do now).

---

## 1. What's done vs what's left

Based on the codebase (`apps/web`, `apps/admin`, `packages/*`). Prompt 0 re-checks this against your latest code.

| Area | Already in the code | Left to do |
| --- | --- | --- |
| Repo structure | Turborepo monorepo, 2 Next apps, MSW mocks, XState | Merge into **one Next.js app**, admin under `/admin`, delete mocks/XState |
| UI kit & theme | Done (`packages/ui`, `theme.css`) | Move to `src/components/ui`, unchanged |
| Public pages (home, about, how it works, FAQ, buyers, sellers, categories, contact, legal) | Done | Fix copy ("verified" → honest wording), real data on home rows |
| Browse listings `/listings` | Done (mock data) | Real data from API, show photos |
| Listing detail `/listings/[id]` | **Missing** | New page + "I'm interested" dialog |
| Register | 4-step wizard with KYC documents + company types | Replace with **one form**: buyer / seller / both + required fields (README §1) |
| Login | Done (mock) | Real API, email **or** mobile, forgot/reset password pages |
| Dashboard shell | Done (mock session, pending/rejected screens) | Real session, role-based menu, remove approval screens |
| Post listing | Form exists (no photos, old trade fields) | Update fields, add **image uploader**, edit page, "my listings" page |
| My enquiries | List exists (mock) | Real data, party status labels |
| My deals | List exists (mock, old pipeline) | Real data, progress bars, **deal detail + seller shipment updates** |
| Profile | **Missing** | New page (edit details, add role, change password) |
| Admin shell | Done (mock session) | Real session, new menu |
| Admin overview | Done (mock, approvals-based) | Rewire to new stats |
| Admin enquiry inbox + detail | **Missing (core feature)** | New list + detail with statuses, notes, call/WhatsApp, convert to deal |
| Admin deals | Card list with old stage machine | List + **deal detail** with payments, shipments, commission |
| Admin users / listings / categories | Tables exist (mock, local state) | Wire to API, block/unblock, user detail |
| Admin registrations, reports | Exist | **Delete** (no approvals; stats go on overview) |
| Admins management (super admin) | **Missing** | New page |
| Notifications bell | **Missing** | New component + API |
| Backend (DB, models, auth, all APIs, email, uploads) | **Nothing** | Everything in README §3–7 |
| API docs for mobile | **Nothing** | `docs/API.md` |

---

## 2. Timeline

| Day | Prompts | Result at end of day |
| --- | --- | --- |
| **Day 1** | 0, 1, 2, 3 | One app, backend foundation, real login/register/profile working on the site and via Bearer token |
| **Day 2** | 4, 5 | Listings with photos, listing detail, "I'm interested", notifications + email, **admin enquiry inbox** |
| **Day 3** | 6, 7, 8 | Deals, payments, shipments; all admin screens; polish, full-flow test, `docs/API.md`, deploy |

**2-day sprint version:** Day 1 = Prompts 0–4, Day 2 = Prompts 5–8. Only do this if the agent is moving fast; Prompts 5 and 6 are the biggest.

**Progress** (the agent ticks these):
- [ ] Prompt 0 — Audit current code
- [ ] Prompt 1 — One app, mocks removed, UI unchanged
- [ ] Prompt 2 — Backend foundation + API conventions
- [ ] Prompt 3 — Auth API + login/register/profile wired
- [ ] Prompt 4 — Listings + uploads API + listing screens wired
- [ ] Prompt 5 — Interest, notifications, email + admin enquiry inbox
- [ ] Prompt 6 — Deals, payments, shipments (API + admin + buyer/seller screens)
- [ ] Prompt 7 — Admin users, listings, categories, admins, overview
- [ ] Prompt 8 — Polish, full-flow test, API docs, deploy

---

## 3. What the owner gives the developer

Details and where each value comes from: README §8. Give secrets directly, never in the repo or the agent chat.

| Before | Owner gives | Developer does |
| --- | --- | --- |
| Prompt 1 | GitHub repo access | Put `README.md`, `DESIGN.md`, `DEVELOPMENT.md` in the repo root |
| Prompt 2 | `MONGODB_URI` (dev DB), `SEED_SUPERADMIN_NAME/EMAIL/MOBILE/PASSWORD`, domain name | Generates `JWT_SECRET`, fills `.env.local` |
| Prompt 4 | `BLOB_READ_WRITE_TOKEN` | Adds to `.env.local` |
| Prompt 5 | `RESEND_API_KEY`, `EMAIL_FROM`, optional `ADMIN_NOTIFY_EMAILS` (domain verified in Resend) | Adds to `.env.local` (until then emails print in the terminal) |
| Prompt 8 | Production `MONGODB_URI`, Vercel access, DNS access | Sets production env vars (new `JWT_SECRET`) |

---

## 4. How to run the agent

- Start each day with a **fresh chat** + the **Session starter**. Paste prompts one at a time; wait for "done" and click through the result before the next.
- Every prompt is **API first, then screens**. If the agent starts with UI, stop it.
- Commit after every prompt. If a prompt goes badly: `git reset --hard` and paste it again.
- If it drifts: *"Stop. Re-read README.md §3 and §6 and DESIGN.md, then redo only Prompt N."*
- Never paste real secrets into the chat.

---

## Session starter (paste at the start of every new chat)

```
You are working on the Doctraders repo. Before doing anything:
1. Read README.md fully: roles, architecture rules (section 3, especially rule 16 about the mobile app), data models, status flows, the /api/v1 REST list (section 6) and notifications.
2. Read DESIGN.md fully: every screen must use its tokens, components and patterns. No new colours, fonts or UI libraries.
3. Read DEVELOPMENT.md: the "done vs left" table and the Progress checklist.
4. Look at the current code structure briefly.

Rules for this whole session:
- The website and a future Android/iOS app share the same /api/v1 endpoints. Build every feature API-first: service + route + Zod validation + docs/API.md entry, THEN connect the screen through src/lib/api-client.ts. No Server Actions for business logic, no page-only data paths for mutations.
- Reuse existing pages and components wherever they exist; replace their mock data with API calls instead of rewriting them.
- Follow README exactly. If something is ambiguous, pick the simplest option that fits README and mention it in your summary.
- After each prompt: run `npm run typecheck`, `npm run lint`, `npm run build`, fix all errors, tick the prompt in DEVELOPMENT.md, update docs/API.md for every endpoint you added or changed, and `git commit`.
- End each prompt with: what you built, files changed, anything I must do manually, and exact steps to test it in the browser and with curl (Bearer token).

Reply "Ready" with the list of done/remaining prompts, then wait.
```

---

## Prompt 0 — Audit (15 minutes, no code changes)

```
Prompt 0: Audit the current codebase against DEVELOPMENT.md section 1 ("done vs left") and README.md.
- For each row, check what actually exists now (pages, components, any API routes, any backend code).
- Update the table in DEVELOPMENT.md section 1 to match reality (mark rows done/partly done, add anything I built that isn't listed).
- List any existing code that conflicts with README (e.g. old fields, approval logic, KYC) that later prompts must remove.
Do not change any other file. Commit "docs: audit current state".
```

---

# DAY 1 — Foundation & auth

## Prompt 1 — One app, mocks removed, UI unchanged

```
Prompt 1: Convert the monorepo into ONE Next.js app at the repo root (README §4). The UI must look exactly the same afterwards.

1. Move apps/web to the root (src/, public/, configs). One package.json with the app's dependencies plus: mongoose@8, jose, bcryptjs, resend, @vercel/blob, server-only; dev: tsx. Scripts: dev, build, start, lint, typecheck (tsc --noEmit), seed (tsx --env-file=.env.local scripts/seed.ts).
2. packages/ui → src/components/ui (barrel index.ts), theme.css → src/app/theme.css UNCHANGED (DESIGN.md Appendix A), cn → src/lib/cn.ts. Delete stepper and file-upload (no KYC).
3. packages/schemas → src/lib/constants.ts and src/lib/format.ts (keep formatINR/formatINRCompact). Drop documents.ts and company types.
4. apps/admin pages → src/app/admin/** (layout, overview, users, listings, deals, categories). Delete admin registrations, reports, review panel and the separate admin login (everyone uses /login).
5. Delete apps/, packages/, turbo.json, .turbo/, MSW (mockServiceWorker.js, MockProvider), XState + all machines, demo auto-login, the header "Demo pages" menu, NEXT_PUBLIC_DEMO_MODE, NEXT_PUBLIC_ADMIN_URL. Keep the old mock records only as a temporary src/lib/sample-data.ts if a page needs something to render; later prompts delete it.
6. Replace all @doctraders/* imports with local paths.
7. Create src/lib/api-client.ts now: apiFetch<T>(path, { method, body, form }) → always calls `/api/v1${path}`, sends JSON or FormData, `credentials: "include"`, parses `{ data }` / `{ error: { message, fields } }`, throws ApiError(message, status, fields); plus useApi(fetcher, deps) → { data, loading, error, refetch }. Later prompts use only this to talk to the backend.
8. .env.example = template from README §8 (empty values). .gitignore: .env, .env*.local, .next, node_modules, .vercel.
9. Remove "Logistics" from the header nav and forms (keep the page file for now).

Done when: build passes, `npm run dev` shows the same marketing site at /, the dashboard shell at /dashboard and the admin shell at /admin, and grep finds no apps/, packages/, @doctraders/, msw or xstate.
```

## Prompt 2 — Backend foundation + API conventions

```
Prompt 2: Build the backend foundation (README §3, §4, §5, §7). Backend only, no screens.

1. src/server/env.ts — the only place reading process.env. Zod-validate lazily on first use (so `next build` works without secrets): required MONGODB_URI, JWT_SECRET (≥32 chars), APP_URL; optional RESEND_API_KEY, EMAIL_FROM, ADMIN_NOTIFY_EMAILS (comma list), BLOB_READ_WRITE_TOKEN. Clear error naming missing keys + pointing to README §8; one warning per missing optional key.
2. src/server/db.ts — cached mongoose connection on globalThis.
3. src/server/http.ts — ok(data, status), okList(items, { page, limit, total }), fail(status, message, fields?), HttpError, parsePaging(searchParams) (default 20, max 50), and handle(fn): connects DB, catches ZodError → 400 with fields map, HttpError → status, else 500 + console.error. Every route uses handle().
4. src/server/models/: User, Category, Listing, Enquiry, Deal, Notification, Counter — exactly README §5 (enums, defaults, indexes, toJSON: _id→id, drop __v, never passwordHash/resetToken*). User.publicCode = unique random 5 digits with retry. Deal.code = DT-<year>-<0001> via Counter.
5. src/server/auth.ts — bcryptjs hash/verify, jose HS256 signToken({ sub, roles }) 30 days, verifyToken, setAuthCookie/clearAuthCookie ("dt_token", httpOnly, secure in prod, sameSite lax), getAuth(req): Bearer header first, then cookie.
6. src/server/guard.ts — requireAuth(req, { roles? }) loads the user from DB, 401 no/invalid token, 403 blocked ("Your account is blocked. Please contact support."), 403 wrong role. "admin" accepts admin or superadmin. Helpers isAdmin, isSuperAdmin, hasRole.
7. src/middleware.ts — page guards only (README §3.5), never runs on /api, /_next or static files. Admin opening /dashboard → /admin, user opening /admin → /dashboard.
8. src/server/serializers.ts — all privacy rules (README §3.6–3.8): alias(), publicListing(), partyEnquiry(), partyDeal() (computed paid/shipped/reached quantities and percents, no commission, other side as alias), adminEnquiry(), adminDeal().
9. src/server/email.ts (Resend; logs to console when no key; never throws; simple branded HTML with a button) and src/server/notify.ts (notify(userIds, payload), notifyAdmins(payload, { email })).
10. src/lib/constants.ts — all enums with labels and party labels, units, business types, Indian states. src/lib/validation.ts — empty file ready for shared Zod schemas.
11. Endpoints: GET /api/v1/health, GET /api/v1/meta (README §6 System: all enum labels from constants.ts, active categories, upload limits, minAppVersion "1.0.0").
12. scripts/seed.ts — creates the super admin from SEED_SUPERADMIN_* if missing and upserts default categories (Rice & Grains, Pulses, Spices, Oilseeds & Edible Oil, Fruits & Vegetables, Sugar & Jaggery, Dry Fruits & Nuts, Tea & Coffee, Animal Feed, Fertilizers & Seeds, Other). Safe to re-run.
13. docs/API.md — create it with: base URL, auth (cookie for web, `Authorization: Bearer` for mobile), response/error format, pagination, enums via /meta, then sections for health and meta with real example responses. Every later prompt adds its endpoints here.

Done when: build passes (also with an empty .env.local), `npm run seed` works with my Day-1 keys, /api/v1/health and /api/v1/meta return correct JSON, and a missing MONGODB_URI gives a clear error. Never print secret values.
```

## Prompt 3 — Auth API + login/register/profile wired

```
Prompt 3: Authentication end to end. API first (README §1 fields, §6 Auth & profile), then wire the screens.

API (src/server/services/auth.ts + src/app/api/v1/auth/**):
- register: roles ["buyer"] | ["seller"] | ["buyer","seller"] + fields; Zod rules in src/lib/validation.ts shared with the form (seller → business type, ≥1 category, address, city, state, 6-digit pincode required; buyer-only → business name, city, state; mobile /^[6-9]\d{9}$/; GST optional, uppercased, regex-checked if present; email lowercased). 409 with fields.email / fields.mobile. Active immediately (no approval), sets cookie, returns { user, token }, welcome email fire-and-forget.
- login { identifier (email or mobile), password } → { user, token } + cookie; 401 generic message; 403 if blocked; updates lastLoginAt.
- logout, GET/PATCH me (edit profile/business, ADD a trade role with its required fields, admins can't add trade roles), change-password, forgot-password (always 200, hashed token 1 h, email link APP_URL/reset-password?token=…), reset-password.
- Add all of them to docs/API.md with request/response examples (include the Bearer usage).

Screens (reuse existing layouts/components, DESIGN.md 5.10 + 6.1):
- /register: replace the 4-step KYC wizard with ONE form: role choice cards (sell / buy / both), then "Your details" and "Your business" groups showing required (*) and optional fields for that choice, categories as checkboxes from /api/v1/meta, state select, consent checkboxes (terms, privacy, commission policy). Server field errors under fields. Success → /dashboard.
- /login: identifier + password, forgot-password link, honours ?next=, admins → /admin, users → /dashboard.
- /forgot-password, /reset-password.
- Session: a small MeProvider (GET /api/v1/auth/me) used by the dashboard shell, admin shell and header. Dashboard shell: remove pending/rejected screens; menu by role (DESIGN.md 5.11); name, business, role badges, logout. Admin shell: real admin name + logout. Header: logged in → Dashboard/Admin link + logout instead of Sign in/Join free.
- /dashboard/profile (new): edit details and business, "Also register as seller/buyer" (reveals missing required fields), change password.

Done when: I can register as seller, buyer and both; log in with email or mobile; land in the right place; edit my profile and add a role; reset a password (email in terminal if no Resend key); the super admin lands on /admin; a user opening /admin is redirected; and with curl, login returns a token that works as `Authorization: Bearer` on GET /api/v1/auth/me.
```

---

# DAY 2 — Listings & interest

## Prompt 4 — Listings + uploads API, listing screens wired

```
Prompt 4: Listings end to end. API first (README §5 Listing, §6 Public data + User), then connect the existing screens and add the missing ones.

API:
- GET /api/v1/categories (active).
- POST /api/v1/uploads: 503 if BLOB_READ_WRITE_TOKEN missing; auth required; multipart "file"; jpeg/png/webp ≤ 4 MB; Vercel Blob put to listings/<userId>/<random>.<ext> public → { url }. (One file per call — works the same for the mobile app.)
- POST /api/v1/listings (offer needs seller role + ≥1 image; requirement needs buyer role; Zod schema shared with the form), GET /api/v1/listings (public, active only, filters kind/category/state/city/q, paging, owner as alias), GET /api/v1/listings/:id, PATCH (owner; active/closed; never unblock), DELETE (owner; hard delete if 0 enquiries else close), GET /api/v1/me/listings.
- docs/API.md entries, including a multipart upload example.

Screens:
- Home page rows and /listings: replace sample data with the service functions in server components (same filters as the API) so they stay server-rendered for SEO. ListingCard shows the cover photo (DESIGN.md 5.9), alias, "View details" → detail page. next.config images.remotePatterns for *.public.blob.vercel-storage.com.
- /listings/[id] (new, DESIGN.md 6.11): gallery, facts, description, alias, "I'm interested" button (Prompt 5 makes it work; for now logged out → /login?next=…).
- Reuse the existing post form as components/listings/ListingForm: new fields (title, category, description, quantity + unit, price per unit or price on request, min order, city, state, photos), remove FOB/CIF/port/payment-terms/valid-until. ImageUploader (DESIGN.md 6.10): up to 6 photos, client-side resize to max 1600px JPEG before upload, progress, remove, reorder, first = cover.
- /dashboard/listings (my listings with tabs My products / My requirements, actions edit/close/reopen/delete, blocked badge), /dashboard/listings/new?kind=…, /dashboard/listings/[id]/edit. Replace the old /dashboard/post and /dashboard/marketplace with these (marketplace = public /listings).
- Dashboard overview: real counts (my active listings, my enquiries, my active deals) + role-based quick actions.

Done when: a seller posts a product with photos and it appears on / and /listings and its detail page; a buyer posts a requirement; edit/close/delete work; public JSON contains no contact details (paste one sample response in your summary); upload works with curl + Bearer.
```

## Prompt 5 — Interest, notifications, email + admin enquiry inbox

```
Prompt 5: The core flow: "I'm interested" → admin is notified → admin works the enquiry. API first, then screens.

API:
- POST /api/v1/enquiries { listingId, quantity, message? } with the interest rules in README §5 (opposite role, not own, active, one per user per listing → 409). Derive buyerId/sellerId, snapshot title, first history entry, increment listing.enquiryCount, notifyAdmins({ type: "enquiry_new", … link: "/admin/enquiries/<id>" }, { email: true }); the admin email includes listing, quantity, message and both parties' names + mobiles + a button.
- GET /api/v1/me/enquiries (party labels, no admin notes).
- GET /api/v1/notifications (?unread=1, paging, unreadCount), POST /api/v1/notifications/read { ids? }.
- GET /api/v1/admin/stats (counts for overview — used fully in Prompt 7).
- GET /api/v1/admin/enquiries (?status, ?q over title/names/business/mobile, paging, both parties' full contact), GET /api/v1/admin/enquiries/:id (listing, both full profiles, notes, history, dealId), PATCH /api/v1/admin/enquiries/:id { status } (not deal_closed; push history), POST /api/v1/admin/enquiries/:id/notes { text }.
- docs/API.md entries.

Screens:
- InterestDialog on /listings/[id] (DESIGN.md 6.8): logged out → login; missing role → message + link to profile; own listing → hidden; already sent → disabled "Interest sent"; quantity (required) + message; success text "Thanks! The Doctraders team will contact you shortly."
- /dashboard/enquiries: reuse the existing page with real data and party status badges.
- NotificationsBell (DESIGN.md 6.7) in dashboard shell, admin shell and header: polls every 30 s, latest 10, click → mark read + go to link, mark all read.
- Admin nav: Enquiries item with "new" count.
- /admin/enquiries (new): status tabs with counts (DESIGN.md 6.2), search, DataTable (date, listing, qty, buyer, seller, status).
- /admin/enquiries/[id] (new, DESIGN.md 6.5/6.6): listing summary; buyer and seller cards with Call (tel:), WhatsApp (https://wa.me/91<mobile>), Email; status select saving instantly with toast; notes timeline + add note; status history; "Convert to deal" button (form arrives in Prompt 6; placeholder now) or "View deal" if one exists.

Done when: buyer clicks interested on an offer → super admin's bell shows it within 30 s and an email is sent (or printed) → admin opens it, calls/WhatsApps both sides, moves status to Spoken, adds a note → buyer sees "In discussion" in /dashboard/enquiries. Same for a seller on a buyer requirement. Duplicate blocked. A normal user calling /api/v1/admin/* gets 403.
```

---

# DAY 3 — Deals, admin, launch

## Prompt 6 — Deals, payments, shipments

```
Prompt 6: Deals end to end (README Deal model, status flows, deal endpoints). API first, then admin screens, then buyer/seller screens.

API:
- POST /api/v1/admin/deals { enquiryId, quantity, unit, pricePerUnit, commissionPercent, adminNotes? }: no existing deal; compute totalValue + commissionAmount; status active, commission pending; enquiry → deal_closed + dealId + history; notify buyer and seller.
- GET /api/v1/admin/deals (?status, ?commissionStatus, ?q, paging), GET /:id, PATCH /:id (recalculate on qty/price/% change; completed → commission due + notify both; cancelled only from active; commission paid only when completed).
- POST /api/v1/admin/deals/:id/payments { amount, method?, note?, paidAt? } (total ≤ value) → notify seller; DELETE …/payments/:paymentId.
- GET /api/v1/me/deals, GET /api/v1/me/deals/:id (partyDeal serializer).
- POST /api/v1/deals/:id/shipments { quantity, note? } (starts packed) and PATCH /api/v1/deals/:id/shipments/:shipmentId { status, note? }: deal's seller or admin; deal active; total shipped qty ≤ deal qty; forward only packed → shipped → reached; history; notify admins (bell + email) and buyer.
- docs/API.md entries.

Admin screens:
- "Convert to deal" dialog on the enquiry detail: prefilled qty/unit from enquiry and price from listing, live total + commission preview → /admin/deals/<id>.
- /admin/deals: replace the old DealCard/stage-machine list with tabs Active/Completed/Cancelled + DataTable (code, title, buyer, seller, value, paid %, shipped %, commission status).
- /admin/deals/[id] (new): header with code/status/value/commission; progress bars Paid / Shipped / Reached (DESIGN.md 6.4); payments table + Record payment dialog (+ delete); shipment lots with stage pills (6.3) and admin can add/advance; Mark completed (confirm warns if < 100%), Cancel, Mark commission paid; edit numbers; admin notes; links to enquiry and users.

Buyer/seller screens:
- /dashboard/deals: reuse the existing page with real data, label "You are the buyer/seller", progress bars instead of the old pipeline.
- /dashboard/deals/[id] (new): summary, other side as alias, payment progress, shipment timeline. Seller + active deal: "Add shipment update" (qty with remaining shown, note) and one big next-step button per lot ("Mark as shipped" → "Mark as reached"). Buyer read-only.

Done when the full flow works: enquiry → convert to deal → admin records 50% → seller adds a lot of 50% → packed → shipped → reached → buyer sees it and gets notified → rest paid and shipped → completed → commission due → paid. Party responses have no commission fields (paste a sample).
```

## Prompt 7 — Admin users, listings, categories, admins, overview

```
Prompt 7: Finish the admin panel. Connect the existing tables, add the missing pages.

API (+ docs/API.md):
- GET /api/v1/admin/users (?role, ?status, ?q, paging; buyers/sellers only), GET /:id (profile + listings, enquiries, deals), PATCH /:id { status: active|blocked }.
- GET /api/v1/admin/listings (?status, ?kind, ?q, paging, owner), PATCH /:id { status: active|blocked }.
- GET/POST /api/v1/admin/categories, PATCH/DELETE /:id (auto slug; delete only if unused, else deactivate).
- Super admin only: GET/POST /api/v1/admin/admins, PATCH /:id { status, password, superadmin }, DELETE /:id. Can't change yourself; can't remove/demote the last super admin. New admin gets an email with the login link (never the password).
- Admin account: reuse PATCH /api/v1/auth/me and change-password.

Screens:
- /admin (overview): rewire to /api/v1/admin/stats — New enquiries, In discussion, Active deals, Commission due ₹, Commission paid ₹, Users (buyers/sellers), Active listings + "Latest enquiries" and "Commission due" cards. Remove all approval wording.
- /admin/users: existing table wired to API with filters + Block/Unblock; /admin/users/[id] (new) with tabs listings/enquiries/deals.
- /admin/listings: existing table wired (cover thumbnail, owner, enquiry count, Block/Unblock; remove the fake "Remove" button).
- /admin/categories: existing page wired (add, rename, active toggle, order, delete).
- /admin/admins (new, super admin only, DESIGN.md patterns): table + Add admin / Reset password / Block / Remove dialogs. Hide the menu item for normal admins; middleware + API both enforce it.
- /admin/account (new): own name, mobile, password.
- Delete src/lib/sample-data.ts and any leftover mock usage.

Done when: super admin adds an admin who can do everything except /admin/admins (page redirects, API 403); blocking a user stops them on their next request; blocked listings disappear from /listings; categories appear in register and listing forms; grep finds no sample/mock data.
```

## Prompt 8 — Polish, full-flow test, API docs, deploy

```
Prompt 8: Make it launch-ready. No new features.

1. Design + copy pass: check every page against DESIGN.md (tokens, StatusBadge map, pill rule, states); replace hard-coded hex / gray-* / slate-*. Remove all "verified / documents checked / approval / KYC / FOB / port / logistics registration" claims; update How it works, FAQ, Buyers, Sellers, About, home hero to the real flow (post → interest → Doctraders connects you → deal → payment & shipment tracking → commission after completion).
2. Every list: loading, empty (with action), error (with retry). Every form: disabled while saving, field errors, success toast. Mobile check at 375 px.
3. Security pass: every /api/v1 route has the right requireAuth roles (except README's public ones); serializers never leak the other party's contact or any commission field; passwordHash never leaves the server; in-memory per-IP rate limit on login, register, forgot-password and POST enquiries; escape user text in emails.
4. SEO: metadata, sitemap.ts (static pages + active listings), robots.ts (disallow /dashboard, /admin, /api).
5. scripts/smoke.ts (run with `npx tsx --env-file=.env.local scripts/smoke.ts` against localhost, Bearer tokens only — this proves the mobile app can use the API): register seller, buyer, both → offer + requirement → interest both ways → duplicate 409 → wrong-role 403 → admin login → status + note → convert to deal → 50% payment → seller lot packed/shipped/reached → buyer deal shows 50% paid/reached and NO commission or seller contact → finish payment + shipping → complete → commission due → paid → block buyer → buyer 403 → super admin creates admin → admin 403 on /admins. PASS/FAIL per step. Fix everything until all PASS and paste the output.
6. docs/API.md: complete and consistent for every endpoint (method, path, auth, body, success example, error examples), plus a short "For the mobile app" section (token storage, 401/403 handling, upload flow, /meta, pagination).
7. Deployment: extend README §10 into an exact checklist (Atlas prod user + network, Vercel import, Blob store, every production env var incl. new JWT_SECRET and APP_URL=https://<domain>, domain + www redirect, Resend DNS, run seed once against prod, post-deploy checks incl. /api/v1/health). List the dashboard steps I must do by hand, in order.

Done when: build/lint/typecheck clean, smoke script all PASS, docs/API.md complete, deployment checklist ready.
```

---

## After launch

- **Mobile app** (Flutter) on the same `/api/v1` — start from `docs/API.md` and README §11.
- Later: push notifications (`POST /api/v1/devices` + FCM in `notify.ts`), WhatsApp alerts to admin, buyer "received" confirmation, invoices, ratings.
