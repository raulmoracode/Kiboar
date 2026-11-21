# Kiboar Studio

Desktop application for the keyboards built with Kiboar components: detect the
board over USB, flash the right firmware, remap keys and visualise the layout.

**Status: M0 — contract.** The board and registry schemas, three board
definitions and the ADRs exist and are tested. There is no application shell
yet; M1 starts with read-only detection.

## Documents

| File | Contents |
| --- | --- |
| [`BRIEF.md`](BRIEF.md) | What the application is, the problems it solves, scope, user journeys, identity model and success criteria |
| [`DEVELOPMENT.md`](DEVELOPMENT.md) | Risk-first milestone order, stack, repository layout, testing, CI, licensing constraints and working agreements |
| [`docs/adr/`](docs/adr/) | Architecture decision records: stack and scope, identity without an EEPROM |

## Development

```bash
cd software
pnpm install
pnpm test
pnpm typecheck
```

`pnpm schema:export` regenerates `schemas/*.json` from the Zod source. CI fails
when a committed schema is stale.

## Reading order

1. `BRIEF.md` — why the application exists and what it does.
2. `DEVELOPMENT.md` — how it is built and in which order.

The application lives in this directory. The KiCad library at the repository
root keeps its own rules in [`AGENTS.md`](../AGENTS.md) and
[`CONTRIBUTING.md`](../CONTRIBUTING.md), and nothing here changes them.
