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

test("the docs use only the Kiboar dark theme", async ({ page }) => {
  await page.goto("/docs");

  const theme = await page.evaluate(() => ({
    htmlClass: document.documentElement.className,
    colorScheme: getComputedStyle(document.documentElement).colorScheme,
    background: getComputedStyle(document.body).backgroundColor,
    primary: getComputedStyle(document.documentElement)
      .getPropertyValue("--color-fd-primary")
      .trim(),
  }));

  expect(theme.htmlClass).toContain("dark");
  expect(theme.colorScheme).toBe("dark");
  expect(theme.background).toBe("rgb(10, 11, 13)");
  expect(theme.primary).toBe("#bef264");
  expect(await page.getByRole("button", { name: /theme|light mode/i }).count()).toBe(0);
});
