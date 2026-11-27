import { describe, expect, it } from "vitest";
import type { Product } from "../lib/api";
import { productSpecs, SPEC_FIELDS } from "../lib/specs";

const product = (metadata: Record<string, unknown> | null): Product => ({
  id: "prod_1",
  title: "Kiboar 60% HHKB",
  handle: "kb60-hhkb",
  description: null,
  thumbnail: null,
  metadata,
});

describe("product specifications", () => {
  it("lists the four known fields with their labels", () => {
    expect(SPEC_FIELDS.map((field) => field.key)).toEqual(["mcu", "case", "keys", "layout"]);
    expect(SPEC_FIELDS.map((field) => field.label)).toEqual(["MCU", "Case", "Keys", "Layout"]);
  });

  it("skips empty and missing values", () => {
    const specs = productSpecs(
      product({
        mcu: "  RP2040 Zero  ",
        case: "   ",
        keys: null,
        layout: undefined,
      }),
    );

    expect(specs).toEqual([{ key: "mcu", label: "MCU", value: "RP2040 Zero" }]);
  });

  it("formats finite numbers as display strings", () => {
    const specs = productSpecs(product({ keys: 61, layout: "HHKB" }));

    expect(specs).toEqual([
      { key: "keys", label: "Keys", value: "61" },
      { key: "layout", label: "Layout", value: "HHKB" },
    ]);
  });

  it("keeps zero and drops non-finite numbers", () => {
    expect(productSpecs(product({ keys: 0 }))).toEqual([
      { key: "keys", label: "Keys", value: "0" },
    ]);
    expect(productSpecs(product({ keys: Number.POSITIVE_INFINITY }))).toEqual([]);
    expect(productSpecs(product({ keys: Number.NaN }))).toEqual([]);
  });

  it("ignores metadata outside the known fields", () => {
    const specs = productSpecs(
      product({ matrix: "5 × 14", hotswap: true, keys: 61, firmware_url: "/static/x.bin" }),
    );

    expect(specs).toEqual([{ key: "keys", label: "Keys", value: "61" }]);
  });

  it("returns nothing without metadata", () => {
    expect(productSpecs(product(null))).toEqual([]);
    expect(
      productSpecs({
        id: "prod_2",
        title: "Kiboar Numpad",
        handle: "kb-numpad",
        description: null,
        thumbnail: null,
      }),
    ).toEqual([]);
  });
});
