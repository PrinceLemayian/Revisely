import { expect, test } from "@playwright/test";

test("home exposes search and assistant entry points", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Revisely" })).toBeVisible();
  await expect(page.getByRole("button", { name: /search/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /ask the ai/i })).toBeVisible();
});
