import { Modules } from "@medusajs/framework/utils";
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";

const FILE_METADATA_KEYS = ["keyboard_files_url", "firmware_url"] as const;

updateProductsWorkflow.hooks.productsUpdated(
  async ({ products, additional_data }, { container }) => {
    if (!additional_data) {
      return;
    }

    const updates: Record<string, string> = {};
    for (const key of FILE_METADATA_KEYS) {
      const value = additional_data[key];
      if (typeof value === "string") {
        updates[key] = value.trim();
      }
    }

    if (Object.keys(updates).length === 0) {
      return;
    }

    const productService = container.resolve(Modules.PRODUCT);

    for (const product of products) {
      const current = await productService.retrieveProduct(product.id);
      await productService.updateProducts(product.id, {
        metadata: { ...(current.metadata ?? {}), ...updates },
      });
    }
  },
);
