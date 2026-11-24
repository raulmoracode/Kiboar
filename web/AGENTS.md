# AGENTS.md — web

This file covers the public site in `web/`. Read the root [`AGENTS.md`](../AGENTS.md)
first: the Git, licensing and repository-wide rules there apply here.

## What this product is

The public front door of the Kiboar brand: the keyboards, the official library,
Kiboar Studio, the documentation and the shop in one place. It is
`@kiboar/web`, a package of the root pnpm workspace. It is not the shop: the
shop is the Medusa application in `shop/`, and this site points at it.

## Layout

- `src/App.tsx` — the minimal router, the home page and the keyboard shortcut listener.
- `src/Keyboard.tsx` — the drawn keyboard; the six lit keys are real links.
- `src/LandingLayout.tsx` — the keyboard-first layout shared by the home page and the 404.
- `src/ProductLinks.tsx` — the six destination links under the keyboard.
- `src/PageHeader.tsx` — the shared `Kiboar / section` breadcrumb.
- `src/StudioPage.tsx` — the `/studio` page: download, install paths and scope.
- `src/LibraryPage.tsx` — the `/library` page: counts, install and scope.
- `src/KeyboardsPage.tsx` — the `/keyboards` page: the open board definitions as cards.
- `src/NotFoundPage.tsx` — the 404 page: the landing layout with a 404 keyboard; it sets `robots: noindex`.
- `src/boards.ts` — the board data mirrored from `software/boards`; update it when a definition changes.
- `src/products.ts` — the six destinations, their key and whether they are internal.
- `src/styles.css` — the shared design entry from `@kiboar/design`.
- `vite.config.ts` — the shared `@kiboar/vite-config` setup and port 3000.

## Rules

- **One workspace.** There is no `web/pnpm-workspace.yaml` and no
  `web/package-lock.json`. Shared versions come from the root `catalog`.
- **No framework migration without a decision.** Vite and React are the stack;
  switching to another framework is a new issue, not a refactor.
- **The letter menu is the navigation.** Every destination lives in
  `src/products.ts` with its key. Keep the keys as real links inside the SVG and
  the shortcut handler ignoring modifiers, key repeats and form fields. External
  destinations open in a new tab; `internal: true` destinations (Keyboards,
  Library and Studio) use the local router and the same tab.
- **Product pages stay honest.** Studio links the real release asset; the
  Keyboards cards use the real definitions in `software/boards` and say the
  hardware files are pending; the Library page states the real counts and the
  keyswitch limitation. Do not add invented screenshots or prices.
- **The 404 reuses the home layout.** It is the landing layout with `404` on the
  keyboard and `robots: noindex`, not a separate page design. Keep it identical
  to the home page apart from the keyboard word.
- **The shop is a separate product.** Do not import `shop/` code into `web/`;
  talk to its Store API over HTTP. Both apps share `@kiboar/design`,
  `@kiboar/vite-config` and `@kiboar/tsconfig`, not screens.
- **Shared code goes to `packages/`.** Do not copy a component or a type into
  `web/` when another product needs it; add it to a shared package instead.
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
