# AGENTS.md — shop

This file covers the Medusa application in `shop/`. Read the root
[`AGENTS.md`](../AGENTS.md) first: the Git, licensing and repository-wide rules
there apply here.

## What this product is

The commercial surface of the Kiboar brand: it sells assembled keyboards. Three
applications live here: a Medusa v2 service with the Store API and the admin
dashboard (`@kiboar/shop`), the storefront in `shop/storefront`
(`@kiboar/storefront`), a static Vite app that reads the Store API over HTTP,
and the POS in `shop/pos` (`@kiboar/pos`), an Expo/React Native app for staff
that uses the Admin API. None is the public site; `web/` is.

Buying is a convenience, not a lock-in: the library and the documentation must
let anyone build the same board, so the shop never gates the design.

## Layout

- `medusa-config.ts` — database and CORS configuration, read from `.env`.
- `src/api/` — custom API routes.
- `src/scripts/` — CLI scripts; `seed.ts` creates the region, sales channels,
  stock location, shipping options, publishable keys and the Kiboar boards.
- `src/admin/` — admin customizations, when they exist.
- `pgadmin/servers.json` — the local pgAdmin connection to the compose database.
- `storefront/` — the customer-facing Vite app, served under `/shop`.
- `pos/` — the Expo/React Native POS; it is not part of `medusa build`
  (the Medusa `tsconfig.json` excludes it) and has its own `shop-pos` CI workflow.
- `.env.template` — the variables a local `.env` needs. Never commit `.env`.

## Rules

- **One workspace.** There is no `shop/pnpm-workspace.yaml` and no
  `shop/package-lock.json`. Dependencies resolve through the root lockfile.
- **The hoisting config is load-bearing.** The root `.npmrc` hoists
  `@medusajs/*`, `@tanstack/react-query`, `react-i18next` and
  `react-router-dom`. Removing those entries breaks the admin.
- **The build must not need a database.** `medusa build` is what CI runs; keep
  it that way. `dev`, `start` and `db:migrate` may require PostgreSQL.
- **The seed owns the catalogue.** Products, photos, prices, regions and the two
  sales channels come from `src/scripts/seed.ts` into PostgreSQL; do not
  reintroduce hardcoded catalogues or photos in the storefront or the POS. The
  seed must stay idempotent and must not run during `medusa build`.
- **The storefront bag is a demo.** It lives in browser memory, does not create
  a Medusa cart and has no checkout. Do not document it as a working purchase
  flow.
- **The storefront is separate from `web`.** `shop/storefront` is its own Vite
  app; do not import `web/` or `software/` code into it. Both front ends share
  `@kiboar/design`, `@kiboar/vite-config` and `@kiboar/tsconfig`, not screens.
- **The POS is a staff surface.** `shop/pos` reads the catalogue from the Store
  API with a publishable key scoped to the POS sales channel, and uses the Admin
  API for the authenticated operations (login and checkout). It never carries a
  secret key. Its non-secret configuration uses `EXPO_PUBLIC_*`; credentials are
  stored in the device keychain.
- **The POS palette is shared.** Import `kiboarColors` from
  `@kiboar/design/tokens`; do not copy hex values into `shop/pos`. Only POS
  spacing, typography and layout belong in the app's theme file.
- **No secrets.** `.env` stays local; `.env.template` carries placeholders only.

## Commands

```bash
cp shop/.env.template shop/.env       # once, then edit it
pnpm --filter @kiboar/shop build
pnpm --filter @kiboar/shop typecheck
pnpm --filter @kiboar/shop dev        # needs PostgreSQL
pnpm --filter @kiboar/shop db:migrate
pnpm --filter @kiboar/shop seed       # needs PostgreSQL; idempotent

cp shop/storefront/.env.template shop/storefront/.env.local
pnpm --filter @kiboar/storefront dev        # http://localhost:3001
pnpm --filter @kiboar/storefront build

cp shop/pos/.env.template shop/pos/.env.local
pnpm --filter @kiboar/pos start
pnpm --filter @kiboar/pos web          # browser preview
pnpm --filter @kiboar/pos typecheck
pnpm --filter @kiboar/pos test
```

## Before a PR

- `pnpm lint` passes (Biome covers `shop/`).
- `pnpm --filter @kiboar/shop build` passes without a database.
- `pnpm install --frozen-lockfile` is clean when dependencies changed.
- Paste the real command output in the pull request, and say that `dev` was not
  run if there is no database.

## Labels

| Label | When |
| --- | --- |
| `product:shop` | Every issue or pull request that touches `shop/` |
| Exactly one `type:*` from [`../LABELS.md`](../LABELS.md) | Matches the title prefix |

If the change also touches `web`, the library, the docs or Studio, add that
product's label too. Do not use `area:*` for new work.

## Git

Follow the root `AGENTS.md`: issue → branch → pull request, with
`feat/<issue>-<slug>` or `fix/<issue>-<slug>` and a Conventional Commit.
