import { describe, expect, it } from "vitest";
import { formatPrice, variantPrice } from "../lib/api";

describe("storefront prices", () => {
  it("formats Medusa amounts as major units", () => {
    expect(formatPrice({ amount: 189, currency_code: "eur" })).toContain("189.00");
    expect(formatPrice({ amount: 59, currency_code: "eur" })).toContain("59.00");
    expect(formatPrice(null)).toBe("—");
  });

  it("prefers the region calculated price", () => {
    expect(
      variantPrice(
        {
          id: "var_1",
          title: "Standard",
          prices: [{ amount: 200, currency_code: "eur" }],
          calculated_price: { calculated_amount: 149, currency_code: "eur" },
        },
        "eur",
      ),
    ).toEqual({ amount: 149, currency_code: "eur" });
  });

  it("falls back to the variant prices", () => {
    expect(
      variantPrice(
        {
          id: "var_1",
          title: "Standard",
          prices: [{ amount: 189, currency_code: "eur" }],
        },
        "eur",
      ),
    ).toEqual({ amount: 189, currency_code: "eur" });
  });
});
