# Doctraders

A simple B2B **trade-tracking platform for a middleman**.

- **Sellers** post what they have (e.g. 2,000 bags of rice) with photos and details.
- **Buyers** post what they need (e.g. "need 500 bags of basmati").
- Either side clicks **"I'm interested"** on the other side's listing.
- That interest lands in the **admin panel** (the middleman). The admin is notified by email and in-app bell.
- The admin talks to both sides **offline** (phone, WhatsApp, visit), and updates the enquiry status: *Contacted → Spoken → Negotiating → Deal closed / Dropped*.
- When a deal is agreed, the admin **converts the enquiry into a deal** (quantity, price, commission %).
- The admin records **payments** (e.g. 50% received). The **seller** posts **shipment updates** per lot (*Packed → Shipped → Reached*), e.g. "50% of stock shipped".
- When fully paid and delivered, the admin marks the deal **Completed** and tracks commission **Due → Paid**.

Buyers and sellers **never see each other's names or contact details** on the platform. The admin is the only link. This is enforced on the **server**, not just hidden in the UI.

> Website first (this repo). A **Flutter app** comes later and will use the **same REST APIs**. Every rule below that says "API" is written so the mobile app can reuse it.

---

## 1. Roles

| Role | How you get it | Can do |
| --- | --- | --- |
| `buyer` | Self-register | Post requirements, show interest in seller offers, see own enquiries and deals |
| `seller` | Self-register | Post offers (products), show interest in buyer requirements, see own deals, **post shipment updates** |
| `buyer` + `seller` ("both") | Self-register, or add the other role later from Profile | Everything above |
| `admin` | Created by a super admin | Enquiry inbox, deals, payments, users, listings, categories |
| `superadmin` | Seed script (first one), or another super admin | Everything an admin can + **add / block / remove admins** |

- **No approvals.** Buyers and sellers are active immediately after registering. The admin can **block** any account or listing.
- One user document holds `roles: string[]`, e.g. `["buyer"]`, `["seller"]`, `["buyer","seller"]`, `["admin"]`, `["admin","superadmin"]`.
- Admin accounts are never buyers/sellers.

### Registration fields

| Field | Seller (or both) | Buyer only |
| --- | --- | --- |
| Full name | required | required |
| Mobile (10-digit Indian, unique) | required | required |
| Email (unique) | required | required |
| Password (min 8) | required | required |
| Business name | required | required |
| Business type (`manufacturer`, `farmer`, `trader`, `wholesaler`, `distributor`, `processor`, `retailer`, `exporter`, `other`) | required | optional |
| Product categories (1 or more) | required | optional |
| Full address | required | optional |
| City, State | required | required |
| Pincode (6 digits) | required | optional |
| GST number | optional (format-checked if given) | optional |
| Years in business | optional | optional |

Login is **email or mobile + password**.

---

## 2. Tech stack

| Concern | Choice |
| --- | --- |
| Framework | **Next.js 15 (App Router)**, React 19, TypeScript strict. **One app, not a monorepo.** |
| Styling | Tailwind CSS v4, small in-house UI kit in `src/components/ui` |
| Database | **MongoDB Atlas** + **Mongoose 8** |
| API | **REST** Route Handlers under `src/app/api/**/route.ts` |
| Auth | Email/mobile + password (`bcryptjs`), **JWT** signed with `jose` (HS256, 30 days) |
| Validation | **Zod** — the same schemas validate forms (client) and requests (server) |
| Email | **Resend** |
| Image storage | **Vercel Blob** (server-side `put()` from `POST /api/uploads`) |
| Hosting | **Vercel** + custom domain |
| Tables (admin) | `@tanstack/react-table` (existing `DataTable`) |
| Icons | `lucide-react` |

Do **not** add other libraries (no NextAuth, no Redux, no XState, no tRPC, no Prisma, no MSW) unless a task really needs one.

---

## 3. Architecture rules (read before writing code)

1. **All mutations go through `/api/*`.** No Server Actions for business logic. The Flutter app must be able to do everything the website does.
2. **Thin routes, logic in services.** Route handler = parse → `requireAuth` → Zod validate → call `src/server/services/*` → return JSON. Public server components (e.g. `/listings`) may call the same service functions directly for SEO.
3. **Auth works two ways with the same JWT:**
   - Web: `httpOnly` cookie `dt_token` (`secure` in production, `sameSite=lax`, 30 days).
   - Mobile: `Authorization: Bearer <token>`. Login/register also return `token` in the JSON body.
   - `getAuth(req)` checks the header first, then the cookie.
