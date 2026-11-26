import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { boards } from "../src/data/boards";

interface BoardDefinition {
  board_id: string;
  name: string;
  hw_rev: number;
  mcu: string;
  matrix: { rows: number; cols: number };
  keys: unknown[];
  split: boolean;
}

interface Registry {
  boards: { board_id: string; hw_rev: number; definition: string }[];
}

const root = resolve(process.cwd(), "..");

function read<T>(path: string): T {
  return JSON.parse(readFileSync(`${root}/${path}`, "utf8")) as T;
}

const registry = read<Registry>("software/registry/index.json");

describe("the board catalogue", () => {
  it.each(boards)("matches $id rev$revision", (board) => {
    const entry = registry.boards.find(
      (candidate) => candidate.board_id === board.id && candidate.hw_rev === board.revision,
    );
    expect(entry).toBeDefined();

    const definition = read<BoardDefinition>(`software/${entry?.definition}`);
    expect(definition.board_id).toBe(board.id);
    expect(definition.name).toBe(board.name);
    expect(definition.hw_rev).toBe(board.revision);
    expect(definition.mcu).toBe(board.mcu);
    expect(definition.matrix.rows).toBe(board.rows);
    expect(definition.matrix.cols).toBe(board.cols);
    expect(definition.keys).toHaveLength(board.keys);
    expect(definition.split).toBe(board.split);
    expect(board.definition.endsWith(`software/boards/${board.id}/rev${board.revision}.json`)).toBe(
      true,
    );
  });

  it("lists every registry board", () => {
    expect(registry.boards).toHaveLength(boards.length);
  });
});
