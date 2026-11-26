import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LandingLayout } from "../src/components/LandingLayout";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  window.history.replaceState({}, "", "/");
});

describe("the details anchor", () => {
  it("scrolls to the details on a direct #details load", () => {
    window.scrollTo = vi.fn();
    window.history.replaceState({}, "", "/keyboards#details");

    render(
      <LandingLayout title="Keyboards" keyboardLabel="Keyboards keyboard" onNavigate={() => {}}>
        <p>Details</p>
      </LandingLayout>,
    );

    expect(window.scrollTo).toHaveBeenCalled();
  });

  it("holds the hero before scrolling on entry", () => {
    vi.useFakeTimers();
    window.scrollTo = vi.fn();

    render(
      <LandingLayout
        title="Keyboards"
        keyboardLabel="Keyboards keyboard"
        onNavigate={() => {}}
        autoScroll
      >
        <p>Details</p>
      </LandingLayout>,
    );

    expect(window.scrollTo).not.toHaveBeenCalled();
    vi.advanceTimersByTime(150);
    expect(window.scrollTo).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(window.scrollTo).toHaveBeenCalled();
  });

  it("jumps without the hold when reduced motion is requested", () => {
    vi.useFakeTimers();
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    window.scrollTo = vi.fn();

    render(
      <LandingLayout
        title="Keyboards"
        keyboardLabel="Keyboards keyboard"
        onNavigate={() => {}}
        autoScroll
      >
        <p>Details</p>
      </LandingLayout>,
    );

    vi.advanceTimersByTime(1);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  });
});
