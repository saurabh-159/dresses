# Awardwala — full build prompt

Paste this entire file into ChatGPT (or any coding agent) and tell it: **build the complete website in this existing Next.js project. Do not skip pages, admin, database, or APIs.**

Reference site (match the content and information architecture, make the UI cleaner and more polished): https://awardwala.com/

---

## 0. Rules for the coding agent

- This repo already exists. Do not run `create-next-app` again.
- Stack is already installed: **Next.js 16.4 App Router, React 19, TypeScript, Tailwind CSS 4**.
- Root: the project folder that contains `package.json`, `src/app/layout.tsx`, `src/app/page.tsx`.
- Empty folders already exist (with `.gitkeep`). Put real files in those folders. Delete a `.gitkeep` when that folder gets a real file.
- Write production-quality code. Every public page and every admin screen must be usable, responsive, and visually finished. No placeholder “lorem” pages, no unstyled forms, no TODO comments left in the UI.
- Public site is a **catalog + WhatsApp quote** business. There is **no cart, no checkout, no online payment**.
- “Get Quote” is never its own page. It opens WhatsApp with a prefilled message.
- Images are stored on **ImageKit**, not in `public/` (except a tiny fallback logo if ImageKit keys are missing in local dev).
- Database is **MongoDB + Mongoose**. Do not install or use Prisma, SQL, SQLite, Postgres, or any other database.
- MongoDB must already be running. Local URI: `mongodb://127.0.0.1:27017/awardwala`. Atlas is also fine if `MONGODB_URI` points at it. Database name: `awardwala`.
- There are no migrations. Mongoose creates collections on first write.
- After coding, the app must run with:

```bash
npm install
npm run seed
npm run dev
```

- Add the missing dependencies yourself: `mongoose`, `bcryptjs`, `jose`, `imagekit`, `zod`. Add `@types/bcryptjs` and `tsx` as dev dependencies.
- Add this script to `package.json`: `"seed": "tsx scripts/seed.ts"`.
- Do not invent extra products beyond the seed list. Do not add blog, login for customers, or reviews.

---

## 1. Brand and UI (this matters most)

The live site feels like a wholesale awards catalog. Rebuild that, but tighter: more whitespace, clearer type, better cards, smoother hover, a proper mobile menu. It should look like a premium Delhi manufacturer, not a generic Tailwind template.

### Colors (use these exact values in Tailwind v4 `@theme`)

| Token | Hex | Use |
|---|---|---|
| `brand-blue` | `#00418C` | Header top bar, primary buttons, headings accents, footer top |
| `brand-blue-dark` | `#002F66` | Button hover, footer background |
| `brand-gold` | `#FCC400` | Highlights, slider progress, small labels, quote buttons |
| `brand-gold-soft` | `#FFE08A` | Soft gold backgrounds |
| `brand-brown` | `#8E4300` | Word “WALA” in the logo lockup |
| `ink` | `#0F172A` | Body headings |
| `muted` | `#64748B` | Secondary text |
| `line` | `#E2E8F0` | Borders |
| `paper` | `#F7F5F2` | Page background (warm off-white, not pure gray) |
| `white` | `#FFFFFF` | Cards, header |

Remove the default dark-mode inversion from `globals.css`. This site is **light only**.

### Type

- Use **Outfit** from `next/font/google` (weights 400, 500, 600, 700, 800). Apply it on `body`.
- Nav links: 13px, extra-bold, uppercase, tracking wide.
- Page titles: 4xl–5xl, extrabold, tight tracking.
- Prices: bold, `brand-blue`.

### Layout

- Max content width `1200px`, horizontal padding `16px` mobile / `24px` tablet / `32px` desktop. Class name: `container-aw`.
- Sticky header (`top-0 z-50`, white, light shadow).
- A 4px gradient strip on the very top: blue → gold → brown.
- Radius: cards `rounded-2xl`, buttons `rounded-full` for marketing CTAs and `rounded-xl` for admin.
- Shadows: soft blue tint `shadow-brand-blue/10`, never heavy black drop shadows.
- Every interactive card: image zoom on hover (`scale-105`, 500ms), title color shifts to `brand-blue`.
- Focus states visible for keyboard users.
- Mobile first. Test 375px and 1280px mentally while building.

### Shared chrome (every public page)

**Top bar** (hidden below `sm`): left tagline, right side hours + two phone links.

