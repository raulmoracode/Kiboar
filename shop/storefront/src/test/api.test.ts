import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { firmwareUrl, formatPrice, keyboardFilesUrl, type Product, variantPrice } from "../lib/api";

beforeEach(() => {
  vi.stubGlobal("navigator", { language: "en-US" });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const productWithFiles = (value: unknown): Product => ({
  id: "prod_1",
  title: "Kiboar 60% HHKB",
  handle: "kb60-hhkb",
  description: null,
  thumbnail: null,
  metadata: value === undefined ? null : { keyboard_files_url: value },
});

const productWithFirmware = (value: unknown): Product => ({
  id: "prod_1",
  title: "Kiboar 60% HHKB",
  handle: "kb60-hhkb",
  description: null,
  thumbnail: null,
  metadata: value === undefined ? null : { firmware_url: value },
});

describe("storefront prices", () => {
  it("formats Medusa amounts as major units", () => {
    expect(formatPrice({ amount: 189, currency_code: "eur" })).toContain("189.00");
    expect(formatPrice({ amount: 59, currency_code: "eur" })).toContain("59.00");
    expect(formatPrice(null)).toBe("—");
  });

  it("prefers the region calculated price", () => {
    expect(
      variantPrice(
        {
          id: "var_1",
          title: "Standard",
          prices: [{ amount: 200, currency_code: "eur" }],
          calculated_price: { calculated_amount: 149, currency_code: "eur" },
        },
        "eur",
      ),
    ).toEqual({ amount: 149, currency_code: "eur" });
  });

  it("falls back to the variant prices", () => {
    expect(
      variantPrice(
        {
          id: "var_1",
          title: "Standard",
          prices: [{ amount: 189, currency_code: "eur" }],
        },
        "eur",
      ),
    ).toEqual({ amount: 189, currency_code: "eur" });
  });
});

describe("the keyboard files link", () => {
  const url = "https://github.com/raulmoracode/Kiboar/tree/main/software/boards/kb60-hhkb";

  it("accepts an https GitHub URL", () => {
    expect(keyboardFilesUrl(productWithFiles(url))).toBe(url);
  });

  it("accepts the www host", () => {
    expect(keyboardFilesUrl(productWithFiles("https://www.github.com/raulmoracode/Kiboar"))).toBe(
      "https://www.github.com/raulmoracode/Kiboar",
    );
  });

  it("ignores a missing or empty link", () => {
    expect(keyboardFilesUrl(productWithFiles(undefined))).toBeNull();
    expect(keyboardFilesUrl(productWithFiles(""))).toBeNull();
    expect(keyboardFilesUrl(productWithFiles("   "))).toBeNull();
  });

  it("ignores a value that is not a string", () => {
    expect(keyboardFilesUrl(productWithFiles(42))).toBeNull();
  });

  it("rejects a non-GitHub host and a non-https protocol", () => {
    expect(keyboardFilesUrl(productWithFiles("https://example.com/files"))).toBeNull();
    expect(keyboardFilesUrl(productWithFiles("http://github.com/raulmoracode/Kiboar"))).toBeNull();
    expect(keyboardFilesUrl(productWithFiles("javascript:alert(1)"))).toBeNull();
  });

  it("rejects a malformed URL", () => {
    expect(keyboardFilesUrl(productWithFiles("not a url"))).toBeNull();
  });
});

describe("the official firmware link", () => {
  it("resolves a stored relative file path against the API", () => {
    expect(firmwareUrl(productWithFirmware("/static/1234-firmware.bin"))).toMatch(
      /\/static\/1234-firmware\.bin$/,
    );
  });

  it("accepts an absolute http or https file URL", () => {
    expect(firmwareUrl(productWithFirmware("https://cdn.example.com/fw.bin"))).toBe(
      "https://cdn.example.com/fw.bin",
    );
    expect(firmwareUrl(productWithFirmware("http://localhost:9000/static/fw.bin"))).toBe(
      "http://localhost:9000/static/fw.bin",
    );
  });

  it("ignores a missing or empty file", () => {
    expect(firmwareUrl(productWithFirmware(undefined))).toBeNull();
    expect(firmwareUrl(productWithFirmware(""))).toBeNull();
    expect(firmwareUrl(productWithFirmware("   "))).toBeNull();
  });

  it("ignores a value that is not a string", () => {
    expect(firmwareUrl(productWithFirmware(42))).toBeNull();
  });

  it("rejects an unsafe or malformed URL", () => {
    expect(firmwareUrl(productWithFirmware("javascript:alert(1)"))).toBeNull();
    expect(firmwareUrl(productWithFirmware("ftp://example.com/fw.bin"))).toBeNull();
    expect(firmwareUrl(productWithFirmware("/static/../secret"))).toBeNull();
    expect(firmwareUrl(productWithFirmware("not a url"))).toBeNull();
  });
});
