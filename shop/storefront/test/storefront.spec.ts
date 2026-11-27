import { expect, type Page, test } from "@playwright/test";
import type { Product } from "../src/lib/api";

const pageSize = 12;

function makeProduct(index: number, metadata: Record<string, unknown> | null = null): Product {
  return {
    id: `prod_${index}`,
    title: `Board ${index}`,
    handle: `board-${index}`,
    description: `Board ${index} description.`,
    thumbnail: null,
    metadata,
    images: [],
    variants: [
      {
        id: `variant_${index}`,
        title: "Default",
        manage_inventory: true,
        allow_backorder: false,
        inventory_quantity: 5,
        prices: [
          { amount: 100 + (index - 1), currency_code: "eur" },
          { amount: 120 + (index - 1), currency_code: "usd" },
        ],
      },
    ],
  };
}

const products = Array.from({ length: pageSize + 2 }, (_, index) => makeProduct(index + 1));

function json(body: unknown, status = 200) {
  return {
    status,
    contentType: "application/json",
    headers: { "access-control-allow-origin": "*" },
    body: JSON.stringify(body),
  };
}

async function mockShop(
  page: Page,
  options: { currency?: string; products?: Product[]; failFirst?: boolean } = {},
) {
  const list = options.products ?? products;
  const currency = options.currency ?? "eur";
  let failed = false;

  await page.route("**/store/regions**", (route) =>
    route.fulfill(
      json({
        regions: [{ id: "reg_test", name: "Test region", currency_code: currency }],
        count: 1,
        offset: 0,
        limit: 50,
      }),
    ),
  );

  await page.route("**/store/products**", async (route) => {
    if (options.failFirst && !failed) {
      failed = true;
      await route.fulfill(json({ message: "temporary" }, 500));
      return;
    }

    const url = new URL(route.request().url());
    const handle = url.searchParams.get("handle");

    if (handle) {
      const product = list.find((entry) => entry.handle === handle);
      await route.fulfill(json({ products: product ? [product] : [], count: product ? 1 : 0 }));
      return;
    }

    const offset = Number(url.searchParams.get("offset") ?? 0);
    const limit = Number(url.searchParams.get("limit") ?? pageSize);
    const slice = list.slice(offset, offset + limit);

    await route.fulfill(json({ products: slice, count: list.length, offset, limit }));
  });
}

test("paginates the catalogue with the Store API count", async ({ page }) => {
  await mockShop(page);
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Board 1", exact: true })).toBeVisible();
  await expect(page.locator('a[href^="?p="]')).toHaveCount(pageSize);
  await expect(page.getByText(`${pageSize} of ${products.length}`)).toBeVisible();

  await page.getByRole("button", { name: "Load more" }).click();

  await expect(page.locator('a[href^="?p="]')).toHaveCount(products.length);
  await expect(page.getByRole("button", { name: "Load more" })).toHaveCount(0);
});