**Header**
- Logo image (from settings, fallback `/images/logo` only if you add a simple placeholder) + wordmark “AWARD” in blue and “WALA” in brown. Subline: `TROPHIES · MEDALS · GIFTS`.
- Desktop nav: Home, TROPHIES (dropdown of child categories), CORPORATE GIFTS, GIFT ITEMS, SPORTS MEDALS, About Us, Contact, gold **Get Quote** button.
- TROPHIES dropdown: white panel, rounded-xl, uppercase child links. Opens on hover and on focus.
- Mobile: hamburger opens a full-height drawer with the same links. Trophies children are an accordion. Drawer closes on link click and on Escape.
- Header links come from the database (categories), not a hardcoded array, except Home / About / Contact / Get Quote.

**Footer** (dark blue `#002F66`, gold small headings)
- Column 1: logo, short about blurb.
- Column 2 Categories: the 3 top-level categories (Trophies, Corporate Gifts, Sports Medals).
- Column 3 Explore: Home, About us, Contact us, Get a quote (WhatsApp).
- Column 4 Contact: address, both phones, email, WhatsApp number, hours.
- Bottom bar: `© {year} Awardwala. All rights reserved.`
- Data comes from `SiteSetting`, not hardcoded in the component. Seed fills the real values so the UI is correct on first run.

**Floating WhatsApp button** bottom-right on all public pages. Green circle, opens the same quote chat. Hidden when it would cover a primary button on very small screens? No — keep it, with `bottom-5 right-5` and safe z-index under the mobile drawer.

### Empty, loading, error

- Category with zero products: calm empty state, not a blank grid.
- Missing product or category slug: designed 404 inside the site chrome, with a link home.
- Image missing: neutral warm placeholder block, product name still visible.
- Admin lists: skeleton is unnecessary; show a proper empty state with a “Create” button.

---

## 2. Public pages

### 2.1 Home — `src/app/(site)/page.tsx`

Delete the Create Next App starter in `src/app/page.tsx`. Home lives at `src/app/(site)/page.tsx` so it shares the public layout. There must be only one `/` route.

Sections, top to bottom:

1. **Hero slider**
   - Slides from DB, ordered by `sortOrder`, only `isActive`.
   - Aspect `4/5` on mobile, `16/7` from `md` up.
   - Image is `object-cover`. ImageKit URL with transform width 1600 (desktop) — use one URL; CSS handles crop.
   - Bottom gradient from `brand-blue/80` to transparent. Slide title in white, extrabold, max width ~2xl.
   - Autoplay every 5s. Pause on hover. Dots + previous/next buttons. Keyboard arrows when the slider is focused.
   - Progress bar in gold along the bottom of the active slide.
   - If a slide has `linkUrl`, the whole slide is a link.

2. **Shop by category**
   - Eyebrow + heading “Shop by category”.
   - Subtext: “Wooden trophies, acrylic trophies, metal cups, sports medals, star awards, and corporate gifts.”
   - Grid of categories where `showOnHome = true` (seed: Trophies, Corporate Gifts, Sports Medals).
   - Large image cards, name over a bottom gradient, whole card links to `/category/[slug]`.

3. **Featured products**
   - Heading “Featured products”.
   - Subtext: “A selection from our catalog — tap any product for details and a WhatsApp quote.”
   - Responsive grid: 2 cols mobile, 3 tablet, 4 desktop.
   - Card: image, name, price text. Link to `/product/[slug]`.
   - Only products with `isFeatured = true`.

4. **Why Awardwala**
   - Three cards: Product range, Our team, Quality first.
   - Short excerpts (2–3 lines) from the about copy in section 2.2. “Read more about us →” links to `/about`.

5. **Let’s meet**
   - Band with blue background, gold eyebrow “Let’s meet”, heading “Share a convenient time for a meeting”.
   - One sentence about India + international supply.
   - Two buttons: “Chat on WhatsApp” (gold) and “Contact us” (outline white) → `/contact`.

### 2.2 About — `src/app/(site)/about/page.tsx`

- Page hero: small label “About us”, title “Awardwala”, tagline from settings.
- Intro paragraph: greetings + India and international supply + invitation to share a meeting time.
- Four sections, each a distinct block (not a wall of text):
  - **Product profile** — wooden trophies, acrylic trophies, metal cups, sports medals, star awards, corporate gifts (list).
  - **Our team** — designers, trained workforce, international standards.
  - **Quality** — technology, quality from raw material to delivery.
  - **Our vision** — national and international brand, corporate sector.
- End with a contact CTA.
- Metadata title: `About Us | Award Wala`.

Use this real copy (you may lightly tighten line breaks, do not change the meaning):

> Greetings from Award Wala. We hope this finds you well. We provide promotional and events-related gift item facilities all over India and the international market. Please share a convenient time for a meeting — we would be glad to discuss how we can support your next celebration or corporate programme.

