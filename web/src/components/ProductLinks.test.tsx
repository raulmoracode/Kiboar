import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProductLinks } from "./ProductLinks";

describe("the product links", () => {
  it("renders the six destinations", () => {
    render(<ProductLinks onNavigate={vi.fn()} />);
    expect(screen.getAllByRole("link")).toHaveLength(6);
  });

  it("opens the external destinations in a new tab", () => {
    const { container } = render(<ProductLinks onNavigate={vi.fn()} />);
    const link = (href: string) => container.querySelector(`a[href="${href}"]`);
    expect(link("/shop")?.getAttribute("target")).toBe("_blank");
    expect(link("https://kiboar.raulmoracode.com/docs")?.getAttribute("target")).toBe("_blank");
    expect(link("https://github.com/raulmoracode/Kiboar")?.getAttribute("target")).toBe("_blank");
  });

  it("keeps the internal destinations in the same tab", () => {
    const { container } = render(<ProductLinks onNavigate={vi.fn()} />);
    const link = (href: string) => container.querySelector(`a[href="${href}"]`);
    expect(link("/keyboards")?.getAttribute("target")).toBeNull();
    expect(link("/library")?.getAttribute("target")).toBeNull();
    expect(link("/studio")?.getAttribute("target")).toBeNull();
  });
});
