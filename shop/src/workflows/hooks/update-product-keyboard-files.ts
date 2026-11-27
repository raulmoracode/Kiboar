import { Modules } from "@medusajs/framework/utils";
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";

updateProductsWorkflow.hooks.productsUpdated(
  async ({ products, additional_data }, { container }) => {
    const value = additional_data?.keyboard_files_url;
    if (typeof value !== "string") {
      return;
    }

    const productService = container.resolve(Modules.PRODUCT);

    for (const product of products) {
      const current = await productService.retrieveProduct(product.id);
      await productService.updateProducts(product.id, {
        metadata: {
          ...(current.metadata ?? {}),
          keyboard_files_url: value.trim(),
        },
      });
    }
  },
);
