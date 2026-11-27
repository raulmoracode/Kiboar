import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Keyboard } from "../src/components/Keyboard";

function labels(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("text")).map((node) => node.textContent ?? "");
}

describe("the keyboard word", () => {
  it("spells the page word on the home row", () => {
    const { container } = render(<Keyboard word="Keyboards" interactive={false} />);
    expect(labels(container).join("")).toBe("Keyboards");
  });

  it("gives every letter the reveal animation", () => {
    const { container } = render(<Keyboard word="Library" interactive={false} />);
    const letters = Array.from(container.querySelectorAll("text"));

    expect(letters).toHaveLength(7);
    for (const letter of letters) {
      expect(letter.classList.contains("kiboar-key-label")).toBe(true);
    }
    expect((letters[0] as SVGTextElement).style.animationDelay).toBe("0ms");
    expect((letters[6] as SVGTextElement).style.animationDelay).toBe("72ms");
  });
});
