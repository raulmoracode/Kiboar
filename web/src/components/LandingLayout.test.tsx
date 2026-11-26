import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LandingLayout } from "./LandingLayout";

const original = Element.prototype.scrollIntoView;

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  window.history.replaceState({}, "", "/");
  if (original) {
    Element.prototype.scrollIntoView = original;
  } else {
    delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
  }
});

describe("the details anchor", () => {
  it("scrolls to the details on a direct #details load", () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    window.history.replaceState({}, "", "/keyboards#details");

    render(
      <LandingLayout title="Keyboards" keyboardLabel="Keyboards keyboard" onNavigate={() => {}}>
        <p>Details</p>
      </LandingLayout>,
    );

    expect(scrollIntoView).toHaveBeenCalled();
  });

  it("smoothly scrolls to the details on entry when autoScroll is set", () => {
    vi.useFakeTimers();
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;

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

    expect(scrollIntoView).not.toHaveBeenCalled();
    vi.advanceTimersByTime(700);
    expect(scrollIntoView).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("jumps instead of animating when reduced motion is requested", () => {
    vi.useFakeTimers();
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;

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
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto" });
  });
});
