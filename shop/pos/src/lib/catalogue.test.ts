import { imageUrl, toCatalogueItem, variantPrice } from "./catalogue";
import { apiUrl } from "./config";

describe("the POS catalogue", () => {
  it("maps the first variant and its EUR price", () => {
    expect(
      toCatalogueItem({
        id: "prod_1",
        title: "Kiboar 60% HHKB",
        thumbnail: "/static/kiboar-60.png",
        variants: [
          {
            id: "var_1",
            title: "Standard",
            prices: [{ amount: 189, currency_code: "eur" }],
          },
        ],
      }),
    ).toEqual({
      variantId: "var_1",
      productId: "prod_1",
      title: "Kiboar 60% HHKB",
      unitAmount: 189,
      currency: "eur",
      thumbnail: "/static/kiboar-60.png",
    });
  });

  it("prefers EUR and falls back to the first price", () => {
    expect(
      variantPrice({
        id: "var_1",
        title: "Standard",
        prices: [
          { amount: 200, currency_code: "usd" },
          { amount: 189, currency_code: "eur" },
        ],
      }),
    ).toEqual({ amount: 189, currency_code: "eur" });

    expect(
      variantPrice({
        id: "var_1",
        title: "Standard",
        prices: [{ amount: 200, currency_code: "usd" }],
      }),
    ).toEqual({ amount: 200, currency_code: "usd" });
  });

  it("skips products without a variant or a price", () => {
    expect(toCatalogueItem({ id: "prod_1", title: "Draft" })).toBeNull();
    expect(
      toCatalogueItem({
        id: "prod_1",
        title: "No price",
        variants: [{ id: "var_1", title: "Standard" }],
      }),
    ).toBeNull();
  });

  it("resolves photos against the Medusa URL", () => {
    expect(imageUrl("/static/kiboar-60.png")).toBe(`${apiUrl}/static/kiboar-60.png`);
    expect(imageUrl("https://cdn.example.com/kiboar-60.png")).toBe(
      "https://cdn.example.com/kiboar-60.png",
    );
    expect(imageUrl(null)).toBeNull();
  });
});
