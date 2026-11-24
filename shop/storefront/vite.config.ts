import { kiboarViteConfig } from "@kiboar/vite-config";
import { loadEnv } from "vite";

export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd(), "");

  if (mode === "production" && (!env.VITE_MEDUSA_URL || !env.VITE_MEDUSA_PUBLISHABLE_KEY)) {
    throw new Error(
      "@kiboar/storefront: VITE_MEDUSA_URL and VITE_MEDUSA_PUBLISHABLE_KEY are required for a production build.",
    );
  }

  return kiboarViteConfig({
    port: 3001,
    base: env.VITE_BASE_PATH ?? "/",
  });
};
