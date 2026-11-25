import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  use: {
    baseURL: "http://127.0.0.1:4324",
  },
  webServer: {
    command: "node test/serve.mjs",
    url: "http://127.0.0.1:4324",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
