import { describe, expect, it, vi } from "vitest";

import { GET } from "../src/api/admin/custom/route";

describe("the custom admin route", () => {
  it("answers with the admin surface", async () => {
    const json = vi.fn();

    await GET({} as never, { json } as never);

    expect(json).toHaveBeenCalledWith({ status: "ok", surface: "admin" });
  });
});
