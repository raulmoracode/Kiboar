// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it } from "vitest";
import { KeyboardFilesButton } from "../components/KeyboardFilesButton";

const url = "https://github.com/raulmoracode/Kiboar/tree/main/software/boards/kb60-hhkb";

afterEach(cleanup);

describe("the keyboard files button", () => {
  it("opens the board files on GitHub in a new tab", () => {
    render(<KeyboardFilesButton url={url} />);

    const link = screen.getByRole("link", { name: /Keyboard files on GitHub/ });
    expect(link.getAttribute("href")).toBe(url);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noreferrer");
  });

  it("renders nothing without a URL", () => {
    const { container } = render(<KeyboardFilesButton url={null} />);

    expect(container.innerHTML).toBe("");
  });

  it("has no axe violations", async () => {
    const { container } = render(<KeyboardFilesButton url={url} />);

    const results = await axe.run(container, {
      // jsdom has no layout engine, so axe cannot compute contrast.
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
