# Doctraders — Design System

This file is the **single source of truth for how Doctraders looks**. It was written from the existing code (`theme.css`, `components/ui/*`, every page and shell), so following it reproduces the **same UI and theme**. New screens (enquiry inbox, deal tracking, uploads, notifications…) must be built **only** from the tokens, components and patterns below.

> Note: the old README said "navy and gold". That is out of date. The real theme is **deep crimson + warm stone neutrals + teal trust colour**, as defined below.

**Rules for the agent**
1. Use Tailwind classes with the tokens in section 2. **Never hard-code hex colours** in components (charts are the only exception, see 9.6).
2. Reuse the components in section 4 before creating anything new. If a new component is needed, build it from the patterns in section 6 and add it to `src/components/ui`.
3. Keep the class strings in this file **exactly** when building the same element.

---

## 1. Look & feel

- **Alibaba-style B2B marketplace**: dense but calm. A white header with a big pill-shaped search bar, a categories mega-menu, product cards in tight grids, light bordered panels on a warm paper background.
- **Warm, not cold**: neutrals are warm stone/beige (`ink-*`), the page background is `paper` (#f7f4ef), and white cards sit on top of it.
- **One strong accent**: deep crimson (`brand-*`) for primary actions, links on hover, and highlights. Dark warm charcoal (`ink-900`) for sidebars, dark bands and secondary buttons.
- **Trust colour**: teal (`verified` / `info`) for trust signals (checkmarks, icons in trust lists).
- **Flat with soft depth**: 1px borders (`ink-100`) plus one soft shadow (`shadow-card`) used for cards and on hover. No gradients except the two hero/RFQ banners.
- **Rounded but not bubbly**: controls and panels `rounded-lg` (8px), cards `rounded-xl` (12px), marketing CTAs and search are **pills** (`rounded-full`).

---

## 2. Design tokens

All tokens live in `src/app/theme.css` (Tailwind v4 `@theme`). The full file is in **Appendix A**. Tailwind generates `bg-*`, `text-*`, `border-*`, `ring-*` etc. from them.

### 2.1 Colours

**Ink (warm stone neutrals)**: text, borders, surfaces, dark UI

| Token | Hex | Used for |
| --- | --- | --- |
| `ink-50` | `#faf8f5` | Subtle fills: table header, hover rows, utility bar, inactive pills, icon tiles, the auth page background |
| `ink-100` | `#f0ece6` | **Default border** for cards/panels/dividers, light gradient end, big step numbers |
| `ink-200` | `#e1dbd2` | **Input borders**, outline buttons, footer top border, secondary text on dark |
| `ink-300` | `#c9c1b5` | Placeholders, chevrons, empty-image icons, muted text on dark |
| `ink-400` | `#9d9588` | Stat labels, empty table text, disabled pills, hints |
| `ink-500` | `#726b60` | **Secondary text** (meta, descriptions, captions) |
| `ink-600` | `#544e45` | Body text in panels, footer links |
| `ink-700` | `#3d3832` | Strong body text, nav links |
| `ink-800` | `#2a2622` | Sidebar hover/active background, header text |
| `ink-900` | `#1c1916` | **Headings**, sidebars, dark bands, secondary button, done pills |
| `ink-950` | `#12100e` | Deepest text/hover |

**Brand (deep crimson)**

| Token | Hex | Used for |
| --- | --- | --- |
| `brand-50` | `#fdf3f2` | Hover backgrounds in menus/category lists, soft notice boxes |
| `brand-100` | `#fbe1df` | Icon circles, "brand" badge background, hover on notice boxes |
| `brand-200` | `#f5bdb9` | (spare) |
| `brand-300` | `#ec8d87` | **Active item text on dark sidebars**, eyebrow on dark, icons on dark circles |
| `brand-400` | `#de5a54` | "Admin" label under the logo in the admin sidebar |
| `brand-500` | `#c8262f` | **Main brand**: search border + button, logo "traders", focus ring, input focus border, spinner, current step |
| `brand-600` | `#a81c25` | **Primary button background**, eyebrows, link hover, check icons |
| `brand-700` | `#85161d` | Primary button hover, "brand" badge text, gradient start, notice text |

**Accent & semantic**

| Token | Hex | Used for |
| --- | --- | --- |
| `sand-300` | `#f3d9a4` | Highlight words on red backgrounds (hero "Zero Joining Fee.") |
| `verified` | `#0f766e` | Teal trust colour (verified badge text) |
| `verified-soft` | `#e2f3f0` | Verified badge background |
| `info` | `#0f766e` | Trust icons in lists |
| `success` | `#15803d` | Success text/icons (badge text on `bg-green-100`, success messages on `bg-green-50`) |
| `danger` | `#c62828` | Errors, danger button, danger badge text (on `bg-red-100`) |
| `warning` | `#b45309` | Warnings, warning badge text (on `bg-amber-100`) |
| `paper` | `#f7f4ef` | **Page background** (`body`) |
| `ink` | `#1c1916` | Default body text colour |

Tailwind defaults `green-50/100/300`, `red-100/800`, `amber-100` are used only as the soft backgrounds of semantic badges/messages (see 4.6).

### 2.2 Typography

- **Font**: Inter via `next/font/google` (`variable: "--font-inter"`), set on `<html>`. Both `--font-sans` and `--font-serif` map to Inter, so `font-serif` (used on Stat values) is still Inter.
- **Root size**: `html { font-size: 15px }`, so `text-sm` ≈ 13px, `text-base` = 15px, and everything is a bit denser than default Tailwind.
- Headings `h1, h2, h3` have `letter-spacing: -0.01em`. Body has `-webkit-font-smoothing: antialiased`.

| Role | Classes |
| --- | --- |
| Hero headline | `text-3xl font-bold leading-[1.1] sm:text-5xl` |
| Inner page title (PageIntro) | `text-3xl font-bold text-ink-900 sm:text-4xl` |
| Dashboard/admin page title (PageHeader) | `text-2xl font-semibold text-ink-900 sm:text-3xl` |
| Auth page title | `text-3xl font-semibold text-ink-900` |
| Home section title | `text-xl font-bold text-ink-900 sm:text-2xl` |
| Section heading (SectionHeading) | `text-3xl font-semibold sm:text-4xl` |
| Content h2 (audience/legal) | `text-2xl font-semibold text-ink-900` |
| Card title | `text-lg font-semibold text-ink-900` |
| Form section title | `text-xl font-semibold text-ink-900` |
| Eyebrow (light bg) | `text-xs font-semibold uppercase tracking-wider text-brand-600` |
| Eyebrow (dark/red bg) | `text-xs font-semibold uppercase tracking-wider text-white/80` or `text-brand-300` |
| Stat label | `text-xs font-medium uppercase tracking-wide text-ink-400` |
| Stat value | `font-serif text-3xl font-semibold text-ink-900` |
| Body | `text-base text-ink-600` (intro), `text-sm text-ink-600/700` (panels) |
| Meta / caption | `text-xs text-ink-500` |
| Label | `text-sm font-medium text-ink-900` |

### 2.3 Spacing, sizes, layout

- **Container**: `mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-10`. Use it on every full-width row.
- **Section rhythm**: marketing sections `py-16 sm:py-20`; home blocks are stacked with `mt-12` (first row after hero `mt-4`, RFQ `mt-8`); PageIntro `py-10 sm:py-14`; footer starts `mt-16`.
- **Card padding**: `p-5` (CardBody), header `px-5 py-4`; forms inside cards `p-6`; status/confirmation cards `p-8 text-center`.
- **Grids**: product grids `gap-3`; card grids `gap-4`; forms `gap-4`, stacked fields `space-y-4`.
- **Control heights**: inputs/selects `h-10`; buttons `h-8` (sm) / `h-10` (md) / `h-12` (lg); search bar `h-11`; header `h-16`; utility bar `h-8`; nav strip `h-11`.
- **Sidebar width** (dashboard + admin): `16rem` (`lg:grid-cols-[16rem_1fr]`).

### 2.4 Radius, borders, shadow

| Token | Value | Used for |
| --- | --- | --- |
| `rounded-lg` | 8px | Inputs, buttons, marketing panels, menus, product cards, notices |
| `rounded-xl` | 12px | `Card`, DataTable wrapper, EmptyState |
| `rounded-full` | pill | Badges, search bar, marketing CTAs, stage pills, icon circles, avatars |
| `rounded-md` | 6px | Menu items inside dropdowns |
| Border | `border border-ink-100` | Every card/panel; dividers `divide-ink-100`; inputs `border-ink-200` |
| `shadow-card` | `0 1px 2px rgb(28 25 22 / .05), 0 6px 18px rgb(28 25 22 / .08)` | `Card`, DataTable, dropdown panels, hover on product cards/tiles |

### 2.5 Focus & motion

- Global focus: `:focus-visible { outline: 2px solid var(--color-brand-500); outline-offset: 2px }`. Inputs also switch to `focus-visible:border-brand-500`.
- Transitions: `transition` / `transition-colors` with `duration-150` for dropdowns (fade + `translate-y-1 → 0`). Hover zoom on card icons: `group-hover:scale-110`. Chevron rotate: `group-hover:rotate-180`. FAQ "+" rotates 45° when open. Spinner `animate-spin`. No other animation.

---

## 3. Iconography

- Library: **lucide-react** only.
- Sizes: inline with text `size-4` (or `size-3.5` in small meta); list items `size-5`; trust/benefit circles hold `size-5` icons in `size-10` circles; category tiles `size-7` in `size-14` circles; empty product image `size-14`; status screens `size-12`.
- Stroke: default 2; categories `strokeWidth={1.6}` (menus) / `1.5` (tiles) / `1.2` (card placeholder).
- Category icons (`components/category-icon.tsx`): map a slug to an icon, fallback `Package`. For the new agro categories use: Rice & Grains `Wheat`, Pulses `Bean`, Spices `Flame`, Oilseeds & Edible Oil `Droplet`, Fruits & Vegetables `Apple`, Sugar & Jaggery `Candy`, Dry Fruits & Nuts `Nut`, Tea & Coffee `Coffee`, Animal Feed `Beef`, Fertilizers & Seeds `Sprout`, Other `Package`.
- Common icons: Search, MapPin, ChevronDown/Right, Menu, X, Check, CheckCircle2, BadgeCheck, ShieldCheck, Ban, Wallet, Handshake, LayoutDashboard, PlusCircle, Inbox, LogOut, Users, ListChecks, FolderTree, Bell, Phone, MessageCircle (WhatsApp), Mail, Package, Truck, UploadCloud, Trash2, Pencil, ArrowLeft, Plus.

---

## 4. Core components (`src/components/ui`)

### 4.1 Button

`cva` base:
```
inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors
disabled:pointer-events-none disabled:opacity-50 cursor-pointer
```

| Variant | Classes | Use |
| --- | --- | --- |
| `primary` (default) | `bg-brand-600 text-white hover:bg-brand-700` | Main action per screen |
| `secondary` | `bg-ink-900 text-white hover:bg-ink-800` | Strong neutral action ("Source as a buyer", "Mark commission paid") |
| `outline` | `border border-ink-200 bg-white text-ink-900 hover:bg-ink-50` | Back, Cancel, secondary row actions, Block/Unblock |
| `ghost` | `text-ink-900 hover:bg-ink-50` | Low-emphasis (Remove in lists, icon buttons) |
| `danger` | `bg-danger text-white hover:bg-red-800` | Reject, Cancel deal, Delete |
| `link` | `text-ink-700 underline-offset-4 hover:underline` | Inline text actions |

| Size | Classes |
| --- | --- |
| `sm` | `h-8 px-3 text-sm` (table rows, card actions) |
| `md` (default) | `h-10 px-4 text-sm` |
| `lg` | `h-12 px-6 text-base` (hero/CTA band) |

- `asChild` renders a `<Link>` with button styles (Radix Slot).
- **Pill rule**: on **public marketing pages** CTAs add `rounded-full` (Join free, Sign in, Browse listings, View filters…). **Inside dashboard/admin** buttons keep `rounded-lg`.
- On red backgrounds: white pill `rounded-full bg-white px-7 text-brand-700 hover:bg-ink-50`, ghost-outline pill `rounded-full border-white/70 bg-transparent px-7 text-white hover:bg-white/10`.
- Loading: keep the button, set `disabled`, change label to "Saving…", "Signing in…", "Submitting…".
- Icon + text: icon `size-4` first (`<Plus className="size-4" />Add`).

### 4.2 Form controls

Shared control class:
```
w-full rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink placeholder:text-ink-300
focus-visible:border-brand-500 disabled:bg-ink-50
```
- `Input`, `Select`: + `h-10`. `Textarea`: + `min-h-24 py-2`.
- `Field` (label + control + hint/error):
  - wrapper `block space-y-1.5`
  - label `text-sm font-medium text-ink-900`
  - hint `block text-xs text-ink-400` (hidden when there is an error)
  - error `block text-xs text-danger` with `role="alert"`
  - **Required fields**: append ` *` in `text-danger` to the label; optional fields append `(optional)` in `text-xs text-ink-400` (same as the old file-upload row).
- `Checkbox`: `flex items-start gap-2 text-sm text-ink-800`, box `mt-0.5 size-4 accent-ink-900`, error below `mt-1 block text-xs text-danger`.
- Radios (filters): `flex items-center gap-2` + `accent-ink-900`.
- Form layouts: two columns `grid gap-4 sm:grid-cols-2`, full-width fields `sm:col-span-2`. Actions row: `flex justify-end` (single) or `flex justify-between` (Back + Continue). Forms use `noValidate`; validation messages come from Zod.
- Server/form-level error: `<p role="alert" className="text-sm text-danger">…</p>` above the submit button.
- Success message inline: `rounded-lg bg-green-50 p-4 text-success`.

### 4.3 Card family

```
Card       rounded-xl border border-ink-100 bg-white shadow-card
CardHeader border-b border-ink-100 px-5 py-4      (may add: flex items-center justify-between)
CardTitle  text-lg font-semibold text-ink-900
CardBody   p-5                                     (lists inside: divide-y divide-ink-100 p-0)
```
- **List inside a card**: `CardBody className="divide-y divide-ink-100 p-0"`, rows `flex items-center justify-between gap-3 px-5 py-3 text-sm`, clickable rows `hover:bg-ink-50`. Empty: `<p className="p-5 text-sm text-ink-500">Nothing pending.</p>`.
- **Stat**: Card > CardBody with label (`text-xs font-medium uppercase tracking-wide text-ink-400`), value (`mt-1 font-serif text-3xl font-semibold text-ink-900`), optional hint (`mt-1 text-xs text-ink-400`). Stat rows: `grid gap-4 sm:grid-cols-2 lg:grid-cols-4` (or `sm:grid-cols-3`).
- **Definition list (details)**: `dl className="grid gap-3 text-sm sm:grid-cols-2"`, `dt text-ink-500`, `dd font-medium text-ink-900`. Compact key/value table: `dl divide-y divide-ink-100 rounded-lg border border-ink-100 text-sm`, rows `flex justify-between gap-4 px-4 py-2`, value `text-right font-medium text-ink-900`.
- **Marketing panels** (not `Card`): `rounded-lg border border-ink-100 bg-white p-5` (no shadow; `hover:shadow-card` when clickable).

### 4.4 Badge & StatusBadge

Base: `inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold`

| Tone | Classes |
| --- | --- |
| `neutral` | `bg-ink-50 text-ink-700` |
| `brand` | `bg-brand-100 text-brand-700` |
| `verified` | `bg-verified-soft text-verified` |
| `success` | `bg-green-100 text-success` |
| `danger` | `bg-red-100 text-danger` |
| `warning` | `bg-amber-100 text-warning` |

`StatusBadge` maps a status key to a tone and shows a **label**. For v1 it must use this map (labels come from `src/lib/constants.ts`; never show raw `deal_closed`):

| Domain | Status → tone (label) |
| --- | --- |
| Account | `active` → success (Active), `blocked` → danger (Blocked) |
| Listing | `active` → success (Live), `closed` → neutral (Closed), `blocked` → danger (Blocked by admin) |
| Listing kind | `offer` → brand (Offer), `requirement` → neutral (Requirement) |
| Enquiry (admin) | `new` → brand (New), `contacted` → warning (Contacted), `spoken` → warning (Spoken), `negotiating` → warning (Negotiating), `deal_closed` → success (Deal closed), `dropped` → neutral (Dropped) |
| Enquiry (party) | Received → brand, In discussion → warning, Deal done → success, Closed → neutral |
| Deal | `active` → brand (Active), `completed` → success (Completed), `cancelled` → danger (Cancelled) |
| Commission | `pending` → neutral (Pending), `due` → warning (Due), `paid` → success (Paid) |
| Shipment | `packed` → neutral (Packed), `shipped` → warning (Shipped), `reached` → success (Reached) |
| Roles | `buyer` → neutral (Buyer), `seller` → brand (Seller), `admin` → verified (Admin), `superadmin` → verified (Super admin) |

Implement `StatusBadge({ status, domain })` (or separate maps) so `active` can differ by domain. Use `capitalize` only for fallback raw values.

**VerifiedBadge** (`BadgeCheck size-3.5` + "Verified", tone verified): **not used in v1** (no verification). If a neutral member mark is needed, use `Badge tone="neutral"` "Member".

### 4.5 Logo

Text wordmark: `text-2xl font-extrabold tracking-tight`, "Doc" in `text-ink-900` (or `text-white` with `dark`), "traders" in `text-brand-500`. Replace with an image later without changing size.

### 4.6 Layout helpers

| Component | Classes / behaviour |
| --- | --- |
| `Container` | see 2.3 |
| `Section` | `py-16 sm:py-20`, tones: `light` (transparent on paper), `white` (`bg-white`), `dark` (`bg-ink-900 text-white`) |
| `SectionHeading` | wrapper `mb-10 max-w-2xl` (+`mx-auto text-center`), eyebrow `mb-2 text-sm font-semibold uppercase tracking-wider text-brand-500`, title `text-3xl font-semibold sm:text-4xl`, text `mt-3 text-base text-ink-600` (`text-ink-200` on dark) |
| `PageHeader` | `mb-6 flex flex-wrap items-end justify-between gap-3`; title (2.2), description `mt-1 text-sm text-ink-500`, `actions` on the right |
| `EmptyState` | `rounded-xl border border-dashed border-ink-200 bg-white p-10 text-center`, title `font-semibold text-ink-900`, text `mt-1 text-sm text-ink-500`. v1: may take an `action` (a Button) below the text |
| `Spinner` | `flex items-center justify-center gap-2 p-10 text-sm text-ink-500` + circle `size-4 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500` + "Loading…" |

### 4.7 DataTable (admin lists)

TanStack table with search, sort and pagination:
- Search input above: `max-w-xs bg-white`.
- Wrapper: `overflow-x-auto rounded-xl border border-ink-100 bg-white shadow-card`.
- Table `w-full text-left text-sm`; thead `bg-ink-50 text-xs uppercase tracking-wide text-ink-500`; th `whitespace-nowrap px-4 py-3 font-semibold`; sortable headers are buttons with `ArrowUp/ArrowDown size-3`.
- Body `divide-y divide-ink-100`; row `hover:bg-ink-50/50`; td `px-4 py-3 align-middle`. Empty row: `px-4 py-8 text-center text-ink-400` "No results".
- Footer: `flex items-center justify-between text-xs text-ink-500`, "Page x of y", outline `sm` buttons with `ChevronLeft/Right size-4`.
- Default page size 8. In v1, when the API paginates on the server, keep the same footer look and drive it from API `page/total`.
- First column bold: `font-medium`. Row actions: `flex gap-2` of `size="sm"` buttons (`outline` / `danger`). Clickable rows link to detail.

---

## 5. App components & layouts

### 5.1 Site header (public)

Sticky white header: `sticky top-0 z-50 bg-white shadow-[0_1px_0_0_var(--color-ink-100)]`. Three rows:

1. **Utility bar** (md+): `border-b border-ink-100 bg-ink-50 text-xs text-ink-600`, `h-8`, left text "Free registration. **Commission only after your deal is completed.**" (highlight `font-semibold text-brand-600`), right links Help & FAQ, Contact. (Remove the old "Demo pages" dropdown.)
2. **Main bar** `h-16 flex items-center gap-3 md:gap-6`: mobile menu button (`grid size-10 place-items-center rounded-lg lg:hidden`, Menu/X) → Logo → **search pill** (md+) → account area.
   - Search pill: `h-11 flex-1 overflow-hidden rounded-full border-2 border-brand-500`. Left: category select on `bg-ink-50` with right border `border-ink-100`, `pl-4 pr-9 text-sm`, ChevronDown `absolute right-3 size-4 text-ink-500`. Middle: input `min-w-0 flex-1 px-4 text-sm outline-none`, placeholder "What are you looking for?". Right: button `bg-brand-500 px-7 text-sm font-semibold text-white hover:bg-brand-600` with Search icon.
   - Account area (logged out): "Sign in" dropdown (Sign in / Join free) + `Button rounded-full` "Join free". **Logged in**: notifications bell + "Dashboard" (or "Admin") link + avatar dropdown (Profile, Logout) in the same text style `text-sm font-medium text-ink-800`.
3. **Nav strip** (lg+): `border-t border-ink-100`, `h-11 flex items-stretch gap-7`. First item is the dark **All categories** block `-ml-px flex items-center gap-2 bg-ink-900 px-4 text-sm font-semibold text-white` (LayoutGrid icon + ChevronDown) with a **mega menu** (`grid w-136 grid-cols-2 gap-1 rounded-b-lg border border-ink-100 bg-white p-3 shadow-card`; items `flex items-start gap-3 rounded-md p-3 hover:bg-brand-50`, icon `mt-0.5 size-5 text-brand-600`, name `text-sm font-semibold text-ink-900`, examples `text-xs text-ink-500`; footer link "View all categories →" `col-span-2 mt-1 border-t border-ink-100 px-3 pt-3 text-sm font-semibold text-brand-600`). Then links `text-sm font-medium text-ink-700 hover:text-brand-600`: Browse listings, Buyers ▾, Sellers ▾, How It Works, Help ▾, About ▾ (no Logistics in v1).
- **Dropdown pattern** (pure CSS): wrapper `group relative`; panel `invisible absolute top-full z-50 translate-y-1 opacity-0 transition duration-150` + `group-hover:visible group-hover:translate-y-0 group-hover:opacity-100` (+ same with `group-focus-within`); inner `min-w-56 rounded-b-lg border border-ink-100 bg-white p-2 shadow-card`; item `block rounded-md px-3 py-2 hover:bg-brand-50` with label `text-sm font-medium text-ink-900` and optional hint `text-xs text-ink-500`.
- **Mobile menu**: `max-h-[75vh] overflow-y-auto border-t border-ink-100 bg-white lg:hidden`; search pill (smaller, icon-only button) then stacked links `block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-800 hover:bg-ink-50`.

### 5.2 Site footer

`mt-16 border-t border-ink-200 bg-white text-ink-600`. Grid `gap-8 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]`: Logo + one-line pitch (`mt-4 max-w-xs text-sm`), then 4 link columns (title `text-sm font-semibold text-ink-900`, list `mt-3 space-y-2 text-sm`, links `hover:text-brand-600`). Bottom strip `border-t border-ink-100 bg-ink-50`, `space-y-1 py-5 text-xs text-ink-500`: disclaimer line + "© {year} Doctraders. All rights reserved."

### 5.3 PageIntro (inner public pages)

`border-b border-ink-100 bg-white py-10 sm:py-14` > Container: eyebrow (`text-xs font-semibold uppercase tracking-wider text-brand-600`), title `mt-2 max-w-3xl text-3xl font-bold text-ink-900 sm:text-4xl`, intro `mt-3 max-w-2xl text-base text-ink-600`.

### 5.4 CtaBand

`bg-ink-900 py-14 text-white`, Container `flex flex-wrap items-center justify-between gap-6`; title `text-2xl font-bold sm:text-3xl`, sub `mt-1 text-ink-200`; `Button size="lg" className="rounded-full px-8"` "Join free". Placed at the bottom of every inner marketing page.

### 5.5 AudiencePage (Buyers / Sellers)

PageIntro → `Section tone="white"` with `grid gap-12 lg:grid-cols-2`: two lists ("What you get", "Who can register"), h2 `text-2xl font-semibold text-ink-900`, items `flex gap-3 text-ink-700` with `Check mt-0.5 size-5 shrink-0 text-brand-600`. Notice box `mt-6 rounded-lg bg-brand-50 p-4 text-sm text-brand-700`. Then CtaBand.

### 5.6 LegalPage

PageIntro (eyebrow "Legal") → `Section tone="white"` → `Container mx-auto max-w-3xl space-y-4 text-ink-700` with nested h2 style `[&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink-900`. Draft notice `rounded-lg bg-brand-50 p-3 text-sm text-brand-700`.

### 5.7 FAQ accordion

`Container mx-auto max-w-3xl divide-y divide-ink-100`; each `<details className="group py-4">`, summary `flex cursor-pointer list-none items-center justify-between font-semibold text-ink-900` with "+" `text-brand-600 transition group-open:rotate-45`; answer `mt-2 text-ink-600`.

### 5.8 Numbered steps (How it works)

Vertical: `ol mx-auto max-w-3xl space-y-6`, item `flex gap-4`, number circle `grid size-10 shrink-0 place-items-center rounded-full bg-brand-500 font-bold text-ink-950`, title `font-sans text-lg font-semibold text-ink-900`, text `mt-1 text-ink-600`.
Home cards: `grid gap-3 sm:grid-cols-2 lg:grid-cols-4`, card `rounded-lg border border-ink-100 bg-white p-5`, icon circle `grid size-10 place-items-center rounded-full bg-ink-900 text-brand-300`, big index `text-2xl font-bold text-ink-100` ("01"), title `mt-3 font-semibold text-ink-900`, text `mt-1 text-sm text-ink-600`.

### 5.9 ListingCard (product card)

```
article  group flex flex-col overflow-hidden rounded-lg border border-ink-100 bg-white transition hover:shadow-card
image    relative aspect-[4/3] bg-linear-to-br from-ink-50 to-ink-100   (photo: object-cover w-full h-full; no photo: centered category icon size-14 text-ink-300 group-hover:scale-110, strokeWidth 1.2)
kind     Badge absolute left-2 top-2 (offer = brand, requirement = neutral)
body     flex flex-1 flex-col gap-1.5 p-3
title    line-clamp-2 min-h-10 text-sm font-medium text-ink-900
price    text-base font-bold text-ink-900          ("₹2,450 / bag" or "Price on request")
meta     text-xs text-ink-500                       ("Qty: 2,000 bag · Min. order 100 bag")
place    flex items-center gap-1 text-xs text-ink-500 + MapPin size-3.5  ("Karnal, Haryana")
footer   mt-auto flex items-center justify-between gap-2 pt-3
alias    text-xs text-ink-600                       ("Seller #48213")
cta      rounded-full border border-ink-900 px-3 py-1.5 text-xs font-semibold text-ink-900 transition hover:bg-ink-900 hover:text-white
         ("View details" → /listings/[id]; on detail page the action is "I'm interested")
```
The whole card links to `/listings/[id]`. Grids: home rows `grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5`; browse page `grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4`. Delivery terms (FOB/CIF) are no longer shown.

### 5.10 Auth layout (login, register, forgot/reset)

`min-h-screen bg-ink-50`; mini header `mx-auto flex h-16 max-w-3xl items-center justify-between px-4` (Logo left, "Back to site" `text-sm text-ink-600 hover:text-ink-900` right); main `mx-auto max-w-3xl px-4 pb-16`.
- Login: `mx-auto max-w-md`, title "Welcome back" (`mb-1 text-3xl font-semibold text-ink-900`), sub `mb-6 text-sm text-ink-600`, form in `Card > CardBody p-6`, full-width primary button, link row `text-center text-sm` with `font-semibold text-ink-900 underline` links. The same page is used by admins (no separate dark admin login in v1).
- Register: title "Register free", sub line, then **role choice** (6.1), then one Card with grouped field sections (`h2 text-xl font-semibold text-ink-900` per group: "Your details", "Your business"), consent checkboxes, submit. Footer line "Already registered? **Log in**".
- Confirmation/status card: `Card > CardBody space-y-3 p-8 text-center`, icon `mx-auto size-12` (`text-success` / `text-warning` / `text-danger`), title `text-2xl font-semibold text-ink-900`, text `text-ink-600`.

### 5.11 Dashboard shell (buyer/seller) and Admin shell

Both use the **same dark sidebar layout**:
```
root     min-h-screen lg:grid lg:grid-cols-[16rem_1fr]
aside    border-b border-ink-800 bg-ink-900 p-4 text-ink-100 lg:sticky lg:top-0 lg:h-screen lg:border-b-0
logo     <Logo dark />   (admin: + <p className="mt-1 text-xs text-brand-400">Admin</p>)
nav      mt-4 flex gap-1 overflow-x-auto lg:mt-8 lg:flex-col      (admin: lg:mt-6)
item     flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-ink-800
active   bg-ink-800 text-brand-300
icon     size-4
footer   (lg) absolute bottom-4 left-4 right-4: user name text-sm font-semibold text-white truncate,
         role badges, Logout button `flex items-center gap-1 text-xs hover:text-brand-300` with LogOut size-3.5
main     p-4 sm:p-8
mobile   top row in main: `mb-4 flex items-center justify-between lg:hidden` (name + Logout underline)
```
- On mobile the sidebar becomes a horizontal scrolling tab strip (the `overflow-x-auto` row). Keep that behaviour.
- Count badges on nav items (e.g. new enquiries): `ml-auto rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white`.
- A top bar inside `main` (right-aligned) holds the **notifications bell** (6.7): `mb-6 flex items-center justify-end gap-2`.
- Active detection: exact match for the root item (`/dashboard`, `/admin`), `startsWith` for the others.

**Dashboard nav (by role)**: Overview (LayoutDashboard) · My products (Package, seller) · My requirements (ClipboardList, buyer) · Post (PlusCircle) · My enquiries (Inbox) · My deals (Handshake) · Profile (UserRound).
**Admin nav**: Overview (LayoutDashboard) · Enquiries (Inbox, with count) · Deals (Handshake) · Users (Users) · Listings (ListChecks) · Categories (FolderTree) · Admins (ShieldCheck, superadmin only) · Account (UserRound).

---

## 6. Patterns for new v1 screens

Build these from the tokens above. Add reusable ones to `src/components/ui`.

### 6.1 Role choice (register / profile)

`grid gap-3 sm:grid-cols-3`. Each option is a `<label>` card containing a hidden radio:
- base `flex cursor-pointer flex-col gap-1 rounded-lg border-2 bg-white p-4 transition`
- unselected `border-ink-200 hover:border-ink-300`
- selected `border-brand-500 bg-brand-50`
- icon `size-6 text-brand-600` (Store = sell, ShoppingCart = buy, ArrowLeftRight = both), title `font-semibold text-ink-900`, hint `text-xs text-ink-500`.

### 6.2 Tabs / filter pills (status tabs, My products/My requirements)

Row `mb-4 flex flex-wrap gap-2`. Pill `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors`:
- active `bg-ink-900 text-white`
- inactive `border border-ink-200 bg-white text-ink-700 hover:bg-ink-50`
- count chip inside `rounded-full bg-white/20 px-1.5 text-xs` (active) / `bg-ink-50 text-ink-500` (inactive).

### 6.3 Stage pills (deal pipeline / shipment steps)

Taken from the existing deal tracker: `ol flex flex-wrap gap-2 text-xs`; each step `flex items-center gap-1 rounded-full px-3 py-1 capitalize`; done/current `bg-ink-900 text-white` (done adds `Check size-3`); upcoming `bg-ink-50 text-ink-400`; cancelled adds `Badge tone="danger"`. Use for shipment lots: Packed → Shipped → Reached.

### 6.4 Progress bar (paid %, shipped %)

```
<div className="space-y-1.5">
  <div className="flex justify-between text-xs"><span className="font-medium text-ink-700">Paid</span><span className="text-ink-500">₹1,20,000 of ₹2,40,000 · 50%</span></div>
  <div className="h-2 overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full bg-success" style={{ width: "50%" }} /></div>
</div>
```
Fill colours: **Paid** `bg-success`, **Shipped** `bg-brand-500`, **Reached** `bg-verified`. Show two or three bars stacked with `space-y-3` in a Card.

### 6.5 Detail page layout (enquiry, deal, user)

Back link `mb-3 inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900` (ArrowLeft `size-4`) → `PageHeader` (title, description = code/date, status badge + actions on the right) → `grid gap-4 lg:grid-cols-[1fr_22rem]`: main column `space-y-4` of Cards; right column `space-y-4` with action Cards (`h-fit`).
- **Party card (admin only)**: CardHeader "Buyer" / "Seller" + role badge; CardBody `dl` grid (Name, Business, Mobile, Email, City/State, GST); actions row `mt-4 flex flex-wrap gap-2` of `size="sm" variant="outline"` buttons: Phone "Call" (`tel:`), MessageCircle "WhatsApp" (`https://wa.me/91…`), Mail "Email".
- **Status select card**: CardHeader "Status" + StatusBadge; `Select` + helper text `text-xs text-ink-400`.

### 6.6 Timeline (notes, status history, shipment history)

```
<ol className="relative space-y-4 border-l border-ink-200 pl-5">
  <li className="relative">
    <span className="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full bg-ink-900 ring-4 ring-white" />
    <p className="text-sm text-ink-800">Spoke to seller, price ₹2,400 final.</p>
    <p className="text-xs text-ink-500">Ravi (admin) · 29 Oct 2026, 3:40 pm</p>
  </li>
</ol>
```
Add-note box below: `Textarea` + right-aligned `Button size="sm"` "Add note". Latest first.

### 6.7 Notifications bell

- Trigger: `relative grid size-10 place-items-center rounded-lg text-ink-700 hover:bg-ink-50` (on dark sidebars: `text-ink-100 hover:bg-ink-800`) with `Bell size-5`.
- Count: `absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white` (hide at 0, show "9+" above 9).
- Panel: dropdown pattern (5.1) with `w-80` Card; header `flex items-center justify-between px-4 py-3 border-b border-ink-100` ("Notifications" `text-sm font-semibold`, "Mark all read" `text-xs font-semibold text-brand-600 hover:underline`); items `block px-4 py-3 text-sm hover:bg-ink-50`, unread `bg-brand-50`, title `font-medium text-ink-900`, body `text-ink-600 line-clamp-2`, time `text-xs text-ink-400`; empty `p-5 text-sm text-ink-500` "You're all caught up."

### 6.8 Dialog (modal)

Overlay `fixed inset-0 z-50 grid place-items-center bg-ink-950/50 p-4`; panel `w-full max-w-lg` `Card` with `CardHeader flex items-center justify-between` (CardTitle + ghost X button `size-8`), `CardBody space-y-4`, footer `flex justify-end gap-2 border-t border-ink-100 px-5 py-4` (outline Cancel + primary/danger confirm). Close on Escape and overlay click; focus the first field. Used for: I'm interested, Convert to deal, Record payment, Add admin, confirmations.
**Confirm dialogs** for destructive actions: danger button, text `text-sm text-ink-600`.

### 6.9 Toast

Fixed stack `fixed bottom-4 right-4 z-[60] space-y-2`; toast `rounded-lg px-4 py-3 text-sm font-medium text-white shadow-card` — success `bg-ink-900`, error `bg-danger`; auto-hide 4 s. Tiny in-house context (no library).

### 6.10 Image uploader (listing form)

Grid `grid grid-cols-3 gap-2 sm:grid-cols-6`. Tile `relative aspect-square overflow-hidden rounded-lg border border-ink-200 bg-ink-50` with `img object-cover`; first tile shows `Badge` "Cover" at `absolute left-1 top-1`; hover controls `absolute right-1 top-1 flex gap-1` with white icon buttons `grid size-7 place-items-center rounded-md bg-white/90 text-ink-700 shadow-card` (Trash2, arrows). Uploading tile: spinner circle + `text-xs text-ink-500` %. Add tile: `grid aspect-square cursor-pointer place-items-center rounded-lg border-2 border-dashed border-ink-300 bg-white text-ink-500 hover:border-brand-500 hover:text-brand-600` with `UploadCloud size-6` + "Add photo" `text-xs font-semibold`. Helper below `text-xs text-ink-400` "Up to 6 photos. JPG, PNG or WebP. First photo is the cover."

### 6.11 Listing detail page (`/listings/[id]`)

Container `py-8`, breadcrumb `mb-4 text-xs text-ink-500` (Home / Listings / Category). Grid `grid gap-6 lg:grid-cols-[1.1fr_1fr]`:
- **Gallery**: main `aspect-[4/3] overflow-hidden rounded-lg border border-ink-100 bg-white` (`object-contain`; no photo → category icon placeholder like ListingCard); thumbs `mt-3 flex gap-2 overflow-x-auto`, each `size-16 shrink-0 overflow-hidden rounded-md border-2`, active `border-brand-500`, others `border-ink-100`.
- **Info panel** `rounded-lg border border-ink-100 bg-white p-6 space-y-4`: kind Badge + category text; title `text-2xl font-bold text-ink-900`; price `text-3xl font-bold text-ink-900` + `text-sm text-ink-500` "/ bag"; key facts `dl grid grid-cols-2 gap-3 text-sm` (Quantity, Min. order, Location, Posted); alias row with `UserRound size-4`; **primary pill CTA** `Button size="lg" className="w-full rounded-full"` "I'm interested"; reassurance line `text-xs text-ink-500` "Doctraders will contact you and handle the deal. Contact details stay private."
- **Description** Card below, full width: `whitespace-pre-line text-sm text-ink-700`.

### 6.12 Browse page (`/listings`)

Existing layout: `Container py-8` → `grid gap-6 lg:grid-cols-[15rem_1fr]`. Filters panel `h-fit space-y-5 rounded-xl border border-ink-100 bg-white p-5` (title `font-semibold text-ink-900`, field labels `font-medium text-ink-800`, radio groups, `Button w-full rounded-full` "Apply filters", "Clear all" `block text-center text-xs text-ink-500 underline`). Results header `mb-4 flex flex-wrap items-center justify-between gap-2` with count `text-xl font-bold text-ink-900` and a hint `text-xs text-ink-500`. Pagination below the grid, centred, outline `sm` buttons.

### 6.13 Dashboard list rows (my listings, my enquiries, my deals)

Stacked Cards `space-y-3`; CardBody `flex flex-wrap items-start justify-between gap-3`. Left: optional thumbnail `size-16 shrink-0 rounded-md object-cover border border-ink-100`, title `font-semibold text-ink-900`, meta `text-sm text-ink-500` (qty · date · alias), message `mt-2 text-sm text-ink-700`. Right: StatusBadge and `size="sm"` actions. Deals add the stage pills / progress bars under the header row (`space-y-4`).

### 6.14 States

Every data view handles three states with existing components: **loading** `Spinner`; **empty** `EmptyState` with a next-step Button (e.g. "Post a product"); **error** `EmptyState` title "Something went wrong" + outline "Try again" button. Forms: disable submit while saving, inline field errors, toast on success.

---

## 7. Page inventory & composition

| Route | Composition |
| --- | --- |
| `/` | Hero row (7.1) → trust strip → RFQ band → "Featured offers" row → "Buyer requirements" row → Browse by category tiles → How it works cards → Buy/Sell split → footer |
| `/listings` | 6.12 |
| `/listings/[id]` | 6.11 |
| `/categories` | PageIntro → `Section white` grid `gap-5 sm:grid-cols-2 lg:grid-cols-3` of Cards (name `font-sans text-lg font-semibold`, examples `mt-2 text-sm text-ink-600`) → CtaBand |
| `/buyers`, `/sellers` | AudiencePage (5.5) |
| `/how-it-works` | PageIntro → numbered steps (5.8) → CtaBand |
| `/about` | PageIntro → `Section white` `mx-auto max-w-3xl space-y-5 text-lg text-ink-700` paragraphs → CtaBand |
| `/faq` | PageIntro → accordion (5.7) → CtaBand |
| `/contact` | PageIntro → `Section white` → `mx-auto max-w-xl` form |
| `/terms`, `/privacy`, `/commission-policy`, `/disclaimer` | LegalPage (5.6) |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Auth layout (5.10) |
| `/dashboard` | PageHeader "Welcome, {name}" + action button → Stat row (`sm:grid-cols-3`) → "Recent enquiries" Card list |
| `/dashboard/listings`, `/new`, `/[id]/edit` | PageHeader + tabs (6.2) + rows (6.13); form in `Card > CardBody p-6` with `grid gap-4 sm:grid-cols-2` + image uploader (6.10) |
| `/dashboard/enquiries`, `/dashboard/deals`, `/dashboard/deals/[id]` | rows (6.13), detail (6.5) with progress (6.4) and shipment timeline (6.3/6.6) |
| `/dashboard/profile` | PageHeader → Cards: "Your details", "Your business", "Roles" (6.1), "Change password" |
| `/admin` | PageHeader "Overview" → Stat row (`sm:grid-cols-2 lg:grid-cols-4`, two rows) → `grid gap-4 lg:grid-cols-2` Cards ("Latest enquiries", "Commission due") |
| `/admin/enquiries`, `/admin/deals`, `/admin/users`, `/admin/listings` | PageHeader → tabs (6.2) → DataTable (4.7) |
| `/admin/enquiries/[id]`, `/admin/deals/[id]`, `/admin/users/[id]` | detail layout (6.5) |
| `/admin/categories` | PageHeader → add row Card (`CardBody flex gap-2`: Input + Button with Plus) → Card list with inline actions |
| `/admin/admins` | PageHeader + "Add admin" button → DataTable → dialogs |

### 7.1 Home hero row (exact)

`section bg-paper py-5` → `Container grid gap-4 lg:h-108 lg:grid-cols-[18rem_1fr_20rem]` with **three equal-height columns**:
1. **Category list** (lg only) `hidden flex-col rounded-lg border border-ink-100 bg-white lg:flex`: header `border-b border-ink-100 px-5 py-3 text-sm font-semibold text-ink-900`; rows `group flex flex-1 items-center gap-3 px-5 hover:bg-brand-50` with icon (`size-5 text-ink-500 group-hover:text-brand-600`, stroke 1.6), name `text-sm font-medium`, examples `truncate text-xs text-ink-500`, `ChevronRight size-4 text-ink-300`. Show the top 8 categories.
2. **Red banner** `relative flex flex-col justify-between overflow-hidden rounded-lg bg-linear-to-br from-brand-700 to-brand-500 p-8 text-white sm:p-10` with two decorative circles (`absolute -right-24 -top-24 size-96 rounded-full bg-white/10` and `absolute -bottom-32 right-24 size-80 rounded-full bg-white/10`), eyebrow, hero headline (last line in `text-sand-300`), `mt-4 max-w-lg text-base text-white/90` sub, and two pill CTAs (4.1).
3. **Welcome card** `flex flex-col rounded-lg border border-ink-100 bg-white p-5`: title `text-lg font-bold`, sub `mt-1 text-sm text-ink-500`, `Join free` (primary pill) + `Sign in` (outline pill) stacked, trust list `mt-5 space-y-3 border-t border-ink-100 pt-5 text-sm text-ink-700` with teal icons (`size-4 translate-y-0.5 text-info`), bottom promo `mt-auto rounded-lg bg-brand-50 p-3 text-sm hover:bg-brand-100` ("Looking for a product? Post a requirement →" in `text-brand-700`). When logged in, show "Hi, {name}" + "Go to dashboard" instead of Join/Sign in.

**Trust strip**: `Container mt-4` → `ul grid divide-ink-100 rounded-lg border border-ink-100 bg-white sm:grid-cols-2 sm:divide-x lg:grid-cols-4`, item `flex items-center gap-3 p-4`, icon circle `grid size-10 place-items-center rounded-full bg-brand-100 text-brand-700`.

**RFQ band**: `grid overflow-hidden rounded-lg bg-linear-to-r from-ink-900 to-ink-700 text-white lg:grid-cols-[1.1fr_1fr]`; left `p-8 sm:p-10` (eyebrow `text-brand-300`, h2 `mt-2 text-2xl font-bold sm:text-3xl`, text `text-ink-200`, ✓ list `text-sm text-ink-100`); right is a white form panel `space-y-3 bg-white p-6 text-ink-900 sm:p-8` (product input, qty + unit `grid grid-cols-[1fr_7rem] gap-3`, full-width pill submit, note `text-xs text-ink-500`). In v1 it submits to `/dashboard/listings/new?kind=requirement` with the values prefilled (login first if needed).

**Product rows**: heading row `flex items-end justify-between gap-4` (title + subtitle `text-sm text-ink-500`; "View all" `flex items-center gap-1 text-sm font-semibold text-ink-800 hover:text-ink-950` + ChevronRight), grid as in 5.9.

**Category tiles**: `grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6`, tile `group flex flex-col items-center gap-3 rounded-lg border border-ink-100 bg-white p-5 text-center transition hover:border-brand-500 hover:shadow-card`, icon circle `grid size-14 place-items-center rounded-full bg-ink-50 text-ink-700 group-hover:bg-brand-100 group-hover:text-brand-700`.

**Buy/Sell split**: `Container mt-12 grid gap-4 md:grid-cols-2`, panel `flex items-center justify-between gap-4 rounded-lg border border-ink-100 bg-white p-6`, title `text-lg font-bold`, text `mt-1 text-sm text-ink-600`, `Button variant="secondary" className="shrink-0 rounded-full"`.

---

## 8. Content & formatting

- **Voice**: short, plain, confident. Sentence case for headings and buttons ("Post a product", "I'm interested", "Mark as shipped"). No exclamation marks except in success messages.
- **v1 truthfulness**: there is no verification/KYC. Do **not** say "verified", "documents checked" or show Verified badges. Trust copy focuses on: free to join, direct buyers & sellers, Doctraders handles the deal, contact details stay private, commission only after completion.
- **Money**: `formatINR()` Indian grouping, e.g. `₹4,62,000`; compact totals `formatINRCompact()` → `₹4.62 L`, `₹1.2 Cr`. Price per unit: `₹2,450 / bag`. Unknown price: "Price on request".
- **Quantity**: `2,000 bag` / `25 tonne` (`toLocaleString("en-IN")` + unit).
- **Dates**: `29 Oct 2026`; with time `29 Oct 2026, 3:40 pm`; relative in notifications ("5 min ago").
- **Aliases**: `Seller #48213`, `Buyer #48213` (never real names outside admin).
- **Percent**: whole numbers, `50%`.

---

## 9. Responsive, accessibility, misc

### 9.1 Breakpoints
Tailwind defaults (`sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`). Design mobile-first; test at **375px**. Header search shows from `md`; nav strip and sidebars from `lg`; hero side columns from `lg`.

### 9.2 Mobile rules
- No horizontal page scroll; wide tables scroll inside their wrapper (`overflow-x-auto`).
- Two-column forms collapse to one (`sm:grid-cols-2`).
- Detail layouts stack (right column moves below).
- Primary actions on mobile detail pages can be full width (`w-full sm:w-auto`).

### 9.3 Accessibility
- Every icon-only button has `aria-label`. Search has `role="search"`. Navs have `aria-label`.
- Errors use `role="alert"`; spinner uses `role="status"`.
- Keyboard: dropdowns open on focus (`group-focus-within`), dialogs trap focus and close on Escape.
- Colour contrast: body text never lighter than `ink-500` on white.

### 9.4 Images
`next/image` with `fill` + `sizes`, `object-cover` on cards, `object-contain` on the detail gallery. Remote pattern for Vercel Blob. Always a category-icon fallback.

### 9.5 SEO & meta
Root title template `%s | Doctraders`; admin/dashboard pages `robots: noindex`.

### 9.6 Charts (only if added later)
Recharts with `INK = "#2a2622"` (bars), `BRAND = "#c8262f"` (lines, width 3), grid `stroke="#f0ece6"` dashed `3 3`, inside `Card > CardBody h-72`.

---

## 10. Do / Don't

**Do**
- Use `Card` for app panels, plain bordered `rounded-lg` panels for marketing.
- Use one primary (crimson) button per view; secondary actions `outline`.
- Use pills (`rounded-full`) for marketing CTAs, badges, tabs and stage steps.
- Keep the dark `ink-900` sidebar for both dashboard and admin.

**Don't**
- Don't introduce new colours, fonts, shadows or radii.
- Don't use the old navy/gold, blue links, or default Tailwind grays (`gray-*`, `slate-*`).
- Don't add a UI library (shadcn CLI, MUI, Chakra…). The kit here is enough.
- Don't show raw enum values (`deal_closed`) to users.
- Don't show real names/contacts outside admin.

---

## Appendix A — `src/app/theme.css` (copy exactly)

```css
@import "tailwindcss";

/*
 * Doctraders design tokens (Tailwind v4 @theme).
 */
@theme {
  /* Warm stone neutrals: text, borders, surfaces */
  --color-ink-50: #faf8f5;
  --color-ink-100: #f0ece6;
  --color-ink-200: #e1dbd2;
  --color-ink-300: #c9c1b5;
  --color-ink-400: #9d9588;
  --color-ink-500: #726b60;
  --color-ink-600: #544e45;
  --color-ink-700: #3d3832;
  --color-ink-800: #2a2622;
  --color-ink-900: #1c1916;
  --color-ink-950: #12100e;

  /* Brand: deep crimson */
  --color-brand-50: #fdf3f2;
  --color-brand-100: #fbe1df;
  --color-brand-200: #f5bdb9;
  --color-brand-300: #ec8d87;
  --color-brand-400: #de5a54;
  --color-brand-500: #c8262f;
  --color-brand-600: #a81c25;
  --color-brand-700: #85161d;

  /* Warm sand highlight, used on red backgrounds */
  --color-sand-300: #f3d9a4;

  /* Teal: the trust color */
  --color-verified: #0f766e;
  --color-verified-soft: #e2f3f0;

  /* Status */
  --color-success: #15803d;
  --color-danger: #c62828;
  --color-warning: #b45309;
  --color-info: #0f766e;

  --color-paper: #f7f4ef;
  --color-ink: #1c1916;

  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-serif: var(--font-inter), ui-sans-serif, system-ui, sans-serif;

  --shadow-card: 0 1px 2px rgb(28 25 22 / 0.05), 0 6px 18px rgb(28 25 22 / 0.08);
}

@layer base {
  html {
    font-size: 15px;
  }
  body {
    background: var(--color-paper);
    color: var(--color-ink);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3 {
    letter-spacing: -0.01em;
  }
  :focus-visible {
    outline: 2px solid var(--color-brand-500);
    outline-offset: 2px;
  }
}
```

`src/app/globals.css`:
```css
@import "./theme.css";
```

Root layout loads Inter: `const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });` and sets `<html lang="en" className={inter.variable}>`.

## Appendix B — `cn` helper

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```
