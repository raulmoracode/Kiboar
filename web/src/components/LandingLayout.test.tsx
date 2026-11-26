import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LandingLayout } from "./LandingLayout";

const original = Element.prototype.scrollIntoView;

afterEach(() => {
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
});
