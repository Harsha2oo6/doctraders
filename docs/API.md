# Doctraders REST API (v1)

The website and the Android/iOS app use **the same endpoints**. This file is the contract: every endpoint has its method, path, auth, body and a real response example. It is updated in the same commit as the code.

- [Conventions](#conventions)
- [System](#system): health, meta
- [Auth & profile](#auth--profile): register, login, logout, me, change/forgot/reset password
- [Categories, listings & uploads](#categories-listings--uploads)
- [Interest (enquiries) & notifications](#interest-enquiries--notifications), contact
- [Admin: enquiries & stats](#admin-enquiries--stats)
<!-- sections are appended below by each feature -->

---

## Conventions

### Base URL

| Environment | Base URL |
| --- | --- |
| Local | `http://localhost:3000/api/v1` |
| Production | `https://<your-domain>/api/v1` |

All paths below are relative to the base URL. The version is in the path (`/api/v1`); breaking changes will go to `/api/v2` so installed apps keep working.

### Authentication

One JWT (HS256, valid 30 days) works two ways:

| Client | How to send it |
| --- | --- |
| Mobile app | `Authorization: Bearer <token>` header. `POST /auth/login` and `POST /auth/register` return `token` in the JSON body. |
| Website | httpOnly cookie `dt_token`, set automatically by login/register (`sameSite=lax`, `secure` in production). |

The server checks the `Authorization` header first, then the cookie. Every authenticated request reloads the user from the database, so a **blocked** account is rejected on its very next call.

Auth levels used in this document:

| Level | Meaning |
| --- | --- |
| public | no token needed |
| any | any logged-in, active account (buyer, seller or admin) |
| user | logged-in buyer and/or seller |
| buyer / seller | must have that role |
| party | the buyer or seller of that deal |
| admin | `admin` or `superadmin` |
| super | `superadmin` only |

### Response format

Success:

```json
{ "data": { "id": "6ae4…", "title": "Basmati rice 1121" } }
```

Lists (always paginated):

```json
{ "data": [ { "id": "…" } ], "page": 1, "limit": 20, "total": 134 }
```

Error (always this shape):

```json
{ "error": { "message": "Human readable message", "fields": { "email": "Already registered" } } }
```

`fields` is only present for validation/duplicate errors; map each key to the matching input.

| Status | When |
| --- | --- |
| 400 | Validation failed (`fields` tells you which inputs) or body is not valid JSON |
| 401 | Not logged in / token missing, invalid or expired → show the login screen |
| 403 | Logged in but not allowed, or the account is **blocked** → for "blocked", log the user out |
| 404 | Not found (also for ids that are not valid) |
| 409 | Duplicate (email/mobile already registered, interest already sent…) |
| 413 | Upload too large |
| 429 | Too many requests (rate limit on login, register, forgot-password, enquiries) |
| 500 | Server error (logged) |
| 503 | A dependency is not configured (e.g. image storage) |

### Pagination

List endpoints accept `?page=1&limit=20` (default `limit` 20, max 50) and return `page`, `limit`, `total`. For infinite scroll, load the next page while `page * limit < total`.

### Data types

- IDs are strings (24-char hex).
- Dates are ISO 8601 UTC strings, e.g. `"2026-10-30T09:15:00.000Z"`.
- Money is a number in **INR rupees** (not paise), e.g. `245000`.
- Enums are returned as **keys** (`deal_closed`, `in_discussion`). Get the human labels from [`GET /meta`](#get-meta); never hard-code labels in the app.
- The other trading party is never named. You get an alias such as `"Seller #48213"`.

---

## System

### GET /health

Auth: public. Uptime check. Always 200; `db` tells you whether MongoDB answered.

```bash
curl http://localhost:3000/api/v1/health
```

```json
{ "data": { "ok": true, "db": true } }
```

### GET /meta

Auth: public. Everything the app needs for dropdowns and labels: every enum with its label, Indian states, active categories, upload limits and `minAppVersion` (compare with the app version to force an update).

```bash
curl http://localhost:3000/api/v1/meta
```

```json
{
  "data": {
    "roles": [{ "key": "buyer", "label": "Buyer" }, { "key": "seller", "label": "Seller" }, { "key": "admin", "label": "Admin" }, { "key": "superadmin", "label": "Super admin" }],
    "accountStatuses": [{ "key": "active", "label": "Active" }, { "key": "blocked", "label": "Blocked" }],
    "businessTypes": [{ "key": "manufacturer", "label": "Manufacturer" }, { "key": "farmer", "label": "Farmer" }, "… trader, wholesaler, distributor, processor, retailer, exporter, other"],
    "units": [{ "key": "kg", "label": "kg" }, { "key": "quintal", "label": "quintal" }, { "key": "tonne", "label": "tonne" }, { "key": "bag", "label": "bag" }, { "key": "piece", "label": "piece" }, { "key": "box", "label": "box" }, { "key": "litre", "label": "litre" }, { "key": "other", "label": "unit" }],
    "states": ["Andaman and Nicobar Islands", "Andhra Pradesh", "… 36 states and UTs", "West Bengal"],
    "listingKinds": [{ "key": "offer", "label": "Offer" }, { "key": "requirement", "label": "Requirement" }],
    "listingStatuses": [{ "key": "active", "label": "Live" }, { "key": "closed", "label": "Closed" }, { "key": "blocked", "label": "Blocked by admin" }],
    "enquiryStatuses": [{ "key": "new", "label": "New" }, { "key": "contacted", "label": "Contacted" }, { "key": "spoken", "label": "Spoken" }, { "key": "negotiating", "label": "Negotiating" }, { "key": "deal_closed", "label": "Deal closed" }, { "key": "dropped", "label": "Dropped" }],
    "enquiryPartyStatuses": [{ "key": "received", "label": "Received" }, { "key": "in_discussion", "label": "In discussion" }, { "key": "deal_done", "label": "Deal done" }, { "key": "closed", "label": "Closed" }],
    "enquiryPartyStatusMap": { "new": "received", "contacted": "in_discussion", "spoken": "in_discussion", "negotiating": "in_discussion", "deal_closed": "deal_done", "dropped": "closed" },
    "dealStatuses": [{ "key": "active", "label": "Active" }, { "key": "completed", "label": "Completed" }, { "key": "cancelled", "label": "Cancelled" }],
    "commissionStatuses": [{ "key": "pending", "label": "Pending" }, { "key": "due", "label": "Due" }, { "key": "paid", "label": "Paid" }],
    "shipmentStatuses": [{ "key": "packed", "label": "Packed" }, { "key": "shipped", "label": "Shipped" }, { "key": "reached", "label": "Reached" }],
    "paymentMethods": [{ "key": "bank", "label": "Bank transfer" }, { "key": "upi", "label": "UPI" }, { "key": "cash", "label": "Cash" }, { "key": "cheque", "label": "Cheque" }, { "key": "other", "label": "Other" }],
    "categories": [
      { "id": "6ae433edb48dbeb87a5ec4fb", "name": "Rice & Grains", "slug": "rice-grains", "order": 0, "examples": "Basmati, non-basmati, wheat, maize, millets" },
      { "id": "6ae433edb48dbeb87a5ec4fc", "name": "Pulses", "slug": "pulses", "order": 1, "examples": "Toor, chana, moong, urad, masoor" }
    ],
    "uploads": { "maxBytes": 4194304, "mimeTypes": ["image/jpeg", "image/png", "image/webp"], "maxImagesPerListing": 6 },
    "minAppVersion": "1.0.0"
  }
}
```

(Arrays shortened with "…" in this example; the real response lists every value.)

---

## Auth & profile

The `user` object returned by every auth endpoint (own full profile):

```json
{
  "id": "6ae43628208a8118a0126195",
  "name": "Ravi Kumar",
  "email": "ravi.seller@example.com",
  "mobile": "9811111111",
  "roles": ["seller"],
  "status": "active",
  "publicCode": "68435",
  "business": {
    "name": "Ravi Rice Mills", "type": "manufacturer", "categories": ["rice-grains"],
    "address": "Plot 4, GT Road", "city": "Karnal", "state": "Haryana", "pincode": "132001",
    "gstNumber": "06ABCDE1234F1Z5", "yearsInBusiness": null
  },
  "lastLoginAt": "2026-10-30T06:16:08.062Z",
  "createdAt": "2026-10-30T06:16:08.237Z",
  "updatedAt": "2026-10-30T06:16:08.237Z"
}
```

Admins have `business: null`. `publicCode` is what others see as the alias (`Seller #68435`).

### POST /auth/register

Auth: public. Creates a buyer, seller or both account. **Active immediately** (no approval). Sets the `dt_token` cookie and returns the token for the app. Sends a welcome email.

Body (`business` rules from README §1):

| Field | Seller or both | Buyer only |
| --- | --- | --- |
| `roles` | `["seller"]` or `["buyer","seller"]` | `["buyer"]` |
| `name`, `email`, `password` (min 8) | required | required |
| `mobile` (10-digit Indian, `+91`/spaces allowed) | required | required |
| `business.name`, `business.city`, `business.state` (one of `meta.states`) | required | required |
| `business.type` (one of `meta.businessTypes`) | required | optional |
| `business.categories` (slugs from `meta.categories`) | 1 or more | optional |
| `business.address` | required | optional |
| `business.pincode` (6 digits) | required | optional |
| `business.gstNumber` (15 chars, uppercased, format-checked) | optional | optional |
| `business.yearsInBusiness` | optional | optional |

```bash
curl -X POST http://localhost:3000/api/v1/auth/register -H "Content-Type: application/json" -d '{
  "roles": ["seller"], "name": "Ravi Kumar", "email": "ravi.seller@example.com", "mobile": "9811111111",
  "password": "secret123",
  "business": { "name": "Ravi Rice Mills", "type": "manufacturer", "categories": ["rice-grains"],
    "address": "Plot 4, GT Road", "city": "Karnal", "state": "Haryana", "pincode": "132001", "gstNumber": "06abcde1234f1z5" }
}'
```

201:

```json
{ "data": { "user": { "id": "6ae43628208a8118a0126195", "roles": ["seller"], "…": "see user object" }, "token": "eyJhbGciOiJIUzI1NiJ9…" } }
```

400 (validation; keys of nested fields use dots):

```json
{ "error": { "message": "Enter a valid email", "fields": {
  "email": "Enter a valid email", "mobile": "Enter a 10-digit Indian mobile number", "password": "At least 8 characters",
  "business.type": "Choose a business type", "business.categories": "Choose at least one category",
  "business.address": "Enter your full address", "business.pincode": "Enter a 6-digit pincode" } } }
```

409:

```json
{ "error": { "message": "This email is already registered", "fields": { "email": "This email is already registered", "mobile": "This mobile number is already registered" } } }
```

### POST /auth/login

Auth: public. `identifier` is the email **or** the mobile number. Sets the cookie and returns the token.

```bash
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" \
  -d '{ "identifier": "9822222222", "password": "secret123" }'
```

```json
{ "data": { "user": { "id": "6ae43629208a8118a01261a4", "roles": ["buyer"], "…": "see user object" }, "token": "eyJhbGciOiJIUzI1NiJ9…" } }
```

Errors: 401 `{ "error": { "message": "Incorrect email/mobile or password." } }`, 403 `{ "error": { "message": "Your account is blocked. Please contact support." } }`.

Use the token on every later call:

```bash
curl http://localhost:3000/api/v1/auth/me -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9…"
```

Admins log in with the same endpoint; `roles` contains `admin` (and `superadmin`).

### POST /auth/logout

Auth: public. Clears the web cookie. The app simply deletes its stored token (JWTs are stateless).

```json
{ "data": { "ok": true } }
```

### GET /auth/me

Auth: any. Returns the user object above. 401 if the token is missing/expired, 403 if blocked.

```json
{ "data": { "id": "6ae43629208a8118a01261a4", "name": "Meena Shah", "roles": ["buyer"], "…": "see user object" } }
```

### PATCH /auth/me

Auth: any. Update your own details. Every field is optional; `business` is **merged** into the saved business. `addRole` adds `"buyer"` or `"seller"` (adding `seller` needs the seller fields, either already saved or in this request). Admin accounts may change only `name`, `email`, `mobile`.

```bash
curl -X PATCH http://localhost:3000/api/v1/auth/me -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "addRole": "seller",
  "business": { "type": "wholesaler", "categories": ["pulses"], "address": "5 Crawford Market", "pincode": "400001" }
}'
```

```json
{ "data": { "id": "6ae43629208a8118a01261a4", "roles": ["buyer", "seller"], "business": { "name": "Shah Foods", "type": "wholesaler", "categories": ["pulses"], "address": "5 Crawford Market", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001", "gstNumber": null, "yearsInBusiness": null }, "…": "see user object" } }
```

400 when adding `seller` without the seller fields:

```json
{ "error": { "message": "Choose a business type", "fields": { "business.type": "Choose a business type", "business.categories": "Choose at least one category", "business.address": "Enter your full address", "business.pincode": "Enter a 6-digit pincode" } } }
```

403 for admins sending `business` or `addRole`; 409 if the new email/mobile belongs to someone else.

### POST /auth/change-password

Auth: any. Body `{ "currentPassword": "secret123", "newPassword": "newpass123" }` → `{ "data": { "ok": true } }`.

400 `{ "error": { "message": "Your current password is not correct.", "fields": { "currentPassword": "Not correct" } } }`.

### POST /auth/forgot-password

Auth: public. Body `{ "email": "meena.buyer@example.com" }`. **Always** returns 200 (never reveals whether the email exists). If the account exists and is active, it emails a link `APP_URL/reset-password?token=<64 hex chars>` valid for 1 hour.

```json
{ "data": { "ok": true } }
```

In the app, the link opens the website's reset page (no deep link in v1).

### POST /auth/reset-password

Auth: public. Body `{ "token": "<token from the email link>", "password": "newpass123" }` → `{ "data": { "ok": true } }`. The token works once.

400 `{ "error": { "message": "This reset link is invalid or has expired. Please ask for a new one.", "fields": { "token": "Invalid or expired" } } }`.

---

## Categories, listings & uploads

The **public listing** object (used by every non-admin listing response). The owner is only an alias; no name, contact, business or GST is ever included:

```json
{
  "id": "6ae43aa04eb077eaccb2586b",
  "kind": "offer",
  "title": "Basmati rice 1121, 25 kg bags",
  "category": "rice-grains",
  "description": "Steam basmati, 8.3mm avg length, broken under 1%.",
  "quantity": 2000,
  "unit": "bag",
  "price": 2450,
  "minOrderQuantity": 100,
  "city": "Karnal",
  "state": "Haryana",
  "images": ["https://<store>.public.blob.vercel-storage.com/listings/6ae4…/9f1c….jpg"],
  "status": "active",
  "owner": { "alias": "Seller #68435" },
  "createdAt": "2026-10-30T06:35:12.277Z",
  "updatedAt": "2026-10-30T06:35:12.277Z"
}
```

- `kind`: `offer` (a seller selling) or `requirement` (a buyer needs). Owner alias is `Seller #…` for offers, `Buyer #…` for requirements.
- `price` is per `unit` in INR; `null` means "Price on request". `minOrderQuantity` may be `null`.
- `images[0]` is the cover. Offers have 1–6 photos, requirements 0–6.
- `status`: `active` (live), `closed` (by the owner), `blocked` (by an admin).

### GET /categories

Auth: public. Active categories in display order (same list as `meta.categories`).

```json
{ "data": [ { "id": "6ae433edb48dbeb87a5ec4fb", "name": "Rice & Grains", "slug": "rice-grains", "order": 0, "examples": "Basmati, non-basmati, wheat, maize, millets" } ] }
```

### POST /uploads

Auth: user or admin. One image per call, `multipart/form-data` with the field **`file`**. JPEG, PNG or WebP, max 4 MB (`meta.uploads`). Stored on Vercel Blob; returns the public URL to put in a listing's `images`.

```bash
curl -X POST http://localhost:3000/api/v1/uploads -H "Authorization: Bearer $TOKEN" -F "file=@rice.jpg;type=image/jpeg"
```

201:

```json
{ "data": { "url": "https://<store>.public.blob.vercel-storage.com/listings/6ae43628208a8118a0126195/9f1c2b7e4d0a5c3e8b6f1a2d.jpg" } }
```

Errors: 400 `{ "error": { "message": "Upload a JPG, PNG or WebP image.", "fields": { "file": "…" } } }`, 413 (over 4 MB), 401, and **503** when image storage is not configured:

```json
{ "error": { "message": "Image uploads are not set up yet (BLOB_READ_WRITE_TOKEN is missing). Please try again later." } }
```

App flow: compress/resize on the device (the website resizes to max 1600 px JPEG), upload each photo, collect the URLs, then send them in `POST /listings`. Photo URLs that are not on the Blob store are rejected.

### GET /listings

Auth: public. Active listings only (blocked owners and closed/blocked listings never appear), newest first, paginated.

Query: `kind` (`offer`|`requirement`), `category` (slug), `q` (matches title, description, city), `state` (exact, from `meta.states`), `city`, `page`, `limit` (max 50).

```bash
curl "http://localhost:3000/api/v1/listings?kind=offer&q=basmati&limit=5"
```

```json
{ "data": [ { "id": "6ae43aa04eb077eaccb2586b", "kind": "offer", "title": "Basmati rice 1121, 25 kg bags", "owner": { "alias": "Seller #68435" }, "…": "public listing object" } ], "page": 1, "limit": 5, "total": 1 }
```

### GET /listings/:id

Auth: public (token optional). One active listing. If the token belongs to the **owner**, their own closed or blocked listing is returned too (for the edit screen). Otherwise 404 `{ "error": { "message": "This listing is not available." } }`.

### POST /listings

Auth: `seller` for `kind: "offer"`, `buyer` for `kind: "requirement"` (403 otherwise). Live immediately.

```bash
curl -X POST http://localhost:3000/api/v1/listings -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "kind": "offer", "title": "Basmati rice 1121, 25 kg bags", "category": "rice-grains",
  "description": "Steam basmati, 8.3mm avg length, broken under 1%.",
  "quantity": 2000, "unit": "bag", "price": 2450, "minOrderQuantity": 100,
  "city": "Karnal", "state": "Haryana",
  "images": ["https://<store>.public.blob.vercel-storage.com/listings/…/9f1c….jpg"]
}'
```

| Field | Rule |
| --- | --- |
| `kind` | `offer` or `requirement` |
| `title` | 5–120 chars |
| `category` | an active category slug |
| `description` | 10–3000 chars |
| `quantity` | > 0 |
| `unit` | one of `meta.units` |
| `price` | optional, > 0 (omit for "price on request") |
| `minOrderQuantity` | optional, > 0, ≤ `quantity` |
| `city`, `state` | required; `state` from `meta.states` |
| `images` | Blob URLs from `/uploads`, max 6; offers need at least 1 |

201 → public listing object. 400 example:

```json
{ "error": { "message": "Add at least one photo", "fields": { "images": "Add at least one photo" } } }
```

403 example: `{ "error": { "message": "Only buyers can post requirements. Add the buyer role in your profile." } }`.

### PATCH /listings/:id

Auth: owner (404 for anyone else). Any subset of the POST fields except `kind`; `price: null` / `minOrderQuantity: null` clear them. `status` may be `active` or `closed`. A listing **blocked by an admin cannot be re-opened** by the owner (403).

```bash
curl -X PATCH http://localhost:3000/api/v1/listings/6ae43aa04eb077eaccb2586b -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{ "price": 2400, "status": "closed" }'
```

200 → public listing object.

### DELETE /listings/:id

Auth: owner. Hard delete if nobody has shown interest yet; otherwise the listing is closed (enquiries keep their history).

```json
{ "data": { "deleted": true, "closed": false } }
```

### GET /me/listings

Auth: user. Your own listings, all statuses, newest first. Query: `kind`, `status`, `page`, `limit`.

```json
{ "data": [ { "id": "6ae43aa04eb077eaccb2586b", "status": "closed", "…": "public listing object" } ], "page": 1, "limit": 20, "total": 1 }
```

### GET /listings/:id — `viewer` field

When the request carries a token, the response also includes:

```json
{ "data": { "id": "6ae43aa04eb077eaccb2586b", "…": "public listing object", "viewer": { "isOwner": false, "enquiryId": "6ae44d81546769ba4191968d" } } }
```

Use it to decide the button: `isOwner` → hide "I'm interested"; `enquiryId` not null → show "Interest sent".

---

## Interest (enquiries) & notifications

The **party enquiry** object (what buyers/sellers see). Never contains the other side's name/contacts or the admin's notes. `status` is the **party status**: `received` | `in_discussion` | `deal_done` | `closed` (labels in `meta.enquiryPartyStatuses`).

```json
{
  "id": "6ae44d81546769ba4191968d",
  "listingId": "6ae43aa04eb077eaccb2586b",
  "listingKind": "offer",
  "listingTitle": "Basmati rice 1121, 25 kg bags",
  "quantity": 500,
  "message": "Need 500 bags, Mumbai delivery",
  "myRole": "buyer",
  "counterparty": { "alias": "Seller #68435" },
  "status": "in_discussion",
  "dealId": null,
  "createdAt": "2026-10-30T07:55:45.486Z",
  "updatedAt": "2026-10-30T07:56:02.113Z"
}
```

### POST /enquiries

Auth: user. "I'm interested". Rules (README §5): on an **offer** you need the `buyer` role, on a **requirement** the `seller` role; not your own listing; the listing must be active; once per listing. Notifies all active admins (bell + email).

```bash
curl -X POST http://localhost:3000/api/v1/enquiries -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{ "listingId": "6ae43aa04eb077eaccb2586b", "quantity": 500, "message": "Need 500 bags, Mumbai delivery" }'
```

201 → party enquiry object (`status: "received"`).

| Status | Example message |
| --- | --- |
| 400 | `{ "error": { "message": "Enter the quantity you want", "fields": { "quantity": "Enter the quantity you want" } } }` |
| 403 | `"You cannot show interest in your own listing."` / `"Only buyers can show interest in offers. Add the buyer role in your profile."` |
| 404 | `"This listing is not available."` |
| 409 | `"You have already shown interest in this listing."` / `"This listing is closed and no longer takes interest."` |

### GET /me/enquiries

Auth: user. Enquiries **you sent**, newest first. Query: `status` (party key), `listingId`, `page`, `limit`.

```json
{ "data": [ { "id": "6ae44d81546769ba4191968d", "status": "in_discussion", "counterparty": { "alias": "Seller #68435" }, "…": "party enquiry object" } ], "page": 1, "limit": 20, "total": 1 }
```

### GET /notifications

Auth: any. Your in-app notifications, newest first, plus `unreadCount`. Query: `unread=1`, `page`, `limit`. Poll every 30 s (push notifications are planned for later).

```json
{
  "data": [
    { "id": "6ae44d87546769ba419196b0", "type": "enquiry_new", "title": "New enquiry: Need 20 tonne toor dal", "body": "Seller wants 20 tonne", "link": "/admin/enquiries/6ae44d87546769ba419196a7", "read": false, "createdAt": "2026-10-30T07:55:51.902Z" }
  ],
  "page": 1, "limit": 10, "total": 2, "unreadCount": 2
}
```

`type`: `enquiry_new`, `deal_created`, `payment_added`, `shipment_update`, `deal_completed`, `system`. `link` is a **website path**; the app can map it (`/dashboard/deals/<id>` → deal screen, `/dashboard/enquiries` → enquiries screen).

### POST /notifications/read

Auth: any. Body `{ "ids": ["6ae44d87546769ba419196b0"] }` marks those; an empty body or `{}` marks **all** as read.

```json
{ "data": { "updated": 2, "unreadCount": 0 } }
```

### POST /contact

Auth: public. Website contact form → emails the Doctraders team.

```bash
curl -X POST http://localhost:3000/api/v1/contact -H "Content-Type: application/json" -d '{ "name": "Asha", "email": "asha@example.com", "message": "Do you cover Assam tea?" }'
```

201 `{ "data": { "ok": true } }`; 400 with `fields` for bad input.

---

## Admin: enquiries & stats

All `/admin/*` endpoints need an `admin` or `superadmin` token (403 otherwise) and are the **only** endpoints that return contact details.

The **admin enquiry** object:

```json
{
  "id": "6ae44d81546769ba4191968d",
  "listingId": "6ae43aa04eb077eaccb2586b",
  "listingKind": "offer",
  "listingTitle": "Basmati rice 1121, 25 kg bags",
  "listing": { "id": "6ae43aa04eb077eaccb2586b", "title": "Basmati rice 1121, 25 kg bags", "enquiryCount": 2, "owner": { "alias": "Seller #68435", "id": "6ae4…", "name": "Ravi Kumar", "mobile": "9811111111", "…": "contact card" }, "…": "listing fields" },
  "fromUserId": "6ae43629208a8118a01261a4",
  "fromRole": "buyer",
  "quantity": 500,
  "message": "Need 500 bags, Mumbai delivery",
  "status": "spoken",
  "buyer": {
    "id": "6ae43629208a8118a01261a4", "name": "Meena Shah", "email": "meena.buyer@example.com", "mobile": "9822222222",
    "status": "active", "publicCode": "92729", "businessName": "Shah Foods", "businessType": "wholesaler",
    "address": "5 Crawford Market", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001", "gstNumber": null
  },
  "seller": { "id": "6ae43628208a8118a0126195", "name": "Ravi Kumar", "…": "contact card" },
  "notes": [ { "id": "6ae44d98546769ba419196cc", "text": "Spoke to seller, price 2,400 final.", "byId": "6ae433ed…", "byName": "Harsha", "at": "2026-10-30T07:56:08.467Z" } ],
  "statusHistory": [ { "status": "spoken", "byId": "6ae433ed…", "at": "2026-10-30T07:56:02.113Z" }, { "status": "new", "byId": "6ae43629…", "at": "2026-10-30T07:55:45.486Z" } ],
  "dealId": null,
  "createdAt": "2026-10-30T07:55:45.486Z",
  "updatedAt": "2026-10-30T07:56:08.470Z"
}
```

`notes` and `statusHistory` are latest first. In list responses `listing` is `null` and `notes`/`statusHistory` are empty (open the detail for them).

### GET /admin/stats

```json
{
  "data": {
    "enquiries": { "new": 1, "inDiscussion": 1, "byStatus": { "new": 1, "contacted": 0, "spoken": 1, "negotiating": 0, "deal_closed": 0, "dropped": 0 }, "total": 2 },
    "deals": { "active": 0, "completed": 0, "cancelled": 0, "activeValue": 0 },
    "commission": { "pendingAmount": 0, "dueAmount": 0, "dueCount": 0, "paidAmount": 0, "paidCount": 0 },
    "users": { "total": 3, "buyers": 2, "sellers": 3, "blocked": 0 },
    "listings": { "active": 3, "activeOffers": 2, "activeRequirements": 1, "closed": 0, "blocked": 0, "total": 3 }
  }
}
```

### GET /admin/enquiries

Query: `status` (one of `meta.enquiryStatuses`), `q` (listing title, buyer/seller name, business, mobile, email), `page`, `limit`. Extra `counts` per status (for the tabs; they respect `q` but not `status`).

```json
{ "data": [ { "id": "6ae44d81546769ba4191968d", "status": "new", "buyer": { "name": "Meena Shah", "mobile": "9822222222", "…": "" }, "seller": { "…": "" }, "…": "admin enquiry object" } ],
  "page": 1, "limit": 20, "total": 2,
  "counts": { "all": 2, "new": 1, "contacted": 0, "spoken": 1, "negotiating": 0, "deal_closed": 0, "dropped": 0 } }
```

### GET /admin/enquiries/:id

Full admin enquiry object (with `listing`, notes and history). 404 if not found.

### PATCH /admin/enquiries/:id

Body `{ "status": "contacted" | "spoken" | "negotiating" | "dropped" | "new" }`. The admin may move freely; `deal_closed` is only set by creating a deal (400 if sent). 409 once a deal exists. Returns the full admin enquiry.

```json
{ "error": { "message": "Use “Convert to deal” to close a deal", "fields": { "status": "Use “Convert to deal” to close a deal" } } }
```

### POST /admin/enquiries/:id/notes

Body `{ "text": "Spoke to seller, price ₹2,400 final." }` → 201 with the full admin enquiry (new note first in `notes`).
