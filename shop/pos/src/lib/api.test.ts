import { MedusaAdminClient } from "./api";

describe("createCashSale", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("posts the cart items to the admin cash route", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        sale: {
          id: "order_1",
          display_id: 7,
          total: 149,
          currency_code: "eur",
          payment_method: "cash",
        },
      }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const client = new MedusaAdminClient("http://medusa.test", "token");
    const sale = await client.createCashSale({
      items: [{ variantId: "var_1", quantity: 2 }],
    });

    expect(sale).toEqual({
      id: "order_1",
      display_id: 7,
      total: 149,
      currency_code: "eur",
      payment_method: "cash",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://medusa.test/admin/pos/cash",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ authorization: "Bearer token" }),
        body: JSON.stringify({ items: [{ variantId: "var_1", quantity: 2 }] }),
      }),
    );
  });
});
