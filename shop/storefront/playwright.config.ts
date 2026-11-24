import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3101",
    locale: "en-US",
    trace: "retain-on-failure",
  },
});
