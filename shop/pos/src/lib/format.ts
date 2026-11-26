/**
 * Medusa v2 stores and returns prices in major units: 149 is €149.00, not
 * €1.49. Do not divide by 100 here.
 */
export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}