test("opens a product and adds it to the bag", async ({ page }) => {
  await mockShop(page);
  await page.goto("/");
  await page.getByRole("heading", { name: "Board 1", exact: true }).click();

  await expect(page).toHaveURL(/\?p=board-1/);
  await expect(page.getByRole("heading", { level: 1, name: "Board 1", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Add to bag" }).click();

  const bag = page.getByRole("dialog", { name: "Bag" });
  await expect(bag).toBeVisible();
  await expect(bag.getByText("€100.00")).toHaveCount(2);
  await expect(bag.getByRole("button", { name: "Increase the quantity of Board 1" })).toBeVisible();
});

test("keeps the bag after a reload", async ({ page }) => {
  await mockShop(page);
  await page.goto("/");
  await page.getByRole("heading", { name: "Board 1", exact: true }).click();
  await page.getByRole("button", { name: "Add to bag" }).click();
  await page
    .getByRole("dialog", { name: "Bag" })
    .getByRole("button", { name: "Close the bag" })
    .last()
    .click();

  await page.reload();

  await expect(page.getByRole("button", { name: "Open the bag, 1 item" })).toBeVisible();
  await page.getByRole("button", { name: "Open the bag, 1 item" }).click();
  await expect(page.getByRole("dialog", { name: "Bag" }).getByText("Board 1")).toBeVisible();
});

test("retries a failed catalogue request", async ({ page }) => {
  await mockShop(page, { failFirst: true });
  await page.goto("/");

  await expect(page.getByText("The shop cannot be reached right now.")).toBeVisible();
  await page.getByRole("button", { name: "Try again" }).click();

  await expect(page.getByRole("heading", { name: "Board 1", exact: true })).toBeVisible();
  await expect(page.locator('a[href^="?p="]')).toHaveCount(pageSize);
});

test("uses the region currency", async ({ page }) => {
  await mockShop(page, { currency: "usd" });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Board 1", exact: true })).toBeVisible();
  await expect(page.getByText("$120.00")).toBeVisible();
});

test("disables the add button for a sold-out variant", async ({ page }) => {
  const soldOut = makeProduct(1);
  soldOut.variants = soldOut.variants?.map((variant) => ({
    ...variant,
    inventory_quantity: 0,
  }));

  await mockShop(page, { products: [soldOut] });
  await page.goto("/?p=board-1");

  await expect(page.getByRole("heading", { level: 1, name: "Board 1", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sold out" })).toBeDisabled();
});

test("links a product to its keyboard files below Add to bag", async ({ page }) => {
  const url = "https://github.com/raulmoracode/Kiboar/tree/main/software/boards/kb60-hhkb";
  const withFiles = makeProduct(1, { keyboard_files_url: url });

  await mockShop(page, { products: [withFiles] });
  await page.goto("/?p=board-1");

  const add = page.getByRole("button", { name: "Add to bag" });
  const files = page.getByRole("link", { name: /Keyboard files on GitHub/ });

  await expect(add).toBeVisible();
  await expect(files).toHaveAttribute("href", url);
  await expect(files).toHaveAttribute("target", "_blank");

  const addBox = await add.boundingBox();
  const filesBox = await files.boundingBox();
  if (!addBox || !filesBox) {
    throw new Error("The add and files controls should both be rendered.");
  }
  expect(filesBox.y).toBeGreaterThan(addBox.y);
});

test("hides the keyboard files and firmware buttons without links", async ({ page }) => {
  await mockShop(page);
  await page.goto("/?p=board-1");

  await expect(page.getByRole("button", { name: "Add to bag" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Keyboard files on GitHub/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Download official firmware/ })).toHaveCount(0);
});

test("links a product to its official firmware", async ({ page }) => {
  const firmware = makeProduct(1, { firmware_url: "/static/1234-firmware.bin" });

  await mockShop(page, { products: [firmware] });
  await page.goto("/?p=board-1");

  const link = page.getByRole("link", { name: /Download official firmware/ });
  await expect(link).toHaveAttribute("href", /\/static\/1234-firmware\.bin$/);
  await expect(link).toHaveAttribute("download", "");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("link", { name: /Keyboard files on GitHub/ })).toHaveCount(0);
});

test("links the shop header to Kiboar Studio", async ({ page }) => {
  await mockShop(page);

  for (const path of ["/", "/?p=board-1"]) {
    await page.goto(path);

    const studio = page.getByRole("link", { name: /Kiboar Studio/ });
    await expect(studio).toBeVisible();
    await expect(studio).toHaveAttribute("href", "https://kiboar.raulmoracode.com/studio");
  }
});

test("shows two catalogue columns on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockShop(page);
  await page.goto("/");

  const cards = page.locator('a[href^="?p="]');
  await expect(cards.first()).toBeVisible();

  const boxes = await Promise.all([0, 1, 2].map((index) => cards.nth(index).boundingBox()));
  const [first, second, third] = boxes;
  if (!first || !second || !third) {
    throw new Error("The first three catalogue cards should be rendered.");
  }

  expect(Math.abs(first.y - second.y)).toBeLessThan(2);
  expect(second.x).toBeGreaterThan(first.x);
  expect(third.y).toBeGreaterThan(first.y);

  const title = await cards.first().locator("h2").boundingBox();
  const price = await cards.first().locator("p").boundingBox();
  if (!title || !price) {
    throw new Error("The first catalogue card should render its title and price.");
  }

  expect(Math.abs(price.y - title.y)).toBeLessThan(4);
  expect(price.x).toBeGreaterThan(first.x + first.width / 2);
});

test("keeps the product actions full width on tablet", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  const withFiles = makeProduct(1, {
    keyboard_files_url:
      "https://github.com/raulmoracode/Kiboar/tree/main/software/boards/kb60-hhkb",
    firmware_url: "/static/1234-firmware.bin",
  });
  await mockShop(page, { products: [withFiles] });
  await page.goto("/?p=board-1");

  const details = page.locator("article > div").nth(1);
  await expect(details).toBeVisible();
  const detailsBox = await details.boundingBox();
  if (!detailsBox) {
    throw new Error("The product details column should be rendered.");
  }

  const actions = [
    page.getByRole("button", { name: "Add to bag" }),
    page.getByRole("link", { name: /Keyboard files on GitHub/ }),
    page.getByRole("link", { name: /Download official firmware/ }),
  ];

  for (const action of actions) {
    await expect(action).toBeVisible();
    const box = await action.boundingBox();
    if (!box) {
      throw new Error("The product action should be rendered.");
    }
    expect(Math.abs(box.width - detailsBox.width)).toBeLessThan(2);
  }
});

test("keeps the product actions full width on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const withFiles = makeProduct(1, {
    keyboard_files_url:
      "https://github.com/raulmoracode/Kiboar/tree/main/software/boards/kb60-hhkb",
    firmware_url: "/static/1234-firmware.bin",
  });
  await mockShop(page, { products: [withFiles] });
  await page.goto("/?p=board-1");

  const details = page.locator("article > div").nth(1);
  await expect(details).toBeVisible();
  const detailsBox = await details.boundingBox();
  if (!detailsBox) {
    throw new Error("The product details column should be rendered.");
  }

  const actions = [
    page.getByRole("button", { name: "Add to bag" }),
    page.getByRole("link", { name: /Keyboard files on GitHub/ }),
    page.getByRole("link", { name: /Download official firmware/ }),
  ];

  for (const action of actions) {
    await expect(action).toBeVisible();
    const box = await action.boundingBox();
    if (!box) {
      throw new Error("The product action should be rendered.");
    }
    expect(Math.abs(box.width - detailsBox.width)).toBeLessThan(2);
  }
});

test("keeps the product actions close on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockShop(page);
  await page.goto("/?p=board-1");

  const image = page.locator("article .kiboar-card").first();
  const add = page.getByRole("button", { name: "Add to bag" });
  await expect(image).toBeVisible();
  await expect(add).toBeVisible();

  const imageBox = await image.boundingBox();
  const addBox = await add.boundingBox();
  if (!imageBox || !addBox) {
    throw new Error("The product image and add button should be rendered.");
  }

  expect(imageBox.height / imageBox.width).toBeLessThan(0.7);
  expect(addBox.y).toBeLessThan(844);
  await expect(page.getByRole("heading", { name: "More boards" })).toBeVisible();
});
