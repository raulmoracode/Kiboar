import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "../src/App";

function visit(path: string) {
  window.history.replaceState({}, "", path);
}

beforeEach(() => {
  window.scrollTo = vi.fn();
  visit("/");
});

afterEach(() => {
  vi.unstubAllGlobals();
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  visit("/");
});

describe("the app", () => {
  it("renders the six keyboard destinations and the four live links", () => {
    const { container } = render(<App />);
    expect(container.querySelectorAll("svg a")).toHaveLength(6);
    expect(screen.getAllByRole("link")).toHaveLength(10);
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

  it("rewinds a scrolled detail page before going home", () => {
    visit("/keyboards");
    Object.defineProperty(window, "scrollY", { configurable: true, value: 300 });
    const smooth = vi.fn();
    window.scrollTo = ((options: ScrollToOptions) => {
      if (options.behavior === "smooth") {
        smooth();
        Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
      }
    }) as typeof window.scrollTo;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });

    render(<App />);
    fireEvent.keyDown(window, { key: "k" });

    expect(smooth).toHaveBeenCalledTimes(1);
    expect(window.location.pathname).toBe("/");
  });

  it("keeps the scroll position between detail pages", () => {
    visit("/keyboards");
    Object.defineProperty(window, "scrollY", { configurable: true, value: 300 });

    render(<App />);
    fireEvent.keyDown(window, { key: "i" });

    expect(window.location.pathname).toBe("/library");
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("renders the 404 for an unknown route", () => {
    visit("/missing");
    render(<App />);
    expect(screen.getByRole("heading", { name: "Not found" })).not.toBeNull();
  });
});
