import { repository } from "@kiboar/links";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProductLinks } from "./ProductLinks";

describe("the product links", () => {
  it("renders the four live destinations", () => {
    render(<ProductLinks onNavigate={vi.fn()} />);
    expect(screen.getAllByRole("link")).toHaveLength(4);
  });

  it("marks the destinations that are not live as unavailable", () => {
    render(<ProductLinks onNavigate={vi.fn()} />);
    expect(screen.getByText("Shop").closest("span[aria-disabled]")).not.toBeNull();
    expect(screen.getByText("Docs").closest("span[aria-disabled]")).not.toBeNull();
  });

  it("opens the external destination in a new tab", () => {
    const { container } = render(<ProductLinks onNavigate={vi.fn()} />);
    const link = (href: string) => container.querySelector(`a[href="${href}"]`);
    expect(link(repository)?.getAttribute("target")).toBe("_blank");
  });

  it("keeps the internal destinations in the same tab", () => {
    const { container } = render(<ProductLinks onNavigate={vi.fn()} />);
    const link = (href: string) => container.querySelector(`a[href="${href}"]`);
    expect(link("/keyboards")?.getAttribute("target")).toBeNull();
    expect(link("/library")?.getAttribute("target")).toBeNull();
    expect(link("/studio")?.getAttribute("target")).toBeNull();
  });
});
