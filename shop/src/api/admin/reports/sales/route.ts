import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import { type SalesOrderSource, toSaleRow } from "../../../../lib/sales";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const FIELDS = [
  "id",
  "display_id",
  "created_at",
  "status",
  "currency_code",
  "total",
  "metadata",
  "sales_channel.name",
  "sales_channel.metadata",
  "payment_collections.payments.provider_id",
  "payment_collections.payment_sessions.provider_id",
];

function intParam(value: unknown, fallback: number, min: number, max: number): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = typeof raw === "string" ? Number.parseInt(raw, 10) : Number.NaN;

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
}

/** Paginated sales register shared by the admin page and the POS. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const limit = intParam(req.query.limit, DEFAULT_LIMIT, 1, MAX_LIMIT);
  const offset = intParam(req.query.offset, 0, 0, Number.MAX_SAFE_INTEGER);

  const { data, metadata } = await query.graph({
    entity: "order",
    fields: FIELDS,
    pagination: {
      take: limit,
      skip: offset,
      order: { created_at: "DESC" },
    },
  });

  const orders = data as unknown as SalesOrderSource[];

  res.json({
    sales: orders.map(toSaleRow),
    count: metadata?.count ?? orders.length,
    limit,
    offset,
  });
}
