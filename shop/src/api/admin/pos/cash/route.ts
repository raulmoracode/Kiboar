import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils";
import {
  addShippingMethodToCartWorkflow,
  capturePaymentWorkflow,
  completeCartWorkflow,
  createCartWorkflow,
  createPaymentCollectionForCartWorkflow,
  createPaymentSessionsWorkflow,
} from "@medusajs/medusa/core-flows";
import { z } from "zod";

const schema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

const CASH_PROVIDER = "pp_system_default";
const PICKUP_OPTION = "Store pickup";
const POS_EMAIL = "pos@kiboar.local";

/**
 * Completes a cash sale in the POS channel: cart, pickup, system payment,
 * capture, then marks the order with the POS payment method so the sales
 * register can attribute it.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Expected at least one item with variantId and a positive quantity.",
    );
  }

  const regionService = req.scope.resolve(Modules.REGION);
  const salesChannelService = req.scope.resolve(Modules.SALES_CHANNEL);
  const fulfillmentService = req.scope.resolve(Modules.FULFILLMENT);
  const orderService = req.scope.resolve(Modules.ORDER);
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const regions = await regionService.listRegions({});
  const region = regions.find((entry) => entry.currency_code === "eur") ?? regions[0];

  const channels = await salesChannelService.listSalesChannels({});
  const posChannel = channels.find((channel) => channel.metadata?.kiboar_channel === "pos");

  const [pickup] = await fulfillmentService.listShippingOptions({
    name: PICKUP_OPTION,
  });

  if (!region || !posChannel || !pickup) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "The POS region, sales channel or store pickup option is not configured.",
    );
  }

  const countryCode = region.countries?.[0]?.iso_2?.toLowerCase() ?? "es";

  const { result: cart } = await createCartWorkflow(req.scope).run({
    input: {
      region_id: region.id,
      sales_channel_id: posChannel.id,
      items: parsed.data.items.map((item) => ({
        variant_id: item.variantId,
        quantity: item.quantity,
      })),
      email: POS_EMAIL,
      shipping_address: {
        first_name: "Kiboar",
        last_name: "POS",
        address_1: "Store",
        city: "Barcelona",
        country_code: countryCode,
        postal_code: "08001",
      },
    },
  });

  await addShippingMethodToCartWorkflow(req.scope).run({
    input: { cart_id: cart.id, options: [{ id: pickup.id }] },
  });

  const { result: paymentCollection } = await createPaymentCollectionForCartWorkflow(req.scope).run(
    {
      input: { cart_id: cart.id },
    },
  );

  await createPaymentSessionsWorkflow(req.scope).run({
    input: {
      payment_collection_id: paymentCollection.id,
      provider_id: CASH_PROVIDER,
    },
  });

  const { result: completed } = await completeCartWorkflow(req.scope).run({
    input: { id: cart.id },
  });

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["payment_collections.payments.id"],
    filters: { id: completed.id },
  });

  const payment = (
    orders as Array<{
      payment_collections?: Array<{ payments?: Array<{ id: string }> }>;
    }>
  )[0]?.payment_collections?.[0]?.payments?.[0];

  if (!payment) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "The cash order has no payment to capture.",
    );
  }

  await capturePaymentWorkflow(req.scope).run({
    input: { payment_id: payment.id },
  });

  const order = await orderService.updateOrders(completed.id, {
    metadata: {
      payment_method: "cash",
      pos_sale: true,
    },
  });

  const { data: saleRows } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "total", "currency_code"],
    filters: { id: order.id },
  });

  const sale = (
    saleRows as Array<{
      id: string;
      display_id: number | null;
      total: number;
      currency_code: string;
    }>
  )[0];

  if (!sale) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "The cash order could not be read back.",
    );
  }

  res.status(201).json({
    sale: {
      id: sale.id,
      display_id: sale.display_id ?? null,
      total: sale.total,
      currency_code: sale.currency_code,
      payment_method: "cash",
    },
  });
}
