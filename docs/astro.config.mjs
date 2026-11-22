// @ts-check

import fumadocs from "@fumadocs/astro";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://kiboar.raulmoracode.com",
  integrations: [
    fumadocs({
      components: "./src/components/mdx.tsx",
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
