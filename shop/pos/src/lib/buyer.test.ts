import { isValidBuyer } from "./buyer";

describe("the sale buyer", () => {
  it("accepts a complete buyer", () => {
    expect(isValidBuyer({ firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" })).toBe(
      true,
    );
  });

  it("rejects missing names", () => {
    expect(isValidBuyer({ firstName: " ", lastName: "Lovelace", email: "ada@example.com" })).toBe(
      false,
    );
    expect(isValidBuyer({ firstName: "Ada", lastName: "", email: "ada@example.com" })).toBe(false);
  });

  it("rejects malformed emails", () => {
    for (const email of ["", "ada", "ada@", "ada@example", "ada example.com"]) {
      expect(isValidBuyer({ firstName: "Ada", lastName: "Lovelace", email })).toBe(false);
    }
  });
});
