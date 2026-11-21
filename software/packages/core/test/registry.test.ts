import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { formatIssues, registrySchema, type Registry } from "../src";
import { SOFTWARE_ROOT, parseBoard, readJson } from "./helpers";

type MutableRegistry = Record<string, any>;

function readRegistry(): Registry {
  const result = registrySchema.safeParse(readJson("registry/index.json"));
  if (!result.success) {
    throw new Error(formatIssues(result.error));
  }
  return result.data;
}

function mutableRegistry(): MutableRegistry {
  return structuredClone(readRegistry()) as MutableRegistry;
}

function firmware(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    board_id: "macropad-6",
    hw_rev: 1,
    version: "0.1.0",
    path: "firmware/macropad-6/0.1.0/kiboar-macropad-6-0.1.0.uf2",
    sha256: "a".repeat(64),
    signature: "b".repeat(32),
    ...overrides,
  };
}

interface InvalidCase {
  name: string;
  expected: string;
  mutate: (registry: MutableRegistry) => void;
}

const INVALID_CASES: InvalidCase[] = [
  {
    name: "a registry without boards",
    expected: "boards",
    mutate: (registry) => {
      registry.boards = [];
    },
  },
  {
    name: "a duplicate board revision",
    expected: "boards.3.hw_rev",
    mutate: (registry) => {
      registry.boards.push({ ...registry.boards[0] });
    },
  },
  {
    name: "a duplicate MCU id",
    expected: "mcus.1.id",
    mutate: (registry) => {
      registry.mcus.push({ ...registry.mcus[0] });
    },
  },
  {
    name: "a definition path that escapes the repository",
    expected: "boards.0.definition",
    mutate: (registry) => {
      registry.boards[0].definition = "../boards/kb60-hhkb/rev1.json";
    },
  },
  {
    name: "a bad generation date",
    expected: "generated",
    mutate: (registry) => {
      registry.generated = "21-11-2026";
    },
  },
  {
    name: "a firmware artefact with a bad digest",
    expected: "firmware.0.sha256",
    mutate: (registry) => {
      registry.firmware.push(firmware({ sha256: "abc" }));
    },
  },
  {
    name: "firmware for an unknown board",
    expected: "firmware.0.board_id",
    mutate: (registry) => {
      registry.firmware.push(firmware({ board_id: "unknown-board" }));
    },
  },
  {
    name: "a duplicate firmware version",
    expected: "firmware.1.version",
    mutate: (registry) => {
      registry.firmware.push(firmware(), firmware());
    },
  },
  {
    name: "firmware without a signature",
    expected: "firmware.0.signature",
    mutate: (registry) => {
      const entry = firmware();
      delete entry.signature;
      registry.firmware.push(entry);
    },
  },
];

describe("registry schema", () => {
  it("accepts the committed registry", () => {
    expect(() => readRegistry()).not.toThrow();
  });

  it("lists every board definition on disk", () => {
    const registry = readRegistry();
    const declared = new Set(registry.boards.map((entry) => entry.definition));

    for (const directory of readdirSync(join(SOFTWARE_ROOT, "boards"), {
      withFileTypes: true,
    })) {
      if (!directory.isDirectory()) {
        continue;
      }
      const path = `boards/${directory.name}/rev1.json`;
      expect(declared.has(path), `${path} is not listed in registry/index.json`).toBe(true);
    }
  });

  it("points every definition at a board that matches its registry entry", () => {
    const registry = readRegistry();

    for (const entry of registry.boards) {
      const board = parseBoard(entry.definition);
      expect(board.board_id).toBe(entry.board_id);
      expect(board.hw_rev).toBe(entry.hw_rev);
      expect(
        registry.mcus.some((mcu) => mcu.id === board.mcu),
        `${board.board_id} uses MCU ${board.mcu}, which the registry does not declare`,
      ).toBe(true);
    }
  });

  it("points every firmware entry at a file that exists", () => {
    const registry = readRegistry();

    for (const entry of registry.firmware) {
      expect(existsSync(join(SOFTWARE_ROOT, entry.path)), entry.path).toBe(true);
    }
  });

  for (const invalidCase of INVALID_CASES) {
    it(`rejects ${invalidCase.name}`, () => {
      const registry = mutableRegistry();
      invalidCase.mutate(registry);

      const result = registrySchema.safeParse(registry);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(formatIssues(result.error)).toContain(invalidCase.expected);
      }
    });
  }
});
