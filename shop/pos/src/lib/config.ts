export const DEFAULT_API_URL = "http://localhost:9000";

export const apiUrl = (process.env.EXPO_PUBLIC_MEDUSA_URL ?? DEFAULT_API_URL).replace(/\/$/, "");

/**
 * Publishable key linked to the POS sales channel. It is not a secret: it only
 * scopes Store API requests to the catalogue the till may sell.
 */
export const publishableKey = process.env.EXPO_PUBLIC_POS_PUBLISHABLE_KEY;

/** Non-secret IDs the POS uses to scope sales to its channel and stock location. */
export const salesChannelId = process.env.EXPO_PUBLIC_POS_SALES_CHANNEL_ID;
export const locationId = process.env.EXPO_PUBLIC_POS_LOCATION_ID;