4. **Guard every API route** with `requireAuth(req, { roles?: Role[] })`. It verifies the JWT, **loads the user from DB** (so a block takes effect immediately), rejects `status: "blocked"` with 403, and checks roles. Ownership checks (e.g. "is this your listing") live in the service.
5. **Page protection** in `src/middleware.ts` (JWT verify only, no DB): `/dashboard/**` needs a logged-in buyer/seller; `/admin/**` needs `admin`/`superadmin`; `/admin/admins/**` needs `superadmin`. Otherwise redirect to `/login?next=...`.
6. **Privacy is enforced in serializers.** Public/party-facing responses never include another party's `name`, `email`, `mobile`, `businessName`, `address` or `gstNumber`. They show an alias: `Seller #48213` / `Buyer #48213` (from `user.publicCode`). Only admin endpoints return full contact details.
7. **Never return** `passwordHash`, `resetTokenHash`, or internal fields. Every model has a `toJSON` transform: `_id → id` (string), drop `__v`.
8. **Commission fields are admin-only.** Party-facing deal responses omit `commissionPercent`, `commissionAmount`, `commissionStatus`.
9. **Response format** (all APIs):
   - Success: `{ "data": ... }`. Lists: `{ "data": [...], "page": 1, "limit": 20, "total": 134 }`.
   - Error: `{ "error": { "message": "Human readable", "fields": { "email": "Already registered" } } }` with a correct HTTP status (400 validation, 401 not logged in, 403 forbidden/blocked, 404, 409 duplicate, 500).
   - Use helpers `ok(data, status?)`, `fail(status, message, fields?)` from `src/server/http.ts`. Wrap handlers with `handle()` which catches `ZodError` → 400 with `fields`, `HttpError` → its status, anything else → 500 (logged).
10. **Emails never break a request.** `sendEmail()` catches and logs errors. If `RESEND_API_KEY` is missing (local dev), it logs the email to the console instead.
11. **Mongo connection** is cached on `globalThis` (`src/server/db.ts`) so serverless functions reuse it. Models use `mongoose.models.X || mongoose.model(...)`.
12. **Server-only code** lives in `src/server/**` and starts with `import "server-only"`. Client-safe code lives in `src/lib/**`.
13. Dates are stored as `Date`, returned as ISO strings. Money is stored as **numbers in INR** (rupees, not paise) and shown with `formatINR()`.
14. Keep it simple and readable. Small files, plain functions, clear names. No premature abstractions.
15. **UI follows `DESIGN.md` exactly** — same theme tokens, components and class patterns. No new colours, fonts or UI libraries.

---

## 4. Folder structure

```
doctraders/
├─ README.md                 ← this file (project context)
├─ DESIGN.md                 ← design system: tokens, components, page patterns (UI source of truth)
├─ DEVELOPMENT.md            ← build plan and agent prompts
├─ .env.example
├─ next.config.ts
├─ package.json
├─ scripts/
│  └─ seed.ts                creates first super admin + default categories
└─ src/
   ├─ middleware.ts          page guards (/dashboard, /admin)
   ├─ app/
   │  ├─ layout.tsx, globals.css, theme.css
   │  ├─ (marketing)/        public pages: home, listings, listings/[id], about, faq, contact, legal…
   │  ├─ (auth)/             login, register, forgot-password, reset-password
   │  ├─ dashboard/          buyer/seller area
   │  │  ├─ page.tsx                  overview
   │  │  ├─ listings/                 my listings, new, [id]/edit
   │  │  ├─ enquiries/                interests I sent
   │  │  ├─ deals/, deals/[id]/       my deals (seller: shipment updates)
   │  │  └─ profile/                  profile, add role, change password
   │  ├─ admin/              admin panel
   │  │  ├─ page.tsx                  overview stats
   │  │  ├─ enquiries/, enquiries/[id]/
   │  │  ├─ deals/, deals/[id]/
   │  │  ├─ users/, users/[id]/
   │  │  ├─ listings/
   │  │  ├─ categories/
   │  │  └─ admins/                   super admin only
   │  └─ api/                REST endpoints (see section 6)
   ├─ components/
   │  ├─ ui/                 Button, Card, Badge, Input/Select/Textarea/Field, DataTable, Logo, layout bits
   │  ├─ site/               header, footer, marketing blocks
   │  ├─ listings/           ListingCard, ListingForm, ImageUploader, Gallery, InterestDialog
   │  ├─ dashboard/          DashboardShell (sidebar by role)
   │  ├─ admin/              AdminShell, StatusSelect, NotesTimeline, PaymentForm, ShipmentTimeline
   │  └─ notifications-bell.tsx
   ├─ lib/                   client-safe
   │  ├─ constants.ts        roles, statuses, units, business types, Indian states
   │  ├─ validation.ts       Zod schemas shared by forms and API
   │  ├─ api-client.ts       fetch wrapper + useApi hook
   │  ├─ format.ts           formatINR, formatDate, percent
   │  └─ cn.ts
   └─ server/                server-only
      ├─ env.ts              reads + validates env vars (Zod), the only place that touches process.env
      ├─ db.ts               cached mongoose connection
      ├─ auth.ts             hashPassword, verifyPassword, signToken, verifyToken, setAuthCookie, clearAuthCookie, getAuth
      ├─ guard.ts            requireAuth(req, { roles })
      ├─ http.ts             ok, fail, HttpError, handle
      ├─ email.ts            sendEmail + templates
      ├─ blob.ts             uploadImage (Vercel Blob)
      ├─ notify.ts           notify(userIds, …) + notifyAdmins(…) (in-app + email)
      ├─ serializers.ts      publicListing, partyDeal, adminEnquiry … (privacy rules live here)
      ├─ models/             User, Category, Listing, Enquiry, Deal, Notification
      └─ services/           auth, users, listings, enquiries, deals, notifications, stats
```

