# AGENTS.md — shop

This file covers the Medusa application in `shop/`. Read the root
[`AGENTS.md`](../AGENTS.md) first: the Git, licensing and repository-wide rules
there apply here.

## What this product is

The Kiboar shop backend: a Medusa v2 application with the Store API and the
admin dashboard. It is `@kiboar/shop`, a package of the root pnpm workspace. It
is not the public site; `web/` is.

## Layout

- `medusa-config.ts` — database and CORS configuration, read from `.env`.
- `src/api/` — custom API routes.
- `src/admin/` — admin customizations, when they exist.
- `.env.template` — the variables a local `.env` needs. Never commit `.env`.

## Rules

- **One workspace.** There is no `shop/pnpm-workspace.yaml` and no
  `shop/package-lock.json`. Dependencies resolve through the root lockfile.
- **The hoisting config is load-bearing.** The root `.npmrc` hoists
  `@medusajs/*`, `@tanstack/react-query`, `react-i18next` and
  `react-router-dom`. Removing those entries breaks the admin.
- **The build must not need a database.** `medusa build` is what CI runs; keep
  it that way. `dev`, `start` and `db:migrate` may require PostgreSQL.
- **No catalogue in the repository yet.** Products, regions and prices are not
  seeded from `src/`. A seed is a separate change with its own decision.
- **No secrets.** `.env` stays local; `.env.template` carries placeholders only.
- **No storefront here.** The customer-facing UI belongs to `web/`.

## Commands

```bash
cp shop/.env.template shop/.env       # once, then edit it
pnpm --filter @kiboar/shop build
pnpm --filter @kiboar/shop dev        # needs PostgreSQL
pnpm --filter @kiboar/shop db:migrate
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
