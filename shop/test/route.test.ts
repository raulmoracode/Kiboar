import { describe, expect, it, vi } from "vitest";

import { GET } from "../src/api/store/custom/route";

describe("the custom store route", () => {
  it("answers with the store surface", async () => {
    const json = vi.fn();

    await GET({} as never, { json } as never);

    expect(json).toHaveBeenCalledWith({ status: "ok", surface: "store" });
  });
});