---

## 5. Data models (Mongoose)

```ts
User {
  name: string                        // required
  email: string                       // required, unique, lowercase
  mobile: string                      // required, unique, 10 digits
  passwordHash: string
  roles: ("buyer"|"seller"|"admin"|"superadmin")[]
  status: "active" | "blocked"        // default active
  publicCode: string                  // unique random 5-digit, used for alias "Seller #48213"
  business: {                         // empty for admins
    name, type?, categories: string[] (category slugs), address?, city, state, pincode?, gstNumber?, yearsInBusiness?
  }
  resetTokenHash?: string, resetTokenExpires?: Date
  lastLoginAt?: Date
  createdBy?: ObjectId (User)         // for admins created by a super admin
  timestamps
}
// indexes: email unique, mobile unique, publicCode unique, roles, status

Category { name, slug (unique), active: boolean, order: number }

Listing {
  kind: "offer" | "requirement"       // offer = seller selling, requirement = buyer needs
  ownerId: ObjectId (User)
  title: string                       // "Basmati rice 1121, 25 kg bags"
  category: string (slug)
  description: string
  quantity: number, unit: "kg"|"quintal"|"tonne"|"bag"|"piece"|"box"|"litre"|"other"
  price?: number                      // per unit, INR; empty = price on request
  minOrderQuantity?: number
  city, state
  images: string[]                    // Vercel Blob URLs, max 6 (requirements may have 0)
  status: "active" | "closed" | "blocked"   // blocked = by admin only
  enquiryCount: number                // admin-only stat
  timestamps
}
// indexes: { status, kind, category, createdAt: -1 }, text index on title + description

Enquiry {                              // "I'm interested"
  listingId, listingKind, listingTitle (snapshot)
  fromUserId                           // who clicked interested
  ownerId                              // listing owner
  buyerId, sellerId                    // derived: offer → buyer=from, seller=owner; requirement → buyer=owner, seller=from
  quantity: number, message?: string
  status: "new" | "contacted" | "spoken" | "negotiating" | "deal_closed" | "dropped"
  notes: [{ text, byId, byName, at }]  // admin-only
  statusHistory: [{ status, byId, at }]
  dealId?: ObjectId
  timestamps
}
// indexes: unique { listingId, fromUserId }, { status, createdAt: -1 }, buyerId, sellerId

Deal {
  code: string                         // "DT-2026-0001"
  enquiryId, listingId, title
  buyerId, sellerId
  quantity, unit, pricePerUnit, totalValue        // totalValue = quantity * pricePerUnit
  commissionPercent: number, commissionAmount: number
  commissionStatus: "pending" | "due" | "paid"    // pending until completed → due → paid
  payments: [{ _id, amount, method?: "bank"|"upi"|"cash"|"cheque"|"other", note?, paidAt, byId }]
  shipments: [{ _id, quantity, status: "packed"|"shipped"|"reached", note?, history: [{ status, at, byId }], createdAt }]
  status: "active" | "completed" | "cancelled"
  adminNotes?: string
  createdBy, timestamps
}
// computed in serializer (not stored): paidAmount, paidPercent, shippedQuantity (shipped+reached), shippedPercent, reachedQuantity, reachedPercent

Notification {
  userId, type: "enquiry_new"|"deal_created"|"payment_added"|"shipment_update"|"deal_completed"|"system"
  title, body?, link?                  // link = web path, e.g. "/admin/enquiries/<id>"
  read: boolean, timestamps
}
// index: { userId, read, createdAt: -1 }
```

