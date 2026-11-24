import { expect, test } from "@playwright/test";

test("the English home renders", async ({ page }) => {
  const response = await page.goto("/docs");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: /Keyboards you can buy/ }),
  ).toBeVisible();
});

test("the Spanish home renders", async ({ page }) => {
  const response = await page.goto("/es/docs");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: /Teclados que puedes comprar/ }),
  ).toBeVisible();
});

test("a generated library page renders", async ({ page }) => {
  const response = await page.goto("/docs/libraries/switches-and-buttons/Kiboar_TactileButton");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("the static search endpoint answers", async ({ request }) => {
  const response = await request.get("/api/search");
  expect(response.status()).toBe(200);
  expect((await response.text()).length).toBeGreaterThan(1000);
});

test("the home loads without failed assets", async ({ page }) => {
  const failed: string[] = [];
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failed.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto("/docs", { waitUntil: "networkidle" });
  expect(failed).toEqual([]);
});
