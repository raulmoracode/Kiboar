# Labels

This repository uses its own label scheme. It is the authoritative policy for
issues and pull requests here and **supersedes the generic label catalog that
ships with `git-workflow`**. If you are an agent using that skill, read this
file and the label table in the `AGENTS.md` of every product you touch before
applying labels. If the skill proposes its own catalog, this file wins.

## Dimensions

Every issue and pull request carries:

| Dimension | Rule |
| --- | --- |
| `type:*` | Exactly one, matching the Conventional Commit prefix in the title |
| `product:*` | One per product the change touches; two or more for a cross-product change |
| `risk:*` | Only for level 2 or 3, and never both risk labels |

`area:*` labels are retired for new work. Their definitions stay in the
repository for history; do not delete them without a separate migration.

## Products

| Label | Use for |
| --- | --- |
| `product:library` | `library/`: KiCad assets, PCM and library tools |
| `product:docs` | `docs/`: the documentation site |
| `product:studio` | `software/`: Kiboar Studio |
| `product:repo` | Root files, CI, repository process and cross-product docs |

A change to a product's `AGENTS.md`, `README.md` or tests gets that product's
label. A change to `LABELS.md`, the root `AGENTS.md`, the root `package.json`,
`pnpm-workspace.yaml`, `turbo.json` or `.github/` gets `product:repo`. A change
that spans products gets every product label it touches.

## Types

Use the existing 16 type labels, one per issue or pull request:

`type:feat`, `type:fix`, `type:hotfix`, `type:bugfix`, `type:refactor`,
`type:chore`, `type:docs`, `type:test`, `type:style`, `type:perf`,
`type:build`, `type:ci`, `type:revert`, `type:release`, `type:spike`,
`type:experiment`.

The title prefix is the source of truth. A pull request inherits its issue's
type; if the type changes, update both and follow the normal post-push rule for
the branch name.

## Risk

| Label | Use when |
| --- | --- |
| `risk:consequential` | A public schema, library install contract, persisted data or integration changes |
| `risk:sensitive` | Authentication, payments, personal data or deletion is involved |

Risk labels apply to pull requests only, never to issues. Level 2 or 3 only;
never both labels.

## History and migration

Issues and pull requests created before this scheme keep their labels. This
change does not rewrite old objects and does not delete `area:*` definitions.
New work uses the scheme above and does not add `area:*`.

If a label is missing, create it with the exact name from this file; do not
create an equivalent or an extra dimension.

## Product tables

The exact labels to apply for a product live in that product's agent file:

- [`library/AGENTS.md`](library/AGENTS.md)
- [`docs/AGENTS.md`](docs/AGENTS.md)
- [`software/AGENTS.md`](software/AGENTS.md)
- [`AGENTS.md`](AGENTS.md) for `product:repo`

For a cross-product change, read all the tables for the products you touch.
