# Kiboar shop

The commercial surface of the brand: it sells assembled Kiboar keyboards. Buying
is a convenience, not a lock-in — the library and the board definitions are
published and the documentation lets anyone build the same board. A Medusa v2
application with the Store API and the admin dashboard.

**Status: scaffold.** The application is wired into the repository workspace and
builds and runs, but it has no products, no region and no storefront
integration. The `web` product is the public site and the future storefront.

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

## pnpm notes

Medusa needs some packages hoisted to the top-level `node_modules`. That is why
the repository root has an `.npmrc` with the four `public-hoist-pattern`
entries from the Medusa pnpm guide. Do not remove them: without them the admin
fails with `can't resolve @medusajs/dashboard` or a missing `QueryClient`.

## What is not here

- No storefront: `web/` is the public site and will consume the Store API.
- No catalogue seed, no payment provider, no shipping options.
- No deployment. Medusa Cloud or a Node host are the candidates.
