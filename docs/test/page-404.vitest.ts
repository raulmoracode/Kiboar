// @vitest-environment node
import { within } from "@testing-library/dom";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { JSDOM } from "jsdom";
import { afterEach, describe, expect, it } from "vitest";
import NotFound from "@/pages/404.astro";

async function renderPage() {
  const container = await AstroContainer.create();
  const html = await container.renderToString(NotFound);
  return new JSDOM(html);
}

let dom: JSDOM | undefined;
afterEach(() => {
  dom = undefined;
  Reflect.deleteProperty(globalThis, "window");
  Reflect.deleteProperty(globalThis, "document");
});

describe("the 404 page", () => {
  it("renders the layout and the message", async () => {
    dom = await renderPage();
    const page = within(dom.window.document.body);

    expect(page.getByRole("heading", { level: 1, name: "404" })).toBeTruthy();
    expect(page.getByRole("link", { name: "Open the documentation" }).getAttribute("href")).toBe(
      "/docs",
    );
    expect(dom.window.document.documentElement.lang).toBe("en");
    expect(dom.window.document.title).toBe("Not found");
  });

  it("has no axe violations", async () => {
    dom = await renderPage();
    const { window } = dom;
    Object.assign(globalThis, { window, document: window.document });

    const axe = (await import("axe-core")).default;
    const results = await axe.run(window.document.body, {
      // jsdom has no layout engine, so axe cannot compute contrast.
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
