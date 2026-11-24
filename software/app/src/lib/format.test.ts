import { describe, expect, it } from "vitest";

import { blockLabel, familyLabel, fileName, formatBytes, shortDigest } from "./format";

describe("the Studio formatting helpers", () => {
  it("formats bytes across the unit boundaries", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1023)).toBe("1023 B");
    expect(formatBytes(1536)).toBe("1.5 KiB");
    expect(formatBytes(2 * 1024 * 1024)).toBe("2.0 MiB");
  });

  it("takes the file name from a POSIX or Windows path", () => {
    expect(fileName("/Users/raúl/firmware.uf2")).toBe("firmware.uf2");
    expect(fileName("C:\\boards\\firmware.uf2")).toBe("firmware.uf2");
    expect(fileName("firmware.uf2")).toBe("firmware.uf2");
  });

  it("shortens a digest at both ends", () => {
    expect(shortDigest("0123456789abcdef0123456789abcdef")).toBe("01234567…cdef");
  });

  it("names the RP2040 family and falls back to hex", () => {
    expect(familyLabel(0xe48bff56)).toBe("RP2040");
    expect(familyLabel(null)).toBe("no family");
    expect(familyLabel(0x1234)).toBe("0x00001234");
  });

  it("pluralises the block count", () => {
    expect(blockLabel(1)).toBe("1 block");
    expect(blockLabel(0)).toBe("0 blocks");
    expect(blockLabel(12)).toBe("12 blocks");
  });
});
