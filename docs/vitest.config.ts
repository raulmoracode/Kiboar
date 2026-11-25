/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { getViteConfig } from "astro/config";

export default getViteConfig({
  // Astro keeps `jsx: "preserve"` for its own transform, so the React plugin
  // provides the transform for the `.tsx` component tests.
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}", "test/**/*.vitest.{ts,tsx}"],
  },
});
