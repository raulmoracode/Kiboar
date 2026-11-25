// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Product } from "./api";
import { ProductCard } from "./ProductCard";

const product: Product = {
  id: "prod_1",
  title: "Kiboar 60",
  handle: "kiboar-60",
  description: null,
  thumbnail: null,
  variants: [{ id: "var_1", title: "Default", prices: [{ amount: 18900, currency_code: "eur" }] }],
};

afterEach(cleanup);

describe("the product card", () => {
  it("links to the product and opens it in place", () => {
    const onOpen = vi.fn();
    render(<ProductCard product={product} currency="eur" onOpen={onOpen} />);

    const link = screen.getByRole("link", { name: /Kiboar 60/ });
    expect(link.getAttribute("href")).toBe("?p=kiboar-60");

    fireEvent.click(link);
    expect(onOpen).toHaveBeenCalledWith("kiboar-60");
  });

  it("explains a product without a photo", () => {
    render(<ProductCard product={product} onOpen={() => {}} />);

    expect(screen.getByText("No photo")).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ProductCard product={product} currency="eur" onOpen={() => {}} />,
    );

    const results = await axe.run(container, {
      // jsdom has no layout engine, so axe cannot compute contrast.
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