> Product profile. We offer a great range of wooden gift sets and promotional gifts, appreciated for their quality, value, and price. Our range includes: Wooden Trophies, Acrylic Trophies, Metal Cups, Sports Medals, Star Awards, Corporate Gifts.

> Our team. Creating an exclusive range of awards is the outcome of organised teamwork. We have a group of innovative designers who continuously meet the ever-changing requirements of clients by developing award products of international standards. We work with well-trained workforces who support the entire manufacturing process. Our team plays a major role in the success of the company, and with their assistance we have achieved great success.

> Quality. Quality is the great mark of our products and business. With the help of advanced technology, we manufacture an exotic collection of award products. To deliver outstanding awards, quality is maintained at every level of production — from raw materials through to delivery of the finished product.

> Our vision. Our prime vision is to develop into a brand name in the national as well as the international market. We always look forward to unlocking success by creating high-grade quality products for the corporate and economic sectors.

### 2.3 Contact — `src/app/(site)/contact/page.tsx`

No contact form. This page is a clear contact board.

- Hero: “Contact us” / “Let’s plan your awards” / “Share your requirements — product type, quantity, and delivery location — and our team will help with the best options and pricing.”
- Cards (responsive 2-column):
  - Visit / hours — address + hours
  - Phone — both numbers as `tel:` links
  - Email — `mailto:`
  - WhatsApp — opens chat
  - Social — Facebook, Instagram, LinkedIn as real buttons
- All values from `SiteSetting`.
- Title: `Contact Us | Award Wala`.

Real defaults (also the seed):

- Address: `D-484, Tagore Garden, New Delhi - 110027`
- Hours: `All Days: 10:00 AM – 9:00 PM`
- Phone 1: `8595359556`
- Phone 2: `9891805316`
- Email: `awardwala@gmail.com`
- WhatsApp: `919891805316` (country code, no plus, for `wa.me`)
- Facebook: `https://www.facebook.com/teamawardwala`
- Instagram: `https://www.instagram.com/awardwala/`
- LinkedIn: `https://www.linkedin.com/in/awardwala`
- Tagline: `Promotional & event gift items across India and international markets`
- Footer blurb: `We provide promotional and events-related gift items all over India and the international market — wooden trophies, acrylic trophies, metal cups, sports medals, star awards, and corporate gifts.`

### 2.4 Category — `src/app/(site)/category/[slug]/page.tsx`

- Breadcrumb: Home / parent (if any) / this category. Links except the current crumb.
- H1 = category name.
- If the category has children, show a **Subcategories** row of image chips linking to each child.
- Then “Products” with a count, e.g. `228 items` (use the real filtered count).
- Product grid same card as home. **24 per page**.
- Pagination: Previous / Next and page numbers. URL is `/category/[slug]?page=2`. Clamp invalid pages.
- Products shown: products whose `categoryId` is this category. Do **not** automatically mix child products into the parent, matching the live site (Trophies has its own 228; Wooden has its own 64).
- Sort: `sortOrder` asc, then `name` asc.
- `generateMetadata` from category name.

### 2.5 Product — `src/app/(site)/product/[slug]/page.tsx`

- Breadcrumb: Home / parent category / category / product name.
- Layout: gallery left, details right. Stacked on mobile.
- Gallery: main image + thumbnail strip if more than one image. Click thumbnail to swap. First image is primary (`sortOrder`).
- Eyebrow = category name.
- H1 = product name.
- Line: “Bulk and event pricing available — send this product on WhatsApp for a quick quote.”
- Label “Price” then `priceText` exactly as stored (do not parse into a number). Examples must render as typed: `800 Per Pcs`, `A-1200 B-1000 C-800`, `A- 80 B- 70 C- 60 D- 50`.
- If `minQty` is set: `Min. qty 25 Pcs`.
- Description as plain text (sizes, notes). Preserve line breaks.
- Primary button **Get Quote on WhatsApp**. Message:

```
Hi Award Wala, I'd like a quote for {product name}.
```

- Secondary text link: `Back to {category name}`.
- Four short trust points under the buy box: Quality checked, Bulk & event ready, Custom engraving, India & export. These are static UI, not database fields.
- **Related products**: up to 8 other products in the same category, excluding this one. Heading “Related products” and “More from {CATEGORY} — tap any item for details and a quote.”
- Bottom band: “Need this for an event?” with the product name and a second WhatsApp button. Message asks them to share quantity, sizes, and delivery city.
- JSON-LD `Product` (name, sku, image, description, brand Awardwala, url) and `BreadcrumbList`.
- Title: `{name} | Awardwala`.

