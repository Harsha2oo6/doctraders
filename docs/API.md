# Doctraders REST API (v1)

The website and the Android/iOS app use **the same endpoints**. This file is the contract: every endpoint has its method, path, auth, body and a real response example. It is updated in the same commit as the code.

- [Conventions](#conventions)
- [System](#system): health, meta
- [Auth & profile](#auth--profile): register, login, logout, me, change/forgot/reset password
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
