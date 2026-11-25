import { describe, expect, it } from "vitest";

import { i18n } from "./i18n";

describe("the docs locales", () => {
  it("serves English at the default locale and Spanish under /es", () => {
    expect(i18n.defaultLanguage).toBe("en");
    expect(i18n.languages).toEqual(["en", "es"]);
    expect(i18n.hideLocale).toBe("default-locale");
  });
});
