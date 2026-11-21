import { describe, expect, it } from "vitest";
import { boardJsonSchema, registryJsonSchema } from "../src";
import { readJson } from "./helpers";

describe("generated JSON Schema", () => {
  it("matches schemas/board.schema.json", () => {
    expect(
      boardJsonSchema(),
      "schemas/board.schema.json is stale; run `pnpm schema:export`",
    ).toEqual(readJson("schemas/board.schema.json"));
  });

  it("matches schemas/registry.schema.json", () => {
    expect(
      registryJsonSchema(),
      "schemas/registry.schema.json is stale; run `pnpm schema:export`",
    ).toEqual(readJson("schemas/registry.schema.json"));
  });

  it("publishes stable identifiers", () => {
    expect(boardJsonSchema().$id).toBe("urn:kiboar:board:1");
    expect(registryJsonSchema().$id).toBe("urn:kiboar:registry:1");
  });

  it("rejects unknown fields in the exported board schema", () => {
    expect(boardJsonSchema().additionalProperties).toBe(false);
  });
});
