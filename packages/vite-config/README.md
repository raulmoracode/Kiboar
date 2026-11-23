# @kiboar/vite-config

The Vite setup shared by the Kiboar React apps: the React plugin, the Tailwind
plugin and the strict dev/preview ports. It exists so `web` and the storefront do
not repeat the same plugin wiring or depend on the plugins directly.

## Usage

```ts
import { kiboarViteConfig } from "@kiboar/vite-config";

export default kiboarViteConfig({ port: 3000 });
```

The storefront also sets the deployed base path:

```ts
export default kiboarViteConfig({
  port: 3001,
  base: process.env.VITE_BASE_PATH ?? "/",
});
```

## Boundaries

- The package exports the config; the app still owns its `vite` binary and its
  `index.html`, because Vite runs from the app root.
- `vite` is a peer dependency: the app decides the Vite version and the package
  does not install a second copy.
- React itself is not re-exported here. Each app declares `react` and
  `react-dom` with the catalog version; a wrapper would break hooks and produce
  a second React copy.
