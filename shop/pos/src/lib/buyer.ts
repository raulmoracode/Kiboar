export interface Buyer {
  firstName: string;
  lastName: string;
  email: string;
}

export const EMPTY_BUYER: Buyer = { firstName: "", lastName: "", email: "" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Every sale needs a name and a reachable email, whatever the payment method. */
export function isValidBuyer(buyer: Buyer): boolean {
  return (
    buyer.firstName.trim().length > 0 &&
    buyer.lastName.trim().length > 0 &&
    EMAIL.test(buyer.email.trim())
  );
}
