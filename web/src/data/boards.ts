import { repository as REPOSITORY, tree } from "@kiboar/links";

export interface OpenBoard {
  id: string;
  name: string;
  revision: number;
  mcu: string;
  rows: number;
  cols: number;
  keys: number;
  split: boolean;
  /** The published board definition file. */
  definition: string;
  /** The GitHub directory that holds the board files. */
  files: string;
}

/**
 * The board definitions Studio reads from `software/boards`. The KiCad project,
 * fabrication files and firmware are not published yet; `keyboards/` is their
 * home and starts empty.
 */
export const boards: readonly OpenBoard[] = [
  {
    id: "kb60-hhkb",
    name: "Kiboar 60% HHKB",
    revision: 1,
    mcu: "rp2040-zero",
    rows: 5,
    cols: 14,
    keys: 61,
    split: false,
    definition: `${REPOSITORY}/blob/main/software/boards/kb60-hhkb/rev1.json`,
    files: tree("software/boards/kb60-hhkb"),
  },
  {
    id: "macropad-6",
    name: "Kiboar Macropad 6",
    revision: 1,
    mcu: "rp2040-zero",
    rows: 2,
    cols: 3,
    keys: 6,
    split: false,
    definition: `${REPOSITORY}/blob/main/software/boards/macropad-6/rev1.json`,
    files: tree("software/boards/macropad-6"),
  },
  {
    id: "split-4x6",
    name: "Kiboar Split 4x6",
    revision: 1,
    mcu: "rp2040-zero",
    rows: 4,
    cols: 12,
    keys: 48,
    split: true,
    definition: `${REPOSITORY}/blob/main/software/boards/split-4x6/rev1.json`,
    files: tree("software/boards/split-4x6"),
  },
];
