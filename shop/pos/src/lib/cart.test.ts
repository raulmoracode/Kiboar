import { addLine, type CartLine, cartCount, cartTotal, setQuantity } from "./cart";

const coffee: Omit<CartLine, "quantity"> = {
  id: "kb60",
  title: "Kiboar 60",
  unitAmount: 18900,
  currency: "EUR",
};

describe("the cart", () => {
  it("adds a line and increments an existing one", () => {
    const once = addLine([], coffee);
    expect(once).toHaveLength(1);
    expect(once[0]?.quantity).toBe(1);

    const twice = addLine(once, coffee);
    expect(twice).toHaveLength(1);
    expect(twice[0]?.quantity).toBe(2);
  });

  it("removes a line when the quantity drops to zero", () => {
    const lines = addLine([], coffee);
    expect(setQuantity(lines, coffee.id, 0)).toEqual([]);
  });

  it("totals and counts every unit", () => {
    const lines = addLine(addLine([], coffee), coffee);
    expect(cartTotal(lines)).toBe(37800);
    expect(cartCount(lines)).toBe(2);
  });
});
