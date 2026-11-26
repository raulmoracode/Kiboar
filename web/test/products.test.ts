import { describe, expect, it } from "vitest";

import { productForKey } from "../src/data/products";

describe("the keyboard shortcuts", () => {
  it("maps b to Studio and o to Shop", () => {
    expect(productForKey("b")?.name).toBe("Studio");
    expect(productForKey("o")?.name).toBe("Shop");
  });
});