### 2.6 WhatsApp helper

`src/lib/whatsapp.ts`

```ts
export function whatsappUrl(phone: string, text: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
```

Default general quote message:

`Hi Award Wala, I'd like a quote for promotional gifts / awards.`

---

## 3. Admin panel

Route group: `src/app/admin/`. Visual style can be denser than the marketing site, but it must still use the same colors, Outfit, and feel like one product. Sidebar layout, not Filament and not a copy of a dashboard template with random charts.

### 3.1 Login — `src/app/admin/login/page.tsx`

- Centered card on a blue background.
- Wordmark, “Admin sign in”, email, password, submit.
- Error message under the form if credentials fail.
- If already logged in, redirect to `/admin`.

### 3.2 Shell — `src/app/admin/(panel)/layout.tsx`

- Left sidebar: Dashboard, Categories, Products, Sliders, Settings, and a Log out button.
- Top of sidebar: “Awardwala Admin”.
- Main area: page title + content.
- Protect this layout: no session → redirect `/admin/login`.
- Mobile: sidebar collapses into a top bar with a menu button.

### 3.3 Dashboard — `src/app/admin/(panel)/page.tsx`

- Four stat cards: categories, products, active sliders, featured products.
- Recent products table (name, category, price, featured) with edit links.
- No fake analytics.

### 3.4 Categories — `src/app/admin/(panel)/categories/page.tsx`

- Table: image thumb, name, slug, parent, show on home, sort, active, actions.
- Create and edit in a dialog or a side panel on the same page (do not add a dozen extra routes unless you also add `/admin/categories/new` and `/admin/categories/[id]` — either pattern is fine if both create and edit work).
- Fields: name, slug (auto from name, editable), parent (select, empty = top level), image upload, show on home, sort order, active.
- Prevent choosing itself or its descendant as parent.
- Delete asks for confirmation. Block delete if products still use it; show a clear error.

### 3.5 Products — `src/app/admin/(panel)/products/page.tsx`

- Search by name.
- Filter by category.
- Table: thumb, name, category, price text, featured, active.
- Form fields: name, slug, sku, category, price text (free text, with helper: “Type exactly what customers should read, e.g. 800 Per Pcs or A-1200 B-1000 C-800”), min qty (optional number), description (textarea), featured, sort order, active.
- **Multiple images**: upload one or many, reorder with up/down, set the first as the card image, remove one. Show previews from ImageKit URLs.
- Delete with confirmation.

### 3.6 Sliders — `src/app/admin/(panel)/sliders/page.tsx`

- List slides with thumb, title, order, active.
- Fields: title, image, optional link URL, sort order, active.
- Reorder with sort order numbers.

### 3.7 Settings — `src/app/admin/(panel)/settings/page.tsx`

- One form, one row in the database.
- Fields: tagline, footer blurb, hours, address, phone1, phone2, email, whatsapp, facebook, instagram, linkedin, logo upload.
- Save shows a success message. Public header/footer update immediately because they read this row.

### Admin UX details

- Required fields marked.
- Disabled submit while saving.
- Toast or inline success/error. No `alert()`.
- Tables horizontally scroll on small screens.
- Image upload shows a spinner and then the preview.

---

## 4. Database schema (MongoDB + Mongoose)

Connection file: `src/lib/db/mongoose.ts`

- Read `process.env.MONGODB_URI`.
- Cache the connection on `globalThis` so Next.js dev hot reload does not open a new connection on every request.
- Export `connectDB()` and call it at the start of every query helper, API route, and the seed script.

Collections (Mongoose model names):

| Model file | Collection | Notes |
|---|---|---|
| `src/lib/db/models/AdminUser.ts` | `adminusers` | email unique |
| `src/lib/db/models/Category.ts` | `categories` | slug unique, self-reference via `parent` |
| `src/lib/db/models/Product.ts` | `products` | slug unique, images embedded in the same document |
| `src/lib/db/models/Slider.ts` | `sliders` | |
| `src/lib/db/models/SiteSetting.ts` | `sitesettings` | single document, `key: "site"` |

Do not create a separate images collection. Product photos live inside the product document.

Use MongoDB `ObjectId` as `_id`. In every JSON response, send `id` (string of `_id`) and omit `_id` and `__v`. A small `toJSON` transform on each schema is the right place for that.

