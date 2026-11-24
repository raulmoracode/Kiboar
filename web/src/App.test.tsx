import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

function visit(path: string) {
  window.history.replaceState({}, "", path);
}

beforeEach(() => {
  window.scrollTo = vi.fn();
  visit("/");
});

afterEach(() => visit("/"));

describe("the app", () => {
  it("renders the six keyboard destinations and the six links", () => {
    const { container } = render(<App />);
    expect(container.querySelectorAll("svg a")).toHaveLength(6);
    expect(screen.getAllByRole("link")).toHaveLength(12);
  });

  it("opens a product page from a keyboard key", () => {
    const { container } = render(<App />);
    const key = container.querySelector('svg a[aria-label="Keyboards"]');
    expect(key).not.toBeNull();
    fireEvent.click(key as Element);
    expect(window.location.pathname).toBe("/keyboards");
    expect(screen.getByRole("heading", { name: "Keyboards" })).not.toBeNull();
  });

  it("opens a product page from the shortcut", () => {
    render(<App />);
    fireEvent.keyDown(window, { key: "k" });
    expect(window.location.pathname).toBe("/keyboards");
  });

  it("ignores a shortcut with a modifier", () => {
    render(<App />);
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(window.location.pathname).toBe("/");
  });

  it("renders the 404 for an unknown route", () => {
    visit("/missing");
    render(<App />);
    expect(screen.getByRole("heading", { name: "Not found" })).not.toBeNull();
  });
});
