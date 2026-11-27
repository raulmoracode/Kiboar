# @kiboar/links

The canonical URLs shared by the Kiboar web products. Every link to the
repository, the public site, the documentation, the Studio release and the
library install pages comes from here, so a domain or release change happens in
one place.

## Usage

```ts
import { docs, repository, studio } from "@kiboar/links";

repository; // https://github.com/raulmoracode/Kiboar
docs; // https://kiboar.raulmoracode.com/docs
studio.dmg; // the published macOS asset
```

The package also exports `blob`, `tree`, `raw`, `release` and `asset` helpers for
repository paths and release assets, plus grouped `studio`, `library` and
`keyboards` entry points.

## What it owns

- The repository, site root and documentation URLs.
- Helpers for repository blobs, trees, raw files, releases and release assets.
- The Studio release tag and the published DMG, `SHA256SUMS`, install guide,
  ADR, installer script, source and roadmap links.
- The library install, licensing, notice and source links.
- The keyboards README link.

## Boundaries

- URLs and tiny path helpers only. No React, no product data and no build step.
- The Studio tag and asset names must match the published release and
  `.github/workflows/studio-release.yml`.
- A product-specific URL stays in that product; this package is for links that
  more than one product needs.
