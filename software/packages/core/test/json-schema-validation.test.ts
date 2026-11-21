import Ajv2020 from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";
import { readJson } from "./helpers";

const FIXTURES = [
  "boards/kb60-hhkb/rev1.json",
  "boards/macropad-6/rev1.json",
  "boards/split-4x6/rev1.json",
] as const;

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(readJson("schemas/board.schema.json") as object);

describe("exported board JSON Schema", () => {
  it.each(FIXTURES)("validates %s with a standard validator", (path) => {
    const document = readJson(path);
    expect(validate(document), JSON.stringify(validate.errors)).toBe(true);
  });

  it("rejects a document with an unknown field", () => {
    const document = readJson("boards/macropad-6/rev1.json") as Record<string, unknown>;
    expect(validate({ ...document, unknown: true })).toBe(false);
  });

  it("rejects a document with a missing required field", () => {
    const document = readJson("boards/macropad-6/rev1.json") as Record<string, unknown>;
    const { board_id: _removed, ...rest } = document;
    expect(validate(rest)).toBe(false);
  });
});
