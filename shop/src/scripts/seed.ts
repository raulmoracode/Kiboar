import { writeFile } from "node:fs/promises";
import path from "node:path";

import type { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils";
import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

const ONLINE_CHANNEL = "Kiboar Online";
const POS_CHANNEL = "Kiboar POS";
const LOCATION_NAME = "Kiboar Store";
const REGION_NAME = "Europe";
const COUNTRY = "es";
const CURRENCY = "eur";

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => ({
      selector: { id: data.input.store_id },
      update: {
        supported_currencies: data.input.supported_currencies.map((currency) => ({
          currency_code: currency.currency_code,
          is_default: currency.is_default ?? false,
        })),
      },
    }));

    return new WorkflowResponse(updateStoresStep(normalizedInput));
  },
);

const products = [
  {
    handle: "kb60-hhkb",
    title: "Kiboar 60% HHKB",
    description: "A 60% HHKB layout with the Kiboar hotswap PCB and aluminium case.",
    price: 189,
    image: "1795471428861-kiboar-60.png",
  },
  {
    handle: "macropad-6",
    title: "Kiboar Macropad 6",
    description: "A six-key macropad with an encoder and a USB-C connection.",
    price: 59,
    image: "1795471429050-kiboar-macropad.png",
  },
  {
    handle: "kb65",
    title: "Kiboar 65",
    description: "A 65% board with arrows and a compact function row.",
    price: 199,
    image: "1795471429421-kiboar-65.png",
  },
  {
    handle: "kb-split",
    title: "Kiboar Split",
    description: "A split board for a wider, more relaxed typing position.",
    price: 219,
    image: "1795471429236-kiboar-split.png",
  },
  {
    handle: "kb-numpad",
    title: "Kiboar Numpad",
    description: "A matching numpad for the Kiboar desk.",
    price: 79,
    image: "1795471429610-kiboar-numpad.png",
  },
  {
    handle: "kb-encoder",
    title: "Kiboar Encoder",
    description: "A single encoder macropad for volume, zoom and media.",
    price: 149,
    image: "1795471429809-kiboar-encoder.png",
  },
] as const;

