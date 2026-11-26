import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  testMatch: "**/*.spec.ts",
  use: {
    baseURL: "http://127.0.0.1:4326",
  },
  webServer: {
    command: "node test/serve.mjs",
    url: "http://127.0.0.1:4326/",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
