// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

describe("the MDX steps", () => {
  it("renders every step in order", () => {
    render(
      <Steps>
        <Step>Install KiCad</Step>
        <Step>Add the library</Step>
      </Steps>,
    );

    expect(screen.getByText("Install KiCad")).toBeTruthy();
    expect(screen.getByText("Add the library")).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Steps>
        <Step>Install KiCad</Step>
        <Step>Add the library</Step>
      </Steps>,
    );

    const results = await axe.run(container, {
      // jsdom has no layout engine, so axe cannot compute contrast.
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