export default async function seedKiboar({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const storeService = container.resolve(Modules.STORE);
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL);
  const regionService = container.resolve(Modules.REGION);
  const stockLocationService = container.resolve(Modules.STOCK_LOCATION);
  const fulfillmentService = container.resolve(Modules.FULFILLMENT);
  const taxService = container.resolve(Modules.TAX);
  const apiKeyService = container.resolve(Modules.API_KEY);
  const productService = container.resolve(Modules.PRODUCT);
  const inventoryService = container.resolve(Modules.INVENTORY);

  const [store] = await storeService.listStores();

  logger.info("Seeding store, sales channels and region...");
  const channelByName = async (name: string, kind: "online" | "pos") => {
    const [existing] = await salesChannelService.listSalesChannels({ name });

    if (existing) {
      if (existing.metadata?.kiboar_channel !== kind) {
        await salesChannelService.updateSalesChannels(existing.id, {
          metadata: { ...(existing.metadata ?? {}), kiboar_channel: kind },
        });
      }
      return existing;
    }

    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name }] },
    });
    const created = result[0];
    await salesChannelService.updateSalesChannels(created.id, {
      metadata: { kiboar_channel: kind },
    });
    return created;
  };

  const onlineChannel = await channelByName(ONLINE_CHANNEL, "online");
  const posChannel = await channelByName(POS_CHANNEL, "pos");

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [{ currency_code: CURRENCY, is_default: true }],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { default_sales_channel_id: onlineChannel.id },
    },
  });

  const [existingRegion] = await regionService.listRegions({ name: REGION_NAME });
  let region = existingRegion;
  if (!region) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: REGION_NAME,
            currency_code: CURRENCY,
            countries: [COUNTRY],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    region = result[0];
  }

  const taxRegions = await taxService.listTaxRegions({ country_code: COUNTRY });
  if (!taxRegions.length) {
    await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: COUNTRY, provider_id: "tp_system" }],
    });
  }

  logger.info("Seeding stock location and fulfillment...");
  const [existingLocation] = await stockLocationService.listStockLocations({ name: LOCATION_NAME });
  let stockLocation = existingLocation;
  if (!stockLocation) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: LOCATION_NAME,
            address: { city: "Barcelona", country_code: "ES", address_1: "" },
          },
        ],
      },
    });
    stockLocation = result[0];
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    });
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { default_location_id: stockLocation.id },
    },
  });

  const shippingProfiles = await fulfillmentService.listShippingProfiles({ type: "default" });
  let shippingProfile = shippingProfiles[0];
  if (!shippingProfile) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: { data: [{ name: "Default Shipping Profile", type: "default" }] },
    });
    shippingProfile = result[0];
  }

  const options = await fulfillmentService.listShippingOptions({ name: "Store pickup" });
  if (!options.length) {
    const fulfillmentSet = await fulfillmentService.createFulfillmentSets({
      name: "Kiboar Store delivery",
      type: "shipping",
      service_zones: [
        {
          name: "Spain",
          geo_zones: [{ country_code: COUNTRY, type: "country" }],
        },
      ],
    });

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    });

    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Store pickup",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Pickup",
            description: "Collect the board at the Kiboar store.",
            code: "pickup",
          },
          prices: [
            { currency_code: CURRENCY, amount: 0 },
            { region_id: region.id, amount: 0 },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    });
  }

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [onlineChannel.id, posChannel.id],
    },
  });

  logger.info("Seeding publishable keys...");
  const keys = await apiKeyService.listApiKeys({ type: "publishable" });
  const keyByTitle = async (title: string, channelId: string) => {
    const existing = keys.find((key) => key.title === title);
    if (existing) return existing;
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [{ title, type: "publishable", created_by: "" }],
      },
    });
    const created = result[0];
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: { id: created.id, add: [channelId] },
    });
    return created;
  };

  const onlineKey = await keyByTitle("Kiboar Online", onlineChannel.id);
  const posKey = await keyByTitle("Kiboar POS", posChannel.id);

  logger.info("Seeding products...");
  const existingProducts = await productService.listProducts(
    { handle: products.map((product) => product.handle) },
    { take: products.length },
  );
  const existingHandles = new Set(existingProducts.map((product) => product.handle));

  const missing = products.filter((product) => !existingHandles.has(product.handle));
  if (missing.length) {
    await createProductsWorkflow(container).run({
      input: {
        products: missing.map((product) => ({
          title: product.title,
          handle: product.handle,
          description: product.description,
          status: ProductStatus.PUBLISHED,
          thumbnail: `/static/${product.image}`,
          images: [{ url: `/static/${product.image}` }],
          weight: 800,
          shipping_profile_id: shippingProfile.id,
          options: [{ title: "Version", values: ["Standard"] }],
          variants: [
            {
              title: "Standard",
              sku: `KIBOAR-${product.handle.toUpperCase()}`,
              options: { Version: "Standard" },
              prices: [{ amount: product.price, currency_code: CURRENCY }],
              manage_inventory: true,
            },
          ],
          sales_channels: [{ id: onlineChannel.id }, { id: posChannel.id }],
        })),
      },
    });
  }

  logger.info("Seeding inventory levels...");
  const inventoryItems = await inventoryService.listInventoryItems({});
  const levels = await inventoryService.listInventoryLevels({ location_id: stockLocation.id });
  const seeded = new Set(levels.map((level) => level.inventory_item_id));
  const missingLevels: CreateInventoryLevelInput[] = inventoryItems
    .filter((item) => !seeded.has(item.id))
    .map((item) => ({
      location_id: stockLocation.id,
      stocked_quantity: 100,
      inventory_item_id: item.id,
    }));

  if (missingLevels.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: missingLevels },
    });
  }

  const output = {
    onlineKey: onlineKey.token ?? onlineKey.id,
    posKey: posKey.token ?? posKey.id,
    onlineKeyId: onlineKey.id,
    posKeyId: posKey.id,
    onlineChannelId: onlineChannel.id,
    posChannelId: posChannel.id,
    regionId: region.id,
    stockLocationId: stockLocation.id,
  };

  await writeFile(
    path.join(process.cwd(), "seed-output.json"),
    `${JSON.stringify(output, null, 2)}\n`,
    "utf8",
  );

  logger.info(`Seeded ${missing.length} new products.`);
  logger.info(`Online publishable key: ${output.onlineKey}`);
  logger.info(`POS publishable key: ${output.posKey}`);
  logger.info(`POS sales channel: ${output.posChannelId}`);
  logger.info(`Region: ${output.regionId}`);
  logger.info("Wrote seed-output.json.");
}
