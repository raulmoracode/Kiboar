import { formatMoney } from "./format";

describe("formatMoney", () => {
  it("treats the amount as the currency major unit", () => {
    expect(formatMoney(189, "EUR")).toBe("€189.00");
  });
});
