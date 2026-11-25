import { expect, test } from "@playwright/test";

test("the shell renders with the Tauri IPC mocked", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.addInitScript(() => {
    const invoke = async (command: string) => {
      if (command === "list_devices" || command === "list_boards") {
        return [];
      }
      return null;
    };

    window.__TAURI_INTERNALS__ = {
      invoke,
      transformCallback: () => 1,
      convertFileSrc: (path: string) => path,
      metadata: {},
    };
  });

  await page.goto("/");
  await expect(page.getByRole("region", { name: "Keyboards" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Add keyboard/ })).toBeVisible();
  expect(errors).toEqual([]);
});