```ts
// AdminUser
{
  name: string,
  email: string,          // unique, lowercase
  passwordHash: string,
  timestamps: true
}

// Category
{
  name: string,
  slug: string,           // unique
  parent: ObjectId | null, // ref Category, default null
  imageFileId: string | null,
  imageUrl: string | null,
  imagePath: string | null,
  showOnHome: boolean,    // default false
  sortOrder: number,      // default 0
  isActive: boolean,      // default true
  timestamps: true
}
// index: { slug: 1 } unique, { parent: 1 }, { showOnHome: 1, isActive: 1 }

// Product
{
  name: string,
  slug: string,           // unique
  sku: string,
  category: ObjectId,     // ref Category, required
  priceText: string,      // free text, never a parsed number
  minQty: number | null,
  description: string,    // default ""
  isFeatured: boolean,    // default false
  sortOrder: number,      // default 0
  isActive: boolean,      // default true
  images: [
    {
      fileId: string,
      url: string,
      filePath: string,
      sortOrder: number
    }
  ],
  timestamps: true
}
// index: { slug: 1 } unique, { category: 1, isActive: 1 }, { isFeatured: 1 }

// Slider
{
  title: string,
  fileId: string | null,
  url: string | null,
  filePath: string | null,
  linkUrl: string | null,
  sortOrder: number,
  isActive: boolean,
  timestamps: true
}

// SiteSetting
{
  key: "site",            // unique
  tagline: string,
  footerBlurb: string,
  hours: string,
  address: string,
  phone1: string,
  phone2: string,
  email: string,
  whatsapp: string,
  facebook: string,
  instagram: string,
  linkedin: string,
  logoFileId: string | null,
  logoUrl: string | null,
  logoPath: string | null,
  timestamps: true
}
```

Relations are references, not SQL joins:

- Category `parent` points at another category `_id`, or `null` for a top-level category.
- Product `category` points at a category `_id`.
- When reading, `.populate("parent")` or `.populate("category")` as needed. Populated category in API JSON is `{ id, name, slug }`, and for a product also include `parent: { id, name, slug } | null`.

Slug rules: lowercase, spaces to hyphens, strip characters other than `a-z`, `0-9`, and `-`. Store a URL-safe slug (`tro-280`) and display `name` as the human title. Lookup is by `slug`.

API bodies still use string ids: `parentId` and `categoryId`. Map those onto `parent` and `category` in Mongoose. Do not store a second copy of the id under a different field name in MongoDB.

Deleting a product deletes that one document (images go with it). Before delete, remove each `images[].fileId` from ImageKit. There are no multi-document transactions; this app must work on a standalone local MongoDB. Update images by replacing the `images` array on the product, and delete ImageKit files that were removed from that array.

---

## 5. Seed — `scripts/seed.ts`

Run with `npm run seed`. The script calls `connectDB()`, then upserts so running it twice does not duplicate rows.

- Admin user: upsert by `email`.
- Categories: upsert by `slug`. Create the three parents first, then set each child's `parent` to the parent `_id`.
- Products: upsert by `slug`. Set `category` to the category `_id`. `images: []`.
- Sliders: if the collection is empty, insert the two slides. If slides already exist, leave them.
- Site setting: upsert by `key: "site"`.

Admin user:

- email: `admin@awardwala.com`
- password: `Awardwala@123`
- Hash with bcrypt, cost 10.

SiteSetting: the contact values in section 2.3. Logo can be null.

Categories (create parents first). `showOnHome` true only for the three parents.

| name | slug | parent slug | showOnHome | sort |
|---|---|---|---|---|
| TROPHIES | trophy | — | true | 1 |
| CORPORATE GIFTS | corporate-items | — | true | 2 |
| SPORTS MEDALS | sports-medals | — | true | 3 |
| ACRYLIC AWARDS | acrylic-trophy | trophy | false | 1 |
| GLASS TROPHIES | glass-trophy | trophy | false | 2 |
| METAL TROPHIES | awards | trophy | false | 3 |
| PLASTIC TROPHIES | plastic-trophy | trophy | false | 4 |
| POLY RISON | poly-rison-trophy | trophy | false | 5 |
| WOODEN TROPHIES | wooden-trophy | trophy | false | 6 |
| GIFT ITEMS | corporate-gift-items | corporate-items | false | 1 |

Images for categories can be null in seed. Admin will upload later.

Products to seed (enough to show grids, prices, tiers, featured, and related). `isActive` true. Put `isFeatured` true on the first 8.

