import { kiboarViteConfig } from "@kiboar/vite-config";

export default kiboarViteConfig({
  port: 3001,
  base: process.env.VITE_BASE_PATH ?? "/",
});
