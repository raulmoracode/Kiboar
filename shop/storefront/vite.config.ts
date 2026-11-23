import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [react(), tailwindcss()],
  server: {
    port: 3001,
    strictPort: true,
  },
  preview: {
    port: 3001,
    strictPort: true,
  },
});
