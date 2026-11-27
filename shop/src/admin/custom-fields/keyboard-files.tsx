import { z } from "zod";

type ProductWithMetadata = {
  metadata?: Record<string, unknown> | null;
};

// The helper is not exported by @medusajs/admin-sdk 2.23 yet. The admin build
// reads the call statically, so a local identity helper is enough.
function unstable_defineCustomFieldsConfig<T>(config: T): T {
  return config;
}

export default unstable_defineCustomFieldsConfig({
  model: "product",
  // The value lives in product metadata, persisted by the workflow hook, so
  // there is no linked model to fetch. The build still requires the property.
  link: [],
  forms: [
    {
      zone: "edit",
      fields: {
        keyboard_files_url: {
          label: "Keyboard files URL",
          description: "GitHub link shown below Add to bag on the storefront.",
          placeholder: "https://github.com/raulmoracode/Kiboar/tree/main/software/boards/kb60-hhkb",
          validation: z.string().optional(),
          defaultValue: (product: ProductWithMetadata) => {
            const value = product.metadata?.keyboard_files_url;
            return typeof value === "string" ? value : "";
          },
        },
      },
    },
  ],
});
