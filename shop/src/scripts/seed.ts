import { writeFile } from "node:fs/promises";
import path from "node:path";

import type { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils";
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
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows";

const STORE_NAME = "Kiboar";
const ONLINE_CHANNEL = "Kiboar Online";
const POS_CHANNEL = "Kiboar POS";
const LOCATION_NAME = "Kiboar Store";
const REGION_NAME = "Europe";
const COUNTRY = "es";
const CURRENCY = "eur";
const TAX_RATE_NAME = "IVA 21%";
const TAX_RATE_CODE = "IVA21";
const TAX_RATE_PERCENT = 21;
const DEFAULT_CHANNEL_NAME = "Default Sales Channel";
const KEYBOARD_FILES_KEY = "keyboard_files_url";
const COLLECTION = { title: "Kiboar boards", handle: "kiboar-boards" } as const;

const PRODUCT_TYPES = ["Keyboard", "Macropad", "Numpad", "Encoder"] as const;

const PRODUCT_TAGS = [
  "60%",
  "65%",
  "HHKB",
  "Split",
  "Macropad",
  "Numpad",
  "Encoder",
  "Hotswap",
  "Aluminium",
  "USB-C",
  "Arrows",
  "Function row",
  "Media",
] as const;

interface CategorySeed {
  name: string;
  handle: string;
  rank: number;
  children?: CategorySeed[];
}

const CATEGORY_TREE: CategorySeed[] = [
  {
    name: "Boards",
    handle: "boards",
    rank: 0,
    children: [
      {
        name: "Keyboards",
        handle: "keyboards",
        rank: 0,
        children: [
          { name: "60%", handle: "keyboards-60", rank: 0 },
          { name: "65%", handle: "keyboards-65", rank: 1 },
          { name: "Split", handle: "keyboards-split", rank: 2 },
        ],
      },
      { name: "Macropads", handle: "macropads", rank: 1 },
      { name: "Numpads", handle: "numpads", rank: 2 },
      { name: "Encoders", handle: "encoders", rank: 3 },
    ],
  },
];

interface ProductSeed {
  handle: string;
  title: string;
  description: string;
  subtitle: string;
  type: (typeof PRODUCT_TYPES)[number];
  category: string;
  tags: (typeof PRODUCT_TAGS)[number][];
  metadata: Record<string, unknown>;
  price: number;
  image: string;
}

const products: ProductSeed[] = [
  {
    handle: "kb60-hhkb",
    title: "Kiboar 60% HHKB",
    description: "A 60% HHKB layout with the Kiboar hotswap PCB and aluminium case.",
    subtitle: "60% HHKB · hotswap · aluminium",
    type: "Keyboard",
    category: "keyboards-60",
    tags: ["60%", "HHKB", "Hotswap", "Aluminium"],
    metadata: {
      mcu: "RP2040 Zero",
      case: "Aluminium",
      keys: 61,
      layout: "HHKB",
      matrix: "5 × 14",
      hotswap: true,
      form_factor: "60%",
      [KEYBOARD_FILES_KEY]:
        "https://github.com/raulmoracode/Kiboar/tree/main/software/boards/kb60-hhkb",
    },
    price: 189,
    image: "1795471428861-kiboar-60.png",
  },
  {
    handle: "macropad-6",
    title: "Kiboar Macropad 6",
    description: "A six-key macropad with an encoder and a USB-C connection.",
    subtitle: "6 keys · encoder · USB-C",
    type: "Macropad",
    category: "macropads",
    tags: ["Macropad", "Encoder", "USB-C"],
    metadata: {
      mcu: "RP2040 Zero",
      keys: 6,
      matrix: "2 × 3",
      encoder: true,
      connection: "USB-C",
      form_factor: "Macropad",
      [KEYBOARD_FILES_KEY]:
        "https://github.com/raulmoracode/Kiboar/tree/main/software/boards/macropad-6",
    },
    price: 59,
    image: "1795471429050-kiboar-macropad.png",
  },
  {
    handle: "kb65",
    title: "Kiboar 65",
    description: "A 65% board with arrows and a compact function row.",
    subtitle: "65% · arrows · function row",
    type: "Keyboard",
    category: "keyboards-65",
    tags: ["65%", "Arrows", "Function row"],
    metadata: {
      features: ["arrows", "function row"],
      form_factor: "65%",
    },
    price: 199,
    image: "1795471429421-kiboar-65.png",
  },
  {
    handle: "kb-split",
    title: "Kiboar Split",
    description: "A split board for a wider, more relaxed typing position.",
    subtitle: "Split · relaxed typing",
    type: "Keyboard",
    category: "keyboards-split",
    tags: ["Split"],
    metadata: {
      split: true,
      form_factor: "Split",
      [KEYBOARD_FILES_KEY]:
        "https://github.com/raulmoracode/Kiboar/tree/main/software/boards/split-4x6",
    },
    price: 219,
    image: "1795471429236-kiboar-split.png",
  },
  {
    handle: "kb-numpad",
    title: "Kiboar Numpad",
    description: "A matching numpad for the Kiboar desk.",
    subtitle: "Matching numpad",
    type: "Numpad",
    category: "numpads",
    tags: ["Numpad"],
    metadata: {
      form_factor: "Numpad",
    },
    price: 79,
    image: "1795471429610-kiboar-numpad.png",
  },
  {
    handle: "kb-encoder",
    title: "Kiboar Encoder",
    description: "A single encoder macropad for volume, zoom and media.",
    subtitle: "Single encoder · media control",
    type: "Encoder",
    category: "encoders",
    tags: ["Encoder", "Media"],
    metadata: {
      encoder: true,
      features: ["volume", "zoom", "media"],
      form_factor: "Encoder",
    },
    price: 149,
    image: "1795471429809-kiboar-encoder.png",
  },
];

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

  await storeService.updateStores(store.id, {
    name: STORE_NAME,
    supported_currencies: [{ currency_code: CURRENCY, is_default: true }],
    default_sales_channel_id: onlineChannel.id,
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

  await storeService.updateStores(store.id, { default_region_id: region.id });

  const [existingTaxRegion] = await taxService.listTaxRegions({ country_code: COUNTRY });
  let taxRegion = existingTaxRegion;
  if (!taxRegion) {
    const { result } = await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: COUNTRY, provider_id: "tp_system" }],
    });
    taxRegion = result[0];
  }

  const taxRates = await taxService.listTaxRates({ tax_region_id: taxRegion.id });
  if (!taxRates.some((rate) => rate.code === TAX_RATE_CODE)) {
    await taxService.createTaxRates({
      tax_region_id: taxRegion.id,
      name: TAX_RATE_NAME,
      rate: TAX_RATE_PERCENT,
      code: TAX_RATE_CODE,
      is_default: true,
    });
  }

  const pricingService = container.resolve(Modules.PRICING);
  const ensureTaxInclusivePricePreference = async (attribute: string, value: string) => {
    const [existing] = await pricingService.listPricePreferences({ attribute, value }, { take: 1 });
    if (existing) {
      if (!existing.is_tax_inclusive) {
        await pricingService.updatePricePreferences(existing.id, { is_tax_inclusive: true });
      }
      return;
    }
    await pricingService.createPricePreferences({ attribute, value, is_tax_inclusive: true });
  };

  await ensureTaxInclusivePricePreference("currency_code", CURRENCY);
  await ensureTaxInclusivePricePreference("region_id", region.id);

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

  await storeService.updateStores(store.id, { default_location_id: stockLocation.id });

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

  logger.info("Seeding product taxonomy...");
  const existingTypes = await productService.listProductTypes({}, { take: 100 });
  const typeIds = new Map(existingTypes.map((type) => [type.value, type.id]));
  for (const value of PRODUCT_TYPES) {
    if (!typeIds.has(value)) {
      const created = await productService.createProductTypes({ value });
      typeIds.set(value, created.id);
    }
  }

  const existingTags = await productService.listProductTags({}, { take: 100 });
  const tagIds = new Map(existingTags.map((tag) => [tag.value, tag.id]));
  for (const value of PRODUCT_TAGS) {
    if (!tagIds.has(value)) {
      const created = await productService.createProductTags({ value });
      tagIds.set(value, created.id);
    }
  }

  const [existingCollection] = await productService.listProductCollections(
    { handle: COLLECTION.handle },
    { take: 1 },
  );
  const collection =
    existingCollection ??
    (await productService.createProductCollections({
      title: COLLECTION.title,
      handle: COLLECTION.handle,
    }));

  const categoryIds = new Map<string, string>();
  const ensureCategory = async (category: CategorySeed, parentId: string | null) => {
    const [existing] = await productService.listProductCategories(
      { handle: category.handle },
      { take: 1 },
    );
    const current =
      existing ??
      (await productService.createProductCategories({
        name: category.name,
        handle: category.handle,
        rank: category.rank,
        parent_category_id: parentId,
        is_active: true,
      }));
    categoryIds.set(category.handle, current.id);
    for (const child of category.children ?? []) {
      await ensureCategory(child, current.id);
    }
  };

  for (const category of CATEGORY_TREE) {
    await ensureCategory(category, null);
  }

  const seededId = (ids: Map<string, string>, kind: string, value: string) => {
    const id = ids.get(value);
    if (!id) throw new Error(`Seed ${kind} "${value}" was not created.`);
    return id;
  };

  const productTaxonomy = (product: ProductSeed) => ({
    type_id: seededId(typeIds, "type", product.type),
    collection_id: collection.id,
    categories: [{ id: seededId(categoryIds, "category", product.category) }],
    tags: product.tags.map((value) => ({ id: seededId(tagIds, "tag", value) })),
    subtitle: product.subtitle,
    metadata: product.metadata,
  });

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
          ...productTaxonomy(product),
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

  const seededProducts = await productService.listProducts(
    { handle: products.map((product) => product.handle) },
    { take: products.length },
  );
  for (const product of seededProducts) {
    const seed = products.find((entry) => entry.handle === product.handle);
    if (!seed) continue;

    const existingFilesUrl = product.metadata?.[KEYBOARD_FILES_KEY];
    const metadata = {
      ...seed.metadata,
      ...(typeof existingFilesUrl === "string" ? { [KEYBOARD_FILES_KEY]: existingFilesUrl } : {}),
    };

    await updateProductsWorkflow(container).run({
      input: {
        selector: { id: product.id },
        update: {
          ...productTaxonomy(seed),
          metadata,
          sales_channels: [{ id: onlineChannel.id }, { id: posChannel.id }],
        },
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

  logger.info("Cleaning up the unused default sales channel...");
  const [defaultChannel] = await salesChannelService.listSalesChannels({
    name: DEFAULT_CHANNEL_NAME,
  });
  if (defaultChannel) {
    const [currentStore] = await storeService.listStores();
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const orderService = container.resolve(Modules.ORDER);
    const cartService = container.resolve(Modules.CART);
    const { data: productLinks } = await query.graph({
      entity: "product_sales_channel",
      fields: ["product_id"],
      filters: { sales_channel_id: defaultChannel.id },
    });
    const [order] = await orderService.listOrders(
      { sales_channel_id: defaultChannel.id },
      { take: 1 },
    );
    const [cart] = await cartService.listCarts(
      { sales_channel_id: defaultChannel.id },
      { take: 1 },
    );

    if (
      currentStore.default_sales_channel_id !== defaultChannel.id &&
      !productLinks.length &&
      !order &&
      !cart
    ) {
      await salesChannelService.deleteSalesChannels(defaultChannel.id);
      logger.info(`Removed the unused ${DEFAULT_CHANNEL_NAME}.`);
    }
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
