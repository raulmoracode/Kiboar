// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProductCard } from "../components/ProductCard";
import type { Product, Variant } from "../lib/api";

const product: Product = {
  id: "prod_1",
  title: "Kiboar 60",
  handle: "kiboar-60",
  description: null,
  thumbnail: null,
  variants: [{ id: "var_1", title: "Default", prices: [{ amount: 189, currency_code: "eur" }] }],
};

const soldOut: Variant = {
  id: "var_1",
  title: "Default",
  prices: [{ amount: 189, currency_code: "eur" }],
  manage_inventory: true,
  allow_backorder: false,
  inventory_quantity: 0,
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

  it("marks a product as sold out when every variant is sold out", () => {
    const { container } = render(
      <ProductCard product={{ ...product, variants: [soldOut] }} onOpen={() => {}} />,
    );

    const badge = screen.getByText("Sold out");
    const link = screen.getByRole("link", { name: /Kiboar 60/ });

    expect(badge.tagName).toBe("SPAN");
    expect(link.contains(badge)).toBe(true);
    expect(container.querySelectorAll("a")).toHaveLength(1);
  });

  it("does not mark a product with stock as sold out", () => {
    render(
      <ProductCard
        product={{ ...product, variants: [{ ...soldOut, inventory_quantity: 4 }] }}
        onOpen={() => {}}
      />,
    );

    expect(screen.queryByText("Sold out")).toBeNull();
  });

  it("does not mark a product without variants as sold out", () => {
    render(<ProductCard product={{ ...product, variants: [] }} onOpen={() => {}} />);

    expect(screen.queryByText("Sold out")).toBeNull();
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