| name | slug | sku | category slug | priceText | minQty | description | featured |
|---|---|---|---|---|---|---|---|
| TRO - 280 | tro-280 | TRO - 280 | acrylic-trophy | 800 Per Pcs | 25 | Size - 8.5"x3" inch | yes |
| TRO - 270 | tro-270 | TRO - 270 | acrylic-trophy | 550 Per Pcs | null | | yes |
| TRO - 265 | tro-265 | TRO - 265 | acrylic-trophy | 350 Per Pcs | null | | no |
| TRO - 2383 | tro-2383 | TRO - 2383 | acrylic-trophy | 700 Per Pcs | null | | no |
| TRO - 90 | tro-90 | TRO - 90 | trophy | A-1200 B-1000 C-800 | null | | yes |
| TRO - 92 | tro-92 | TRO - 92 | trophy | 3000 PER PCS | null | | yes |
| TRO - 04 | tro-04 | TRO - 04 | trophy | A-160 B-140 C-120 | null | | yes |
| TRO - 08 | tro-08 | TRO - 08 | wooden-trophy | 500 PER PCS | null | | yes |
| TRO - 11 | tro-11 | TRO - 11 | wooden-trophy | A-160 B-140 C-120 | null | | no |
| TRO - 03 | tro-03 | TRO - 03 | wooden-trophy | 350 PER PCS | null | | yes |
| TRO - 77 | tro-77 | TRO - 77 | metal via awards | A-400 B-350 C-300 | null | | no |
| Olympic Medal | olympic-medal | Olympic Medal- | sports-medals | 40 - 60 - 80 Per Pcs | null | | yes |
| M2- | m2 | M2- | sports-medals | A- 80 B- 70 C- 60 D- 50 | null | | no |
| M8- | m8 | M8- | sports-medals | 70 Per Pcs | null | | no |
| Pach Mug | pach-mug | Pach Mug- | corporate-gift-items | 150 Per Pcs | null | | no |
| PR2- | pr2 | PR2- | trophy | 1200 Per Pcs | null | | no |

Category for TRO - 77 is slug `awards`. No product images in the seed (gallery empty state must still look finished).

Two sliders, inactive image optional, titles `Premium trophies` and `Corporate gifts`, `isActive` true, sort 1 and 2. If `url` is null, the slider component shows a designed blue/gold gradient panel with the title instead of a broken image. That way home looks good before ImageKit upload.

---

## 6. ImageKit

Package: `imagekit` (official Node SDK).

Env:

```
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
```

`src/lib/imagekit/server.ts` — server-only client using the private key.

Folders:

- products → `/awardwala/products`
- categories → `/awardwala/categories`
- sliders → `/awardwala/sliders`
- site (logo) → `/awardwala/site`

`src/lib/imagekit/url.ts`

```ts
export function imageUrl(url: string | null | undefined, width: number) {
  if (!url) return null;
  // If it is an ImageKit URL, insert transformation before the path.
  // Example endpoint https://ik.imagekit.io/your_id + /tr:w-800,q-80,f-auto + /awardwala/products/file.jpg
  // If the stored url already contains the endpoint, rebuild it.
  // Non-ImageKit URLs return unchanged.
}
```

Use widths: category card 480, product card 400, product gallery 900, slider 1600, admin thumb 160, logo 200.

Upload from admin only (session required).

Flow:

1. Browser sends `multipart/form-data` to `POST /api/upload` with fields `file` and `folder` (`products` | `categories` | `sliders` | `site`).
2. API checks auth, validates mime (`image/jpeg`, `image/png`, `image/webp`) and size ≤ 5 MB.
3. Upload to ImageKit with a unique file name. Return `{ fileId, url, filePath }`.
4. The admin form keeps that payload in state and saves it with the category/product/slider/settings API.
5. On image replace or delete, call ImageKit `deleteFile(fileId)` so storage does not leak. If delete fails, still remove the DB row and log the error.

If ImageKit env is missing, `POST /api/upload` returns 500 with `{ error: "ImageKit is not configured" }`. Do not pretend the upload worked.

`next.config.ts`: allow ImageKit host in `images.remotePatterns` (`ik.imagekit.io`). You may use `<img>` for transformed URLs if `next/image` makes the transform awkward. Prefer `next/image` when the URL is stable.

---

## 7. Auth

- Login `POST /api/auth/login` with `{ email, password }`.
- Compare bcrypt hash.
- On success set httpOnly cookie `aw_session`, SameSite Lax, Path `/`, 7 days.
- JWT via `jose`, secret `AUTH_SECRET`, payload `{ sub, email }`.
- `GET /api/auth/me` returns `{ user: { id, name, email } }` or 401.
- `POST /api/auth/logout` clears the cookie.
- `src/lib/auth.ts`: `getSession()` for server components and route handlers.
- Middleware `src/middleware.ts`: matcher `/admin/:path*`. Allow `/admin/login`. Other `/admin` routes without a valid cookie redirect to `/admin/login`. Do not block `/api` in middleware; each mutating API checks the session and returns 401 JSON.

