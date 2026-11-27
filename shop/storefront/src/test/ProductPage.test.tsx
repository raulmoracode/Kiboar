// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { getProduct } = vi.hoisted(() => ({ getProduct: vi.fn() }));

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return { ...actual, getProduct };
});

import { ProductPage } from "../components/ProductPage";
import type { Product } from "../lib/api";

const url = "https://github.com/raulmoracode/Kiboar/tree/main/software/boards/kb60-hhkb";

const product = (metadata: Record<string, unknown> | null): Product => ({
  id: "prod_1",
  title: "Kiboar 60% HHKB",
  handle: "kb60-hhkb",
  description: "A board.",
  thumbnail: null,
  metadata,
  variants: [
    {
      id: "var_1",
      title: "Standard",
      prices: [{ amount: 189, currency_code: "eur" }],
      inventory_quantity: 10,
      manage_inventory: true,
    },
  ],
});

function renderPage() {
  return render(
    <ProductPage
      handle="kb60-hhkb"
      products={[]}
      onOpen={() => {}}
      onBack={() => {}}
      onAdd={() => {}}
    />,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("the product page", () => {
  it("shows the keyboard files button below Add to bag", async () => {
    getProduct.mockResolvedValue(product({ keyboard_files_url: url }));
    renderPage();

    const add = await screen.findByRole("button", { name: "Add to bag" });
    const link = screen.getByRole("link", { name: /Keyboard files on GitHub/ });

    expect(link.getAttribute("href")).toBe(url);
    expect(add.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("hides the keyboard files button without a URL", async () => {
    getProduct.mockResolvedValue(product(null));
    renderPage();

    expect(await screen.findByRole("button", { name: "Add to bag" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Keyboard files on GitHub/ })).toBeNull();
  });
});
