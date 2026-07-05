import { test, expect } from "@playwright/test";

test("Dashboard loads and shows product stats", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page.locator("h1", { hasText: "Dashboard" })).toBeVisible();
  await expect(page.locator("text=Total Products").first()).toBeVisible();
});

test("Products page lists the catalog", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  await page.locator("text=Products").first().click();

  await expect(page.locator("h1", { hasText: "Product Administration" })).toBeVisible();
  await expect(page.locator("text=Alle Kategorien").first()).toBeVisible();
});

test("Manufacturers page lists manufacturers", async ({ page }) => {
  await page.goto("/manufacturers", { waitUntil: "networkidle" });

  await expect(page.locator("h1", { hasText: "Manufacturers" })).toBeVisible();
  await expect(page.locator("text=Solarfabrik").first()).toBeVisible();
});
