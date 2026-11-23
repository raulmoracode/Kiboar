# @kiboar/tsconfig

The TypeScript options shared by the Kiboar React apps: the browser libraries,
Bundler resolution, strict mode and the `noUncheckedIndexedAccess` and
`exactOptionalPropertyTypes` flags the two apps already enforce.

## Usage

```json
{
  "extends": "@kiboar/tsconfig/react.json",
  "compilerOptions": {
    "types": ["vite/client"]
  },
  "include": ["src", "vite.config.ts"]
}
```

Keep in the app only what is genuinely per app:

- `types`, because the storefront includes `node` for its Vite config.
- `include`, because each app owns its source roots.

The base does not include a `$schema`-driven `include` or `types`, so the app
still decides what enters the program.

## Boundaries

- No path aliases and no project references yet; both apps have one `src` tree.
- Node-only packages do not extend this file. Medusa and the library tooling
  keep their own configuration.