---

## 8. APIs

JSON only. Errors: `{ error: string }` with the right status. Validate bodies with zod. Mutating routes require a session.

Shared query helpers in `src/lib/db/queries.ts`. Each helper starts with `await connectDB()`. Public server components call these directly. Route handlers call the same helpers. Do not query Mongoose from page components.

### Auth

| Method | Path | Auth | Body | Success |
|---|---|---|---|---|
| POST | `/api/auth/login` | no | `{ email, password }` | `{ user }` + set cookie. 401 if bad. |
| POST | `/api/auth/logout` | no | — | `{ ok: true }` + clear cookie |
| GET | `/api/auth/me` | cookie | — | `{ user }` or 401 |

### Categories

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/categories` | no | Query `?tree=1` returns nested tree of active categories for the nav. Without `tree`, return a flat admin list (include inactive) only if authed; public callers get active only. |
| GET | `/api/categories/[id]` | no | By id. 404 if missing. Include `children` and `parent`. |
| POST | `/api/categories` | yes | Create. 409 if slug exists. |
| PATCH | `/api/categories/[id]` | yes | Partial update. |
| DELETE | `/api/categories/[id]` | yes | 409 if products exist or children exist. Delete ImageKit file if `imageFileId` set. |

Create/update body:

```json
{
  "name": "ACRYLIC AWARDS",
  "slug": "acrylic-trophy",
  "parentId": "optional or null",
  "imageFileId": "optional",
  "imageUrl": "optional",
  "imagePath": "optional",
  "showOnHome": false,
  "sortOrder": 1,
  "isActive": true
}
```

### Products

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/products` | no | Query: `category` (slug), `featured=1`, `q` (name contains), `page` (default 1), `pageSize` (default 24, max 48). Public results are `isActive` only. Response: `{ items, total, page, pageSize }`. Each item includes `category { name, slug }` and `images` ordered. |
| GET | `/api/products/[slug]` | no | By slug. Include images, category, category.parent, and `related` (up to 8, same category, exclude self). 404 if missing or inactive (admin can pass `?preview=1` with auth to see inactive). |
| POST | `/api/products` | yes | Create product + images array. 409 duplicate slug. |
| PATCH | `/api/products/id/[id]` | yes | Update fields. If `images` is sent, replace the embedded `images` array. Delete ImageKit files that were removed. |
| DELETE | `/api/products/id/[id]` | yes | Delete the product document and its ImageKit files. |

Product body:

```json
{
  "name": "TRO - 280",
  "slug": "tro-280",
  "sku": "TRO - 280",
  "categoryId": "id",
  "priceText": "800 Per Pcs",
  "minQty": 25,
  "description": "Size - 8.5\"x3\" inch",
  "isFeatured": true,
  "sortOrder": 0,
  "isActive": true,
  "images": [
    { "fileId": "...", "url": "...", "filePath": "/awardwala/products/x.jpg", "sortOrder": 0 }
  ]
}
```

### Sliders

| Method | Path | Auth |
|---|---|---|
| GET | `/api/sliders` | no for active only. If cookie present, return all. |
| POST | `/api/sliders` | yes |
| PATCH | `/api/sliders/[id]` | yes |
| DELETE | `/api/sliders/[id]` | yes, also delete ImageKit file |

Body: `{ title, fileId, url, filePath, linkUrl, sortOrder, isActive }`.

### Settings

| Method | Path | Auth |
|---|---|---|
| GET | `/api/settings` | no (public contact data is not secret) |
| PUT | `/api/settings` | yes, update the single document `key: "site"` |

