# Kiboar shop

The commercial surface of the brand: it sells assembled Kiboar keyboards. Buying
is a convenience, not a lock-in — the library and the board definitions are
published and the documentation lets anyone build the same board.

Two applications live here: the Medusa v2 service (Store API and admin
dashboard) and the storefront in `shop/storefront`, a static Vite app that reads
the Store API over HTTP.

**Status: catalogue.** The backend and the admin run, and the storefront lists
the published products with their prices. There is no cart, checkout or account
flow yet.

## Requirements

- Node 22.23.4 or newer and pnpm 12, the same as the rest of the workspace.
- PostgreSQL for `dev`, `db:migrate` and `start`. The build does not need a
  database.

## Setup

```bash
cp shop/.env.template shop/.env
# edit shop/.env: DATABASE_URL, JWT_SECRET and COOKIE_SECRET
pnpm --filter @kiboar/shop db:migrate
pnpm --filter @kiboar/shop dev
```

The API runs at <http://localhost:9000> and the admin dashboard at
<http://localhost:9000/app>. The first launch asks you to create an admin user.

## Commands

```bash
pnpm --filter @kiboar/shop dev          # needs PostgreSQL
pnpm --filter @kiboar/shop build        # compiles the server and the admin
pnpm --filter @kiboar/shop start        # needs PostgreSQL and a build
pnpm --filter @kiboar/shop db:migrate   # applies the migrations
```

`build` writes to `.medusa/`, which is ignored by git.

## Storefront

`shop/storefront` is the customer-facing app, served under `/shop`. It is a
separate app from `web`: both use the base CSS and colour tokens from
`@kiboar/design`, but neither imports the other's pages or components.

```bash
cp shop/storefront/.env.template shop/storefront/.env.local
# edit it: VITE_MEDUSA_URL and the publishable key from the admin
pnpm --filter @kiboar/storefront dev        # http://localhost:3001
pnpm --filter @kiboar/storefront typecheck
pnpm --filter @kiboar/storefront build
```

The key is created in the admin under **Settings → Developer → Publishable API
keys**. The Medusa `STORE_CORS` must include the storefront origin; the template
allows both `http://localhost:3000` and `http://localhost:3001` in development.

## pnpm notes

Medusa needs some packages hoisted to the top-level `node_modules`. That is why
the repository root has an `.npmrc` with the four `public-hoist-pattern`
entries from the Medusa pnpm guide. Do not remove them: without them the admin
fails with `can't resolve @medusajs/dashboard` or a missing `QueryClient`.

## Deployment

The storefront is static: build it with `VITE_BASE_PATH=/shop/` and serve it at
`/shop`. The Medusa service (Store API and admin) needs Node and PostgreSQL and
is proxied behind the same prefix; the admin and the API come from that process,
so the rewrite has to keep their paths consistent. Production CORS must include
the brand domain.

The routing and the production host are not configured in this repository.

## What is not here

- No cart, checkout, customer accounts or product detail pages.
- No catalogue seed, payment provider or shipping options.
- No deployment configuration. The `/shop` route is a host concern; the
  applications themselves are ready to build.
