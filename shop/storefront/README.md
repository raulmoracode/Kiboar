# Kiboar storefront

The customer-facing shop, served under `/shop`. It is a separate app from
`web` and from the Medusa backend: they share `@kiboar/design` and
`@kiboar/tsconfig` from `packages/`, not pages or components.

**Status: catalogue, product pages and a demo bag.** It lists the products
published in Medusa as vertical cards with a photo, the name and the price, and
each card opens a page for that board, with a gallery of every photo on the
product. There is no checkout, account or search yet.

## Product pages

A card links to `?p=<handle>`, for example `/shop/?p=kiboar-60-hhkb`. The page
reads the `handle` from the URL, loads that product from the Store API and shows
the photo, the name, the price, the description and the variants, with an
`Add to bag` button. Unknown handles render a "not published" state.

The handle lives in a query string on purpose: the build is static and no host
rewrite is configured yet, so a real `/products/<handle>` path would break on a
reload or a shared link. Moving to a path is a routing decision for the host.

## Bag

The `Bag` control in the top bar opens a drawer on the right; on phones it is a
bottom sheet. Each line has the product photo and name (both link back to the
product), a quantity stepper and the line total. The `−` stops at 1; the red
trash button removes the whole line, whatever the quantity.
The footer shows the subtotal and a disabled `Checkout` button, because the
checkout is not connected. When the bag is empty, `Browse boards` closes it and
returns to the catalogue.

Products are added from their own page, not from the card. The bag is
**client-side only**: it does not create a Medusa cart, it is not persisted and
it is lost on reload. It closes on Escape, keeps focus inside and returns focus
to the control that opened it.

## Photos

Each card uses the product's `thumbnail`. The product page shows every image in
the product's `images` gallery, with a thumbnail strip under the main photo; with
no images it falls back to the thumbnail. Upload them in the Medusa admin
(**Products → the product → Media**). Without any image the card renders a
neutral "No photo" panel; no image is invented or bundled.

## Development

From the repository root:

```bash
pnpm install
cp shop/storefront/.env.template shop/storefront/.env.local
# edit .env.local: VITE_MEDUSA_URL and the publishable key
pnpm --filter @kiboar/storefront dev        # http://localhost:3001
```

The key is created in the Medusa admin under **Settings → Developer →
Publishable API keys**. Publishable keys are public; they scope the Store API to
one or more sales channels.

The Medusa service must allow this origin. Its `STORE_CORS` includes
`http://localhost:3001` in `.env.template`; add the production origin there too.

## Commands

```bash
pnpm --filter @kiboar/storefront dev
pnpm --filter @kiboar/storefront typecheck
pnpm --filter @kiboar/storefront build
```

## Deployment

The output is static. It is served under `/shop`, so build with the base path:

```bash
VITE_BASE_PATH=/shop/ pnpm --filter @kiboar/storefront build
```

The host must route `/shop` to this build and proxy the Store API separately.
The storefront talks to Medusa over HTTP; it does not import the backend.

## Boundaries

- No imports from `web/` or `software/`. The shared base comes from
  `@kiboar/design`; product pages and cards stay in this app.
- No Medusa admin code here. The admin is served by the Medusa application.
- No secrets in the bundle. The publishable key is public by design; anything
  else belongs to the backend.
