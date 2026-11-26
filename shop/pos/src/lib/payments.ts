export type PaymentStatus = "pending" | "paid" | "expired" | "cancelled";

export interface QrPayment {
  /** Hosted Stripe Checkout URL that the customer scans. */
  url: string;
  draftOrderId: string;
  expiresAt: string;
  status: PaymentStatus;
}

export interface CheckoutInput {
  items: { variantId: string; quantity: number }[];
  customerId?: string;
  salesChannelId?: string;
  locationId?: string;
}
