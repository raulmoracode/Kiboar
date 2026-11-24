import { fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

const routes = ["/", "/keyboards", "/library", "/studio", "/missing"];

function visit(path: string) {
  window.history.replaceState({}, "", path);
}

beforeEach(() => {
  window.scrollTo = vi.fn();
  // jsdom has no canvas; axe probes it while computing accessible names.
  HTMLCanvasElement.prototype.getContext = (() =>
    null) as typeof HTMLCanvasElement.prototype.getContext;
  visit("/");
});

afterEach(() => visit("/"));

describe("accessibility", () => {
  it.each(routes)("has no axe violations on %s", async (path) => {
    visit(path);
    const { container } = render(<App />);
    const results = await axe.run(container, {
      // jsdom has no layout engine, so axe cannot compute contrast.
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it.each(routes)("has exactly one h1 on %s", (path) => {
    visit(path);
    render(<App />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("names every keyboard destination", () => {
    const { container } = render(<App />);
    const keys = Array.from(container.querySelectorAll("svg a"));
    expect(keys).toHaveLength(6);
    for (const key of keys) {
      expect(key.getAttribute("aria-label")?.trim()).not.toBe("");
      expect(key.getAttribute("href")).not.toBeNull();
    }
  });

  it("ignores the shortcut inside a form field", () => {
    render(<App />);
    const input = document.createElement("input");
    document.body.append(input);
    input.focus();
    fireEvent.keyDown(input, { key: "k" });
    expect(window.location.pathname).toBe("/");
    input.remove();
  });
});
