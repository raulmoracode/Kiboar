import { describe, expect, it } from "vitest";

import { POST } from "../src/api/admin/pos/cash/route";

describe("the POS cash route", () => {
  it("rejects an empty item list before touching the container", async () => {
    await expect(
      POST({ body: { items: [] } } as never, { json: () => {} } as never),
    ).rejects.toThrow(/at least one item/i);
  });

  it("rejects a non-positive quantity", async () => {
    await expect(
      POST(
        {
          body: { items: [{ variantId: "var_1", quantity: 0 }] },
        } as never,
        { json: () => {} } as never,
      ),
    ).rejects.toThrow(/at least one item/i);
  });
});