### Status flows

```
Enquiry: new → contacted → spoken → negotiating → deal_closed
                   └──────────┴──────────┴──────→ dropped      (admin can move freely; deal_closed is set automatically when a deal is created)

Party view of enquiry status:  new → "Received" | contacted/spoken/negotiating → "In discussion" | deal_closed → "Deal done" | dropped → "Closed"

Deal:        active → completed   (admin; allowed any time, UI warns if paid < 100% or reached < 100%)
             active → cancelled
Commission:  pending → due (auto when deal completed) → paid (admin)

Shipment lot (seller or admin, forward only): packed → shipped → reached
Rule: sum of all shipment quantities ≤ deal quantity. Only on active deals.
```

### Interest rules
- Must be logged in, active, and have the opposite role: interest on an **offer** needs `buyer`; on a **requirement** needs `seller`.
- Cannot show interest in your own listing, a closed/blocked listing, or twice on the same listing (409).
- Creates an Enquiry, increments `listing.enquiryCount`, and **notifies all active admins** (bell + email).

---

## 6. REST API

Auth column: **public**, **user** (any logged-in buyer/seller), **buyer**, **seller**, **party** (buyer or seller of that deal), **admin** (admin or superadmin), **super**.

### Auth & profile
| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | public | body: roles (`buyer`/`seller`, 1–2) + fields from section 1. Sets cookie, returns `{ user, token }`. Sends welcome email. |
| POST | `/api/auth/login` | public | `{ identifier (email or mobile), password }` → `{ user, token }` + cookie. Blocked → 403. |
| POST | `/api/auth/logout` | public | clears cookie |
| GET | `/api/auth/me` | any | current user (own full profile) |
| PATCH | `/api/auth/me` | user | update profile / business; can **add** a role (adding `seller` requires seller fields) |
| POST | `/api/auth/change-password` | any | `{ currentPassword, newPassword }` |
| POST | `/api/auth/forgot-password` | public | `{ email }` → always 200; emails reset link (token valid 1 h) |
| POST | `/api/auth/reset-password` | public | `{ token, password }` |

### Public data
| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/categories` | public | active categories |
| GET | `/api/listings` | public | `?kind&category&q&state&city&page&limit` → active listings only, owner as alias |
| GET | `/api/listings/:id` | public | one active listing (alias only) |

### User (buyer/seller)
| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/uploads` | user/admin | `multipart/form-data` field `file`; jpeg/png/webp, ≤ 4 MB → `{ url }` |
| POST | `/api/listings` | seller (offer) / buyer (requirement) | create, live immediately |
| PATCH | `/api/listings/:id` | owner | edit; owner may set `active`/`closed`, never un-block |
| DELETE | `/api/listings/:id` | owner | hard delete if 0 enquiries, else set `closed` |
| GET | `/api/me/listings` | user | own listings, all statuses |
| POST | `/api/enquiries` | buyer/seller | `{ listingId, quantity, message? }` — see interest rules |
| GET | `/api/me/enquiries` | user | enquiries I sent, with party status label |
| GET | `/api/me/deals` | user | deals where I am buyer or seller (no commission, other side as alias) |
| GET | `/api/me/deals/:id` | party | one deal with payments summary + shipments |
| POST | `/api/deals/:id/shipments` | seller of deal / admin | `{ quantity, status?: "packed", note? }` |
| PATCH | `/api/deals/:id/shipments/:shipmentId` | seller of deal / admin | `{ status, note? }` forward only; notifies admins + buyer |
| GET | `/api/notifications` | any | `?unread=1&page` → list + `unreadCount` |
| POST | `/api/notifications/read` | any | `{ ids?: string[] }` (no ids = mark all read) |

