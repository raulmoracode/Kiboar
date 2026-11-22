# Releasing

Kiboar ships three products with independent versions. A release is a tagged
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
| Documentation | None | Vercel deploy from `main` |

`ARCHITECTURE.md` is the authority for the product boundaries; this file only
covers cutting a version.

## Tags

There are no tags yet. The first release under this policy starts the
convention, and the `1.0.0` library entry in the changelog predates it.

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

Studio cannot produce a distributable bundle today: `bundle.active` is `false`
in `software/app/src-tauri/tauri.conf.json`, no signing or notarisation is
configured, and CI does not build a desktop artifact. A Studio release needs a
separate change that enables bundling for the target platforms; until that
lands, Studio has no release artifact to tag.

When bundling is enabled:

1. **Set the same version** in `software/app/package.json` and
   `software/app/src-tauri/tauri.conf.json`.
2. **Run the gate.** `pnpm check` must pass.
3. **Build on each target OS.** `pnpm --filter @kiboar/studio tauri build`
   produces the bundles locally; cross-compiling is not supported.
4. **Sign and notarise** where the platform requires it, or state explicitly in
   the release notes that the build is unsigned.
5. **Tag `studio-v<version>`**, create the GitHub release and attach the
   bundles for every platform built.

Studio has no changelog yet. The release notes carry the changes until one
exists.

## Documentation

The site deploys from `main` through Vercel and has no version or tag. A
documentation change ships when its pull request merges. There is nothing to
cut.

## Rollback

| Product | If the release is wrong |
| --- | --- |
| Library | Publish a patch with the fix. If the ZIP itself is corrupt, replace the asset on the GitHub release and say so in the release notes; deleting a published tag is a last resort |
| Studio | Mark the release as a pre-release, remove the broken artifacts and publish a patch. Do not reuse the version |
| Docs | Revert the offending pull request; Vercel redeploys `main` |

## Not automated

| Gap | Consequence |
| --- | --- |
| No release workflow | Tagging, building the PCM ZIP and attaching artifacts are manual |
| No CI desktop bundle | Studio cannot be released from CI |
| No signing or notarisation | Studio builds are unsigned today |
| No changelog for docs or Studio | Their release notes are written by hand |
| PCM not in the official repository | The library release is a GitHub release only |

Closing those gaps is separate work, each with its own pull request. This file
describes the process that exists, not the one that would be nice to have.
