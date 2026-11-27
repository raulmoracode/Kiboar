// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Bag } from "../components/Bag";

afterEach(cleanup);

function renderEmptyBag(onBrowse = vi.fn()) {
  const { container } = render(
    <Bag
      items={[]}
      onClose={() => {}}
      onBrowse={onBrowse}
      onIncrease={() => {}}
      onDecrease={() => {}}
      onRemove={() => {}}
      onOpenProduct={() => {}}
    />,
  );

  return { onBrowse, container };
}

describe("the empty bag", () => {
  it("offers browsing the boards and opening Kiboar Studio", () => {
    const { onBrowse } = renderEmptyBag();

    expect(screen.getByText("Your bag is empty.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Browse boards" }));
    expect(onBrowse).toHaveBeenCalledTimes(1);

    const studio = screen.getByRole("link", {
      name: /Control your keyboard with Kiboar Studio/,
    });
    expect(studio.getAttribute("href")).toBe("https://kiboar.raulmoracode.com/studio");
    expect(studio.getAttribute("target")).toBe("_blank");
    expect(studio.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("has no axe violations", async () => {
    const { container } = renderEmptyBag();

    const results = await axe.run(container, {
      // jsdom has no layout engine, so axe cannot compute contrast.
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
