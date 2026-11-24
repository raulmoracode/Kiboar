# ADR-0004: Safety invariants, principles and data contracts

- Status: Accepted
- Date: 2026-11-24
- Deciders: Kiboar maintainer
- Related: [ADR-0001](0001-stack-and-scope.md) · [ADR-0002](0002-identity-without-eeprom.md) · [ADR-0003](0003-root-workspace-and-turborepo.md) · [protocol.md](../protocol.md)

## Context

The Studio brief and the development plan carried the decisions that outlive a
milestone: what the flasher must never do, how the application talks to a board,
how the data contracts version and where the licence boundary sits. Those two
documents were tracking artefacts with milestone status and a risk register, and
they had drifted from the code. Tracking belongs in the issue tracker; the
durable decisions belong here.

## Decision

### Safety invariants

1. **No write without naming the target.** The board, hardware revision and
   artefact are shown and confirmed before a write; the backend repeats the
   confirmation check.
2. **Detection is read-only.** Probing a device never changes it.
3. **Exactly two write paths.** Flashing and keymap writes, both user-initiated,
   both naming the target. No hidden or background writes.
4. **Untrusted input.** Device reports and IPC arguments are validated before
   use: lengths, `board_id` slugs, digests, UF2 families, addresses and overlap.
   A malformed response is an error, not a crash and never a panic on user input.
5. **Long operations are cancellable** and a cancelled or failed copy removes
   the partial file.
6. **No telemetry, no cloud, no secrets.** The registry ships with the
   application and logs are local.
7. **No dead options.** A control that cannot work yet is not shown.

### Product principles

- Safety before convenience.
- The contract before the interface: a screen over an undefined board is a demo.
- Works offline.
- Open and honest: open hardware, MIT application, GPL obligations met, no DRM.
- Keyboard-first and accessible.
- One source of truth: the board definition drives layout, exports and flashing.

### Scope

0.1 is a flasher on macOS: detect, choose board, inspect the UF2, confirm, write
and cancel. Firmware identity and re-enumeration are 0.2, read-only layout is
0.3, remapping starts with VIA at 1.0, and the editor follows. Nothing builds a
later stage early.

### Architecture rules

- `@kiboar/core` is pure TypeScript: no DOM, no Node, no Tauri.
- IPC is typed; a Rust signature change breaks TypeScript compilation.
- No blocking work on the UI thread; filesystem and HID work runs off it.
- Least privilege: Tauri capabilities cover only the plugins in use.
- Errors are typed in Rust and actionable in the UI.

### Data contracts

- `kiboar.board/1` evolves additively; a breaking change is a new version.
- `kiboar.registry/1` indexes board definitions and, later, firmware artefacts.
- Application, firmware and schema versions are independent.

## Consequences

A change to an invariant, a principle or a contract version needs a new ADR that
supersedes this one. Routine milestone status, risk and acceptance checklists do
not live in the repository.
