import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { Keyboard } from "../src/components/Keyboard";

function labels(container: HTMLElement, selector: string): string[] {
  return Array.from(container.querySelectorAll(selector)).map((node) => node.textContent ?? "");
}

beforeEach(() => {
  // A home render clears the module-level previous word.
  const { unmount } = render(<Keyboard interactive={false} />);
  unmount();
});

describe("the keyboard word", () => {
  it("spells the page word on the home row", () => {
    const { container } = render(<Keyboard word="Keyboards" interactive={false} />);
    expect(labels(container, "text.kiboar-key-label-in").join("")).toBe("Keyboards");
  });

  it("crossfades the previous word out and the new word in", () => {
    const first = render(<Keyboard word="Keyboards" interactive={false} />);
    first.unmount();

    const { container } = render(<Keyboard word="Library" interactive={false} />);

    expect(labels(container, "text.kiboar-key-label-out").join("")).toBe("Keyboards");
    expect(labels(container, "text.kiboar-key-label-in").join("")).toBe("Library");
  });
});
