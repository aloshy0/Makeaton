import { test, expect } from "@playwright/test";

test.describe("Brightloop Application E2E Smoke Tests", () => {
  test("loads the executive dashboard shell", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Brightloop Software/);
    await expect(page.locator("text=Subscription Operations Overview")).toBeVisible();
    await expect(page.locator("text=Monthly Recurring Revenue")).toBeVisible();
  });

  test("navigates to subscriptions view", async ({ page }) => {
    await page.goto("/subscriptions");
    await expect(page.locator("text=Subscription Management")).toBeVisible();
    await expect(page.locator("text=All Subscriptions")).toBeVisible();
  });
});
