# @kiboar/tsconfig

The TypeScript options shared by the Kiboar apps and Node packages.

- `base.json` — the strict base for Node libraries: ES2022, Bundler resolution,
  `strict`, `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- `react.json` — the base plus the browser libraries, `react-jsx` and `noEmit`.

## Usage

React apps:

```json
{
  "extends": "@kiboar/tsconfig/react.json",
  "compilerOptions": {
    "types": ["vite/client"]
  },
  "include": ["src", "vite.config.ts"]
}
```

Node packages:

```json
{
  "extends": "@kiboar/tsconfig/base.json",
  "compilerOptions": {
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["src", "test"]
}
```

Keep in the project only what is genuinely per project:

- `types`, because the storefront and core add `node` for their tooling.
- `include`, because each project owns its source roots.

## Boundaries

- No path aliases and no project references yet.
- Astro (`docs`) extends Astro's own strict config and Medusa (`shop`) needs
  `Node16` resolution and decorators; neither extends this package.
