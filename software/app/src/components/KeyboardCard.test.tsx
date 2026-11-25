// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { BoardSummary } from "../lib/bindings/BoardSummary";
import { KeyboardCard } from "./KeyboardCard";

const board: BoardSummary = {
  board_id: "kiboar-60",
  name: "Kiboar 60",
  hw_rev: 1,
  mcu: "RP2040",
  rows: 5,
  cols: 12,
  keys: 60,
  layers: 4,
  split: false,
  layout: [{ x: 0, y: 0, w: 1, h: 1 }],
};

afterEach(cleanup);

describe("the keyboard card", () => {
  it("reports the selection to the caller", () => {
    const onSelect = vi.fn();
    render(<KeyboardCard board={board} selected={false} onSelect={onSelect} />);

    const card = screen.getByRole("button", { name: /Kiboar 60/ });
    expect(card.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(card);
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("marks the selected and connected board", () => {
    render(<KeyboardCard board={board} selected connected onSelect={() => {}} />);

    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("true");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <KeyboardCard board={board} selected={false} onSelect={() => {}} />,
    );

    const results = await axe.run(container, {
      // jsdom has no layout engine, so axe cannot compute contrast.
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
