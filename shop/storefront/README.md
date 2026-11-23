# Kiboar storefront

The customer-facing shop, served under `/shop`. It is a separate project from
`web` and from the Medusa backend: it shares the design language, not the code.

**Status: catalogue, product pages and a demo bag.** It lists the products
published in Medusa as vertical cards with a photo, the name and the price, and
each card opens a page for that board. There is no checkout, account or search
yet.

## Product pages

A card links to `?p=<handle>`, for example `/shop/?p=kiboar-60-hhkb`. The page
reads the `handle` from the URL, loads that product from the Store API and shows
the photo, the name, the price, the description and the variants, with an
`Add to bag` button. Unknown handles render a "not published" state.

The handle lives in a query string on purpose: the build is static and no host
rewrite is configured yet, so a real `/products/<handle>` path would break on a
reload or a shared link. Moving to a path is a routing decision for the host.

## Bag

The `Bag` control in the top bar opens a side panel with the selected boards,
quantities, a remove action and the total. Products are added from their own
page, not from the card. The bag is **client-side only**: it does not create a
Medusa cart, it is not persisted and it is lost on reload. Checkout is not
connected.

## Photos

Each card uses the product's `thumbnail` from the Store API. Upload one in the
Medusa admin (**Products → the product → Media**) and the card shows it. Without
a thumbnail the card renders a neutral "No photo" panel; no image is invented or
bundled.

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

- No imports from `web/` or `software/`. The palette and type are copied on
  purpose; extracting a shared package is a separate decision.
- No Medusa admin code here. The admin is served by the Medusa application.
- No secrets in the bundle. The publishable key is public by design; anything
  else belongs to the backend.
