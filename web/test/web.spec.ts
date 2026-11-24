import { expect, test } from "@playwright/test";

test("the home renders the keyboard and the product links", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("svg a")).toHaveCount(6);
  const section = page.locator("section.grid").first();
  await expect(section.locator("a")).toHaveCount(4);
  await expect(section.locator('[aria-disabled="true"]')).toHaveCount(2);
  await expect(section).toContainText("Studio");
  await expect(section).toContainText("Shop");
});

test("a keyboard key opens the product page in the same tab", async ({ page }) => {
  await page.goto("/");
  await page.locator('svg a[aria-label="Keyboards"]').click();
  await expect(page).toHaveURL(/\/keyboards$/);
  await expect(page.getByRole("heading", { name: "Keyboards" })).toBeVisible();
});

test("the product pages render their detail", async ({ page }) => {
  await page.goto("/studio");
  await expect(page.getByRole("heading", { name: "Kiboar Studio" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download for macOS" })).toBeVisible();

  await page.goto("/keyboards");
  await expect(page.locator("article")).toHaveCount(3);

  await page.goto("/library");
  await expect(page.getByText("145", { exact: true })).toBeVisible();
});

test("an unknown path renders the client-side 404", async ({ page }) => {
  await page.goto("/missing");
  await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible();
});

test("the home loads without failed assets", async ({ page }) => {
  const failed: string[] = [];
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failed.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto("/", { waitUntil: "networkidle" });
  expect(failed).toEqual([]);
});
