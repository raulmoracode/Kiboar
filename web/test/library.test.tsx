import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LibraryPage } from "../src/pages/LibraryPage";

beforeEach(() => {
  window.scrollTo = vi.fn();
});

describe("the library page", () => {
  it("shows the current library counts", () => {
    render(<LibraryPage onNavigate={vi.fn()} />);

    for (const count of ["145", "173", "26", "129"]) {
      expect(screen.getByText(count)).toBeTruthy();
    }
  });
});
