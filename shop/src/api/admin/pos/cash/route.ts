import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils";
import {
  addShippingMethodToCartWorkflow,
  capturePaymentWorkflow,
  completeCartWorkflow,
  createCartWorkflow,
  createOrderFulfillmentWorkflow,
  createPaymentCollectionForCartWorkflow,
  createPaymentSessionsWorkflow,
  markOrderFulfillmentAsDeliveredWorkflow,
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
  buyer: z.object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().trim().email(),
  }),
});

const CASH_PROVIDER = "pp_system_default";
const PICKUP_OPTION = "Store pickup";

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
      "Expected at least one item and the buyer's first name, last name and email.",
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

  const { result: cart } = await createCartWorkflow(req.scope).run({
    input: {
      region_id: region.id,
      sales_channel_id: posChannel.id,
      items: parsed.data.items.map((item) => ({
        variant_id: item.variantId,
        quantity: item.quantity,
      })),
      email: parsed.data.buyer.email,
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

  // An in-person cash sale is handed over at the counter: fulfill and deliver
  // it immediately so it never waits for a shipment.
  const { data: orderItems } = await query.graph({
    entity: "order",
    fields: ["items.id", "items.quantity"],
    filters: { id: completed.id },
  });
  const items = (orderItems as Array<{ items?: Array<{ id: string; quantity: number }> }>)[0]
    ?.items;

  if (!items?.length) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "The cash order has no items to fulfill.",
    );
  }

  const fulfillment = await createOrderFulfillmentWorkflow(req.scope).run({
    input: {
      order_id: completed.id,
      items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
    },
  });

  await markOrderFulfillmentAsDeliveredWorkflow(req.scope).run({
    input: { orderId: completed.id, fulfillmentId: fulfillment.result.id },
  });

  const order = await orderService.updateOrders(completed.id, {
    metadata: {
      payment_method: "cash",
      pos_sale: true,
      buyer_first_name: parsed.data.buyer.firstName,
      buyer_last_name: parsed.data.buyer.lastName,
      buyer_email: parsed.data.buyer.email,
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
