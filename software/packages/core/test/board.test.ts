import { describe, expect, it } from "vitest";
import { boardSchema, formatIssues } from "../src";
import { parseBoard } from "./helpers";

const FIXTURES = [
  "boards/kb60-hhkb/rev1.json",
  "boards/macropad-6/rev1.json",
  "boards/split-4x6/rev1.json",
] as const;

type MutableBoard = Record<string, any>;

function macropad(): MutableBoard {
  return structuredClone(parseBoard("boards/macropad-6/rev1.json")) as MutableBoard;
}

interface InvalidCase {
  name: string;
  expected: string;
  mutate: (board: MutableBoard) => void;
}

const INVALID_CASES: InvalidCase[] = [
  {
    name: "a different schema version",
    expected: "schema",
    mutate: (board) => {
      board.schema = "kiboar.board/2";
    },
  },
  {
    name: "an invalid board id",
    expected: "board_id",
    mutate: (board) => {
      board.board_id = "Kiboar Studio";
    },
  },
  {
    name: "a row pin count that does not match the matrix",
    expected: "pins.rows",
    mutate: (board) => {
      board.pins.rows.pop();
    },
  },
  {
    name: "a pin used twice",
    expected: "pins.cols.0",
    mutate: (board) => {
      board.pins.cols[0] = board.pins.rows[0];
    },
  },
  {
    name: "a duplicate matrix position",
    expected: "keys.1.matrix",
    mutate: (board) => {
      board.keys[1].matrix = [...board.keys[0].matrix];
    },
  },
  {
    name: "a matrix position outside the matrix",
    expected: "keys.0.matrix",
    mutate: (board) => {
      board.keys[0].matrix = [9, 0];
    },
  },
  {
    name: "an unknown field",
    expected: "Unrecognized key",
    mutate: (board) => {
      board.unknown = true;
    },
  },
  {
    name: "a first layer that is not base",
    expected: "layers.0.name",
    mutate: (board) => {
      board.layers[0].name = "main";
    },
  },
  {
    name: "a duplicate layer name",
    expected: "layers.1.name",
    mutate: (board) => {
      board.layers.push({ name: "base" });
    },
  },
  {
    name: "an empty keycode",
    expected: "keys.0.keycode",
    mutate: (board) => {
      board.keys[0].keycode = "";
    },
  },
  {
    name: "a negative key position",
    expected: "keys.0.x",
    mutate: (board) => {
      board.keys[0].x = -1;
    },
  },
  {
    name: "an encoder that reuses a matrix pin",
    expected: "encoders.0.pins.a",
    mutate: (board) => {
      board.encoders.push({
        id: "knob",
        x: 0,
        y: 2,
        pins: { a: board.pins.rows[0], b: "GP27" },
      });
    },
  },
];

describe("board schema", () => {
  it.each(FIXTURES)("accepts %s", (path) => {
    expect(() => parseBoard(path)).not.toThrow();
  });

  it("applies the documented defaults", () => {
    const board = parseBoard("boards/macropad-6/rev1.json");
    expect(board.encoders).toEqual([]);
    expect(board.display).toBeNull();
    expect(board.split).toBe(false);
    expect(board.keys[0]?.w).toBe(1);
    expect(board.keys[0]?.h).toBe(1);
    expect(board.keys[0]?.r).toBe(0);
  });

  it("keeps the split flag of a split board", () => {
    const board = parseBoard("boards/split-4x6/rev1.json");
    expect(board.split).toBe(true);
    expect(board.keys).toHaveLength(48);
  });

  it("rejects a document that is not an object", () => {
    const result = boardSchema.safeParse([]);
    expect(result.success).toBe(false);
  });

  for (const invalidCase of INVALID_CASES) {
    it(`rejects ${invalidCase.name}`, () => {
      const board = macropad();
      invalidCase.mutate(board);

      const result = boardSchema.safeParse(board);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(formatIssues(result.error)).toContain(invalidCase.expected);
      }
    });
  }
});
