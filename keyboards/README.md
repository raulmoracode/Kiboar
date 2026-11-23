# Kiboar keyboards

The official Kiboar keyboard files: the designs for the boards Kiboar sells and
publishes, so a board can be built, repaired and customised.

## Layout

One directory per keyboard, named after its board id, with one directory per
hardware revision:

```text
keyboards/
  kb60-hhkb/
    rev1/
      README.md      what the board is, what changed, and its licence
      hardware/      KiCad project: schematic, PCB and fabrication outputs
      firmware/      QMK/VIA configuration and build notes
```

Each revision directory is self-contained: the licence, the files and the notes
live together. Do not add a file without its origin and its licence.

## Today

The repository publishes the official component library in `library/` and the
board definitions Studio reads in `software/boards/`. This directory is the home
for the full hardware files and starts empty: no keyboard release has published
its files here yet.

Only the files present in a revision directory are published. An empty directory
is not a promise, and a design is not published until its files and its licence
are here.
