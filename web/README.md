# Kiboar web

The public front door of the Kiboar brand: the keyboards, the official library,
Kiboar Studio, the documentation and the shop in one place. A Vite 8 + React 19 +
Tailwind 4 single page application.

**Status: brand page and product pages.** The home page draws the word Kiboar on
the keyboard. Each letter opens one destination — Keyboards, Library, Shop,
Studio, Docs and GitHub — and pressing the letter does the same. Keyboards,
Library and Studio open the local pages in the same tab; the rest open in a new
tab. It does not replace the docs or the shop. The storefront in `shop/` reads
Medusa; `web` does not call the Store API.

## Development

From the repository root:

```bash
pnpm install
pnpm --filter @kiboar/web dev        # http://localhost:3000
pnpm --filter @kiboar/web typecheck
pnpm --filter @kiboar/web build
```

`dev` and `preview` use port 3000 with `strictPort`, the same port the shop
allows in `STORE_CORS`.

## Layout

```text
index.html          Vite entry
src/main.tsx        React root
src/App.tsx         the router, home page and keyboard shortcuts
src/Keyboard.tsx    the drawn keyboard and the letter links
src/PageHeader.tsx  the shared Kiboar / section breadcrumb
src/StudioPage.tsx  the Studio page: download, install and scope
src/LibraryPage.tsx the library page: counts, install and scope
src/KeyboardsPage.tsx  the open board definitions as cards
src/NotFoundPage.tsx   the client-side 404
src/boards.ts       the board data mirrored from software/boards
src/products.ts     the six destinations, their keys and internal links
src/styles.css      the shared design entry
vite.config.ts      shared Vite config and port 3000
```

## Sharing

The package is part of the root pnpm workspace, so React, Vite, Tailwind and
TypeScript come from the `catalog` block of `pnpm-workspace.yaml`. There is no
second lockfile and no nested workspace.

The base CSS and colour tokens come from `@kiboar/design`, the Vite plugins and
ports from `@kiboar/vite-config`, and the compiler options from
`@kiboar/tsconfig`, all in `packages/`. React, Vite, Tailwind and TypeScript
versions come from the catalog. If a component or a type
is needed by both `web` and another product, add it as a shared package instead
of copying it; a component used by one product stays in that product.

## Deployment

Served at the root of the brand domain, `https://kiboar.raulmoracode.com/`.
`pnpm --filter @kiboar/web build` produces a static `dist/` with no server.

The app also serves `/studio`, `/library` and `/keyboards`, and a client-side
404 for any other path. The host must fall back to `index.html` for those
routes, as for any client-side route, so a reload or a shared link works. The
404 is a client-side page, not an HTTP 404 status; it sets `robots: noindex`.

The docs (`/docs`) and the shop (`/shop`) are separate deployments behind the
same domain. This app owns `/` and `/studio`; the host must route the other
prefixes. See [`../ARCHITECTURE.md`](../ARCHITECTURE.md#deployment).
