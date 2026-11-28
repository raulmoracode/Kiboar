# Dev container

A Linux environment with the tools the repository needs: Node 22, pnpm 12,
Rust 1.100, the Tauri build dependencies, Docker and `psql`. It is optional; the
host setup in `CONTRIBUTING.md` still works.

## What it covers

- `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm test` and `pnpm typecheck` for
  every JavaScript package.
- `pnpm lint` and `pnpm lint:rust` (Biome, rustfmt, clippy).
- `pnpm test:rust` and `pnpm check:rust`.
- `pnpm dev:shop`: the compose service starts inside the container's Docker
  engine, so `localhost:5433` keeps working as it does on a host.

## What it does not cover

- **KiCad 10 and `kicad-cli`.** There is no packaged KiCad 10 for the container
  image, so `pnpm library` and the KiCad render checks stay on the host.
- **A Tauri window.** The system libraries are installed, so `cargo check` and
  the Rust tests run, but `pnpm dev:studio` needs a display.
- **Android and iOS simulators.** `pnpm dev:pos` serves the web preview on 8081;
  native builds stay on a host with the SDKs.

## Ports

| Port | Service |
| --- | --- |
| 3000 | web |
| 3001 | storefront |
| 4321 | docs |
| 5432 / 5433 | PostgreSQL (the shop `.env` decides which) |
| 8081 | POS web |
| 9000 | Medusa and its admin |

## Docker inside the container

The container runs its own Docker engine (Docker-in-Docker). Containers started
there are not visible from the host, and they stop with the dev container.
That is deliberate: it keeps `shop/docker-compose.yml` and the fixed port
bindings working exactly as they do outside.

## First run

VS Code or any devcontainer-compatible editor offers **Reopen in Container**.
The first build installs the features and runs `pnpm install`; later rebuilds
reuse the image and the volumes.
