# Kiboar storefront

The customer-facing shop, served under `/shop`. It is a separate project from
`web` and from the Medusa backend: it shares the design language, not the code.

**Status: catalogue with a demo bag.** It lists the products published in Medusa
as vertical cards with a photo, the name and the price, and lets you add them to
a local bag. There is no checkout, account or product page yet.

## Bag

The `Bag` control in the top bar opens a side panel with the selected products,
quantities and total. The bag is **client-side only**: it does not create a
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