### Admin
| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/admin/stats` | admin | counts: new enquiries, enquiries by status, active deals, commission due/paid, users, listings |
| GET | `/api/admin/enquiries` | admin | `?status&q&page` with buyer + seller **full contact** and listing |
| GET | `/api/admin/enquiries/:id` | admin | full detail incl. notes + history |
| PATCH | `/api/admin/enquiries/:id` | admin | `{ status }` |
| POST | `/api/admin/enquiries/:id/notes` | admin | `{ text }` |
| POST | `/api/admin/deals` | admin | `{ enquiryId, quantity, unit, pricePerUnit, commissionPercent, adminNotes? }` → enquiry becomes `deal_closed`; notifies both parties |
| GET | `/api/admin/deals` | admin | `?status&commissionStatus&q&page` |
| GET | `/api/admin/deals/:id` | admin | full |
| PATCH | `/api/admin/deals/:id` | admin | `{ status?, commissionStatus?, quantity?, pricePerUnit?, commissionPercent?, adminNotes? }` (recalculates totals) |
| POST | `/api/admin/deals/:id/payments` | admin | `{ amount, method?, note?, paidAt? }`; notifies seller |
| DELETE | `/api/admin/deals/:id/payments/:paymentId` | admin | undo a wrong entry |
| GET | `/api/admin/users` | admin | `?role&status&q&page` (buyers/sellers only) |
| GET | `/api/admin/users/:id` | admin | profile + their listings, enquiries, deals |
| PATCH | `/api/admin/users/:id` | admin | `{ status: "active"|"blocked" }` |
| GET | `/api/admin/listings` | admin | `?status&kind&q&page` with owner |
| PATCH | `/api/admin/listings/:id` | admin | `{ status: "active"|"blocked" }` |
| GET/POST | `/api/admin/categories` | admin | list all / create |
| PATCH/DELETE | `/api/admin/categories/:id` | admin | edit, toggle active, delete if unused |
| GET/POST | `/api/admin/admins` | super | list / create admin `{ name, email, mobile, password, superadmin?: boolean }` |
| PATCH | `/api/admin/admins/:id` | super | `{ status?, password?, superadmin? }` — cannot change yourself |
| DELETE | `/api/admin/admins/:id` | super | cannot delete yourself or the last super admin |

---

## 7. Notifications

| Event | In-app bell | Email |
| --- | --- | --- |
| New enquiry ("I'm interested") | all active admins | all active admins (+ `ADMIN_NOTIFY_EMAILS`) |
| Deal created | buyer + seller | — |
| Payment recorded | seller | — |
| Shipment added / status changed | admins + buyer | admins |
| Deal completed | buyer + seller | — |
| Registration | — | welcome email to user |
| Forgot password | — | reset link |

The bell (`components/notifications-bell.tsx`) polls `GET /api/notifications?unread=1` every 30 s and shows the count. Clicking an item marks it read and navigates to `link`.

Emails come from `EMAIL_FROM` (e.g. `Doctraders <no-reply@yourdomain.com>`). The domain must be verified in Resend (add the DNS records Resend gives you).

---

## 8. Environment variables

Local: `.env.local` (never committed). Production: Vercel → Project → Settings → Environment Variables. `.env.example` in the repo lists the same keys with **empty values**. Secrets are given to the developer **directly by the owner**, never committed, never pasted into issues or chats.

### Template

```bash
# --- Day 1 (required to run anything) ---
MONGODB_URI=
JWT_SECRET=
APP_URL=http://localhost:3000

SEED_SUPERADMIN_NAME=
SEED_SUPERADMIN_EMAIL=
SEED_SUPERADMIN_MOBILE=
SEED_SUPERADMIN_PASSWORD=

# --- Day 2 (email + images) ---
RESEND_API_KEY=
EMAIL_FROM="Doctraders <no-reply@yourdomain.com>"
ADMIN_NOTIFY_EMAILS=

