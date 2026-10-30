# Doctraders — Development Plan & Agent Prompts

**Goal:** a working website in **3 build days + 1 test/deploy day**.
**How to use this file:** paste the prompts below into the VS Code Claude agent **one at a time, in order**. Wait until a prompt is finished (build passes, you've clicked through it) before pasting the next one. `README.md` is the source of truth for architecture, models and APIs. These prompts say *what to build now*.

---

## Progress

The agent ticks these boxes when a prompt is done.

**Day 1 — Foundation & auth**
- [ ] Prompt 1 — Convert monorepo to a single Next.js app
- [ ] Prompt 2 — Backend foundation (DB, models, auth helpers, guards, seed)
- [ ] Prompt 3 — Register, login, profile, password reset (API + UI)

**Day 2 — Listings & interest**
- [ ] Prompt 4 — Categories, image upload, listings API
- [ ] Prompt 5 — Listings UI (public browse, detail, my listings, post/edit)
- [ ] Prompt 6 — "I'm interested" + notifications + email

**Day 3 — Admin & deals**
- [ ] Prompt 7 — Admin shell, overview, enquiry inbox
- [ ] Prompt 8 — Deals, payments, shipment updates (admin + buyer/seller)
- [ ] Prompt 9 — Admin users, listings, categories, admins (super admin)
- [ ] Prompt 10 — Cleanup, copy, polish

**Day 4 — Test & launch**
- [ ] Prompt 11 — Full-flow test pass and fixes
- [ ] Prompt 12 — Deploy to Vercel

---

## Before Day 1 — what the owner gives the developer

Full details and where each value comes from: **README.md section 8**. Give secrets to the developer directly (not in the repo, not in agent chats).

| When | Owner gives | Developer does |
| --- | --- | --- |
| Before Prompt 1 | GitHub repo access | Clone, add `README.md` + `DEVELOPMENT.md` to the root |
| Before Prompt 2 | `MONGODB_URI` (dev database), `SEED_SUPERADMIN_NAME/EMAIL/MOBILE/PASSWORD`, domain name (for `APP_URL`/`EMAIL_FROM` later) | Generates `JWT_SECRET`, fills `.env.local` |
| Before Prompt 4 | `BLOB_READ_WRITE_TOKEN` (Vercel Blob store) | Adds to `.env.local` |
| Before Prompt 6 | `RESEND_API_KEY`, `EMAIL_FROM`, optional `ADMIN_NOTIFY_EMAILS`; Resend domain verified | Adds to `.env.local` (until then emails print to the terminal) |
| Day 4 (Prompt 12) | Production `MONGODB_URI`, Vercel project access, DNS access | Sets production env vars in Vercel (new `JWT_SECRET`) |

Missing Day 2 keys never block work: without `RESEND_API_KEY` emails are logged to the terminal, and without `BLOB_READ_WRITE_TOKEN` only image upload fails, with a clear message.

---

## Tips for running the agent

- Start **each day in a fresh agent chat** with the **Session starter** below, then paste that day's prompts one by one in the same chat.
- If the agent goes off-track, say: *"Stop. Re-read README.md sections 3 and 6 and redo only what Prompt N asks."*
- Commit after every prompt (the prompts ask the agent to). If something breaks badly, `git reset --hard` to the last commit and re-run the prompt.
- Have `.env.local` filled with the Day 1 keys before Prompt 2 (see the table above).
- Never paste real secret values into the agent chat. The agent only needs to know a key **exists**; it reads values from `.env.local` at runtime.

---

## Session starter (paste at the start of every new chat)

```
You are working on the Doctraders repo. Before doing anything:
1. Read README.md fully. It is the source of truth for roles, architecture rules (section 3), folder structure, data models, status flows and the REST API.
2. Read DESIGN.md fully. It is the source of truth for the UI: theme tokens, components, layouts and the patterns for new screens. Every screen you build must follow it (same theme, same class patterns, no new colours/fonts/UI libraries).
3. Read DEVELOPMENT.md and look at the Progress checklist to see which prompts are done.
4. Look at the current code structure briefly.

Working rules for this whole session:
- Follow README.md exactly. If something is ambiguous, choose the simplest option that fits README, and tell me what you chose in your summary.
- Do not add libraries that README does not list unless the prompt says so.
- All business mutations go through /api route handlers (no Server Actions for business logic).
- After each prompt: run `npm run typecheck`, `npm run lint` and `npm run build`, fix all errors, tick the prompt's box in DEVELOPMENT.md, and `git commit` with a clear message.
- End each prompt with a short summary: what you built, files changed, anything I must do manually (env vars, etc.), and how I can test it in the browser.

Reply "Ready" with the list of done/remaining prompts, then wait for my next message.
```

---

# DAY 1 — Foundation & auth

## Prompt 1 — Convert the monorepo into a single Next.js app

```
Prompt 1: Convert this Turborepo monorepo into ONE Next.js app at the repo root, as described in README.md section 4 and 13.

Do this:
1. Move apps/web into the repo root: src/, public/, next.config.ts, postcss.config.mjs, tsconfig.json, eslint config. One package.json at the root with all dependencies the app needs (Next 15, React 19, Tailwind v4, zod, lucide-react, class-variance-authority, clsx, tailwind-merge, @radix-ui/react-slot, @tanstack/react-table) plus: mongoose@8, jose, bcryptjs, resend, @vercel/blob, server-only. Dev: typescript, @types/*, tsx, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss.
   Scripts: dev, build, start, lint, typecheck (tsc --noEmit), seed (tsx --env-file=.env.local scripts/seed.ts).
2. Move packages/ui/src/components into src/components/ui (with an index.ts barrel), packages/ui/src/theme.css into src/app/theme.css, cn into src/lib/cn.ts. Delete the stepper and file-upload components (no KYC).
3. Move the useful parts of packages/schemas into src/lib/constants.ts and src/lib/format.ts. Drop documents.ts (no KYC) and the old company types.
4. Move the admin app's pages into src/app/admin/** (layout with sidebar, overview, users, listings, deals, categories). Delete the admin "registrations" and "reports" pages and the approval review panel — there are no approvals. Admin URLs are now /admin, /admin/users, etc. Remove the separate admin login page; everyone uses /login.
5. Delete: apps/, packages/, turbo.json, .turbo/, MSW (mockServiceWorker.js, MockProvider and all mock imports), XState and all machines, the demo-mode auto login, the "Demo pages" menu in the header, NEXT_PUBLIC_DEMO_MODE and NEXT_PUBLIC_ADMIN_URL.
6. Replace every import of @doctraders/* with local paths (@/components/ui, @/lib/...).
7. Pages that used mock data (home page featured listings, /listings, dashboard pages, admin pages): make them compile and render with empty arrays and an EmptyState for now. They get real data in later prompts. Do not build new features in this prompt.
8. Remove the logistics company type everywhere it appears in forms. Keep the marketing pages, but remove the Logistics link from the header nav.
9. Create .env.example by copying the template in README.md section 8 exactly (keys and comments, all values empty except APP_URL=http://localhost:3000 and the EMAIL_FROM example). Make sure .gitignore ignores .env, .env*.local, .next, node_modules, .vercel.
10. Keep README.md, DESIGN.md and DEVELOPMENT.md at the root as they are (only tick the checkbox). The UI must look exactly the same after the move: theme.css copied unchanged (DESIGN.md Appendix A), all ui components unchanged except import paths.

Done when: `npm install && npm run build` passes, `npm run dev` serves the marketing site at /, the dashboard shell at /dashboard and the admin shell at /admin (no auth yet), and there are no references to apps/, packages/, @doctraders/, msw or xstate left (grep to confirm).
```

## Prompt 2 — Backend foundation

```
Prompt 2: Build the backend foundation exactly as README.md sections 3, 4 and 5 describe. No UI work in this prompt.

Create:
0. src/server/env.ts — the only file that reads process.env. Validate with Zod: required MONGODB_URI (must start with mongodb), JWT_SECRET (min 32 chars), APP_URL (url, no trailing slash); optional RESEND_API_KEY, EMAIL_FROM (default "Doctraders <onboarding@resend.dev>"), ADMIN_NOTIFY_EMAILS (comma list → string[]), BLOB_READ_WRITE_TOKEN. Validate lazily on first use (so `next build` works without secrets) and throw a message that names the missing/invalid keys and points to README section 8. Log one warning at startup for each missing optional key explaining the fallback. The seed script reads SEED_SUPERADMIN_* itself and errors clearly if any is missing.
1. src/server/db.ts — cached mongoose connection on globalThis using env.MONGODB_URI.
2. src/server/http.ts — ok(data, status=200), okList(data, {page, limit, total}), fail(status, message, fields?), class HttpError, and handle(fn) wrapper that connects the DB, catches ZodError → 400 with fields (path → message), HttpError → its status, everything else → 500 with console.error. Helper parsePaging(searchParams) → { page, limit (max 50, default 20), skip }.
3. src/server/models/: User, Category, Listing, Enquiry, Deal, Notification — fields, enums, defaults and indexes exactly as README section 5. Every schema has a toJSON transform (_id → id string, remove __v, and for User also remove passwordHash, resetTokenHash, resetTokenExpires). Use `mongoose.models.X || mongoose.model(...)`. User.publicCode: unique random 5-digit string, generated in a pre-validate hook with a retry on duplicate. Deal.code: "DT-<year>-<4-digit sequence>" using a small Counter model.
4. src/server/auth.ts — hashPassword/verifyPassword (bcryptjs, 10 rounds), signToken({ sub, roles }) / verifyToken with jose HS256 and JWT_SECRET, 30-day expiry; setAuthCookie(res, token) / clearAuthCookie(res) for cookie "dt_token" (httpOnly, secure in production, sameSite lax, path /, 30 days); getAuth(req) reads `Authorization: Bearer` first, then the cookie.
5. src/server/guard.ts — requireAuth(req, { roles?: Role[] }) → loads the user from DB, 401 if no/invalid token or user missing, 403 if status is blocked, 403 if roles given and user has none of them. Role groups: "admin" accepts admin or superadmin. Export helpers isAdmin(user), isSuperAdmin(user), hasRole(user, role).
6. src/middleware.ts — page guard only (jose verify, no DB): /dashboard/** needs a token with buyer or seller; /admin/admins/** needs superadmin; /admin/** needs admin or superadmin; otherwise redirect to /login?next=<path>. If a logged-in admin opens /dashboard, redirect to /admin, and vice versa. Do not run middleware on /api, /_next, static files.
7. src/server/serializers.ts — functions that turn documents into API JSON and enforce the privacy rules (README 3.6–3.8): alias(user, side) → "Seller #48213" / "Buyer #48213"; publicListing(listing, owner); partyEnquiry(enquiry); partyDeal(deal, viewerId) with computed paidAmount/paidPercent/shippedQuantity/shippedPercent/reachedQuantity/reachedPercent and NO commission fields and the other side as an alias; adminDeal(deal, buyer, seller) with everything. Write small unit-like assertions in comments if useful, but no test framework.
8. src/server/email.ts — sendEmail({ to, subject, html }) using Resend; if RESEND_API_KEY is empty, console.log the email instead; never throws (catch + log). Plain simple HTML template helper with the Doctraders name and a button link.
9. src/server/notify.ts — notify(userIds, { type, title, body?, link? }) creates Notification docs; notifyAdmins(payload, { email?: boolean }) notifies all active admins/superadmins, and if email is true also emails them plus ADMIN_NOTIFY_EMAILS. Email is fire-and-forget (don't await failures into the response).
10. src/lib/constants.ts — ROLES, LISTING_KINDS, UNITS, BUSINESS_TYPES, ENQUIRY_STATUSES with labels and party labels, DEAL_STATUSES, COMMISSION_STATUSES, SHIPMENT_STATUSES, PAYMENT_METHODS, INDIAN_STATES (all states + UTs). src/lib/format.ts — formatINR, formatDate, formatDateTime, percent.
11. scripts/seed.ts — connects with MONGODB_URI, creates the super admin from SEED_SUPERADMIN_* if no user with that email exists (roles ["admin","superadmin"]), and upserts default categories: Rice & Grains, Pulses, Spices, Oilseeds & Edible Oil, Fruits & Vegetables, Sugar & Jaggery, Dry Fruits & Nuts, Tea & Coffee, Animal Feed, Fertilizers & Seeds, Other. Safe to run multiple times. Prints what it did.
12. GET /api/health → { data: { ok: true, db: "connected" } } to test the connection.

Done when: build passes (also with an empty .env.local), `npm run seed` runs against my MONGODB_URI (I have filled the Day 1 keys in .env.local), GET /api/health returns ok, and removing MONGODB_URI gives a clear error naming it. Do not print any secret values in logs or in your summary.
```

## Prompt 3 — Register, login, profile, password reset

```
Prompt 3: Build authentication end to end (API + UI). Follow README section 1 (registration fields) and section 6 (Auth & profile endpoints).

API (src/server/services/auth.ts + route handlers in src/app/api/auth/**):
- POST /api/auth/register: body has roles (array of "buyer"/"seller", 1–2 items) and the fields. Validation rules in src/lib/validation.ts with Zod, shared with the form: seller (or both) → business type, at least one category, address, city, state, 6-digit pincode required; buyer-only → business name, city, state required; mobile /^[6-9]\d{9}$/; GST optional but if present must match /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/ (uppercase it first); email lowercased. 409 with fields.email / fields.mobile if already used. Creates the user (status active, no approval), sets the cookie, returns { data: { user, token } }, sends a welcome email (fire-and-forget).
- POST /api/auth/login: { identifier, password } where identifier is email or mobile. Wrong credentials → 401 "Invalid email/mobile or password". Blocked → 403 "Your account is blocked. Please contact support." Updates lastLoginAt. Returns user + token and sets the cookie.
- POST /api/auth/logout, GET /api/auth/me, PATCH /api/auth/me (name, mobile, business fields; may ADD the other trade role — if adding seller, seller-required fields must be present after the update; admins cannot add buyer/seller; cannot remove a role in v1), POST /api/auth/change-password.
- POST /api/auth/forgot-password: always returns 200; if the email exists, store a sha256 hash of a random token with 1 hour expiry and email a link APP_URL/reset-password?token=...
- POST /api/auth/reset-password: { token, password } → sets the password and clears the token.

Client:
- src/lib/api-client.ts: apiFetch<T>(path, { method, body, form }) that sends JSON (or FormData), includes credentials, parses { data } / { error }, and throws an ApiError with message + fields. A useApi(fetcher, deps) hook returning { data, loading, error, refetch }. A useMe() hook (GET /api/auth/me, cached in a small React context provided in the dashboard and admin layouts).
- /register: ONE page form (no wizard). First a big choice: "I want to sell", "I want to buy", "Both". Then show the fields for that choice; required fields marked with *, optional ones labelled. Categories as checkboxes loaded from GET /api/categories (create a simple public GET /api/categories now if not present). Indian state as a select. Show server field errors under each field. On success redirect to /dashboard.
- /login: identifier + password, "Forgot password?" link, honours ?next=. After login: admins → /admin, others → /dashboard (or next).
- /forgot-password and /reset-password pages.
- /dashboard/profile: view/edit profile and business details, "Also register as seller/buyer" button that reveals the missing required fields, change password form.
- Dashboard shell: sidebar items depend on roles (seller: "My products"; buyer: "My requirements"; both see both; everyone: Overview, My enquiries, My deals, Profile). Show the user's name, business name and role badges; Logout button calls the API then goes to /login. The site header shows "Dashboard"/"Admin" + Logout when logged in instead of "Sign in / Join free" (check via /api/auth/me on the client).
- Remove every remaining "pending / rejected / verification" screen and wording.

Done when: I can register as seller, buyer and both; log in with email or mobile; get redirected correctly; edit my profile; add the seller role to a buyer account; reset a password (email printed in the console if no Resend key); the seeded super admin can log in and lands on /admin; a non-admin opening /admin is redirected.
```

---

# DAY 2 — Listings & interest

## Prompt 4 — Categories, uploads, listings API

```
Prompt 4: Build the listings backend (README section 5 Listing model, section 6 Public data + User listing endpoints).

1. GET /api/categories (public, active, sorted by order then name). Admin category endpoints come in Prompt 9.
2. POST /api/uploads: if env.BLOB_READ_WRITE_TOKEN is missing return 503 "Image upload is not configured (BLOB_READ_WRITE_TOKEN)". requireAuth (any active user or admin), multipart field "file", only image/jpeg, image/png, image/webp, max 4 MB, upload with @vercel/blob put() to "listings/<userId>/<random>.<ext>" with access "public" → { data: { url } }. Clear 400 messages for wrong type/size. src/server/blob.ts holds the upload code.
3. src/server/services/listings.ts + routes:
   - POST /api/listings: kind "offer" requires the seller role, "requirement" requires the buyer role. Zod schema in src/lib/validation.ts: title (5–120), category (must exist and be active), description (10–2000), quantity > 0, unit enum, price optional ≥ 0, minOrderQuantity optional, city, state, images (0–6 URLs; an offer needs at least 1 image), status starts active.
   - GET /api/listings: public, only status active, filters kind, category, state, city, q (text search on title + description), paging, newest first. Each item via publicListing(): owner shown only as alias ("Seller #48213" for offers, "Buyer #48213" for requirements), plus owner's city/state; never name, business name, mobile, email.
   - GET /api/listings/:id: public, active only, 404 otherwise.
   - PATCH /api/listings/:id: owner only; may edit fields and set status active/closed; cannot change kind; cannot touch a blocked listing (403 "This listing was blocked by admin").
   - DELETE /api/listings/:id: owner only; hard delete if enquiryCount is 0, otherwise set status closed.
   - GET /api/me/listings: own listings, all statuses, with ?kind and paging. Do not include enquiryCount (admin-only stat).
4. Make the existing public /listings page and the home page featured rows call the service functions directly in server components (same filters as the API) so they are server-rendered for SEO.

Done when: build passes and I can create, list, filter, edit, close and delete listings with curl or the browser devtools, and the public responses contain no contact details (show me one sample JSON response in your summary).
```

## Prompt 5 — Listings UI

```
Prompt 5: Build the listings UI using the APIs from Prompt 4. Reuse the existing look (ListingCard, theme, ui components).

1. components/listings/ImageUploader: pick up to 6 images, client-side resize/compress to max 1600px wide JPEG (~0.8 quality) using a canvas before upload so files stay under 4 MB, upload each to POST /api/uploads with progress state, show thumbnails, remove, and drag or arrow buttons to reorder (first image = cover).
2. components/listings/ListingForm used for create and edit: kind (preselected by the page), title, category, description, quantity + unit, price per unit (or a "Price on request" checkbox), min order qty (optional), city, state, images. Client validation with the same Zod schema; show server field errors.
3. Dashboard pages:
   - /dashboard/listings: tabs "My products" (offers, seller only) and "My requirements" (requirements, buyer only); table/cards with cover image, title, qty, price, status badge, created date, actions Edit / Close / Reopen / Delete (confirm). Blocked listings show a red "Blocked by admin" badge and no edit.
   - /dashboard/listings/new?kind=offer|requirement (button "Post a product" for sellers, "Post a requirement" for buyers; only show what the user's roles allow).
   - /dashboard/listings/[id]/edit.
4. Public pages:
   - /listings: real data, filters (keyword, kind, category from API, state), pagination, cards show cover image (next/image; allow the Vercel Blob host in next.config images.remotePatterns: "*.public.blob.vercel-storage.com"), fallback category icon when no image.
   - /listings/[id]: gallery (main image + thumbnails), title, kind badge, category, quantity, price or "Price on request", min order, location, description, alias of the owner, posted date, and an "I'm interested" button (it opens the dialog built in Prompt 6 — for now link to /login?next=/listings/<id> when logged out, and show a disabled button with a hint when logged in). generateMetadata with title/description/first image.
5. Dashboard overview (/dashboard): counts of my active listings, my enquiries, my active deals, and quick action buttons by role.

Done when: a seller can post a product with photos and see it on /listings and /listings/[id]; a buyer can post a requirement; editing/closing/deleting works; it looks good on mobile width (375px).
```

## Prompt 6 — "I'm interested", notifications, email

```
Prompt 6: Build the interest flow and notifications (README section 5 "Interest rules", section 6 enquiries + notifications, section 7).

API:
1. POST /api/enquiries { listingId, quantity, message? } following the interest rules exactly: user must have the opposite role (offer → buyer, requirement → seller), not own listing, listing active, one per user per listing (409 "You have already shown interest in this listing"). Derive buyerId/sellerId, snapshot listingTitle, push first statusHistory entry, increment listing.enquiryCount. Then notifyAdmins({ type: "enquiry_new", title: "New interest: <listing title>", body: "<Buyer #x> wants <qty unit>", link: "/admin/enquiries/<id>" }, { email: true }). The admin email contains the listing title, quantity, message, and full names + mobiles of BOTH parties (admins are allowed to see them) with a button to open the enquiry.
2. GET /api/me/enquiries: enquiries I sent, newest first, with listing title, cover image, quantity, message, date and the party status label (README "Party view of enquiry status"). Never return admin notes.
3. GET /api/notifications (?unread=1, paging) returning list + unreadCount; POST /api/notifications/read { ids? }.

UI:
4. components/listings/InterestDialog on /listings/[id]: logged out → go to /login?next=...; logged in without the needed role → message "Register as a buyer/seller from your Profile to show interest" with a link; own listing → button hidden; already interested → disabled "Interest sent". Dialog fields: quantity required (prefilled with min order qty if any) + unit shown, optional message. Success state: "Thanks! The Doctraders team will contact you shortly."
5. /dashboard/enquiries: list of my enquiries with status badges and links to the listing.
6. components/notifications-bell.tsx: bell with unread count in the dashboard shell and the admin shell (and site header when logged in), polls every 30s, dropdown with the latest 10 (title, body, time ago), click → mark read + navigate to link, "Mark all read".

Done when: as a buyer I click "I'm interested" on a seller's product → the super admin sees the bell count go up within 30s and an email is sent (or printed to console) → the buyer sees the enquiry in /dashboard/enquiries as "Received". Same the other way round for a seller on a buyer requirement. Duplicate interest is blocked.
```

---

# DAY 3 — Admin & deals

## Prompt 7 — Admin shell, overview, enquiry inbox

```
Prompt 7: Build the admin core: shell, overview and the enquiry inbox. This is the most important admin screen.

1. Admin shell (src/app/admin/layout.tsx): sidebar Overview, Enquiries (with count of "new" as a badge), Deals, Users, Listings, Categories, Admins (only for superadmin). Header with notifications bell, admin name, Logout. Mobile friendly (collapsible sidebar).
2. GET /api/admin/stats and the /admin overview: cards for New enquiries, In discussion (contacted+spoken+negotiating), Active deals, Commission due (₹ sum), Commission paid (₹ sum), Total users (buyers / sellers), Active listings; plus a "Latest 10 enquiries" table linking to the detail.
3. API: GET /api/admin/enquiries (?status, ?q matches listing title / buyer or seller name, business, mobile; paging; newest first) returning listing title + kind, quantity, both parties with full name, business name, mobile, email, city; GET /api/admin/enquiries/:id with listing (incl. images and price), both parties' full profiles, notes, statusHistory, dealId; PATCH /api/admin/enquiries/:id { status } (any status except deal_closed, which only deal creation sets; push statusHistory); POST /api/admin/enquiries/:id/notes { text }.
4. /admin/enquiries: status tabs (All, New, Contacted, Spoken, Negotiating, Deal closed, Dropped) with counts, search box, table (date, listing, qty, buyer, seller, status badge). Rows click through to detail.
5. /admin/enquiries/[id]: left: listing summary with image and link; buyer card and seller card with name, business, mobile as tel: link, WhatsApp link (https://wa.me/91<mobile>), email as mailto:, city/state, GST if any. Right: status dropdown (saves immediately, toast), notes timeline with "Add note" box, status history. A primary button "Convert to deal" (opens the form built in Prompt 8; for now a placeholder) — hidden if a deal exists, then show "View deal".

Done when: the admin can find a new enquiry, call/WhatsApp both sides from the page, move it through statuses, add notes, and see the history. A normal user calling any /api/admin route gets 403.
```

## Prompt 8 — Deals, payments, shipment updates

```
Prompt 8: Build deals end to end (README Deal model, status flows, admin deal endpoints, party deal endpoints, shipments).

API:
1. POST /api/admin/deals { enquiryId, quantity, unit, pricePerUnit, commissionPercent, adminNotes? }: enquiry must not already have a deal; computes totalValue and commissionAmount; status active, commissionStatus pending; sets enquiry.status = deal_closed + dealId + history; notifies buyer and seller ("Deal confirmed: <title>", link /dashboard/deals/<id>).
2. GET /api/admin/deals (?status, ?commissionStatus, ?q, paging), GET /api/admin/deals/:id (full with both parties), PATCH /api/admin/deals/:id (recalculate totals when qty/price/% change; status → completed sets commissionStatus due if pending, and notifies both parties; status → cancelled allowed only from active; commissionStatus → paid allowed only when completed).
3. POST /api/admin/deals/:id/payments { amount > 0, method?, note?, paidAt? } (reject if total paid would exceed totalValue) → notify seller "Payment recorded: ₹x (y% paid)". DELETE /api/admin/deals/:id/payments/:paymentId.
4. GET /api/me/deals and GET /api/me/deals/:id (party only, partyDeal serializer — no commission, other side as alias).
5. POST /api/deals/:id/shipments and PATCH /api/deals/:id/shipments/:shipmentId: allowed for the deal's seller or an admin; deal must be active; total shipment quantity ≤ deal quantity; status forward only packed → shipped → reached; push history; notify admins (in-app + email) and the buyer ("Shipment update: 250 bags shipped").

UI:
6. Admin "Convert to deal" form on the enquiry detail: prefilled quantity/unit from the enquiry and price from the listing; live preview of total value and commission amount; submit → go to /admin/deals/<id>.
7. /admin/deals: tabs Active / Completed / Cancelled, table with code, title, buyer, seller, value, paid %, shipped %, commission status.
8. /admin/deals/[id]: header (code, title, status badge, value, commission % and ₹, commission status); two progress bars "Paid ₹x of ₹y (z%)" and "Shipped a of b unit (z%) · Reached …"; payments table + "Record payment" form; shipments timeline (each lot with qty, status steps, notes, times) + admin can add/advance lots too; buttons Mark completed (confirm dialog warns if paid or reached < 100%), Cancel deal, Mark commission paid (only when completed); edit deal numbers; admin notes; links to the enquiry and both user profiles.
9. /dashboard/deals: my deals as buyer and as seller (label which side I am), status, paid %, shipped %.
10. /dashboard/deals/[id]: deal summary, the other side as alias, payment progress (amount + %), shipment timeline. If I am the seller and the deal is active: "Add shipment update" form (quantity of this lot — show remaining quantity — and optional note; starts as Packed) and on each lot one big button for the next step ("Mark as shipped" → "Mark as reached"). Buyer sees it read-only.

Done when: full flow works: enquiry → convert to deal → admin records 50% payment → seller adds a lot of 50% quantity and marks it Packed → Shipped → Reached → buyer sees the updates and gets notifications → admin records the rest, seller ships the rest → admin marks completed → commission due → paid. Party API responses contain no commission fields (show a sample in your summary).
```

## Prompt 9 — Admin users, listings, categories, admins

```
Prompt 9: Finish the admin panel management screens.

1. Users: GET /api/admin/users (buyers/sellers only; ?role buyer|seller, ?status, ?q name/business/mobile/email; paging), GET /api/admin/users/:id (profile + their listings, enquiries, deals), PATCH /api/admin/users/:id { status } (block/unblock). Page /admin/users with filters and table (name, business, roles badges, mobile, city/state, joined, status) and /admin/users/[id] detail with Block/Unblock (confirm) and tabs for listings, enquiries, deals. Blocking must stop the user immediately (API guard already checks DB) and the website should log them out on their next request with the 403 message.
2. Listings: GET /api/admin/listings (?status, ?kind, ?q, paging, with owner name/business), PATCH /api/admin/listings/:id { status: active|blocked }. Page /admin/listings with cover image thumbnail, title, kind, owner, enquiryCount, status, Block/Unblock.
3. Categories: GET/POST /api/admin/categories, PATCH/DELETE /api/admin/categories/:id (slug auto from name, unique; delete only if no listing uses it, otherwise ask to deactivate). Page /admin/categories with inline add/edit, active toggle, order.
4. Admins (superadmin only, API and page): GET/POST /api/admin/admins (create { name, email, mobile, password, superadmin? } → roles ["admin"] or ["admin","superadmin"]; email the new admin their login link, not the password), PATCH /api/admin/admins/:id ({ status, password, superadmin }), DELETE /api/admin/admins/:id. Rules: you cannot block/delete/demote yourself; the last active super admin cannot be removed or demoted. Page /admin/admins with table and "Add admin" dialog, Reset password dialog, Block/Remove.
5. An "Account" page for any admin at /admin/account: change own name/mobile and password.

Done when: super admin can add a normal admin, that admin can log in and use everything except /admin/admins (page redirects, API 403); blocking a user/listing works immediately; categories show up in the register and listing forms.
```

## Prompt 10 — Cleanup, copy, polish

```
Prompt 10: Cleanup and polish pass. No new features.

0. Design audit: go through every page against DESIGN.md (tokens, StatusBadge map, pill rule, shells, states, patterns in section 6) and fix anything that drifted. Grep for hard-coded hex colours and gray-*/slate-* classes and replace them with tokens.

1. Copy: the site must not claim manual verification any more (no KYC, no approvals). Replace "Verified Buyers. Verified Sellers." and similar with honest wording, e.g. "Direct buyers. Direct sellers. One trusted middleman." Remove the VerifiedBadge usage or rename it to a neutral "Member" badge. Update How it works / FAQ / Buyers / Sellers pages to the real flow in README (post → interest → Doctraders connects you → deal → payment & shipment tracking → commission after completion). Remove references to documents, ports/FOB/CIF, logistics registration and international trade terms that no longer exist in the forms.
2. Every list page: loading state, empty state with a helpful action, error state with retry. Every form: disabled submit while saving, success toast, field errors. Add a tiny toast component in components/ui if none exists (no new library).
3. Mobile check at 375px for: header, /listings, /listings/[id], register, dashboard pages, admin enquiry detail and deal detail. Fix overflow.
4. Security pass: grep every /api route and confirm it calls requireAuth with the right roles (except the public ones in README); confirm party/public serializers never leak name/mobile/email/business/address/GST of the other side or any commission field; confirm passwordHash never leaves the server; limit request body sizes; trim and escape user text in emails.
5. Add simple rate limiting for POST /api/auth/login, /api/auth/register, /api/auth/forgot-password and /api/enquiries: an in-memory per-IP limiter is fine for v1 (note in README that it is per-instance).
6. SEO: metadata for public pages, sitemap.ts (static pages + active listings), robots.ts (disallow /dashboard, /admin, /api).
7. Update README.md if anything you built differs from it.

Done when: build and lint pass with zero warnings you can reasonably fix, and you give me a list of what you changed.
```

---

# DAY 4 — Test & launch

## Prompt 11 — Full-flow test pass

```
Prompt 11: Test the whole app end to end and fix what breaks. Use a local or test MongoDB database, not production.

1. Write scripts/smoke.ts (run with `npx tsx --env-file=.env.local scripts/smoke.ts`) that uses fetch against http://localhost:3000 and Bearer tokens (this also proves the Flutter-style auth works) to run the full flow and assert each step:
   register seller → register buyer → register "both" user → seller creates offer (use an image URL placeholder if no Blob token) → buyer posts requirement → buyer shows interest in offer → duplicate interest gets 409 → seller shows interest in requirement → buyer cannot show interest on a requirement (403) → super admin logs in → sees 2 new enquiries → moves one to spoken, adds a note → converts to deal (qty 100, price 2000, 2%) → records 50% payment → seller adds lot of 50 (packed) → shipped → reached → buyer GET /api/me/deals/:id shows paidPercent 50, reachedPercent 50 and NO commission fields and NO seller name/mobile → admin records remaining payment, seller ships remaining 50 → admin completes deal → commissionStatus due → paid → admin blocks the buyer → buyer's next request gets 403 → super admin creates an admin → that admin gets 403 on /api/admin/admins.
   Print a clear PASS/FAIL line per step. Use unique emails/mobiles per run.
2. Run it, fix every failure, run again until all PASS.
3. Then give me a short manual browser checklist (10–15 items) for things the script cannot check: image upload, layout on mobile, bell, emails, redirects.

Done when: smoke script is all PASS. Paste the output in your summary.
```

## Prompt 12 — Deploy

```
Prompt 12: Prepare production deployment on Vercel (README section 10).

1. Check `npm run build` passes with NODE_ENV=production. Make sure nothing depends on files written to disk at runtime.
2. Confirm next.config images.remotePatterns covers the Vercel Blob host, and that the auth cookie is secure in production.
3. Extend README section 10 into a full "Deployment checklist" with exact steps for: Atlas production DB user + network access, Vercel project import, Blob store, setting every Production env var from README section 8 (new JWT_SECRET, production MONGODB_URI, APP_URL=https://<domain>; SEED_* not needed on Vercel), domain + www → apex redirect, Resend domain verification (DNS records), running `npm run seed` once against the production MONGODB_URI from a local terminal, and a post-deploy smoke test list. Also check the env.ts validation passes on Vercel (call /api/health after deploy).
4. List anything I must do by hand in the Vercel / Atlas / Resend / domain dashboards, in order.

Done when: you've given me the step-by-step list. I will do the dashboard steps myself.
```

---

## After launch (not now)

- Flutter app on the same APIs (see README section 11).
- Push notifications (FCM), WhatsApp alerts to admin, buyer "received" confirmation, invoices, ratings, KYC if needed later.