### Upload

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/upload` | yes | multipart `file` + `folder`. Response `{ fileId, url, filePath }`. |
| DELETE | `/api/upload` | yes | JSON `{ fileId }`. Response `{ ok: true }`. |

---

## 9. Files to create

Keep `src/app/layout.tsx` as the root layout (fonts, html, body). Public chrome goes in `src/app/(site)/layout.tsx`.

```
src/app/globals.css
src/app/layout.tsx
src/app/(site)/layout.tsx
src/app/(site)/page.tsx
src/app/(site)/about/page.tsx
src/app/(site)/contact/page.tsx
src/app/(site)/category/[slug]/page.tsx
src/app/(site)/product/[slug]/page.tsx
src/app/(site)/not-found.tsx
src/app/admin/login/page.tsx
src/app/admin/(panel)/layout.tsx
src/app/admin/(panel)/page.tsx
src/app/admin/(panel)/categories/page.tsx
src/app/admin/(panel)/products/page.tsx
src/app/admin/(panel)/sliders/page.tsx
src/app/admin/(panel)/settings/page.tsx
src/app/api/auth/login/route.ts
src/app/api/auth/logout/route.ts
src/app/api/auth/me/route.ts
src/app/api/categories/route.ts
src/app/api/categories/[id]/route.ts
src/app/api/products/route.ts
src/app/api/products/[slug]/route.ts
src/app/api/sliders/route.ts
src/app/api/sliders/[id]/route.ts
src/app/api/settings/route.ts
src/app/api/upload/route.ts
src/components/layout/Header.tsx
src/components/layout/Footer.tsx
src/components/layout/TopBar.tsx
src/components/layout/MobileNav.tsx
src/components/layout/WhatsAppButton.tsx
src/components/home/HeroSlider.tsx
src/components/home/CategoryGrid.tsx
src/components/home/FeaturedProducts.tsx
src/components/home/WhyAwardwala.tsx
src/components/home/MeetingCta.tsx
src/components/category/ProductGrid.tsx
src/components/category/Pagination.tsx
src/components/category/SubcategoryRow.tsx
src/components/product/Gallery.tsx
src/components/product/BuyBox.tsx
src/components/product/RelatedProducts.tsx
src/components/ui/Container.tsx
src/components/ui/Breadcrumbs.tsx
src/components/admin/Sidebar.tsx
src/components/admin/ImageUpload.tsx
src/components/admin/ConfirmDialog.tsx
src/lib/db/mongoose.ts
src/lib/db/queries.ts
src/lib/db/models/AdminUser.ts
src/lib/db/models/Category.ts
src/lib/db/models/Product.ts
src/lib/db/models/Slider.ts
src/lib/db/models/SiteSetting.ts
src/lib/auth.ts
src/lib/whatsapp.ts
src/lib/slug.ts
src/lib/imagekit/server.ts
src/lib/imagekit/url.ts
src/lib/validators/category.ts
src/lib/validators/product.ts
src/lib/validators/slider.ts
src/lib/validators/settings.ts
src/types/index.ts
src/middleware.ts
scripts/seed.ts
.env.example
```

Product PATCH/DELETE are by **id**, while the public GET one is by **slug**. Implement that split cleanly:

- `src/app/api/products/[slug]/route.ts` handles GET by slug.
- PUT delete and patch in `src/app/api/products/id/[id]/route.ts` so Next.js dynamic params do not collide.

Adjust the file tree accordingly. Document the real paths in a short comment at the top of each route file.

`.env.example`:

```
MONGODB_URI="mongodb://127.0.0.1:27017/awardwala"
AUTH_SECRET="replace-with-a-long-random-string"
IMAGEKIT_PUBLIC_KEY=""
IMAGEKIT_PRIVATE_KEY=""
IMAGEKIT_URL_ENDPOINT=""
```

Add `.env` to `.gitignore` if it is not already ignored. Do not commit real secrets.

Do not add a `prisma/` folder. If an empty `prisma/` folder is already in the repo, delete it.

Replace Geist in the root layout with Outfit. Update metadata:

- title default: `Awardwala — Trophies, Medals & Promotional Gifts`
- description: the tagline
- `metadataBase` can be omitted

`next.config.ts`: keep the file valid. Add `images.remotePatterns` for `ik.imagekit.io`. Leave existing flags if the project already builds with them.

---

## 10. Done when

- `npm run dev` opens a home page that looks like a finished Awardwala catalog: top bar, sticky nav with trophy dropdown, slider, 3 category cards, featured products, why section, meeting band, footer, WhatsApp button.
- `/about` and `/contact` use the real copy and the seeded phone numbers.
- `/category/trophy`, `/category/wooden-trophy`, `/category/sports-medals`, `/category/corporate-gift-items` all render.
- `/product/tro-280` shows price `800 Per Pcs`, min qty 25, description, WhatsApp link, and related acrylic products.
- Tier prices show as one string, not as separate broken fields.
- `/admin/login` accepts `admin@awardwala.com` / `Awardwala@123` and lands on a dashboard.
- Admin can create a category, upload an image (when ImageKit keys exist), create a product with two images, feature it, and see it on the home page after refresh.
- Logout works. Visiting `/admin` while logged out returns to login.
- Invalid API bodies return 400. Missing records return 404. Unauthenticated writes return 401.
- Mobile nav works. No horizontal page scroll at 375px.
- No cart, no fake payment, no customer accounts.
