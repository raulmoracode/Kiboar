import { describe, expect, it, vi } from "vitest";

import { GET } from "../src/api/admin/reports/sales/route";

describe("the sales register route", () => {
  it("maps orders and returns the page metadata", async () => {
    const graph = vi.fn().mockResolvedValue({
      data: [
        {
          id: "order_1",
          display_id: 7,
          created_at: "2026-11-26T09:00:00.000Z",
          status: "completed",
          total: 59,
          currency_code: "eur",
          metadata: { payment_method: "cash" },
          sales_channel: { name: "Kiboar POS", metadata: { kiboar_channel: "pos" } },
        },
      ],
      metadata: { count: 1, skip: 0, take: 50 },
    });
    const json = vi.fn();

    await GET(
      {
        query: { limit: "50", offset: "0" },
        scope: { resolve: () => ({ graph }) },
      } as never,
      { json } as never,
    );

    expect(json).toHaveBeenCalledWith({
      sales: [
        {
          id: "order_1",
          display_id: 7,
          created_at: "2026-11-26T09:00:00.000Z",
          status: "completed",
          total: 59,
          currency_code: "eur",
          channel: "pos",
          channel_name: "Kiboar POS",
          payment_method: "cash",
        },
      ],
      count: 1,
      limit: 50,
      offset: 0,
    });
  });

  it("clamps the page size and defaults invalid values", async () => {
    const graph = vi.fn().mockResolvedValue({ data: [], metadata: { count: 0 } });
    const json = vi.fn();

    await GET(
      {
        query: { limit: "999", offset: "nope" },
        scope: { resolve: () => ({ graph }) },
      } as never,
      { json } as never,
    );

    expect(graph).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: { take: 200, skip: 0, order: { created_at: "DESC" } },
      }),
    );
    expect(json).toHaveBeenCalledWith({ sales: [], count: 0, limit: 200, offset: 0 });
  });
});
