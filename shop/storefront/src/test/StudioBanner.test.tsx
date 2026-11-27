// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it } from "vitest";
import { StudioBanner } from "../components/StudioBanner";

afterEach(cleanup);

describe("the Kiboar Studio banner", () => {
  it("links to the public Studio page", () => {
    render(<StudioBanner />);

    const link = screen.getByRole("link", { name: /Kiboar Studio/ });
    expect(link.getAttribute("href")).toBe("https://kiboar.raulmoracode.com/studio");
  });

  it("has no axe violations", async () => {
    const { container } = render(<StudioBanner />);

    const results = await axe.run(container, {
      // jsdom has no layout engine, so axe cannot compute contrast.
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
