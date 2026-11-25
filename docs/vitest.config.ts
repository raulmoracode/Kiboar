import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Astro keeps `jsx: "preserve"` for its own transform, so the React plugin
  // provides the transform for the `.tsx` component tests.
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