BLOB_READ_WRITE_TOKEN=
```

### What each key is and where it comes from

| Key | Needed | Who provides | Where to get it / format |
| --- | --- | --- | --- |
| `MONGODB_URI` | Day 1 | Owner | cloud.mongodb.com → free cluster (region **Mumbai ap-south-1**) → Database Access: add user → Network Access: allow `0.0.0.0/0` → Connect → Drivers → copy. Add the db name before `?`: `mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/doctraders?retryWrites=true&w=majority`. Use a **separate database** (`doctraders_dev`) for local work. |
| `JWT_SECRET` | Day 1 | Developer generates | `openssl rand -base64 32`. **Different value** in local and production. Changing it logs everyone out. |
| `APP_URL` | Day 1 | Owner (domain) | `http://localhost:3000` locally, `https://yourdomain.com` in production. Used for links in emails. No trailing slash. |
| `SEED_SUPERADMIN_NAME` | Day 1 | Owner | Name of the main admin. |
| `SEED_SUPERADMIN_EMAIL` | Day 1 | Owner | Login email of the main admin. |
| `SEED_SUPERADMIN_MOBILE` | Day 1 | Owner | 10-digit mobile, e.g. `9876543210`. |
| `SEED_SUPERADMIN_PASSWORD` | Day 1 | Owner | Min 8 chars. Only used once by `npm run seed`; change it after the first login. |
| `RESEND_API_KEY` | Day 2 | Owner | resend.com → API Keys → Create (permission: Sending). **Empty in local dev = emails are printed to the terminal**, so the developer can work without it. |
| `EMAIL_FROM` | Day 2 | Owner | Sender shown in emails, e.g. `Doctraders <no-reply@yourdomain.com>`. Must be on a domain **verified in Resend** (Resend → Domains → add domain → add its DNS records at the registrar → wait for "Verified"). |
| `ADMIN_NOTIFY_EMAILS` | Day 2 | Owner | Optional. Extra comma-separated addresses that get new-enquiry alerts (e.g. a personal Gmail), in addition to all admin accounts. |
| `BLOB_READ_WRITE_TOKEN` | Day 2 | Owner | vercel.com → project → Storage → Create → **Blob** → connect to project. Vercel adds it to production automatically. For local: copy it from the store's settings, or run `vercel env pull .env.local`. Without it, image upload returns a clear error (everything else works). |

### Owner setup checklist (accounts to create)

1. **GitHub** — private repo for the code, developer added as collaborator.
2. **MongoDB Atlas** — cluster + database user + network access (above). Give the developer the **dev** connection string; keep the production one for Vercel.
3. **Vercel** — account, import the GitHub repo, create the Blob store. Add the developer to the team if they will deploy.
4. **Resend** — account + API key + domain verification (needs access to the domain's DNS).
5. **Domain registrar** — access to DNS settings (for Vercel and Resend records).

---

## 9. Running locally

```bash
npm install
cp .env.example .env.local      # fill in the Day 1 values from section 8
npm run seed                    # creates the super admin + default categories (safe to run twice)
npm run dev                     # http://localhost:3000
```

If a required variable is missing, the app fails fast with a clear message naming it (see `src/server/env.ts`). Optional ones (`RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_NOTIFY_EMAILS`) only log a warning and fall back as described in section 8.

Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `seed`.

- Website: `/` · Login: `/login` (admins and users use the same page; admins land on `/admin`, users on `/dashboard`).

---

## 10. Deployment (Vercel)

1. MongoDB Atlas: production database (`/doctraders`), its own database user, *Network Access* `0.0.0.0/0` (Vercel IPs are dynamic).
2. Push repo to GitHub → import in Vercel → framework Next.js (defaults).
3. Vercel → Storage → create a **Blob** store and connect it to the project (adds `BLOB_READ_WRITE_TOKEN`).
4. Add every env var from section 8 for **Production**: production `MONGODB_URI`, a **new** `JWT_SECRET`, `APP_URL=https://yourdomain.com`, Resend keys. The `SEED_*` values are not needed on Vercel.
5. Vercel → Domains → add `yourdomain.com` and `www.yourdomain.com`, set the DNS records at your registrar.
6. Resend → Domains → add your domain, add its DNS records, wait for "Verified".
7. Run `npm run seed` once locally against the production `MONGODB_URI`.

---

## 11. Flutter app (later) — what's already prepared

- Same endpoints, JSON only, Bearer token auth (`token` returned from login/register).
- Images upload via `POST /api/uploads` (multipart), then send the URLs in the listing body.
- Notifications via `GET /api/notifications` (push notifications can be added later with FCM: add `deviceTokens: string[]` to User and send from `notify.ts`).
- Native apps don't need CORS. If a web-based client on another domain is ever added, add CORS headers then.

---

## 12. Out of scope for v1

KYC/document uploads, online payments/escrow, in-app chat between parties, invoices/GST PDFs, ratings, multi-language, push notifications, logistics role, SMS/WhatsApp alerts.

---

## 13. Current state of this repo

The repo started as a **frontend-only Turborepo monorepo** (`apps/web`, `apps/admin`, `packages/*`, mock API via MSW, XState). It is being converted into the **single Next.js app** described above — see `DEVELOPMENT.md`, Prompt 1. After that prompt, `apps/`, `packages/`, `turbo.json`, MSW and XState no longer exist.
