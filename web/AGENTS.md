# AGENTS.md — web

This file covers the public site in `web/`. Read the root [`AGENTS.md`](../AGENTS.md)
first: the Git, licensing and repository-wide rules there apply here.

## What this product is

The public Kiboar site: a Vite + React + Tailwind single page application. It is
`@kiboar/web`, a package of the root pnpm workspace. It is not the shop: the
shop is the Medusa application in `shop/`.

## Layout

- `src/App.tsx` — the page. Keep it one page until there is a reason for more.
- `src/styles.css` — the Tailwind import and the base styles.
- `vite.config.ts` — React and Tailwind plugins, port 3000.

## Rules

- **One workspace.** There is no `web/pnpm-workspace.yaml` and no
  `web/package-lock.json`. Shared versions come from the root `catalog`.
- **No framework migration without a decision.** Vite and React are the stack;
  switching to another framework is a new issue, not a refactor.
- **The shop is a separate product.** Do not import `shop/` code into `web/`;
  talk to its Store API over HTTP.
- **Static output only.** No server adapter, no runtime secret in the bundle.
- **Accessible by default.** Semantic elements, focus styles and a real heading
  order; the page is a document, not a canvas.
- **No remote fonts or trackers.** The site ships its own CSS and no analytics.

## Commands

```bash
pnpm --filter @kiboar/web dev
pnpm --filter @kiboar/web typecheck
pnpm --filter @kiboar/web build
```

## Before a PR

- `pnpm lint` passes (Biome covers `web/`).
- `pnpm --filter @kiboar/web typecheck` passes.
- `pnpm --filter @kiboar/web build` passes.
- Paste the real command output in the pull request.

## Labels

| Label | When |
| --- | --- |
| `product:web` | Every issue or pull request that touches `web/` |
| Exactly one `type:*` from [`../LABELS.md`](../LABELS.md) | Matches the title prefix |

If the change also touches the shop, the library, the docs or Studio, add that
product's label too. Do not use `area:*` for new work.

## Git

Follow the root `AGENTS.md`: issue → branch → pull request, with
`feat/<issue>-<slug>` or `fix/<issue>-<slug>` and a Conventional Commit.
