# Kiboar web

The public front door of the Kiboar brand: the keyboards, the official library,
Kiboar Studio, the documentation and the shop in one place. A Vite 8 + React 19 +
Tailwind 4 single page application.

**Status: scaffold.** One landing page that points at the documentation, the
Studio release and the source. It does not replace the docs or the shop; it
points at them. The Medusa Store API integration is the next step once the
catalogue exists.

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
src/App.tsx         the page
src/styles.css      Tailwind import and the shared base
vite.config.ts      shared Vite config and port 3000
```

## Sharing

The package is part of the root pnpm workspace, so React, TypeScript and
Tailwind come from the `catalog` block of `pnpm-workspace.yaml`. There is no
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

The docs (`/docs`) and the shop (`/shop`) are separate deployments behind the
same domain. This app owns `/` only; the host must route the other prefixes. See
[`../ARCHITECTURE.md`](../ARCHITECTURE.md#deployment).
