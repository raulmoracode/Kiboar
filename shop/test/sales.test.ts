import { describe, expect, it } from "vitest";

import { channelKindOf, paymentMethodOf, toSaleRow } from "../src/lib/sales";

const base = {
  id: "order_1",
  display_id: 42,
  created_at: "2026-11-26T09:00:00.000Z",
  status: "completed",
  total: 189,
  currency_code: "eur",
};

describe("the sales register mapping", () => {
  it("reads the seeded channel tag before the channel name", () => {
    expect(channelKindOf({ name: "Counter", metadata: { kiboar_channel: "pos" } })).toBe("pos");
    expect(channelKindOf({ name: "Kiboar POS", metadata: null })).toBe("pos");
    expect(channelKindOf({ name: "Kiboar Online", metadata: null })).toBe("online");
    expect(channelKindOf({ name: "Wholesale" })).toBe("other");
    expect(channelKindOf(null)).toBe("other");
  });

  it("reads the POS payment method from the order metadata", () => {
    expect(paymentMethodOf({ ...base, metadata: { payment_method: "cash" } })).toBe("cash");
    expect(paymentMethodOf({ ...base, metadata: { payment_method: "stripe_link" } })).toBe(
      "stripe_link",
    );
  });

  it("falls back to the Stripe provider when the metadata is absent", () => {
    expect(
      paymentMethodOf({
        ...base,
        payment_collections: [{ payments: [{ provider_id: "pp_stripe_stripe" }] }],
      }),
    ).toBe("stripe_link");
    expect(
      paymentMethodOf({
        ...base,
        payment_collections: [{ payment_sessions: [{ provider_id: "pp_system_default" }] }],
      }),
    ).toBe("other");
  });

  it("builds a register row", () => {
    expect(
      toSaleRow({
        ...base,
        sales_channel: { name: "Kiboar POS", metadata: { kiboar_channel: "pos" } },
        metadata: { payment_method: "cash" },
      }),
    ).toEqual({
      id: "order_1",
      display_id: 42,
      created_at: "2026-11-26T09:00:00.000Z",
      status: "completed",
      total: 189,
      currency_code: "eur",
      channel: "pos",
      channel_name: "Kiboar POS",
      payment_method: "cash",
    });
  });

  it("tolerates a sparse order", () => {
    expect(toSaleRow({ id: "order_2" })).toEqual({
      id: "order_2",
      display_id: null,
      created_at: new Date(0).toISOString(),
      status: "unknown",
      total: 0,
      currency_code: "",
      channel: "other",
      channel_name: "Unknown",
      payment_method: "other",
    });
  });
});
