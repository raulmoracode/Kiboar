export type SalesChannelKind = "online" | "pos" | "other";
export type SalesPaymentMethod = "stripe_link" | "cash" | "other";

export interface SalesOrderSource {
  id: string;
  display_id?: number | null;
  created_at?: string | Date | null;
  status?: string | null;
  total?: number | null;
  currency_code?: string | null;
  metadata?: Record<string, unknown> | null;
  sales_channel?: {
    name?: string | null;
    metadata?: Record<string, unknown> | null;
  } | null;
  payment_collections?: Array<{
    payments?: Array<{ provider_id?: string | null } | null> | null;
    payment_sessions?: Array<{ provider_id?: string | null } | null> | null;
  } | null> | null;
}

export interface SaleRow {
  id: string;
  display_id: number | null;
  created_at: string;
  status: string;
  total: number;
  currency_code: string;
  channel: SalesChannelKind;
  channel_name: string;
  payment_method: SalesPaymentMethod;
}

/**
 * The seed tags the two channels with `kiboar_channel`. The name check is a
 * fallback for channels created by hand in the admin.
 */
export function channelKindOf(
  channel: SalesOrderSource["sales_channel"] | undefined,
): SalesChannelKind {
  const tagged = channel?.metadata?.kiboar_channel;
  if (tagged === "online" || tagged === "pos") {
    return tagged;
  }

  const name = channel?.name?.toLowerCase() ?? "";
  if (name.includes("pos")) {
    return "pos";
  }
  if (name.includes("online") || name.includes("web") || name.includes("storefront")) {
    return "online";
  }
  return "other";
}

/**
 * POS checkout writes `metadata.payment_method` (`cash` or `stripe_link`). When
 * it is absent, the Stripe provider id is still enough to attribute the sale.
 */
export function paymentMethodOf(order: SalesOrderSource): SalesPaymentMethod {
  const fromMetadata = order.metadata?.payment_method;
  if (fromMetadata === "cash" || fromMetadata === "stripe_link") {
    return fromMetadata;
  }

  const providerIds = (order.payment_collections ?? []).flatMap((collection) => [
    ...(collection?.payments ?? []).map((payment) => payment?.provider_id),
    ...(collection?.payment_sessions ?? []).map((session) => session?.provider_id),
  ]);

  return providerIds.some((id) => id?.includes("stripe")) ? "stripe_link" : "other";
}

export function toSaleRow(order: SalesOrderSource): SaleRow {
  return {
    id: order.id,
    display_id: order.display_id ?? null,
    created_at: new Date(order.created_at ?? 0).toISOString(),
    status: order.status ?? "unknown",
    total: Number(order.total ?? 0),
    currency_code: order.currency_code ?? "",
    channel: channelKindOf(order.sales_channel),
    channel_name: order.sales_channel?.name ?? "Unknown",
    payment_method: paymentMethodOf(order),
  };
}
