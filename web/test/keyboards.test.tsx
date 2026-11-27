import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { boards } from "../src/data/boards";
import { KeyboardsPage } from "../src/pages/KeyboardsPage";

beforeEach(() => {
  window.scrollTo = vi.fn();
});

afterEach(() => {
  window.history.replaceState({}, "", "/");
});

describe("the keyboard cards", () => {
  it("links every card to the shop and to the published files", () => {
    render(<KeyboardsPage onNavigate={vi.fn()} />);

    const shopLinks = screen.getAllByRole("link", { name: /^Shop / });
    expect(shopLinks.map((link) => link.getAttribute("href"))).toEqual(
      boards.map((board) => board.shop),
    );
    expect(shopLinks.map((link) => link.getAttribute("aria-label"))).toEqual(
      boards.map((board) => `Shop ${board.name} (opens in a new tab)`),
    );

    for (const link of shopLinks) {
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.textContent?.trim()).toBe("Shop");
    }
  });
});
