// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

function renderPage(products: Product[] = []) {
  return render(
    <ProductPage
      handle="kb60-hhkb"
      products={products}
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

  it("moves the primary action to the keyboard files when the board is sold out", async () => {
    const soldOut = product({ keyboard_files_url: url });
    const first = soldOut.variants?.[0];
    if (!first) {
      throw new Error("The fixture should have a variant.");
    }
    soldOut.variants = [{ ...first, inventory_quantity: 0 }];
    getProduct.mockResolvedValue(soldOut);
    renderPage();

    const add = await screen.findByRole("button", { name: "Sold out" });
    const link = screen.getByRole("link", { name: /Keyboard files on GitHub/ });

    expect(add.hasAttribute("disabled")).toBe(true);
    expect(add.className).toContain("border-white/10");
    expect(link.className).toContain("bg-zinc-100");
  });

  it("hides the keyboard files button without a URL", async () => {
    getProduct.mockResolvedValue(product(null));
    renderPage();

    expect(await screen.findByRole("button", { name: "Add to bag" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Keyboard files on GitHub/ })).toBeNull();
    expect(screen.queryByRole("link", { name: /Download official firmware/ })).toBeNull();
  });

  it("shows the firmware download below the keyboard files", async () => {
    getProduct.mockResolvedValue(
      product({
        keyboard_files_url: url,
        firmware_url: "/static/1234-firmware.bin",
      }),
    );
    renderPage();

    const files = await screen.findByRole("link", { name: /Keyboard files on GitHub/ });
    const firmware = screen.getByRole("link", { name: /Download official firmware/ });

    expect(firmware.getAttribute("href")).toMatch(/\/static\/1234-firmware\.bin$/);
    expect(files.compareDocumentPosition(firmware) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe("the product page specifications", () => {
  const withSpecs = (): Product => ({
    ...product(null),
    metadata: { mcu: "RP2040 Zero", case: "Aluminium", keys: 61, layout: "HHKB" },
  });

  it("hides the info button without specs", async () => {
    getProduct.mockResolvedValue(product(null));
    renderPage();

    expect(await screen.findByRole("button", { name: "Add to bag" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Specifications for / })).toBeNull();
  });

  it("opens the specifications dialog from the info button", async () => {
    getProduct.mockResolvedValue(withSpecs());
    renderPage();

    const trigger = await screen.findByRole("button", {
      name: "Specifications for Kiboar 60% HHKB",
    });
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Specifications" });
    expect(within(dialog).getByText("RP2040 Zero")).toBeTruthy();
    expect(within(dialog).getByText("61")).toBeTruthy();

    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("sets the document title and description, then restores them", async () => {
    document.title = "Kiboar Shop";
    getProduct.mockResolvedValue(product(null));
    const { unmount } = renderPage();

    await screen.findByRole("button", { name: "Add to bag" });

    await waitFor(() => expect(document.title).toBe("Kiboar 60% HHKB · Kiboar Shop"));
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
      "A board.",
    );

    unmount();

    expect(document.title).toBe("Kiboar Shop");
    expect(document.head.querySelector('meta[name="description"]')).toBeNull();
  });
});

describe("the related boards", () => {
  const other = (id: string): Product => ({
    ...product(null),
    id,
    title: `Board ${id}`,
    handle: id,
  });

  it("picks the same boards for the same product", async () => {
    getProduct.mockResolvedValue(product(null));
    const products = ["a", "b", "c", "d", "e"].map(other);

    const first = renderPage(products);
    const section = await screen.findByRole("region", { name: "More boards" });
    const firstTitles = within(section)
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);
    first.unmount();

    renderPage(products);
    const again = await screen.findByRole("region", { name: "More boards" });
    const secondTitles = within(again)
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);

    expect(firstTitles).toHaveLength(3);
    expect(secondTitles).toEqual(firstTitles);
  });
});
