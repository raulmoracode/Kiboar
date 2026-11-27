// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SpecsDialog } from "../components/SpecsDialog";
import type { SpecEntry } from "../lib/specs";

const specs: SpecEntry[] = [
  { key: "mcu", label: "MCU", value: "RP2040 Zero" },
  { key: "case", label: "Case", value: "Aluminium" },
  { key: "keys", label: "Keys", value: "61" },
  { key: "layout", label: "Layout", value: "HHKB" },
];

afterEach(cleanup);

describe("the specifications dialog", () => {
  it("renders the specs under a labelled dialog", () => {
    render(<SpecsDialog specs={specs} title="Kiboar 60% HHKB" onClose={() => {}} />);

    const dialog = screen.getByRole("dialog", { name: "Specifications" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(screen.getByText("Kiboar 60% HHKB")).toBeTruthy();
    expect(screen.getByText("RP2040 Zero")).toBeTruthy();

    const terms = screen.getAllByRole("term").map((term) => term.textContent);
    expect(terms).toEqual(["MCU", "Case", "Keys", "Layout"]);
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(<SpecsDialog specs={specs} title="Kiboar 60% HHKB" onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes with the close button", () => {
    const onClose = vi.fn();
    render(<SpecsDialog specs={specs} title="Kiboar 60% HHKB" onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <SpecsDialog specs={specs} title="Kiboar 60% HHKB" onClose={() => {}} />,
    );

    const results = await axe.run(container, {
      // jsdom has no layout engine, so axe cannot compute contrast.
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
