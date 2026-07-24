# JollofPlate Web

Customer-facing website and admin dashboard for **JollofPlate** — a digital-first jollof food brand.

> **Tagline:** Every Plate Tells a Story.

## Scope (this repo)

| Area | Responsibility |
|------|----------------|
| Public site | Home, menu, meal details, cart, WhatsApp checkout |
| Admin dashboard | Categories, meals, gallery, restaurant settings, stats |
| Client state | Cart, React Query data fetching |
| Brand UI | Colors, typography, mobile-first layouts |

Backend APIs live in [`jollofplate-api`](https://github.com/mjmandelah07/jollofplate-api).

## MVP goals

- Browse and search the menu in under 30 seconds
- Complete a WhatsApp order in under 2 minutes
- Admins update menu items in under 1 minute
- Fast, mobile-first experience

Checkout for MVP is **WhatsApp only** (no online payments yet).

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- React Query (TanStack Query)
- Hosted on Vercel

## Brand (quick reference)

| Token | Value |
|-------|-------|
| Primary | Jollof Red `#C0392B` |
| Secondary | Golden Rice `#F39C12` |
| Accent | Fresh Green `#145A32` |
| Background | Warm Cream `#FFF8F0` |
| Text | Charcoal Black `#222222` |
| Headings | Poppins Bold |
| Body | Inter |

Full brand guide: [`docs/BRAND.md`](./docs/BRAND.md)

## Product requirements

See [`docs/PRD.md`](./docs/PRD.md) for pages, user flows, admin features, and out-of-scope items.

## Suggested app structure

```
src/
  app/
    (public)/          # home, menu, meal details, cart
    admin/             # protected dashboard
    api/               # optional BFF / revalidation helpers
  components/
    public/
    admin/
    ui/
  lib/
    api/               # API client
    cart/
    whatsapp/          # order message builder
  types/
```

## Environment variables

```bash
NEXT_PUBLIC_API_URL=https://jollofplate-api-develop.onrender.com
NEXT_PUBLIC_SITE_URL=https://jollofplate.com
NEXT_PUBLIC_WHATSAPP_NUMBER=+2348083171151
NEXT_PUBLIC_CONTACT_EMAIL=jollofplate@gamil.com
NEXT_PUBLIC_ADDRESS=Ikorodu, Lagos, Nigeria
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

## Getting started

```bash
npm install
npm run dev
```

## Related docs

- Brand: [`docs/BRAND.md`](./docs/BRAND.md)
- Frontend PRD: [`docs/PRD.md`](./docs/PRD.md)
- API repo: https://github.com/mjmandelah07/jollofplate-api
