// @vitest-environment jsdom
import { docs, keyboards, library, repository, site, studio } from "@kiboar/links";
import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it } from "vitest";
import { Footer } from "../components/Footer";

afterEach(cleanup);

describe("the storefront footer", () => {
  it("groups its links under the three column headings", () => {
    render(<Footer />);

    for (const heading of ["Shop", "Build", "Code"]) {
      expect(screen.getByRole("heading", { level: 2, name: heading })).toBeTruthy();
    }
  });

  it("links to the shop, the documentation and the source", () => {
    render(<Footer />);

    const expected: Array<[string, string]> = [
      ["Boards", "?"],
      ["Kiboar Studio", `${site}/studio`],
      ["Documentation", docs],
      ["Library", library.source],
      ["Licence", library.notice],
      ["GitHub", repository],
      ["Studio source", studio.source],
      ["Keyboard files", keyboards.readme],
    ];

    for (const [name, href] of expected) {
      const link = screen.getByRole("link", { name });
      expect(link.getAttribute("href")).toBe(href);
    }
  });

  it("is a labelled footer landmark", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer.querySelector("nav")?.getAttribute("aria-label")).toBe("Footer");
  });

  it("carries the current year", () => {
    const { container } = render(<Footer />);

    expect(container.textContent).toContain(`© ${new Date().getFullYear()}`);
  });

  it("has no axe violations", async () => {
    const { container } = render(<Footer />);

    const results = await axe.run(container, {
      // jsdom has no layout engine, so axe cannot compute contrast.
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
