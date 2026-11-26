import { formatMoney } from "./format";

describe("formatMoney", () => {
  it("treats the amount as the currency minor unit", () => {
    expect(formatMoney(18900, "EUR")).toBe("€189.00");
  });
});
