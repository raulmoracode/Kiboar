# Releasing

Kiboar ships several products with independent versions. A release is a tagged
commit plus the artifacts that belong to it; the documentation site is the
exception, because it deploys from `main` and has no version.

This document is the process. It does not bump a version, create a tag or
publish anything by itself, and it does not claim that the gaps at the end are
already automated.

## Version sources

| Product | Version lives in | Shipped as |
| --- | --- | --- |
| KiCad library / PCM | `library/pcm/metadata.json`, `versions[0].version` | `dist/Kiboar-<version>.zip` |
| Library notes | `CHANGELOG.md` | The release notes |
| Kiboar Studio | `software/app/package.json` and `software/app/src-tauri/tauri.conf.json`, which must match | Desktop bundles |
| Documentation | None (the package version is not a release) | Vercel deploy from `main` |
| Web | None | Static build from `main`; no host configured yet |
| Shop | `shop/package.json` and the pinned Medusa version | Medusa build; run with Node and PostgreSQL |

`ARCHITECTURE.md` is the authority for the product boundaries; this file only
covers cutting a version.

## Tags

The convention starts with the published Studio release `studio-v0.1.0`. The
`1.0.0` library entry in the changelog predates this policy and was not tagged.

| Product | Tag |
| --- | --- |
| Library | `library-v<major>.<minor>.<patch>` |
| Studio | `studio-v<major>.<minor>.<patch>` |

Tags are prefixed because the products release independently: a plain `v1.2.3`
would not say which product moved. Create annotated tags on the merge commit of
the release pull request, never on a working branch:

```bash
git tag -a library-v1.1.0 -m "Kiboar library 1.1.0"
git push origin library-v1.1.0
```

Do not move or delete a published tag. If a release is wrong, publish a patch.

## Library and PCM

1. **Decide the version.** Patch for fixes to existing parts, minor for new
   components or a new KiCad version, major for a breaking install or file
   format change.
2. **Update the changelog.** Move the entries from `## [Unreleased]` into a new
   `## [<version>] - <YYYY-MM-DD>` section and leave `Unreleased` empty. Keep
   the entry that names a breaking change at the top of its section.
3. **Update the PCM metadata.** Add the new entry **first** in
   `library/pcm/metadata.json` under `versions`; `build_pcm.py` takes
   `versions[0].version` for the archive name. Keep the previous entries.
   Use `"status": "stable"` and the KiCad major version in `kicad_version`.
4. **Run the gate.** `pnpm check` must pass, including the full library gate.
5. **Build the package.**
   ```bash
   python3 library/tools/build_pcm.py
   python3 library/tools/build_pcm.py --no-prefix   # optional second variant
   ```
6. **Verify the archive by hand.** Install the ZIP in a clean KiCad profile
   through the Plugin and Content Manager, place one symbol and one footprint,
   and confirm the 3D model resolves. The automated checks cannot prove that
   KiCad's package manager accepts the archive.
7. **Open the release pull request** from `release/<issue>-<version>` and merge
   it only with the normal review and checks.
8. **Tag and publish.** Tag the merge commit, create a GitHub release with the
   same notes as the changelog entry, and attach `dist/Kiboar-<version>.zip`
   (and the `-no-prefix` variant if you built it).

The library is not in the official PCM repository yet. When it is, the
release also has to update the package index that points at the new ZIP.

## Kiboar Studio

Bundling is enabled: `bundle.active` is `true`, the targets are `app` and `dmg`,
and the registry and board definitions are copied into `Contents/Resources`.
`.github/workflows/studio-release.yml` is configured to build a **universal**
DMG on `macos-14`, write `SHA256SUMS`, upload the artifact and publish a
pre-release when the ref is a `studio-v*` tag. The published 0.1.0 release
contains the Apple Silicon build; it was produced before the universal target.

The 0.1 build is **ad-hoc signed and not notarized**. It is a tester build, not
a public consumer one; the release notes say so.

If the account cannot use macOS hosted runners, the workflow is cancelled before
its first step. Build locally instead:

```bash
pnpm --filter @kiboar/studio tauri build
```

That produces an `aarch64` DMG on Apple Silicon. Attach it to the same
`studio-v<version>` release with `SHA256SUMS`, then update the cask. The 0.1
release was published this way.

1. **Set the same version** in `software/app/package.json`,
   `software/app/src-tauri/tauri.conf.json` and
   `software/app/src-tauri/Cargo.toml`.
2. **Run the gate.** `pnpm check` must pass.
3. **Build locally if you want to inspect it:**
   ```bash
   pnpm --filter @kiboar/studio tauri build
   ```
   The DMG lands in `software/target/release/bundle/dmg/`. Confirm that
   `Contents/Resources/registry/index.json` and `Contents/Resources/boards/`
   exist; without them the app opens with an empty board list.
4. **Tag `studio-v<version>`** on the merge commit and push it. The workflow
   builds the universal DMG, uploads `SHA256SUMS` and creates the pre-release.
5. **Verify the release assets** and download the `SHA256SUMS` digest.
6. **Update the Homebrew cask** in `raulmoracode/homebrew-kiboar`
   (`Casks/kiboar-studio.rb`) with the version and the new digest, then test:
   ```bash
   brew tap raulmoracode/kiboar
   brew trust --cask raulmoracode/kiboar/kiboar-studio
   brew fetch --cask kiboar-studio
   brew install --cask kiboar-studio
   ```

Signing, notarization and the Tauri updater signature are post-MVP. When they
land, the same workflow adds the credentials and stops calling the release
unsigned.

Studio has no changelog yet. The generated release notes carry the changes until
one exists.

## Documentation

The site is configured to deploy from `main` through Vercel; it is not live yet
and has no release version or tag. A documentation change ships when its pull
request merges. There is nothing to cut.

## Web and shop

Neither surface has a release tag or a production deployment yet.

- **Web:** `pnpm --filter @kiboar/web build` produces a static `dist/` for the
  domain root, `/studio`, `/library` and `/keyboards`. The host must fall back
  to `index.html` for the client-side routes.
- **Shop:** `pnpm --filter @kiboar/shop build` compiles the Medusa service and
  the admin without a database. The storefront is a separate static build under
  `/shop/`; the POS is an Expo app distributed separately. Production needs Node,
  PostgreSQL and object storage for uploads.

## Rollback

| Product | If the release is wrong |
| --- | --- |
| Library | Publish a patch with the fix. If the ZIP itself is corrupt, replace the asset on the GitHub release and say so in the release notes; deleting a published tag is a last resort |
| Studio | Mark the release as a pre-release, remove the broken artifacts and publish a patch. Do not reuse the version |
| Docs | Revert the offending pull request; Vercel redeploys `main` |
| Web | Revert the offending pull request and redeploy `main` |
| Shop | Revert the pull request and redeploy the Medusa service and the storefront; the POS ships separately |

## Not automated

| Gap | Consequence |
| --- | --- |
| Library release is manual | Tagging, building the PCM ZIP and attaching artifacts are manual |
| No test gate in the Studio release | The tag build packages without running the Rust or frontend tests |
| No signing or notarisation | Studio builds are unsigned today |
| No changelog for docs or Studio | Their release notes are written by hand |
| No web or shop deployment | Both surfaces are built but not hosted; their release path is not automated |
| PCM not in the official repository | The library release is a GitHub release only |

Closing those gaps is separate work, each with its own pull request. This file
describes the process that exists, not the one that would be nice to have.
