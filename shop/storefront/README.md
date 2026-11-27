# Kiboar storefront

The customer-facing shop, served under `/shop`. It is a separate app from
`web` and from the Medusa backend: they share `@kiboar/design`,
`@kiboar/vite-config` and `@kiboar/tsconfig` from `packages/`, not pages or
components.

**Status: catalogue, product pages and a demo bag.** It lists the products
published in Medusa as vertical cards with a photo, the name and the price. The
catalogue loads in pages, prices follow the Medusa region when one exists, a
failed request can be retried, and each card opens a page for that board with a
gallery of every photo. The bag survives a reload. There is no checkout, account
or search yet.

## Product pages

A card links to `?p=<handle>`, for example `/shop/?p=kiboar-60-hhkb`. The page
reads the `handle` from the URL, loads that product from the Store API and shows
the photo, the name, the price, the description and the variants, with an
`Add to bag` button. When the product metadata has `keyboard_files_url`, a
`Keyboard files on GitHub` button appears below `Add to bag`; a missing or
non-GitHub URL hides it. When `firmware_url` is set, a **Download official
firmware** button appears below the GitHub button. Every page shows a banner under
the header, **Every Kiboar board can be flashed and remapped with Kiboar
Studio**, which links to the public `/studio` page. Below the details, a **More
boards** heading and three random other boards link to their pages. Unknown
handles render a "not published" state.

On phones and tablets the product image uses a 16:10 frame, the buttons take the
full content width, and **More boards** stays a single vertical list. The buttons
keep the full details-column width on desktop. The catalogue switches to two
columns with the price under the title on phones.

The handle lives in a query string on purpose: the build is static and no host
rewrite is configured yet, so a real `/products/<handle>` path would break on a
reload or a shared link. Moving to a path is a routing decision for the host.

## Catalogue and currency

The catalogue reads the Store API `count` and loads twelve products at a time;
`Load more` appends the next page. A failed catalogue or product request offers
`Try again` without reloading the page.

At boot the storefront reads `/store/regions`. If `VITE_REGION_ID` is set, it
uses that region; otherwise it uses the first published one. The region
`currency_code` selects the price and formats it with the browser locale. With
no regions, it falls back to the currency of the product prices.

## Bag

The `Bag` control in the top bar opens a drawer on the right; on phones it is a
bottom sheet. Each line has the product photo and name (both link back to the
product), a quantity stepper and the line total. The `−` stops at 1; the red
trash button removes the whole line, whatever the quantity.
The footer shows the subtotal and a disabled `Checkout` button, because the
checkout is not connected. When the bag is empty, `Browse boards` closes it and
returns to the catalogue.

Products are added from their own page, not from the card. The bag is
**client-side only**: it does not create a Medusa cart. It is stored in
`localStorage` under a versioned key so it survives a reload; malformed stored
data is ignored. It closes on Escape, keeps focus inside and returns focus to
the control that opened it.

## Stock

The add button shows `Sold out` when the Store API returns
`inventory_quantity: 0` with `manage_inventory` enabled and no backorder. The
default Medusa Store API does not expose inventory quantities, so with the
current backend the field is absent and every published variant stays
available. A real stock gate needs a store-level availability endpoint or a
custom field; this app does not invent one.

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
# optional: VITE_REGION_ID to pin one region
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
pnpm --filter @kiboar/storefront test:e2e
```

The end-to-end suite builds the storefront, serves the static output and mocks
the Store API with Playwright, so it needs no Medusa or PostgreSQL. The Playwright
browser is installed once with
`pnpm --filter @kiboar/storefront exec playwright install chromium`.

## Deployment

The output is static. It is served under `/shop`, so build with the base path.
A production build fails if the Medusa URL or the publishable key is missing:

```bash
VITE_BASE_PATH=/shop/ \
VITE_MEDUSA_URL=https://shop.example.com \
VITE_MEDUSA_PUBLISHABLE_KEY=pk_live_... \
pnpm --filter @kiboar/storefront build
```

The host must route `/shop` to this build and proxy the Store API separately.
The storefront talks to Medusa over HTTP; it does not import the backend.

## Boundaries

- No imports from `web/` or `software/`. The design base and the Vite setup come
  from `@kiboar/design` and `@kiboar/vite-config`; product pages and cards stay
  in this app.
- No Medusa admin code here. The admin is served by the Medusa application.
- No secrets in the bundle. The publishable key is public by design; anything
  else belongs to the backend.
