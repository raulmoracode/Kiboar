import { kiboarViteConfig } from "@kiboar/vite-config";

export default kiboarViteConfig({
  port: 1420,
  clearScreen: false,
  server: {
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
});
